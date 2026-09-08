'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/auction-logic'
import { countryFlag } from '@/lib/utils'
import { ROLE_BADGE_CLASSES, ROLE_INITIALS } from '@/lib/role-styles'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SquadsPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, loading } = useRoom(code)
  const [pricePaid, setPricePaid] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!room) return

    async function loadBids() {
      const supabase = createClient()
      const { data } = await supabase.from('bids').select('*').eq('room_id', room!.id)
      if (!data) return

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
  }, [room])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading squads...</p>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Room not found.</p>
        <Button onClick={() => router.push('/')}>Back home</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <h1 className="type-display text-center text-3xl font-semibold text-text-bright">
        Final Squads
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {participants.map((p) => {
          const spent = room.purse_size - p.purse_remaining
          return (
            <Card key={p.id} padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">{p.display_name}</h2>
                <span className="type-mono text-xs text-text-secondary">
                  {p.squad.length}/{room.squad_size}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="type-mono text-lg font-semibold text-accent">{formatPrice(spent)}</p>
                  <p className="type-label text-text-dim">Total spent</p>
                </div>
                <div>
                  <p className="type-mono text-lg font-semibold text-text-primary">
                    {formatPrice(p.purse_remaining)}
                  </p>
                  <p className="type-label text-text-dim">Purse remaining</p>
                </div>
              </div>

              <ul className="flex flex-col gap-1.5">
                {p.squad.map((player) => {
                  const paid = pricePaid[`${p.user_id}:${player.id}`] ?? player.base_price
                  return (
                    <li
                      key={player.id}
                      className="flex items-center justify-between rounded border border-border-1 bg-surface-2 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span>{countryFlag(player.country)}</span>
                        <span className="type-display font-medium text-text-bright">{player.name}</span>
                        <span
                          className={`rounded-full border px-1.5 py-0.5 type-label ${ROLE_BADGE_CLASSES[player.role]}`}
                        >
                          {ROLE_INITIALS[player.role]}
                        </span>
                      </span>
                      <span className="type-mono text-text-secondary">{formatPrice(paid)}</span>
                    </li>
                  )
                })}
                {p.squad.length === 0 && (
                  <li className="text-center text-sm text-text-dim">No players acquired.</li>
                )}
              </ul>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={() => router.push('/')} size="lg">
          Play again
        </Button>
      </div>
    </main>
  )
}
