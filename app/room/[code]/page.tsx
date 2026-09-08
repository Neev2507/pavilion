'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import RoomSettings from '@/components/room/RoomSettings'
import { getUserId } from '@/lib/utils'
import { buildPlayerOrder, buildBiddingState } from '@/lib/auction-logic'
import { Room, Player } from '@/types'
import playersData from '@/data/players.json'

const players = playersData as Player[]

export default function LobbyPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, loading } = useRoom(code)

  const [userId, setUserId] = useState('')
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  useEffect(() => {
    const id = getUserId()
    if (!id) {
      router.push('/')
      return
    }
    setUserId(id)
  }, [router])

  useEffect(() => {
    if (room?.status === 'auction') {
      router.push(`/room/${code}/auction`)
    } else if (room?.status === 'finished') {
      router.push(`/room/${code}/squads`)
    }
  }, [room?.status, code, router])

  async function handleCopyCode() {
    await navigator.clipboard.writeText(code.toUpperCase())
    setCopied('code')
    setTimeout(() => setCopied(null), 1500)
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied('link')
    setTimeout(() => setCopied(null), 1500)
  }

  async function handleSettingsChange(patch: Partial<Room>) {
    if (!room || !isHost) return
    const supabase = createClient()
    await supabase.from('rooms').update(patch).eq('id', room.id)
  }

  async function handleStartAuction() {
    if (!room) return
    setStarting(true)

    const supabase = createClient()

    const playerOrder = buildPlayerOrder(players, room.player_tier_filter)
    const firstPlayer = players.find((p) => p.id === playerOrder[0])

    // Settings may have changed after participants joined with the old
    // defaults, so reset everyone's purse to match the final settings.
    await Promise.all(
      participants.map((p) =>
        supabase
          .from('participants')
          .update({ purse_remaining: room.purse_size, squad: [] })
          .eq('id', p.id)
      )
    )

    await supabase
      .from('rooms')
      .update({ player_order: playerOrder, current_index: 0 })
      .eq('id', room.id)

    if (firstPlayer) {
      await supabase.from('auction_state').upsert(
        buildBiddingState(room.id, firstPlayer.id, firstPlayer.base_price, room.shot_clock_seconds),
        { onConflict: 'room_id' }
      )
    }

    await supabase.from('rooms').update({ status: 'auction' }).eq('id', room.id)

    setStarting(false)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading room...</p>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Room not found.</p>
        <Button onClick={() => router.push('/')}>Back home</Button>
      </main>
    )
  }

  const isHost = room.host_id === userId

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-4 py-10">
      <header className="w-full max-w-2xl">
        <h1 className="text-xl font-bold text-text-primary">Pavilion</h1>
      </header>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm uppercase tracking-wide text-text-secondary">Room code</p>
        <p className="font-mono text-5xl font-bold tracking-[0.2em] text-accent">{code.toUpperCase()}</p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleCopyCode}>
            {copied === 'code' ? 'Copied!' : 'Copy code'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopyLink}>
            {copied === 'link' ? 'Copied!' : 'Copy invite link'}
          </Button>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Players ({participants.length})
        </h2>
        {participants.map((p) => (
          <Card key={p.id} padding="sm" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse-fast rounded-full bg-accent" />
              <span className="font-medium text-text-primary">{p.display_name}</span>
            </div>
            {p.user_id === room.host_id && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                Host
              </span>
            )}
          </Card>
        ))}
        {participants.length < 2 && (
          <p className="text-center text-sm text-text-secondary">Waiting for players...</p>
        )}
      </div>

      <div className="w-full max-w-2xl">
        <RoomSettings room={room} isHost={isHost} onChange={handleSettingsChange} />
      </div>

      {isHost && (
        <Button
          onClick={handleStartAuction}
          disabled={participants.length < 2}
          loading={starting}
          size="lg"
        >
          Start Auction
        </Button>
      )}
    </main>
  )
}
