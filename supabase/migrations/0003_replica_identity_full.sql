-- Fix: large jsonb columns (player_queue, squad, etc.) get TOASTed by
-- Postgres once they exceed ~2KB. By default, logical replication omits
-- unchanged TOASTed columns from UPDATE payloads, so a realtime event
-- triggered by an unrelated column change (e.g. rooms.status) can arrive
-- with player_queue/squad missing entirely, crashing any client that
-- reads it. REPLICA IDENTITY FULL makes Postgres always send the whole
-- row, avoiding that omission.
alter table rooms replica identity full;
alter table participants replica identity full;
alter table auction_state replica identity full;
alter table bids replica identity full;
alter table messages replica identity full;
