'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { generateRoomCode } from '@/lib/auction-logic'

export default function HomePage() {
  const router = useRouter()

  const [createName, setCreateName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')

  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [createError, setCreateError] = useState('')
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    let userId = localStorage.getItem('pavilion_user_id')
    if (!userId) {
      userId = uuidv4()
      localStorage.setItem('pavilion_user_id', userId)
    }

    const storedName = localStorage.getItem('pavilion_display_name')
    if (storedName) {
      setCreateName(storedName)
      setJoinName(storedName)
    }
  }, [])

  async function handleCreateRoom() {
    setCreateError('')
    const name = createName.trim()
    if (!name) {
      setCreateError('Enter a display name')
      return
    }

    setCreating(true)
    try {
      const userId = localStorage.getItem('pavilion_user_id')!
      const supabase = createClient()
      const code = generateRoomCode()

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ code, host_id: userId, status: 'lobby' })
        .select()
        .single()

      if (roomError || !room) {
        setCreateError('Could not create room. Please try again.')
        setCreating(false)
        return
      }

      const { error: participantError } = await supabase.from('participants').insert({
        room_id: room.id,
        user_id: userId,
        display_name: name,
        purse_remaining: room.purse_size,
      })

      if (participantError) {
        setCreateError('Could not join room. Please try again.')
        setCreating(false)
        return
      }

      localStorage.setItem('pavilion_display_name', name)
      router.push(`/room/${code}`)
    } finally {
      setCreating(false)
    }
  }

  async function handleJoinRoom() {
    setJoinError('')
    const code = joinCode.trim().toUpperCase()
    const name = joinName.trim()

    if (!code || !name) {
      setJoinError('Enter a room code and display name')
      return
    }

    setJoining(true)
    try {
      const userId = localStorage.getItem('pavilion_user_id')!
      const supabase = createClient()

      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle()

      if (roomError || !room) {
        setJoinError('Room not found')
        setJoining(false)
        return
      }

      if (room.status !== 'lobby') {
        setJoinError('Auction already started')
        setJoining(false)
        return
      }

      const { error: participantError } = await supabase.from('participants').upsert(
        {
          room_id: room.id,
          user_id: userId,
          display_name: name,
          purse_remaining: room.purse_size,
        },
        { onConflict: 'room_id,user_id' }
      )

      if (participantError) {
        setJoinError('Could not join room. Please try again.')
        setJoining(false)
        return
      }

      localStorage.setItem('pavilion_display_name', name)
      router.push(`/room/${code}`)
    } finally {
      setJoining(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-text-primary">Pavilion</h1>
        <p className="text-text-secondary">All-time Test cricket auctions with friends.</p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <Card padding="lg" className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Create Room</h2>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Display name"
            className="min-h-[44px] rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
          {createError && <p className="text-sm text-error">{createError}</p>}
          <Button onClick={handleCreateRoom} loading={creating} className="w-full">
            Create Room
          </Button>
        </Card>

        <Card padding="lg" className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Join Room</h2>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="Room code"
            maxLength={6}
            className="min-h-[44px] rounded-lg border border-card-border bg-background px-4 py-2 text-sm uppercase tracking-widest text-text-primary placeholder:text-text-secondary placeholder:normal-case placeholder:tracking-normal focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Display name"
            className="min-h-[44px] rounded-lg border border-card-border bg-background px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          />
          {joinError && <p className="text-sm text-error">{joinError}</p>}
          <Button onClick={handleJoinRoom} loading={joining} variant="secondary" className="w-full">
            Join Room
          </Button>
        </Card>
      </div>
    </main>
  )
}
