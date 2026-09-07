'use client'

import { useMemo, useState } from 'react'
import { Player } from '@/types'
import { countryFlag, cn } from '@/lib/utils'

interface NominationPickerProps {
  players: Player[]
  onNominate: (player: Player) => void
}

const ROLE_ORDER: Player['role'][] = ['Batter', 'Bowler', 'All-rounder', 'Wicket-keeper']

const TIER_COLORS: Record<Player['tier'], string> = {
  Legend: 'bg-accent/20 text-accent border-accent/40',
  Great: 'bg-amber/20 text-amber border-amber/40',
  Good: 'bg-white/10 text-text-secondary border-white/20',
}

export default function NominationPicker({ players, onNominate }: NominationPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return players
    return players.filter(
      (p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
    )
  }, [players, query])

  const grouped = useMemo(() => {
    const groups: Record<string, Player[]> = {}
    for (const role of ROLE_ORDER) groups[role] = []
    for (const player of filtered) {
      groups[player.role]?.push(player)
    }
    return groups
  }, [filtered])

  return (
    <div className="flex w-full flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players by name or country..."
        className="min-h-[44px] w-full rounded-lg border border-card-border bg-card px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
      />

      <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto pr-1">
        {ROLE_ORDER.map((role) => {
          const rolePlayers = grouped[role]
          if (!rolePlayers || rolePlayers.length === 0) return null

          return (
            <div key={role} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {role} ({rolePlayers.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {rolePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onNominate(player)}
                    className="flex min-h-[44px] flex-col items-start gap-1 rounded-lg border border-card-border bg-card px-3 py-2 text-left transition-all duration-150 hover:border-accent hover:bg-accent/5 active:bg-accent/10"
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="truncate text-sm font-medium text-text-primary">
                        {player.name}
                      </span>
                      <span>{countryFlag(player.country)}</span>
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                        TIER_COLORS[player.tier]
                      )}
                    >
                      {player.tier}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-text-secondary">No players match your search.</p>
        )}
      </div>
    </div>
  )
}
