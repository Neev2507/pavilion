'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidBoxProps {
  currentBid: number
  currentBidderName: string | null
  isLeadingMe: boolean
  secondsLeft: number
  totalSeconds: number
  paused: boolean
}

const TICK_COUNT = 15

export default function BidBox({
  currentBid,
  currentBidderName,
  isLeadingMe,
  secondsLeft,
  totalSeconds,
  paused,
}: BidBoxProps) {
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    setFlip(true)
    const t = setTimeout(() => setFlip(false), 350)
    return () => clearTimeout(t)
  }, [currentBid])

  const fraction = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0
  const filledTicks = paused ? TICK_COUNT : Math.round(fraction * TICK_COUNT)
  const urgent = !paused && secondsLeft <= 5 && secondsLeft > 0
  const numberColor = urgent ? 'text-accent-high' : 'text-text-bright'

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center justify-center gap-2 rounded border border-border-2 bg-surface-2 p-6 text-center">
        <p className="type-label text-text-dim">Current bid</p>
        <p
          key={currentBid}
          className={cn('type-mono text-4xl font-semibold text-accent', flip && 'animate-number-flip')}
        >
          {formatPrice(currentBid)}
        </p>
        {isLeadingMe ? (
          <p className="text-sm font-medium text-signal-green">You are leading!</p>
        ) : (
          <p className="text-sm text-text-secondary">
            {currentBidderName ? `${currentBidderName} is leading` : 'No bids yet. Be the first.'}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-2 rounded border border-border-2 bg-surface-2 p-6 text-center">
        <p className="type-label text-text-dim">Time left</p>
        {paused ? (
          <p className="type-mono text-3xl font-semibold text-text-secondary">Paused</p>
        ) : (
          <p className={cn('type-mono text-6xl font-semibold', numberColor, urgent && 'animate-pulse-fast')}>
            {secondsLeft}
          </p>
        )}
        <div className="mt-1 flex w-full gap-1">
          {Array.from({ length: TICK_COUNT }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-sm',
                i < filledTicks ? (urgent ? 'bg-accent-high animate-pulse-fast' : 'bg-accent') : 'bg-border-2'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
