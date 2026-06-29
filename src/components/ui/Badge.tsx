import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-text border-transparent',
    secondary: 'bg-secondary text-text border-transparent',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    destructive: 'bg-red-500/10 text-red-400 border-red-500/20',
    outline: 'text-text border-slate-700 bg-transparent',
  };

  const sizes = {
    default: 'px-2.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cta whitespace-nowrap gap-1",
        variants[variant || 'default'],
        sizes[size || 'default'],
        className
      )}
      {...props}
    />
  );
}
