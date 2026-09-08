'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-canvas font-bold hover:bg-accent-hover active:scale-[0.99]',
  secondary:
    'bg-surface-1 border border-border-2 text-text-secondary hover:border-accent hover:text-accent-high active:scale-[0.99]',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-2 active:scale-[0.99]',
  danger: 'bg-signal-red text-text-bright hover:bg-signal-red/80 active:scale-[0.99]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 min-h-[36px]',
  md: 'text-base px-4 py-3 min-h-[44px]',
  lg: 'text-lg px-6 py-4 min-h-[52px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-sans font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
