import { AuctionState, Player, PlayerOrderMode } from '@/types'

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

// Fixed bid increments (in Lakhs) offered as buttons: +₹25L, +₹50L,
// +₹75L, +₹1Cr, +₹5Cr, each added on top of whatever the current bid is.
export const BID_INCREMENTS = [25, 50, 75, 100, 500]

// Format Lakhs to display string.
export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${lakhs / 100} Cr`
  return `₹${lakhs} L`
}

// Generate a random uppercase 6-character alphanumeric room code.
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Generic, role-derived playing style line (no per-player data is tracked).
export function roleBio(role: Player['role']): string {
  switch (role) {
    case 'Batter':
      return 'right-hand bat'
    case 'Bowler':
      return 'right-arm fast-medium'
    case 'All-rounder':
      return 'right-hand bat | right-arm fast-medium'
    case 'Wicket-keeper':
      return 'right-hand bat | wicket-keeper'
  }
}

const CATEGORY_ORDER: Player['role'][] = ['Batter', 'Bowler', 'All-rounder', 'Wicket-keeper']

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Build the auction queue for a room: either fully shuffled, or grouped
// Batters -> Bowlers -> All-rounders -> Wicket-keepers (randomised within
// each group). Either way every eligible player appears exactly once.
export function buildPlayerQueue(players: Player[], mode: PlayerOrderMode): string[] {
  if (mode === 'random') {
    return shuffle(players).map((p) => p.id)
  }

  const queue: string[] = []
  for (const role of CATEGORY_ORDER) {
    const group = shuffle(players.filter((p) => p.role === role))
    queue.push(...group.map((p) => p.id))
  }
  return queue
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
    paused: false,
    paused_seconds_left: null,
    skips: [],
    phase: 'bidding',
    updated_at: new Date().toISOString(),
  }
}
