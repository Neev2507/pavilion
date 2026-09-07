'use client'

import { useEffect, useState } from 'react'
import { Player } from '@/types'
import { countryFlag, cn } from '@/lib/utils'
import { formatPrice } from '@/lib/auction-logic'
import Card from '@/components/ui/Card'

interface PlayerCardProps {
  player: Player
  currentBid: number
  currentBidderName: string | null
}

const ROLE_COLORS: Record<Player['role'], string> = {
  Batter: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  Bowler: 'bg-red-500/20 text-red-400 border-red-500/40',
  'All-rounder': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Wicket-keeper': 'bg-amber/20 text-amber border-amber/40',
}

export default function PlayerCard({ player, currentBid, currentBidderName }: PlayerCardProps) {
  const [pop, setPop] = useState(false)

  useEffect(() => {
    setPop(true)
    const t = setTimeout(() => setPop(false), 300)
    return () => clearTimeout(t)
  }, [currentBid])

  const noBidsYet = currentBid === player.base_price && !currentBidderName

  return (
    <Card padding="lg" className="flex flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-2 text-3xl">
        <span>{countryFlag(player.country)}</span>
      </div>
      <h2 className="text-2xl font-bold text-text-primary">{player.name}</h2>
      <span
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
          ROLE_COLORS[player.role]
        )}
      >
        {player.role}
      </span>
      <p className="text-sm text-text-secondary">
        {player.country} &middot; {player.era}
      </p>
      <p className="text-xs text-text-secondary">Base price: {formatPrice(player.base_price)}</p>

      <div className="mt-2 flex flex-col items-center gap-1">
        <span
          className={cn(
            'font-mono text-4xl font-bold text-accent transition-transform',
            pop && 'animate-scale-pop'
          )}
        >
          {formatPrice(currentBid)}
        </span>
        <span className="text-sm text-text-secondary">
          {noBidsYet ? 'No bids yet' : `${currentBidderName} is leading`}
        </span>
      </div>
    </Card>
  )
}
