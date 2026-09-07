'use client'

import { useEffect, useState } from 'react'
import { Bid } from '@/types'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidFeedProps {
  bids: Bid[]
  currentUserId: string
}

function relativeTime(placedAt: string, now: number): string {
  const diffMs = now - new Date(placedAt).getTime()
  const diffSec = Math.max(0, Math.floor(diffMs / 1000))
  if (diffSec < 2) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  return `${diffMin}m ago`
}

export default function BidFeed({ bids, currentUserId }: BidFeedProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const visible = bids.slice(0, 10)

  if (visible.length === 0) {
    return <p className="text-sm text-text-secondary">No bids yet.</p>
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {visible.map((bid) => (
        <li
          key={bid.id}
          className={cn(
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm animate-slide-in-fade',
            bid.user_id === currentUserId ? 'bg-accent/10 text-accent' : 'bg-card text-text-primary'
          )}
        >
          <span className="font-medium">
            {bid.display_name} bid <span className="font-mono">{formatPrice(bid.amount)}</span>
          </span>
          <span className="text-xs text-text-secondary">{relativeTime(bid.placed_at, now)}</span>
        </li>
      ))}
    </ul>
  )
}
