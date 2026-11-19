import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// The site's one button. Use `asChild` to style a Link:
//   <Button asChild><Link href="/book">Book now</Link></Button>
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-body font-bold tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Gold fill, dark text.
        default: 'bg-primary text-primary-foreground hover:bg-primary/85',
        // Quiet secondary action on light backgrounds.
        outline:
          'border border-foreground/25 bg-transparent text-foreground hover:border-primary-strong hover:text-primary-strong',
        // Secondary action on dark (foreground-coloured) backgrounds.
        inverse:
          'border border-background/40 bg-transparent text-background hover:bg-background hover:text-foreground',
        ghost: 'text-foreground hover:bg-muted',
        // Inline text action ("Learn more").
        link: 'h-auto px-0 text-primary-strong underline-offset-4 hover:underline',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        default: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
