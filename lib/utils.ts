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
