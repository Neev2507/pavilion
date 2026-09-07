'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/useRoom'
import { useAuction } from '@/hooks/useAuction'
import { useTimer } from '@/hooks/useTimer'
import { getUserId, getDisplayName } from '@/lib/utils'
import { getNominator, getSoldPlayerIds, formatPrice } from '@/lib/auction-logic'
import { Player } from '@/types'
import playersData from '@/data/players.json'
import PlayerCard from '@/components/auction/PlayerCard'
import BidChips from '@/components/auction/BidChips'
import BidFeed from '@/components/auction/BidFeed'
import PurseBar from '@/components/auction/PurseBar'
import SquadPanel from '@/components/auction/SquadPanel'
import NominationPicker from '@/components/auction/NominationPicker'
import Timer from '@/components/ui/Timer'
import Card from '@/components/ui/Card'

const players = playersData as Player[]

export default function AuctionPage({ params }: { params: { code: string } }) {
  const { code } = params
  const router = useRouter()
  const { room, participants, currentParticipant, loading: roomLoading } = useRoom(code)
  const { auctionState, bids, nominatePlayer, placeBid, resolveAuction } = useAuction(
    room?.id ?? ''
  )
  const { secondsLeft, isExpired } = useTimer(auctionState?.clock_ends_at ?? null)

  const [userId, setUserId] = useState('')

  useEffect(() => {
    const id = getUserId()
    const name = getDisplayName()
    if (!id || !name) {
      router.push('/')
      return
    }
    setUserId(id)
  }, [router])

  useEffect(() => {
    if (room?.status === 'finished') {
      router.push(`/room/${code}/squads`)
    } else if (room?.status === 'lobby') {
      router.push(`/room/${code}`)
    }
  }, [room?.status, code, router])

  const isHost = room?.host_id === userId

  useEffect(() => {
    if (!isHost) return
    if (!auctionState || auctionState.phase !== 'bidding') return
    if (!isExpired) return
    resolveAuction()
  }, [isHost, isExpired, auctionState, resolveAuction])

  if (roomLoading || !room || !auctionState) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading auction...</p>
      </main>
    )
  }

  const soldPlayerIds = new Set(getSoldPlayerIds(participants))
  const unsoldPlayers = players.filter((p) => !soldPlayerIds.has(p.id))
  const nominator = participants.length > 0 ? getNominator(participants, room.nomination_index) : null
  const isMyTurn = nominator?.user_id === userId

  const currentPlayer = auctionState.current_player_id
    ? players.find((p) => p.id === auctionState.current_player_id) ?? null
    : null

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-primary">Pavilion</h1>
        {currentParticipant && (
          <p className="font-mono text-sm text-text-secondary">
            Purse: <span className="text-accent">{formatPrice(currentParticipant.purse_remaining)}</span>
          </p>
        )}
      </header>

      {auctionState.phase === 'nomination' && (
        <div className="flex flex-1 flex-col gap-4">
          <Card padding="md" className="text-center">
            <p className="text-lg font-semibold text-text-primary">
              {isMyTurn ? 'Your turn to nominate' : `${nominator?.display_name ?? '...'}'s turn to nominate`}
            </p>
          </Card>

          {isMyTurn ? (
            <NominationPicker
              players={unsoldPlayers}
              onNominate={(player) => nominatePlayer(player.id, player.base_price)}
            />
          ) : (
            <p className="text-center text-text-secondary">
              Waiting for {nominator?.display_name ?? 'the next player'} to pick a player...
            </p>
          )}
        </div>
      )}

      {auctionState.phase === 'bidding' && currentPlayer && currentParticipant && (
        <div className="flex flex-1 flex-col gap-6">
          <PlayerCard
            player={currentPlayer}
            currentBid={auctionState.current_bid}
            currentBidderName={auctionState.current_bidder_name}
          />

          <div className="flex justify-center">
            <Timer secondsLeft={secondsLeft} />
          </div>

          <BidChips
            currentBid={auctionState.current_bid}
            onBid={(amount) => placeBid(amount)}
            purseRemaining={currentParticipant.purse_remaining}
            squadSlotsLeft={room.squad_size - currentParticipant.squad.length}
            disabled={
              currentParticipant.squad.length >= room.squad_size ||
              auctionState.current_bidder_id === userId
            }
          />

          <Card padding="md" className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Recent bids
            </h3>
            <BidFeed bids={bids} currentUserId={userId} />
          </Card>

          <Card padding="md">
            <PurseBar
              purseRemaining={currentParticipant.purse_remaining}
              purseSize={room.purse_size}
              squadCount={currentParticipant.squad.length}
              squadSize={room.squad_size}
            />
            <div className="mt-3">
              <SquadPanel squad={currentParticipant.squad} squadSize={room.squad_size} />
            </div>
          </Card>
        </div>
      )}

      {auctionState.phase === 'sold' && currentPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95">
          <p className="font-mono text-5xl font-bold text-accent">SOLD!</p>
          <p className="text-xl font-semibold text-text-primary">{currentPlayer.name}</p>
          <p className="font-mono text-2xl text-text-secondary">
            {formatPrice(auctionState.current_bid)} to {auctionState.current_bidder_name}
          </p>
        </div>
      )}

      {auctionState.phase === 'unsold' && currentPlayer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95">
          <p className="font-mono text-5xl font-bold text-error">UNSOLD</p>
          <p className="text-xl font-semibold text-text-primary">{currentPlayer.name}</p>
        </div>
      )}
    </main>
  )
}
