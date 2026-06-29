import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-green-500 text-slate-950 hover:bg-green-400 font-bold shadow-md hover:shadow-lg hover:shadow-green-500/30 active:shadow-sm transition-all',
      primary: 'bg-green-500 text-slate-950 hover:bg-green-400 font-bold shadow-md hover:shadow-lg hover:shadow-green-500/30 active:shadow-sm transition-all',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 hover:shadow-md hover:shadow-slate-800/60',
      outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-500 hover:shadow-sm',
      ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-slate-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30',
      destructive: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/20',
      link: 'text-green-400 underline-offset-4 hover:underline bg-transparent',
    };

    const sizes: Record<string, string> = {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-8 rounded-md px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-9 w-9 p-0 flex items-center justify-center',
    };

    const vKey = variant || 'primary';
    const sKey = size === 'default' ? 'md' : (size || 'md');

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50 font-sans gap-2',
          variants[vKey] || variants.primary,
          sizes[sKey] || sizes.md,
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner className="w-4 h-4 mr-1 text-current" /> : null}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
