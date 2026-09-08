'use client'

import { Room, PlayerTierFilter } from '@/types'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type SettingsPatch = Partial<
  Pick<Room, 'purse_size' | 'squad_size' | 'shot_clock_seconds' | 'player_tier_filter'>
>

interface RoomSettingsProps {
  room: Room
  isHost: boolean
  onChange: (patch: SettingsPatch) => void
}

const PURSE_OPTIONS: { label: string; value: number }[] = [
  { label: '₹50 Cr', value: 5000 },
  { label: '₹100 Cr', value: 10000 },
  { label: '₹200 Cr', value: 20000 },
]

const SQUAD_SIZE_OPTIONS: { label: string; value: number }[] = [
  { label: '11', value: 11 },
  { label: '15', value: 15 },
  { label: '18', value: 18 },
]

const SHOT_CLOCK_OPTIONS: { label: string; value: number }[] = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
]

const TIER_OPTIONS: { label: string; value: PlayerTierFilter }[] = [
  { label: 'All players', value: 'all' },
  { label: 'Legends & Greats only', value: 'legends_greats' },
  { label: 'Legends only', value: 'legends_only' },
]

function OptionRow<T extends string | number>({
  label,
  options,
  value,
  disabled,
  onSelect,
}: {
  label: string
  options: { label: string; value: T }[]
  value: T
  disabled: boolean
  onSelect: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={String(option.value)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option.value)}
              className={cn(
                'min-h-[40px] rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-card-border bg-background text-text-secondary',
                !disabled && !active && 'hover:border-accent/50 hover:text-text-primary',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function RoomSettings({ room, isHost, onChange }: RoomSettingsProps) {
  return (
    <Card padding="lg" className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Auction settings
        </h2>
        {!isHost && <span className="text-xs text-text-secondary">Set by host</span>}
      </div>

      <OptionRow
        label="Purse per team"
        options={PURSE_OPTIONS}
        value={room.purse_size}
        disabled={!isHost}
        onSelect={(value) => onChange({ purse_size: value })}
      />

      <OptionRow
        label="Squad size"
        options={SQUAD_SIZE_OPTIONS}
        value={room.squad_size}
        disabled={!isHost}
        onSelect={(value) => onChange({ squad_size: value })}
      />

      <OptionRow
        label="Shot clock"
        options={SHOT_CLOCK_OPTIONS}
        value={room.shot_clock_seconds}
        disabled={!isHost}
        onSelect={(value) => onChange({ shot_clock_seconds: value })}
      />

      <OptionRow
        label="Player tiers"
        options={TIER_OPTIONS}
        value={room.player_tier_filter}
        disabled={!isHost}
        onSelect={(value) => onChange({ player_tier_filter: value })}
      />
    </Card>
  )
}
