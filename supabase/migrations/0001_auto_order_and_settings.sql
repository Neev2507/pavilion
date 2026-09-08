-- Migration: automatic player ordering + configurable room settings.
-- Run this in your Supabase project's SQL editor if you already ran the
-- original supabase/schema.sql and want to bring an existing project up
-- to date without dropping any data.

-- If your project ended up with the table misspelled "auction_staete"
-- (from a stray local edit), fix the name first:
alter table if exists auction_staete rename to auction_state;

-- New room-level settings, chosen in the lobby before the auction starts.
alter table rooms add column if not exists shot_clock_seconds int not null default 15;
alter table rooms add column if not exists player_tier_filter text not null default 'all';
alter table rooms add column if not exists player_order jsonb not null default '[]';

-- Turn order is no longer manual, so nomination_index becomes a pointer
-- into player_order instead of "whose turn is it".
alter table rooms rename column nomination_index to current_index;

-- Manual per-participant nomination order is no longer used.
alter table participants drop column if exists nomination_order;
