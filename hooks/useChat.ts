'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/types'
import { getUserId, getDisplayName } from '@/lib/utils'

interface UseChatResult {
  messages: Message[]
  loading: boolean
  sendMessage: (content: string) => Promise<void>
}

export function useChat(roomId: string): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return

    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: true })
        .limit(200)

      if (cancelled) return

      setMessages((data as Message[]) ?? [])
      setLoading(false)

      channel = supabase
        .channel(`messages-${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const inserted = payload.new as Message
            setMessages((prev) => [...prev, inserted])
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

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || !roomId) return

      const supabase = createClient()
      await supabase.from('messages').insert({
        room_id: roomId,
        user_id: getUserId(),
        display_name: getDisplayName(),
        content: trimmed,
      })
    },
    [roomId]
  )

  return { messages, loading, sendMessage }
}
