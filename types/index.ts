export interface Player {
  id: string
  name: string
  country: string
  era: string
  role: 'Batter' | 'Bowler' | 'All-rounder' | 'Wicket-keeper'
  base_price: number // in Lakhs: 200 | 100 | 50
  tier: 'Legend' | 'Great' | 'Good'
}

export type PlayerOrderMode = 'random' | 'category'

export interface Room {
  id: string
  code: string
  host_id: string
  status: 'lobby' | 'auction' | 'round2_selection' | 'finished'
  purse_size: number
  squad_size: number
  shot_clock_seconds: number
  player_order_mode: PlayerOrderMode
  player_queue: string[]
  queue_index: number
  unsold_players: string[]
  round: number
}

export interface Participant {
  id: string
  room_id: string
  user_id: string
  display_name: string
  purse_remaining: number
  squad: Player[]
  round2_ready: boolean
  round2_selections: string[]
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
  paused: boolean
  paused_seconds_left: number | null
  skips: string[]
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

export interface Message {
  id: string
  room_id: string
  user_id: string
  display_name: string
  content: string
  sent_at: string
}
