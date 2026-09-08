'use client'

import { useEffect, useState } from 'react'
import { Room, Participant, Bid, Player } from '@/types'
import { formatPrice } from '@/lib/auction-logic'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import playersData from '@/data/players.json'

const players = playersData as Player[]

interface AuctionSidebarProps {
  room: Room
  participants: Participant[]
  currentUserId: string
  bids: Bid[]
}

const ROLE_COLORS: Record<Player['role'], string> = {
  Batter: 'bg-blue-500/20 text-blue-400',
  Bowler: 'bg-red-500/20 text-red-400',
  'All-rounder': 'bg-green-500/20 text-green-400',
  'Wicket-keeper': 'bg-amber/20 text-amber',
}

const ROLE_INITIALS: Record<Player['role'], string> = {
  Batter: 'B',
  Bowler: 'Bo',
  'All-rounder': 'AR',
  'Wicket-keeper': 'WK',
}

function SquadDots({ filled, total }: { filled: number; total: number }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i < filled ? 'bg-accent' : 'border border-dashed border-card-border'
          )}
        />
      ))}
    </div>
  )
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
      <Card padding="lg" className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Your purse
        </p>
        <p className="font-mono text-3xl font-bold text-amber">
          {formatPrice(me?.purse_remaining ?? room.purse_size)}
        </p>
        <p className="text-xs text-text-secondary">
          {me?.squad.length ?? 0} of {room.squad_size} slots filled
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Teams</h3>
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
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span className="truncate text-sm font-medium text-text-primary">
                      {p.display_name}
                    </span>
                    {p.user_id === currentUserId && (
                      <span className="shrink-0 text-xs text-text-secondary">(you)</span>
                    )}
                    {p.user_id === room.host_id && (
                      <span className="shrink-0 rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        ADMIN
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-[10px] text-text-secondary">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  <span className="shrink-0 font-mono text-xs text-text-secondary">
                    {formatPrice(p.purse_remaining)}
                  </span>
                </div>
                <SquadDots filled={p.squad.length} total={room.squad_size} />
                <p className="text-right text-[10px] text-text-secondary">
                  {p.squad.length}/{room.squad_size}
                </p>

                {isOpen && (
                  <div className="flex animate-fade-in flex-col gap-1.5 border-t border-card-border pt-2">
                    {p.squad.length === 0 ? (
                      <p className="text-xs text-text-secondary">No players yet.</p>
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
                                  'shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px]',
                                  ROLE_COLORS[player.role]
                                )}
                              >
                                {ROLE_INITIALS[player.role]}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-text-secondary">
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

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Activity
        </h3>
        {bids.length === 0 ? (
          <p className="text-sm text-text-secondary">No bids yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {bids.slice(0, 6).map((bid) => {
              const player = players.find((p) => p.id === bid.player_id)
              return (
                <li key={bid.id} className="text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{bid.display_name}</span> bid{' '}
                  <span className="font-mono text-accent">{formatPrice(bid.amount)}</span>
                  {player ? ` on ${player.name}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
