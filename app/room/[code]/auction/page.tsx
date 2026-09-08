'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useAuction } from '@/hooks/useAuction'
import { useTimer } from '@/hooks/useTimer'
import { createClient } from '@/lib/supabase/client'
import { getUserId, getDisplayName, getInitials, cn } from '@/lib/utils'
import { canAffordBid, formatPrice } from '@/lib/auction-logic'
import { Player } from '@/types'
import playersData from '@/data/players.json'
import PlayerCard from '@/components/auction/PlayerCard'
import BidBox from '@/components/auction/BidBox'
import BidAmountPicker from '@/components/auction/BidAmountPicker'
import BidActionBar from '@/components/auction/BidActionBar'
import AuctionSidebar from '@/components/auction/AuctionSidebar'
import ChatPanel from '@/components/room/ChatPanel'
import Button from '@/components/ui/Button'

const players = playersData as Player[]

export default function AuctionPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, currentParticipant, loading: roomLoading } = useRoom(code)
  const { auctionState, bids, placeBid, resolveAuction, pause, resume, skipPlayer } = useAuction(
    room?.id ?? ''
  )
  const { secondsLeft, isExpired } = useTimer(auctionState?.clock_ends_at ?? null)

  const [userId, setUserId] = useState('')
  const [endingRound, setEndingRound] = useState(false)
  const [selectedIncrement, setSelectedIncrement] = useState<number | null>(null)

  useEffect(() => {
    const id = getUserId()
    const name = getDisplayName()
    if (!id || !name) {
      router.push('/')
      return
    }
    setUserId(id)
  }, [router])

  useEffect(() => {
    if (room?.status === 'finished') {
      router.push(`/room/${code}/squads`)
    } else if (room?.status === 'round2_selection') {
      router.push(`/room/${code}/selection`)
    } else if (room?.status === 'lobby') {
      router.push(`/room/${code}`)
    }
  }, [room?.status, code, router])

  const isHost = room?.host_id === userId

  useEffect(() => {
    if (!isHost) return
    if (!auctionState) return
    if (auctionState.paused) return
    if (auctionState.phase !== 'bidding') return
    if (!auctionState.clock_ends_at) return
    if (!auctionState.current_player_id) return
    if (!isExpired) return
    resolveAuction()
  }, [isHost, isExpired, auctionState, resolveAuction])

  // Reset the selected increment whenever a new player comes up.
  useEffect(() => {
    setSelectedIncrement(null)
  }, [auctionState?.current_player_id])

  // Clear it only if it would now be unaffordable on top of the current
  // bid — the increment itself never becomes invalid just because someone
  // else bid, since it always adds to whatever the current bid is.
  useEffect(() => {
    if (!auctionState || !currentParticipant || !room) return
    setSelectedIncrement((prev) => {
      if (prev === null) return prev
      const affordable = canAffordBid(
        auctionState.current_bid + prev,
        currentParticipant.purse_remaining,
        room.squad_size - currentParticipant.squad.length
      )
      return affordable ? prev : null
    })
  }, [auctionState, currentParticipant, room])

  async function handleEndRound() {
    if (!room) return
    setEndingRound(true)
    const supabase = createClient()

    const remaining = room.player_queue.slice(room.queue_index)
    const newUnsold = Array.from(new Set([...room.unsold_players, ...remaining]))

    const { data: allParticipants } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', room.id)

    const allFull =
      !!allParticipants &&
      allParticipants.length > 0 &&
      allParticipants.every((p) => (p.squad as Player[]).length >= room.squad_size)

    const nextStatus =
      !allFull && room.round === 1 && newUnsold.length > 0 ? 'round2_selection' : 'finished'

    await supabase
      .from('rooms')
      .update({ unsold_players: newUnsold, status: nextStatus })
      .eq('id', room.id)

    await supabase
      .from('auction_state')
      .update({
        current_player_id: null,
        current_base_price: 0,
        current_bid: 0,
        current_bidder_id: null,
        current_bidder_name: null,
        clock_ends_at: null,
        paused: false,
        paused_seconds_left: null,
        skips: [],
        phase: 'nomination',
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', room.id)

    setEndingRound(false)
  }

  if (roomLoading || !room || !auctionState) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading auction...</p>
      </main>
    )
  }

  const currentPlayer = auctionState.current_player_id
    ? players.find((p) => p.id === auctionState.current_player_id) ?? null
    : null

  const mySquadSlotsLeft = currentParticipant ? room.squad_size - currentParticipant.squad.length : 0
  const canBid =
    !!currentParticipant &&
    !auctionState.paused &&
    mySquadSlotsLeft > 0 &&
    auctionState.current_bidder_id !== userId

  function handleConfirmBid() {
    if (selectedIncrement === null || !auctionState) return
    placeBid(auctionState.current_bid + selectedIncrement)
    setSelectedIncrement(null)
  }

  const displaySecondsLeft = auctionState.paused ? auctionState.paused_seconds_left ?? 0 : secondsLeft

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-semibold text-text-primary">
            Round {room.round} &middot; {room.queue_index + 1}/{room.player_queue.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <>
              <Button variant="ghost" size="sm" onClick={() => (auctionState.paused ? resume() : pause())}>
                {auctionState.paused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="danger" size="sm" loading={endingRound} onClick={handleEndRound}>
                End Round
              </Button>
            </>
          )}
          <div className="flex items-center gap-2 rounded-full border border-card-border px-2 py-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 font-mono text-[10px] text-accent">
              {getInitials(getDisplayName())}
            </div>
            <span className="text-sm text-text-secondary">{getDisplayName()}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:gap-8">
        <AuctionSidebar room={room} participants={participants} currentUserId={userId} bids={bids} />

        <div className="flex flex-1 flex-col gap-6">
          {auctionState.phase === 'nomination' && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-text-secondary">Setting up the auction...</p>
            </div>
          )}

          {auctionState.phase === 'bidding' && currentPlayer && currentParticipant && (
            <div className="flex flex-1 flex-col gap-6">
              <PlayerCard key={currentPlayer.id} player={currentPlayer} />

              <BidBox
                currentBid={auctionState.current_bid}
                currentBidderName={auctionState.current_bidder_name}
                secondsLeft={displaySecondsLeft}
                totalSeconds={room.shot_clock_seconds}
                paused={auctionState.paused}
              />

              <BidAmountPicker
                currentBid={auctionState.current_bid}
                purseRemaining={currentParticipant.purse_remaining}
                squadSlotsLeft={mySquadSlotsLeft}
                selected={selectedIncrement}
                disabled={!canBid}
                onSelect={setSelectedIncrement}
              />

              <BidActionBar
                currentBid={auctionState.current_bid}
                selectedIncrement={selectedIncrement}
                onConfirm={handleConfirmBid}
                disabled={!canBid}
                pulseSignal={auctionState.current_bid}
                showSkip={auctionState.current_bidder_id === null}
                skipCount={auctionState.skips.length}
                totalParticipants={participants.length}
                hasSkipped={auctionState.skips.includes(userId)}
                onSkip={skipPlayer}
              />
            </div>
          )}

          {auctionState.phase === 'sold' && currentPlayer && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="animate-slam font-mono text-5xl font-bold text-accent">SOLD!</p>
              <p className="text-xl font-semibold text-text-primary">{currentPlayer.name}</p>
              <p className="font-mono text-2xl text-text-secondary">
                {formatPrice(auctionState.current_bid)} to {auctionState.current_bidder_name}
              </p>
            </div>
          )}

          {auctionState.phase === 'unsold' && currentPlayer && (
            <div className="flex flex-1 animate-fade-in flex-col items-center justify-center gap-3 grayscale">
              <p className="font-mono text-5xl font-bold text-error">UNSOLD</p>
              <p className="text-xl font-semibold text-text-primary">{currentPlayer.name}</p>
            </div>
          )}
        </div>

        <aside className={cn('flex w-full flex-col lg:w-[300px] lg:shrink-0')}>
          <div className="flex h-[420px] flex-col rounded-xl border border-card-border bg-card p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)]">
            <ChatPanel roomId={room.id} currentUserId={userId} title="Live chat" />
          </div>
        </aside>
      </div>
    </main>
  )
}
