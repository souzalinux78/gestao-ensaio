'use client';

import Skeleton from './Skeleton';

interface SkeletonCardProps {
  lines?: number;
}

export default function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="card">
      <Skeleton variant="rectangular" width="100%" height={120} className="mb-4" />
      <Skeleton variant="text" lines={lines} />
    </div>
  );
}
