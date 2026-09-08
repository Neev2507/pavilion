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
          'flex min-h-[56px] flex-1 items-center justify-center rounded bg-accent font-sans font-bold text-canvas transition-all duration-150',
          'hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent',
          pulse && 'animate-shimmer'
        )}
      >
        {selectedIncrement !== null ? (
          <>
            Bid <span className="type-mono ml-1.5">{formatPrice(currentBid + selectedIncrement)}</span>
          </>
        ) : (
          'Select a bid amount'
        )}
      </button>

      {showSkip && (
        <button
          onClick={onSkip}
          disabled={hasSkipped}
          className={cn(
            'flex min-h-[56px] w-28 flex-col items-center justify-center gap-0.5 rounded border border-border-2 bg-surface-1 text-sm font-medium text-text-secondary transition-all duration-150',
            'hover:border-accent hover:text-accent-high active:scale-[0.99]',
            hasSkipped && 'cursor-not-allowed text-accent opacity-80 hover:border-border-2'
          )}
        >
          <span className="flex items-center gap-1">
            <span>⏭</span> {hasSkipped ? 'Skipped' : 'Skip'}
          </span>
          <span className="type-mono text-[10px] text-text-dim">
            {skipCount}/{totalParticipants}
          </span>
        </button>
      )}
    </div>
  )
}
