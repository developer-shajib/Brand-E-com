'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProductGridLoading() {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className='bg-white rounded-lg overflow-hidden shadow-sm'>
          {/* Image skeleton */}
          <Skeleton className='aspect-square w-full' />

          {/* Content skeleton */}
          <div className='p-4 space-y-3'>
            {/* Title */}
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />

            {/* Price */}
            <Skeleton className='h-6 w-1/3' />

            {/* Rating */}
            <Skeleton className='h-4 w-24' />
          </div>
        </div>
      ))}
    </div>
  );
}
