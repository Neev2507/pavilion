'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuctionState, Bid, Player } from '@/types'
import { canAffordBid, buildBiddingState } from '@/lib/auction-logic'
import { getUserId, getDisplayName } from '@/lib/utils'
import playersData from '@/data/players.json'

const players = playersData as Player[]

interface UseAuctionResult {
  auctionState: AuctionState | null
  bids: Bid[]
  loading: boolean
  placeBid: (amount: number) => Promise<void>
  resolveAuction: () => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  skipPlayer: () => Promise<void>
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useAuction(roomId: string): UseAuctionResult {
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    async function load() {
      setLoading(true)

      const [{ data: stateData }, { data: bidsData }] = await Promise.all([
        supabase.from('auction_state').select('*').eq('room_id', roomId).maybeSingle(),
        supabase
          .from('bids')
          .select('*')
          .eq('room_id', roomId)
          .order('placed_at', { ascending: false })
          .limit(30),
      ])

      if (cancelled) return

      setAuctionState((stateData as AuctionState) ?? null)
      setBids((bidsData as Bid[]) ?? [])
      setLoading(false)

      channel = supabase
        .channel(`auction-${roomId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'auction_state', filter: `room_id=eq.${roomId}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setAuctionState(null)
              return
            }
            // Merge rather than replace, in case a large jsonb column
            // elsewhere in the row gets omitted from this payload.
            setAuctionState((prev) =>
              prev ? { ...prev, ...(payload.new as Partial<AuctionState>) } : (payload.new as AuctionState)
            )
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bids', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const inserted = payload.new as Bid
            setBids((prev) => [inserted, ...prev].slice(0, 30))
          }
        )
        .subscribe()
    }

    load()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [roomId])

  const placeBid = useCallback(async (amount: number) => {
    if (!auctionState || !auctionState.current_player_id) return
    if (auctionState.paused) return
    if (amount <= auctionState.current_bid) return

    const supabase = createClient()
    const userId = getUserId()
    const displayName = getDisplayName()

    if (auctionState.current_bidder_id === userId) return

    const [{ data: participant }, { data: roomData }] = await Promise.all([
      supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase.from('rooms').select('*').eq('id', roomId).maybeSingle(),
    ])

    if (!participant || !roomData) return

    const squadSlotsLeft = roomData.squad_size - (participant.squad as Player[]).length
    if (squadSlotsLeft <= 0) return

    if (!canAffordBid(amount, participant.purse_remaining, squadSlotsLeft)) return

    const clockEndsAt = new Date(Date.now() + roomData.shot_clock_seconds * 1000).toISOString()

    await supabase
      .from('auction_state')
      .update({
        current_bid: amount,
        current_bidder_id: userId,
        current_bidder_name: displayName,
        clock_ends_at: clockEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)

    await supabase.from('bids').insert({
      room_id: roomId,
      player_id: auctionState.current_player_id,
      user_id: userId,
      display_name: displayName,
      amount,
    })
  }, [auctionState, roomId])

  const pause = useCallback(async () => {
    if (!auctionState || !auctionState.clock_ends_at || auctionState.paused) return
    const supabase = createClient()
    const remaining = Math.max(
      0,
      Math.ceil((new Date(auctionState.clock_ends_at).getTime() - Date.now()) / 1000)
    )
    await supabase
      .from('auction_state')
      .update({ paused: true, paused_seconds_left: remaining })
      .eq('room_id', roomId)
  }, [auctionState, roomId])

  const resume = useCallback(async () => {
    if (!auctionState || !auctionState.paused) return
    const supabase = createClient()
    const remaining = auctionState.paused_seconds_left ?? 0
    const clockEndsAt = new Date(Date.now() + remaining * 1000).toISOString()
    await supabase
      .from('auction_state')
      .update({ paused: false, paused_seconds_left: null, clock_ends_at: clockEndsAt })
      .eq('room_id', roomId)
  }, [auctionState, roomId])

  const resolveAuction = useCallback(async () => {
    if (!auctionState) return

    const supabase = createClient()

    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle()

    if (!roomData) return

    const wasSold = Boolean(auctionState.current_bidder_id && auctionState.current_player_id)

    if (wasSold && auctionState.current_player_id && auctionState.current_bidder_id) {
      const player = players.find((p) => p.id === auctionState.current_player_id)

      const { data: winner } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', auctionState.current_bidder_id)
        .maybeSingle()

      if (player && winner) {
        const updatedSquad = [...(winner.squad as Player[]), player]
        await supabase
          .from('participants')
          .update({
            squad: updatedSquad,
            purse_remaining: winner.purse_remaining - auctionState.current_bid,
          })
          .eq('id', winner.id)
      }

      await supabase
        .from('auction_state')
        .update({ phase: 'sold', updated_at: new Date().toISOString() })
        .eq('room_id', roomId)
    } else {
      await supabase
        .from('auction_state')
        .update({ phase: 'unsold', updated_at: new Date().toISOString() })
        .eq('room_id', roomId)
    }

    const unsoldPlayers = wasSold
      ? (roomData.unsold_players as string[])
      : [...(roomData.unsold_players as string[]), auctionState.current_player_id as string]

    const nextIndex = roomData.queue_index + 1
    await supabase
      .from('rooms')
      .update({ queue_index: nextIndex, unsold_players: unsoldPlayers })
      .eq('id', roomId)

    await sleep(wasSold ? 3000 : 2000)

    const { data: allParticipants } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId)

    const allSquadsFull =
      !!allParticipants &&
      allParticipants.length > 0 &&
      allParticipants.every((p) => (p.squad as Player[]).length >= roomData.squad_size)

    const playerQueue = roomData.player_queue as string[]
    const queueExhausted = nextIndex >= playerQueue.length

    if (allSquadsFull) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
      return
    }

    if (queueExhausted) {
      if (roomData.round === 1 && unsoldPlayers.length > 0) {
        await supabase.from('rooms').update({ status: 'round2_selection' }).eq('id', roomId)
      } else {
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
      }
      return
    }

    const nextPlayer = players.find((p) => p.id === playerQueue[nextIndex])
    if (!nextPlayer) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
      return
    }

    await supabase
      .from('auction_state')
      .update(
        buildBiddingState(roomId, nextPlayer.id, nextPlayer.base_price, roomData.shot_clock_seconds)
      )
      .eq('room_id', roomId)
  }, [auctionState, roomId])

  const skipPlayer = useCallback(async () => {
    if (!auctionState || !auctionState.current_player_id) return
    if (auctionState.current_bidder_id) return // bidding has started, skip is no longer available
    const userId = getUserId()
    if (auctionState.skips.includes(userId)) return

    const supabase = createClient()
    const updatedSkips = [...auctionState.skips, userId]

    await supabase
      .from('auction_state')
      .update({ skips: updatedSkips, updated_at: new Date().toISOString() })
      .eq('room_id', roomId)

    const { count } = await supabase
      .from('participants')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', roomId)

    if (count !== null && count > 0 && updatedSkips.length >= count) {
      await resolveAuction()
    }
  }, [auctionState, roomId, resolveAuction])

  return { auctionState, bids, loading, placeBid, resolveAuction, pause, resume, skipPlayer }
}
