'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/auction-logic'
import { countryFlag } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const ROLE_INITIALS: Record<string, string> = {
  Batter: 'B',
  Bowler: 'Bo',
  'All-rounder': 'AR',
  'Wicket-keeper': 'WK',
}

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
      <h1 className="text-center text-3xl font-bold text-text-primary">Final Squads</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {participants.map((p) => {
          const spent = room.purse_size - p.purse_remaining
          return (
            <Card key={p.id} padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">{p.display_name}</h2>
                <span className="text-xs text-text-secondary">
                  {p.squad.length}/{room.squad_size}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="font-mono text-lg font-bold text-accent">{formatPrice(spent)}</p>
                  <p className="text-xs text-text-secondary">Total spent</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-text-primary">
                    {formatPrice(p.purse_remaining)}
                  </p>
                  <p className="text-xs text-text-secondary">Purse remaining</p>
                </div>
              </div>

              <ul className="flex flex-col gap-1.5">
                {p.squad.map((player) => {
                  const paid = pricePaid[`${p.user_id}:${player.id}`] ?? player.base_price
                  return (
                    <li
                      key={player.id}
                      className="flex items-center justify-between rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span>{countryFlag(player.country)}</span>
                        <span className="text-text-primary">{player.name}</span>
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                          {ROLE_INITIALS[player.role]}
                        </span>
                      </span>
                      <span className="font-mono text-text-secondary">{formatPrice(paid)}</span>
                    </li>
                  )
                })}
                {p.squad.length === 0 && (
                  <li className="text-center text-sm text-text-secondary">No players acquired.</li>
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
