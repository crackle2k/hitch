import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-900/40 hover:opacity-90 hover:-translate-y-px active:translate-y-0',
        destructive:
          'border border-pink-500/40 text-pink-400 hover:bg-pink-500/10',
        outline:
          'border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white hover:border-violet-400/50',
        secondary:
          'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
        ghost:
          'text-slate-400 hover:bg-white/5 hover:text-white',
        link:
          'text-violet-400 underline-offset-4 hover:underline',
        teal:
          'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/40 hover:opacity-90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
