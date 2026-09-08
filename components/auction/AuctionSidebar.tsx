'use client'

import { useEffect, useState } from 'react'
import { Room, Participant, Bid, Player } from '@/types'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ROLE_BADGE_CLASSES, ROLE_INITIALS } from '@/lib/role-styles'
import Card from '@/components/ui/Card'
import playersData from '@/data/players.json'

const players = playersData as Player[]

interface AuctionSidebarProps {
  room: Room
  participants: Participant[]
  currentUserId: string
  bids: Bid[]
}

function SquadDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i < filled ? 'bg-accent' : 'border border-dashed border-border-2'
          )}
        />
      ))}
    </div>
  )
}

function PurseBar({ remaining, total }: { remaining: number; total: number }) {
  const spentPct = total > 0 ? Math.max(0, Math.min(100, ((total - remaining) / total) * 100)) : 0
  return (
    <div className="flex h-1 w-full overflow-hidden bg-surface-2">
      <div
        className="h-full"
        style={{
          width: `${spentPct}%`,
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--accent-muted), var(--accent-muted) 3px, transparent 3px, transparent 6px)',
        }}
      />
      <div className="h-full flex-1 bg-accent" />
    </div>
  )
}

function relativeTime(placedAt: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000))
  if (diffSec < 2) return 'now'
  if (diffSec < 60) return `${diffSec}s`
  return `${Math.floor(diffSec / 60)}m`
}

export default function AuctionSidebar({
  room,
  participants,
  currentUserId,
  bids,
}: AuctionSidebarProps) {
  const me = participants.find((p) => p.user_id === currentUserId)
  const [openParticipantId, setOpenParticipantId] = useState<string | null>(null)
  const [pricePaid, setPricePaid] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false

    async function loadBids() {
      const supabase = createClient()
      const { data } = await supabase.from('bids').select('*').eq('room_id', room.id)
      if (cancelled || !data) return

      const highest: Record<string, number> = {}
      for (const bid of data) {
        const key = `${bid.user_id}:${bid.player_id}`
        if (!highest[key] || bid.amount > highest[key]) {
          highest[key] = bid.amount
        }
      }
      setPricePaid(highest)
    }

    loadBids()

    return () => {
      cancelled = true
    }
  }, [room.id, participants])

  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[260px] lg:shrink-0">
      <Card padding="lg" className="flex flex-col gap-2">
        <p className="type-label text-text-dim">Your purse</p>
        <p className="type-mono text-3xl font-semibold text-accent">
          {formatPrice(me?.purse_remaining ?? room.purse_size)}
        </p>
        <PurseBar remaining={me?.purse_remaining ?? room.purse_size} total={room.purse_size} />
        <p className="text-xs text-text-secondary">
          {me?.squad.length ?? 0} of {room.squad_size} slots filled
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="type-label text-text-dim">Teams</h3>
        <div className="flex flex-col gap-2">
          {participants.map((p) => {
            const isOpen = openParticipantId === p.id
            return (
              <Card key={p.id} padding="sm" className="flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setOpenParticipantId(isOpen ? null : p.id)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-signal-green" />
                    <span className="truncate text-sm font-medium text-text-primary">
                      {p.display_name}
                    </span>
                    {p.user_id === currentUserId && (
                      <span className="shrink-0 text-xs text-text-dim">(you)</span>
                    )}
                    {p.user_id === room.host_id && (
                      <span className="shrink-0 rounded-full bg-accent/10 border border-accent px-1.5 py-0.5 type-label text-accent-high">
                        Admin
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-[10px] text-text-dim">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  <span className="shrink-0 type-mono text-xs text-text-secondary">
                    {formatPrice(p.purse_remaining)}
                  </span>
                </div>
                <SquadDots filled={p.squad.length} total={room.squad_size} />
                <p className="text-right text-[10px] text-text-dim">
                  {p.squad.length}/{room.squad_size}
                </p>

                {isOpen && (
                  <div className="flex animate-fade-in flex-col gap-1.5 border-t border-border-1 pt-2">
                    {p.squad.length === 0 ? (
                      <p className="text-xs text-text-dim">No players yet.</p>
                    ) : (
                      p.squad.map((player) => {
                        const paid = pricePaid[`${p.user_id}:${player.id}`] ?? player.base_price
                        return (
                          <div
                            key={player.id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-text-primary">{player.name}</span>
                              <span
                                className={cn(
                                  'shrink-0 rounded-full border px-1.5 py-0.5 type-label',
                                  ROLE_BADGE_CLASSES[player.role]
                                )}
                              >
                                {ROLE_INITIALS[player.role]}
                              </span>
                            </span>
                            <span className="shrink-0 type-mono text-text-secondary">
                              {formatPrice(paid)}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded border border-border-1">
        <h3 className="type-label bg-surface-1 px-3 py-2 text-text-dim">Activity</h3>
        {bids.length === 0 ? (
          <p className="bg-surface-1 px-3 py-3 text-sm text-text-secondary">No bids yet.</p>
        ) : (
          <ul>
            {bids.slice(0, 6).map((bid, i) => {
              const player = players.find((p) => p.id === bid.player_id)
              return (
                <li
                  key={bid.id}
                  className={cn(
                    'flex items-center justify-between gap-2 border-t border-surface-2 px-3 py-2 text-xs',
                    i % 2 === 0 ? 'bg-surface-1' : 'bg-[#140d08]'
                  )}
                >
                  <span className="min-w-0 truncate text-text-secondary">
                    <span className="font-medium text-text-primary">{bid.display_name}</span>
                    {player ? ` · ${player.name}` : ''}
                    <span className="ml-1.5 text-text-dim">{relativeTime(bid.placed_at)}</span>
                  </span>
                  <span className="shrink-0 type-mono text-accent">{formatPrice(bid.amount)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
