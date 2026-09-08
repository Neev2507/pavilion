'use client'

import { useEffect, useState } from 'react'

interface UseTimerResult {
  secondsLeft: number
  isExpired: boolean
}

export function useTimer(clockEndsAt: string | null): UseTimerResult {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!clockEndsAt) return

    const interval = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(interval)
  }, [clockEndsAt])

  if (!clockEndsAt) {
    return { secondsLeft: 0, isExpired: false }
  }

  // Derived directly from the clockEndsAt prop and a live `now` on every
  // render, so a brand new clockEndsAt is never judged against a stale
  // secondsLeft left over from the previous player's countdown reaching 0.
  const remainingMs = new Date(clockEndsAt).getTime() - now
  const secondsLeft = Math.max(0, Math.ceil(remainingMs / 1000))
  const isExpired = remainingMs <= 0

  return { secondsLeft, isExpired }
}
