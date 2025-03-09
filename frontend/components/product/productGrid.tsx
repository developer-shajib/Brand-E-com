'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './productCard';

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  hasVoucher?: boolean;
}

interface ProductGridProps {
  products: Product[];
  itemsPerPage?: number;
}

export default function ProductGrid({ products, itemsPerPage = 10 }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Get current products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers array
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className='space-y-6'>
      {/* Product Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}>
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <div className='flex gap-1'>
            {pageNumbers.map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? 'default' : 'outline'}
                size='sm'
                onClick={() => paginate(number)}
                className='min-w-[2.5rem]'>
                {number}
              </Button>
            ))}
          </div>

          <Button
            variant='outline'
            size='icon'
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
