import { cn } from '@/lib/utils'

interface TimerProps {
  secondsLeft: number
  totalSeconds?: number
}

const RADIUS = 40
const STROKE = 4
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Timer({ secondsLeft, totalSeconds = 15 }: TimerProps) {
  const clamped = Math.max(0, Math.min(secondsLeft, totalSeconds))
  const progress = totalSeconds > 0 ? clamped / totalSeconds : 0
  const offset = CIRCUMFERENCE * (1 - progress)

  const colorClass =
    clamped < 3 ? 'text-error' : clamped <= 5 ? 'text-amber' : 'text-text-primary'
  const strokeColorClass =
    clamped < 3 ? 'stroke-error' : clamped <= 5 ? 'stroke-amber' : 'stroke-accent'

  return (
    <div
      className={cn(
        'relative flex h-24 w-24 items-center justify-center',
        clamped <= 3 && clamped > 0 && 'animate-pulse-fast'
      )}
    >
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-card-border"
        />
        <circle
          cx="48"
          cy="48"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn('transition-[stroke-dashoffset] duration-150 ease-linear', strokeColorClass)}
        />
      </svg>
      <span className={cn('absolute font-mono text-2xl font-bold', colorClass)}>{clamped}</span>
    </div>
  )
}
