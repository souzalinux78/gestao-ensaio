'use client';

import Skeleton from './Skeleton';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export default function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`card fade-in ${className}`}>
      <Skeleton variant="rectangular" width="100%" height={120} className="mb-4" shimmer />
      <Skeleton variant="text" lines={lines} shimmer />
    </div>
  );
}
