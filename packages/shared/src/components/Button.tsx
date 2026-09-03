import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../utils'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = 'primary', ...props }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variant === 'primary'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
          className,
        )}
        {...props}
      />
    )
  },
)
