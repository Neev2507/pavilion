import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Padding = 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: Padding
  /** The current player on the block, or any other single focused card. */
  active?: boolean
}

const paddingClasses: Record<Padding, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export default function Card({
  children,
  className,
  padding = 'md',
  active = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded border bg-surface-1',
        active
          ? 'border-accent shadow-[0_8px_32px_-4px_rgba(15,10,6,0.9),0_0_1px_1px_rgba(212,163,89,0.2)]'
          : 'border-border-1',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
