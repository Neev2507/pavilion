'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import { getUserId, getDisplayName, countryFlag, cn } from '@/lib/utils'
import { buildPlayerQueue, buildBiddingState, formatPrice } from '@/lib/auction-logic'
import { Player } from '@/types'
import playersData from '@/data/players.json'
import Button from '@/components/ui/Button'
import { ROLE_BADGE_CLASSES } from '@/lib/role-styles'

const players = playersData as Player[]

export default function SelectionPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, currentParticipant, loading } = useRoom(code)

  const [userId, setUserId] = useState('')
  const [savingReady, setSavingReady] = useState(false)

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
    if (room?.status === 'auction') {
      router.push(`/room/${code}/auction`)
    } else if (room?.status === 'lobby') {
      router.push(`/room/${code}`)
    } else if (room?.status === 'finished') {
      router.push(`/room/${code}/squads`)
    }
  }, [room?.status, code, router])

  const isHost = room?.host_id === userId
  const allReady = participants.length > 0 && participants.every((p) => p.round2_ready)

  useEffect(() => {
    if (!isHost) return
    if (!room || room.status !== 'round2_selection') return
    if (!allReady) return

    async function transition() {
      if (!room) return
      const supabase = createClient()

      const selectedIds = Array.from(
        new Set(participants.flatMap((p) => p.round2_selections))
      )
      const selectedPlayers = players.filter((p) => selectedIds.includes(p.id))
      const queue = buildPlayerQueue(selectedPlayers, 'category')
      const firstPlayer = players.find((p) => p.id === queue[0])

      await supabase
        .from('rooms')
        .update({
          player_queue: queue,
          queue_index: 0,
          unsold_players: [],
          round: 2,
        })
        .eq('id', room.id)

      if (firstPlayer) {
        await supabase.from('auction_state').upsert(
          buildBiddingState(room.id, firstPlayer.id, firstPlayer.base_price, room.shot_clock_seconds),
          { onConflict: 'room_id' }
        )
      }

      await supabase.from('rooms').update({ status: 'auction' }).eq('id', room.id)
    }

    transition()
  }, [isHost, room, allReady, participants])

  if (loading || !room) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </main>
    )
  }

  const unsoldPlayers = room.unsold_players
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p))

  const mySelections = currentParticipant?.round2_selections ?? []
  const iAmReady = currentParticipant?.round2_ready ?? false

  async function toggleSelection(playerId: string) {
    if (!currentParticipant || iAmReady) return
    const supabase = createClient()
    const next = mySelections.includes(playerId)
      ? mySelections.filter((id) => id !== playerId)
      : [...mySelections, playerId]
    await supabase
      .from('participants')
      .update({ round2_selections: next })
      .eq('id', currentParticipant.id)
  }

  async function handleReady() {
    if (!currentParticipant) return
    setSavingReady(true)
    const supabase = createClient()
    await supabase
      .from('participants')
      .update({ round2_ready: true })
      .eq('id', currentParticipant.id)
    setSavingReady(false)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="type-display text-3xl font-semibold text-text-bright">
          Round 2 — Pick players to bring back
        </h1>
        <p className="text-text-secondary">
          Select the unsold players you want to auction again. Once everyone is ready, Round 2
          begins.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {participants.map((p) => (
          <span
            key={p.id}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150',
              p.round2_ready
                ? 'border-signal-green/40 bg-signal-green/10 text-signal-green'
                : 'border-border-1 bg-surface-1 text-text-secondary'
            )}
          >
            {p.round2_ready ? '✓' : '…'} {p.display_name}
          </span>
        ))}
      </div>

      {unsoldPlayers.length === 0 ? (
        <p className="text-center text-text-dim">No unsold players.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {unsoldPlayers.map((player) => {
            const selected = mySelections.includes(player.id)
            return (
              <button
                key={player.id}
                onClick={() => toggleSelection(player.id)}
                disabled={iAmReady}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded border-2 bg-surface-1 px-3 py-3 text-left transition-all duration-150',
                  selected
                    ? 'scale-[1.02] border-accent bg-accent/10'
                    : 'border-border-1 hover:border-accent/40',
                  iAmReady && 'cursor-not-allowed opacity-70'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {player.name}
                  </span>
                  <span>{countryFlag(player.country)}</span>
                </div>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 type-label',
                    ROLE_BADGE_CLASSES[player.role]
                  )}
                >
                  {player.role}
                </span>
                <span className="type-mono text-xs text-text-secondary">
                  {formatPrice(player.base_price)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleReady}
          disabled={iAmReady}
          loading={savingReady}
          variant={iAmReady ? 'secondary' : 'primary'}
          size="lg"
          className="w-full max-w-xs"
        >
          {iAmReady ? '✓ Ready' : 'Ready'}
        </Button>
        {!allReady && <p className="text-sm text-text-dim">Waiting for others...</p>}
      </div>
    </main>
  )
}
