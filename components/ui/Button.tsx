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
  primary: 'bg-accent text-[#0a0a0a] hover:bg-accent-dim active:bg-accent-dim',
  secondary:
    'bg-card border border-accent text-accent hover:bg-accent/10 active:bg-accent/20',
  ghost: 'bg-transparent text-text-primary hover:bg-white/5 active:bg-white/10',
  danger: 'bg-error text-white hover:bg-error/80 active:bg-error/70',
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
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
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
