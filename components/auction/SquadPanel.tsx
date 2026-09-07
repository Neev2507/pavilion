import { Player } from '@/types'

interface SquadPanelProps {
  squad: Player[]
  squadSize: number
}

const ROLE_INITIALS: Record<Player['role'], string> = {
  Batter: 'B',
  Bowler: 'Bo',
  'All-rounder': 'AR',
  'Wicket-keeper': 'WK',
}

export default function SquadPanel({ squad, squadSize }: SquadPanelProps) {
  const emptySlots = Math.max(0, squadSize - squad.length)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Your squad &middot; {squad.length}/{squadSize}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {squad.map((player) => (
          <div
            key={player.id}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border bg-card px-3 py-1.5 text-xs"
          >
            <span className="font-medium text-text-primary">{player.name}</span>
            <span className="rounded-full bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
              {ROLE_INITIALS[player.role]}
            </span>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-8 w-16 shrink-0 rounded-full border border-dashed border-card-border"
          />
        ))}
      </div>
    </div>
  )
}
