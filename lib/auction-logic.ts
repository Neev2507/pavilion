import { AuctionState, Player, PlayerTierFilter } from '@/types'

// Returns true if the user can afford to place newBid.
// Must have enough left over to still fill remaining squad slots at base price 50L each.
export function canAffordBid(
  newBid: number,
  purseRemaining: number,
  squadSlotsLeft: number
): boolean {
  const slotsAfterWin = squadSlotsLeft - 1
  const reserve = slotsAfterWin * 50 // minimum 50L per remaining slot
  return purseRemaining - newBid >= reserve
}

// Minimum purse the user must keep in reserve.
export function minimumReserve(squadSlotsLeft: number): number {
  return squadSlotsLeft * 50
}

// Dynamic bid chips based on current bid level.
export function getBidChips(currentBid: number): number[] {
  if (currentBid < 100) return [25, 50, 75, 100]
  if (currentBid < 500) return [50, 100, 200, 500]
  if (currentBid < 1000) return [100, 200, 500, 1000]
  return [200, 500, 1000, 2000]
}

// Format Lakhs to display string.
export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${lakhs / 100} Cr`
  return `₹${lakhs} L`
}

// Generate a random uppercase 6-character alphanumeric room code.
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const ROLE_ORDER: Player['role'][] = ['Batter', 'All-rounder', 'Bowler', 'Wicket-keeper']

// Restrict the player pool to a tier filter chosen in room settings.
export function filterPlayersByTier(players: Player[], filter: PlayerTierFilter): Player[] {
  if (filter === 'legends_only') return players.filter((p) => p.tier === 'Legend')
  if (filter === 'legends_greats') {
    return players.filter((p) => p.tier === 'Legend' || p.tier === 'Great')
  }
  return players
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Build the fixed auction order for a room: Batters, then All-rounders,
// then Bowlers, then Wicket-keepers, randomised within each group.
export function buildPlayerOrder(players: Player[], tierFilter: PlayerTierFilter): string[] {
  const eligible = filterPlayersByTier(players, tierFilter)
  const order: string[] = []
  for (const role of ROLE_ORDER) {
    const group = shuffle(eligible.filter((p) => p.role === role))
    order.push(...group.map((p) => p.id))
  }
  return order
}

// Shape of the auction_state row for putting a player up for bidding.
export function buildBiddingState(
  roomId: string,
  playerId: string,
  basePrice: number,
  shotClockSeconds: number
): Omit<AuctionState, 'id'> {
  return {
    room_id: roomId,
    current_player_id: playerId,
    current_base_price: basePrice,
    current_bid: basePrice,
    current_bidder_id: null,
    current_bidder_name: null,
    clock_ends_at: new Date(Date.now() + shotClockSeconds * 1000).toISOString(),
    phase: 'bidding',
    updated_at: new Date().toISOString(),
  }
}
