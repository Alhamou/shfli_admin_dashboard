import { cn } from '@/lib/utils';
import { BADGE_VARIANTS, type BadgeVariant } from '@/constants/colors';

interface CustomBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  rounded?: 'full' | 'lg' | 'md' | 'none';
  size?: 'sm' | 'md' | 'lg';
}

export function CustomBadge({
  variant = 'unknown',
  className,
  children,
  icon,
  rounded = 'full',
  size = 'md',
  ...props
}: CustomBadgeProps) {
  const variantClasses = BADGE_VARIANTS[variant] || BADGE_VARIANTS.unknown;
  
  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
    none: 'rounded-none',
  }[rounded];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 text-base',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium transition-colors',
        variantClasses.bg,
        variantClasses.text,
        variantClasses.border,
        variantClasses.hover,
        roundedClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
}