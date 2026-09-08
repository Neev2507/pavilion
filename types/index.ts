export interface Player {
  id: string
  name: string
  country: string
  era: string
  role: 'Batter' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
  base_price: number // in Lakhs: 200 | 100 | 50
  tier: 'Legend' | 'Great' | 'Good'
}

export type PlayerTierFilter = 'all' | 'legends_greats' | 'legends_only'

export interface Room {
  id: string
  code: string
  host_id: string
  status: 'lobby' | 'auction' | 'finished'
  purse_size: number
  squad_size: number
  shot_clock_seconds: number
  player_tier_filter: PlayerTierFilter
  player_order: string[]
  current_index: number
}

export interface Participant {
  id: string
  room_id: string
  user_id: string
  display_name: string
  purse_remaining: number
  squad: Player[]
}

export interface AuctionState {
  id: string
  room_id: string
  current_player_id: string | null
  current_base_price: number
  current_bid: number
  current_bidder_id: string | null
  current_bidder_name: string | null
  clock_ends_at: string | null
  phase: 'nomination' | 'bidding' | 'sold' | 'unsold'
  updated_at: string
}

export interface Bid {
  id: string
  room_id: string
  player_id: string
  user_id: string
  display_name: string
  amount: number
  placed_at: string
}
