import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-bold transition-all duration-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer border-2 border-black',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white hover:bg-gray-800 active:translate-y-px shadow-[3px_3px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-none',
        destructive:
          'bg-white text-red-600 border-red-600 hover:bg-red-50 shadow-[3px_3px_0px_#cc0000] hover:shadow-[2px_2px_0px_#cc0000] active:shadow-none',
        outline:
          'bg-white text-black hover:bg-[#F5F5F0] shadow-[3px_3px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-none',
        secondary:
          'bg-[#EBEBDF] text-black border-black hover:bg-[#E0E0D0] shadow-[3px_3px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-none',
        ghost:
          'border-transparent bg-transparent text-black hover:bg-[#EBEBDF] hover:border-transparent shadow-none',
        link:
          'border-transparent text-black underline-offset-4 hover:underline shadow-none',
        teal:
          'bg-[#C6F5D2] text-black border-black hover:bg-[#8EE8A4] shadow-[3px_3px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-none',
        yellow:
          'bg-[#FEFBB8] text-black border-black hover:bg-[#F5E870] shadow-[3px_3px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:shadow-none',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
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
