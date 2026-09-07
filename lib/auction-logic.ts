import { Participant } from '@/types'

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

// Get the participant whose turn it is to nominate.
export function getNominator(participants: Participant[], nominationIndex: number): Participant {
  const sorted = [...participants].sort((a, b) => a.nomination_order - b.nomination_order)
  return sorted[nominationIndex % sorted.length]
}

// Get all player IDs already in any squad.
export function getSoldPlayerIds(participants: Participant[]): string[] {
  return participants.flatMap((p) => p.squad.map((player) => player.id))
}
