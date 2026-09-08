import { Player } from '@/types'

export const ROLE_BADGE_CLASSES: Record<Player['role'], string> = {
  Batter: 'bg-accent/10 border-accent text-accent-high',
  Bowler: 'bg-signal-red/10 border-signal-red text-[#e05a4a]',
  'All-rounder': 'bg-signal-green/10 border-signal-green text-[#5aad7a]',
  'Wicket-keeper': 'bg-accent-muted/10 border-accent-muted text-accent-muted',
}

export const ROLE_INITIALS: Record<Player['role'], string> = {
  Batter: 'B',
  Bowler: 'Bo',
  'All-rounder': 'AR',
  'Wicket-keeper': 'WK',
}
