import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-[3px] px-2.5 py-0.5 text-xs font-bold border-2 border-black transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-black text-white',
        secondary: 'bg-[#EBEBDF] text-black',
        destructive: 'bg-red-100 text-red-700 border-red-600',
        outline: 'bg-white text-black',
        teal: 'bg-[#C6F5D2] text-black',
        pink: 'bg-[#FEFBB8] text-black',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
