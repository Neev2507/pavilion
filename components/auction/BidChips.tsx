'use client'

import { getBidChips, canAffordBid, formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidChipsProps {
  currentBid: number
  onBid: (amount: number) => void
  purseRemaining: number
  squadSlotsLeft: number
  disabled: boolean
}

export default function BidChips({
  currentBid,
  onBid,
  purseRemaining,
  squadSlotsLeft,
  disabled,
}: BidChipsProps) {
  const chips = getBidChips(currentBid)

  return (
    <div className="grid grid-cols-4 gap-2">
      {chips.map((chip) => {
        const newBid = currentBid + chip
        const affordable = canAffordBid(newBid, purseRemaining, squadSlotsLeft)
        const isDisabled = disabled || !affordable

        return (
          <button
            key={chip}
            onClick={() => onBid(newBid)}
            disabled={isDisabled}
            className={cn(
              'min-h-[44px] rounded-lg border border-accent bg-card font-mono text-sm font-semibold text-accent transition-all duration-150',
              'hover:bg-accent/10 active:bg-accent/20',
              isDisabled && 'cursor-not-allowed opacity-30 hover:bg-card'
            )}
          >
            +{formatPrice(chip)}
          </button>
        )
      })}
    </div>
  )
}
