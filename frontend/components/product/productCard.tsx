'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  hasVoucher?: boolean;
}

export default function ProductCard({ id, title, image, price, originalPrice, rating, reviewCount, hasVoucher = false }: ProductCardProps) {
  // Calculate discount percentage if original price exists
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  // Generate rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className='h-4 w-4 fill-yellow-400 text-yellow-400'
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key='half-star'
          className='h-4 w-4 fill-yellow-400 text-yellow-400'
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-star-${i}`}
          className='h-4 w-4 text-gray-300'
        />
      );
    }

    return stars;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}>
      <Link
        href={`/product/${id}`}
        className='group block bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200'>
        {/* Product Image Container */}
        <div className='relative aspect-square'>
          <Image
            src={image || '/placeholder.svg'}
            alt={title}
            fill
            className='object-cover'
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
          />
          {hasVoucher && <div className='absolute top-2 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-r-md'>COLLECT VOUCHER</div>}
        </div>

        {/* Product Details */}
        <div className='p-4'>
          {/* Title */}
          <h3 className='text-sm font-medium dark:text-slate-300 line-clamp-2 mb-2 group-hover:text-primary transition-colors'>{title}</h3>

          {/* Price */}
          <div className='flex items-baseline gap-2 mb-2'>
            <span className='text-lg font-bold text-primary'>৳{price.toLocaleString()}</span>
            <span className='text-lg font-medium text-primary'>
              <sub className='line-through text-lg text-slate-600 dark:text-slate-300'>৳{price.toLocaleString()}</sub>
            </span>
            {discountPercentage && <span className='text-xs text-red-600'>-{discountPercentage}%</span>}
          </div>

          {/* Rating */}
          <div className='flex items-center gap-1'>
            <div className='flex'>{renderStars(rating)}</div>
            <span className='text-xs text-slate-600 dark:text-slate-300'>({reviewCount})</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
