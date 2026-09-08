'use client'

import { Room, PlayerOrderMode } from '@/types'
import { cn } from '@/lib/utils'

type SettingsPatch = Partial<
  Pick<Room, 'purse_size' | 'squad_size' | 'shot_clock_seconds' | 'player_order_mode'>
>

interface RoomSettingsProps {
  room: Room
  isHost: boolean
  onChange: (patch: SettingsPatch) => void
}

const PURSE_OPTIONS = [
  { label: '₹100 Cr', value: 10000 },
  { label: '₹125 Cr', value: 12500 },
  { label: '₹150 Cr', value: 15000 },
  { label: '₹175 Cr', value: 17500 },
  { label: '₹200 Cr', value: 20000 },
]

const SQUAD_SIZE_OPTIONS = [11, 15, 18]

const SHOT_CLOCK_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]

const ORDER_OPTIONS: { label: string; value: PlayerOrderMode }[] = [
  { label: 'Random', value: 'random' },
  { label: 'By Category', value: 'category' },
]

function Select({
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  label: string
  value: string | number
  disabled: boolean
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="type-label text-text-dim">{label}</p>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'min-h-[44px] rounded border border-border-1 bg-surface-2 px-3 py-2 text-sm text-text-primary accent-accent transition-colors duration-150',
          'focus:border-accent focus:outline-none',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        {children}
      </select>
    </div>
  )
}

export default function RoomSettings({ room, isHost, onChange }: RoomSettingsProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-xs text-text-dim">
        Editable until the auction starts{!isHost && ' — set by the host'}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Purse"
          value={room.purse_size}
          disabled={!isHost}
          onChange={(v) => onChange({ purse_size: Number(v) })}
        >
          {PURSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          label="Squad"
          value={room.squad_size}
          disabled={!isHost}
          onChange={(v) => onChange({ squad_size: Number(v) })}
        >
          {SQUAD_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} players
            </option>
          ))}
        </Select>

        <Select
          label="Timer"
          value={room.shot_clock_seconds}
          disabled={!isHost}
          onChange={(v) => onChange({ shot_clock_seconds: Number(v) })}
        >
          {SHOT_CLOCK_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}s
            </option>
          ))}
        </Select>

        <Select
          label="Order"
          value={room.player_order_mode}
          disabled={!isHost}
          onChange={(v) => onChange({ player_order_mode: v as PlayerOrderMode })}
        >
          {ORDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
