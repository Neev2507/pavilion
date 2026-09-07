'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Room, Participant } from '@/types'
import { getUserId } from '@/lib/utils'

interface UseRoomResult {
  room: Room | null
  participants: Participant[]
  currentParticipant: Participant | null
  loading: boolean
}

export function useRoom(code: string): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return

    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .maybeSingle()

      if (cancelled) return

      if (!roomData) {
        setRoom(null)
        setParticipants([])
        setLoading(false)
        return
      }

      setRoom(roomData as Room)

      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomData.id)
        .order('joined_at', { ascending: true })

      if (cancelled) return

      setParticipants((participantsData ?? []) as Participant[])
      setLoading(false)

      channel = supabase
        .channel(`room-${roomData.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomData.id}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setRoom(null)
              return
            }
            setRoom(payload.new as Room)
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomData.id}` },
          (payload) => {
            setParticipants((prev) => {
              if (payload.eventType === 'INSERT') {
                const inserted = payload.new as Participant
                if (prev.some((p) => p.id === inserted.id)) return prev
                return [...prev, inserted]
              }
              if (payload.eventType === 'UPDATE') {
                const updated = payload.new as Participant
                return prev.map((p) => (p.id === updated.id ? updated : p))
              }
              if (payload.eventType === 'DELETE') {
                const deleted = payload.old as Participant
                return prev.filter((p) => p.id !== deleted.id)
              }
              return prev
            })
          }
        )
        .subscribe()
    }

    load()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [code])

  const userId = getUserId()
  const currentParticipant = participants.find((p) => p.user_id === userId) ?? null

  return { room, participants, currentParticipant, loading }
}
