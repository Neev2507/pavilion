'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import RoomSettings from '@/components/room/RoomSettings'
import ParticipantGrid from '@/components/room/ParticipantGrid'
import ChatPanel from '@/components/room/ChatPanel'
import { getUserId, cn } from '@/lib/utils'
import { buildPlayerQueue, buildBiddingState } from '@/lib/auction-logic'
import { Room, Player } from '@/types'
import playersData from '@/data/players.json'

const players = playersData as Player[]

type Tab = 'settings' | 'chat'

export default function LobbyPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, loading } = useRoom(code)

  const [userId, setUserId] = useState('')
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [tab, setTab] = useState<Tab>('settings')

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
    } else if (room?.status === 'round2_selection') {
      router.push(`/room/${code}/selection`)
    } else if (room?.status === 'finished') {
      router.push(`/room/${code}/squads`)
    }
  }, [room?.status, code, router])

  const isHost = room?.host_id === userId

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

    const playerQueue = buildPlayerQueue(players, room.player_order_mode)
    const firstPlayer = players.find((p) => p.id === playerQueue[0])

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
      .update({ player_queue: playerQueue, queue_index: 0, unsold_players: [], round: 1 })
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Pavilion</h1>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tracking-widest text-accent">{code.toUpperCase()}</span>
          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
            {copied === 'code' ? 'Copied!' : 'Copy code'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopyLink}>
            {copied === 'link' ? 'Copied!' : 'Copy link'}
          </Button>
        </div>
      </header>

      <ParticipantGrid participants={participants} hostId={room.host_id} />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-card-border bg-card p-1">
          <button
            onClick={() => setTab('settings')}
            className={cn(
              'min-h-[40px] rounded-lg text-sm font-semibold transition-colors duration-150',
              tab === 'settings' ? 'bg-accent text-[#0a0a0a]' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Room Settings
          </button>
          <button
            onClick={() => setTab('chat')}
            className={cn(
              'min-h-[40px] rounded-lg text-sm font-semibold transition-colors duration-150',
              tab === 'chat' ? 'bg-accent text-[#0a0a0a]' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Chat
          </button>
        </div>

        {tab === 'settings' ? (
          <RoomSettings room={room} isHost={isHost} onChange={handleSettingsChange} />
        ) : (
          <div className="h-80">
            <ChatPanel roomId={room.id} currentUserId={userId} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleStartAuction}
          disabled={!isHost || participants.length < 2}
          loading={starting}
          size="lg"
          className="w-full"
        >
          Start auction
        </Button>
        {participants.length < 2 && (
          <p className="text-center text-sm text-text-secondary">
            At least two managers are required to start.
          </p>
        )}
      </div>
    </main>
  )
}
