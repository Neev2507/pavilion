'use client'

import { useEffect, useState } from 'react'

interface UseTimerResult {
  secondsLeft: number
  isExpired: boolean
}

export function useTimer(clockEndsAt: string | null): UseTimerResult {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (!clockEndsAt) {
      setSecondsLeft(0)
      return
    }

    const endTime = new Date(clockEndsAt).getTime()

    const tick = () => {
      const remainingMs = endTime - Date.now()
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000))
      setSecondsLeft(remaining)
    }

    tick()
    const interval = setInterval(tick, 100)

    return () => clearInterval(interval)
  }, [clockEndsAt])

  return {
    secondsLeft,
    isExpired: clockEndsAt !== null && secondsLeft === 0,
  }
}
