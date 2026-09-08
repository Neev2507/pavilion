import { Player } from '@/types'
import { countryFlag, cn, getInitials } from '@/lib/utils'
import { roleBio, formatPrice } from '@/lib/auction-logic'
import Card from '@/components/ui/Card'

interface PlayerCardProps {
  player: Player
}

const ROLE_COLORS: Record<Player['role'], string> = {
  Batter: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  Bowler: 'bg-red-500/20 text-red-400 border-red-500/40',
  'All-rounder': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Wicket-keeper': 'bg-amber/20 text-amber border-amber/40',
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card padding="lg" className="flex animate-rise-in flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-card-border bg-background font-mono text-lg font-bold text-text-primary">
        {getInitials(player.name)}
      </div>
      <h2 className="text-2xl font-bold text-text-primary">{player.name}</h2>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
            ROLE_COLORS[player.role]
          )}
        >
          {player.role}
        </span>
        <span className="text-sm text-text-secondary">
          {countryFlag(player.country)} {player.country}
        </span>
      </div>
      <p className="text-xs text-text-secondary">{roleBio(player.role)}</p>
      <p className="text-xs text-text-secondary">
        BASE PRICE <span className="font-mono text-text-primary">{formatPrice(player.base_price)}</span>
      </p>
    </Card>
  )
}
