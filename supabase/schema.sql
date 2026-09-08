-- Rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id text not null,
  status text not null default 'lobby', -- lobby | auction | round2_selection | finished
  purse_size bigint not null default 10000, -- stored in Lakhs (₹100 Cr = 10000 L)
  squad_size int not null default 15,
  shot_clock_seconds int not null default 15,
  player_order_mode text not null default 'random', -- random | category
  player_queue jsonb not null default '[]', -- ordered array of player ids for the current round
  queue_index int not null default 0, -- pointer into player_queue
  unsold_players jsonb not null default '[]', -- player ids that went unsold in round 1
  round int not null default 1,
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
  round2_ready boolean not null default false,
  round2_selections jsonb not null default '[]',
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
  paused boolean not null default false,
  paused_seconds_left int,
  skips jsonb not null default '[]', -- user_ids who skipped the current player
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

-- Chat messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  content text not null,
  sent_at timestamptz default now()
);

-- Enable Supabase Realtime on all tables
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table auction_state;
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table messages;

-- Large jsonb columns (player_queue, squad) get TOASTed by Postgres past
-- ~2KB, and unchanged TOASTed columns are omitted from UPDATE replication
-- payloads by default. REPLICA IDENTITY FULL keeps realtime UPDATE events
-- carrying the complete row so those fields never arrive as missing.
alter table rooms replica identity full;
alter table participants replica identity full;
alter table auction_state replica identity full;
alter table bids replica identity full;
alter table messages replica identity full;
