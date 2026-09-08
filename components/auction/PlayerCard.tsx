import { Player } from '@/types'
import { countryFlag, cn, getInitials } from '@/lib/utils'
import { roleBio, formatPrice } from '@/lib/auction-logic'
import { ROLE_BADGE_CLASSES } from '@/lib/role-styles'
import Card from '@/components/ui/Card'

interface PlayerCardProps {
  player: Player
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card active padding="lg" className="flex animate-rise-in flex-col items-center gap-3 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border-1 bg-surface-2 type-mono text-lg font-semibold text-text-primary">
        {getInitials(player.name)}
      </div>
      <h2 className="type-display text-3xl font-semibold text-text-bright">{player.name}</h2>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-[22px] items-center rounded-full border px-3 type-label',
            ROLE_BADGE_CLASSES[player.role]
          )}
        >
          {player.role}
        </span>
        <span className="text-sm text-text-secondary">
          {countryFlag(player.country)} {player.country}
        </span>
      </div>
      <p className="text-xs text-text-dim">{roleBio(player.role)}</p>
      <p className="type-label text-text-dim">
        Base price <span className="type-mono text-sm text-text-primary">{formatPrice(player.base_price)}</span>
      </p>
    </Card>
  )
}
