'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'

interface ChatPanelProps {
  roomId: string
  currentUserId: string
  title?: string
  className?: string
}

const REACTIONS = ['🔥', '💰', '😂', '✂️', '💀']

export default function ChatPanel({ roomId, currentUserId, title, className }: ChatPanelProps) {
  const { messages, sendMessage } = useChat(roomId)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-3', className)}>
      {title && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-signal-green" />
          <h3 className="type-label text-text-dim">{title}</h3>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-text-secondary">No messages yet. Say something!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="animate-slide-in-bottom text-sm">
              <span
                className={cn(
                  'font-medium',
                  m.user_id === currentUserId ? 'text-accent-high' : 'text-text-primary'
                )}
              >
                {m.display_name}
              </span>
              <span className="text-text-secondary"> {m.content}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-1.5">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendMessage(emoji)}
            className="flex h-9 w-9 items-center justify-center rounded border border-border-2 bg-surface-1 text-lg transition-transform duration-150 hover:scale-110 hover:border-accent active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          placeholder="Type a message..."
          className="min-h-[40px] flex-1 rounded border border-border-1 bg-[#120c07] px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="min-h-[40px] rounded bg-accent px-4 text-sm font-bold text-canvas transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99]"
        >
          Send
        </button>
      </div>
    </div>
  )
}
