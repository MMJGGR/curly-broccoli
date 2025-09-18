import React from 'react';

export const Skeleton = ({ className = '', ...props }) => (
  <div className={`animate-pulse rounded-md bg-gray-200/70 ${className}`} {...props} />
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

