import { BID_INCREMENTS, canAffordBid, formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'

interface BidAmountPickerProps {
  currentBid: number
  purseRemaining: number
  squadSlotsLeft: number
  selected: number | null
  disabled: boolean
  onSelect: (increment: number) => void
}

export default function BidAmountPicker({
  currentBid,
  purseRemaining,
  squadSlotsLeft,
  selected,
  disabled,
  onSelect,
}: BidAmountPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {BID_INCREMENTS.map((increment) => {
        // The only reasons a bid button is ever disabled: the resulting
        // bid would be unaffordable, or the outer `disabled` gate (paused,
        // squad full, or this user is already the current bidder). Nothing
        // about the current bid amount itself disables a button — there is
        // always a next increment on top of whatever it currently is.
        const unaffordable = !canAffordBid(currentBid + increment, purseRemaining, squadSlotsLeft)
        const isDisabled = disabled || unaffordable
        const isSelected = selected === increment

        return (
          <button
            key={increment}
            onClick={() => onSelect(increment)}
            disabled={isDisabled}
            className={cn(
              'min-h-[44px] rounded border type-mono text-sm font-medium transition-all duration-150',
              isSelected
                ? 'border-accent bg-accent/10 text-accent-high'
                : 'border-border-1 bg-surface-1 text-text-primary hover:border-accent hover:text-accent-high',
              isDisabled && 'cursor-not-allowed opacity-40 hover:border-border-1 hover:text-text-primary'
            )}
          >
            +{formatPrice(increment)}
          </button>
        )
      })}
    </div>
  )
}
