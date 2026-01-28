'use client';

import Skeleton from './Skeleton';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export default function SkeletonTable({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) {
  return (
    <div className={`bg-white dark:bg-[var(--bg-primary)] rounded-lg shadow-soft overflow-hidden fade-in ${className}`}>
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" width="25%" height={20} shimmer />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`p-4 flex gap-4 items-center stagger-item`}
            style={{ animationDelay: `${rowIndex * 50}ms` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="25%" height={16} shimmer />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
