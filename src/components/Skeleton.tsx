'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table' | 'avatar';
  width?: string | number;
  height?: string | number;
  lines?: number;
  shimmer?: boolean;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  shimmer = true,
}: SkeletonProps) {
  const baseClasses = shimmer 
    ? 'skeleton-shimmer'
    : 'bg-gray-200 dark:bg-gray-700 animate-pulse';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-card p-4',
    table: 'rounded h-12',
    avatar: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={index === 0 ? style : undefined}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${variantClasses.card} ${className}`} style={style}>
        <div className="space-y-3">
          <div className={`${baseClasses} h-4 w-3/4 rounded`} />
          <div className={`${baseClasses} h-4 w-full rounded`} />
          <div className={`${baseClasses} h-4 w-5/6 rounded`} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`${baseClasses} ${variantClasses.table} ${className}`} style={style}>
        <div className="flex items-center space-x-4 h-full px-4">
          <div className={`${baseClasses} h-4 w-1/4 rounded`} />
          <div className={`${baseClasses} h-4 w-1/4 rounded`} />
          <div className={`${baseClasses} h-4 w-1/4 rounded`} />
          <div className={`${baseClasses} h-4 w-1/4 rounded`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}
