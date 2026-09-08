export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('pavilion_user_id') ?? ''
}

export function getDisplayName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('pavilion_display_name') ?? ''
}

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  Australia: '🇦🇺',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'West Indies': '🏝️',
  'South Africa': '🇿🇦',
  Pakistan: '🇵🇰',
  'New Zealand': '🇳🇿',
  'Sri Lanka': '🇱🇰',
  Zimbabwe: '🇿🇼',
  Bangladesh: '🇧🇩',
}

export function countryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? '🏏'
}

// "Thomas Aspinwall" -> "TA", "Neev" -> "NE"
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
