import { clsx } from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  variant?: 'card' | 'line' | 'circle';
}

export function LoadingSkeleton({
  className,
  count = 1,
  variant = 'line',
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={clsx('grid grid-cols-2 gap-3', className)}>
        {items.map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 animate-pulse">
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full w-1/2" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className={clsx('flex gap-3', className)}>
        {items.map((_, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"
          style={{ width: `${60 + (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}
