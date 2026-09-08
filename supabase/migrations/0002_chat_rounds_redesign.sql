-- Migration: chat, round 2 recycling, pause, and the 11auction-style redesign.
-- Run this in your Supabase project's SQL editor after 0001.

-- Rename the queue fields to match the new round system's naming.
alter table rooms rename column player_order to player_queue;
alter table rooms rename column current_index to queue_index;

-- Player tier filtering is dropped from room settings in this redesign.
alter table rooms drop column if exists player_tier_filter;

-- New room settings / round-tracking columns.
alter table rooms add column if not exists player_order_mode text not null default 'random';
alter table rooms add column if not exists unsold_players jsonb not null default '[]';
alter table rooms add column if not exists round int not null default 1;

-- Round 2 "pick players to bring back" state, per participant.
alter table participants add column if not exists round2_ready boolean not null default false;
alter table participants add column if not exists round2_selections jsonb not null default '[]';

-- Host pause/resume support.
alter table auction_state add column if not exists paused boolean not null default false;
alter table auction_state add column if not exists paused_seconds_left int;

-- Chat.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  content text not null,
  sent_at timestamptz default now()
);

alter publication supabase_realtime add table messages;
