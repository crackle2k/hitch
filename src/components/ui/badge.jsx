import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-violet-600 text-white shadow shadow-violet-900/50',
        secondary: 'bg-white/10 text-slate-300',
        destructive: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
        outline: 'border border-white/20 text-slate-300',
        teal: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
        pink: 'bg-pink-500 text-white shadow shadow-pink-900/50',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
