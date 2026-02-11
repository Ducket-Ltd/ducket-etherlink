import { useXtzPrice } from '@/hooks/useXtzPrice';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  xtzAmount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showXtz?: boolean;
}

export function PriceDisplay({
  xtzAmount,
  className,
  size = 'md',
  showXtz = true,
}: PriceDisplayProps) {
  const { formatWithFiat, isLoading } = useXtzPrice();
  const { fiat, xtz } = formatWithFiat(xtzAmount);

  const sizeClasses = {
    sm: {
      fiat: 'text-sm font-medium',
      xtz: 'text-xs',
    },
    md: {
      fiat: 'text-base font-semibold',
      xtz: 'text-sm',
    },
    lg: {
      fiat: 'text-xl font-bold',
      xtz: 'text-base',
    },
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn(sizeClasses[size].fiat, 'text-gray-900')}>
        {fiat}
      </span>
      {showXtz && (
        <span className={cn(sizeClasses[size].xtz, 'text-gray-500')}>
          {isLoading ? 'Loading...' : `~${xtz}`}
        </span>
      )}
    </div>
  );
}

// Inline version for use in text
export function PriceInline({
  xtzAmount,
  className,
}: {
  xtzAmount: number;
  className?: string;
}) {
  const { formatWithFiat } = useXtzPrice();
  const { fiat, xtz } = formatWithFiat(xtzAmount);

  return (
    <span className={className}>
      {fiat} <span className="text-gray-500 text-sm">({xtz})</span>
    </span>
  );
}
