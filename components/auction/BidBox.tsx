'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidBoxProps {
  currentBid: number
  currentBidderName: string | null
  secondsLeft: number
  totalSeconds: number
  paused: boolean
}

export default function BidBox({
  currentBid,
  currentBidderName,
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

  const progressPct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0
  const urgent = secondsLeft < 3 && secondsLeft > 0
  const barColor = secondsLeft < 3 ? 'bg-error' : secondsLeft <= 5 ? 'bg-amber' : 'bg-accent'
  const numberColor = secondsLeft < 3 ? 'text-error' : secondsLeft <= 5 ? 'text-amber' : 'text-text-primary'

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card padding="lg" className="flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Base price
        </p>
        <p
          key={currentBid}
          className={cn(
            'font-mono text-4xl font-bold text-accent',
            flip && 'animate-number-flip'
          )}
        >
          {formatPrice(currentBid)}
        </p>
        <p className="text-sm text-text-secondary">
          {currentBidderName ? `${currentBidderName} is leading` : 'No bids yet. Be the first.'}
        </p>
      </Card>

      <Card padding="lg" className="flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Time left
        </p>
        {paused ? (
          <p className="font-mono text-3xl font-bold text-text-secondary">Paused</p>
        ) : (
          <>
            <p className={cn('font-mono text-5xl font-bold', numberColor, urgent && 'animate-pulse-fast')}>
              {secondsLeft}
            </p>
            <p className="text-xs uppercase tracking-wide text-text-secondary">Seconds</p>
          </>
        )}
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-card-border">
          <div
            className={cn('h-full rounded-full transition-all duration-150 ease-linear', barColor)}
            style={{ width: `${paused ? 100 : progressPct}%` }}
          />
        </div>
      </Card>
    </div>
  )
}
