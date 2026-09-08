-- Track which participants have skipped the current player, so the
-- auction screen can show "Skip X/Y" and auto-resolve as unsold once
-- everyone has skipped.
alter table auction_state add column if not exists skips jsonb not null default '[]';
