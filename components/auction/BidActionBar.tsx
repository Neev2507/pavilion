'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidActionBarProps {
  currentBid: number
  selectedIncrement: number | null
  onConfirm: () => void
  disabled: boolean
  pulseSignal: number
  showSkip: boolean
  skipCount: number
  totalParticipants: number
  hasSkipped: boolean
  onSkip: () => void
}

export default function BidActionBar({
  currentBid,
  selectedIncrement,
  onConfirm,
  disabled,
  pulseSignal,
  showSkip,
  skipCount,
  totalParticipants,
  hasSkipped,
  onSkip,
}: BidActionBarProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [pulseSignal])

  return (
    <div className="flex gap-3">
      <button
        onClick={onConfirm}
        disabled={disabled || selectedIncrement === null}
        className={cn(
          'flex min-h-[56px] flex-1 items-center justify-center rounded-xl bg-accent font-bold text-[#0a0a0a] transition-all duration-150',
          'hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100',
          pulse && 'animate-shimmer'
        )}
      >
        {selectedIncrement !== null
          ? `Bid ${formatPrice(currentBid + selectedIncrement)}`
          : 'Select a bid amount'}
      </button>

      {showSkip && (
        <button
          onClick={onSkip}
          disabled={hasSkipped}
          className={cn(
            'flex min-h-[56px] w-28 flex-col items-center justify-center gap-0.5 rounded-xl border border-card-border bg-card text-sm font-semibold text-text-secondary transition-all duration-150',
            'hover:border-accent/50 hover:text-text-primary active:scale-95',
            hasSkipped && 'cursor-not-allowed border-accent/30 text-accent opacity-80'
          )}
        >
          <span className="flex items-center gap-1">
            <span>⏭</span> {hasSkipped ? 'Skipped' : 'Skip'}
          </span>
          <span className="font-mono text-[10px] text-text-secondary">
            {skipCount}/{totalParticipants}
          </span>
        </button>
      )}
    </div>
  )
}
