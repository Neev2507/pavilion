-- Rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id text not null,
  status text not null default 'lobby', -- lobby | auction | finished
  purse_size bigint not null default 10000, -- stored in Lakhs (₹100 Cr = 10000 L)
  squad_size int not null default 15,
  shot_clock_seconds int not null default 15,
  player_tier_filter text not null default 'all', -- all | legends_greats | legends_only
  player_order jsonb not null default '[]', -- ordered array of player ids for this room's auction
  current_index int not null default 0, -- pointer into player_order
  created_at timestamptz default now()
);

-- Participants table
create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  purse_remaining bigint not null default 10000,
  squad jsonb not null default '[]',
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- Auction state (one row per room, upserted)
create table auction_state (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade unique,
  current_player_id text,
  current_base_price bigint not null default 0,
  current_bid bigint not null default 0,
  current_bidder_id text,
  current_bidder_name text,
  clock_ends_at timestamptz,
  phase text not null default 'nomination', -- nomination | bidding | sold | unsold
  updated_at timestamptz default now()
);

-- Bid history
create table bids (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  player_id text not null,
  user_id text not null,
  display_name text not null,
  amount bigint not null,
  placed_at timestamptz default now()
);

-- Enable Supabase Realtime on all four tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table auction_state;
alter publication supabase_realtime add table bids;
