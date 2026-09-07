import { formatPrice } from '@/lib/auction-logic'

interface PurseBarProps {
  purseRemaining: number
  purseSize: number
  squadCount: number
  squadSize: number
}

export default function PurseBar({
  purseRemaining,
  purseSize,
  squadCount,
  squadSize,
}: PurseBarProps) {
  const spent = purseSize - purseRemaining
  const spentPct = purseSize > 0 ? Math.min(100, (spent / purseSize) * 100) : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-mono text-lg font-bold text-accent">{formatPrice(purseRemaining)}</p>
          <p className="text-xs text-text-secondary">Purse left</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-text-primary">{squadCount}</p>
          <p className="text-xs text-text-secondary">Players bought</p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-text-primary">{squadSize - squadCount}</p>
          <p className="text-xs text-text-secondary">Slots left</p>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-200"
          style={{ width: `${spentPct}%` }}
        />
      </div>
    </div>
  )
}
