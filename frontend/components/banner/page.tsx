'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BannerSlide {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  buttonName: string;
  buttonUrl: string;
}

interface BannerSlideshowProps {
  slides: BannerSlide[];
  autoplaySpeed?: number;
  className?: string;
}

function Banner({ slides, autoplaySpeed = 3000, className }: BannerSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [nextSlide, autoplaySpeed, isPaused]);

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      {/* Slides container */}
      <div
        className='flex transition-transform duration-500 ease-in-out h-[300px] sm:h-[400px] md:h-[500px] lg:h-[500px]'
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className='relative w-full flex-shrink-0'>
            <Image
              src={slide.imageUrl || '/placeholder.svg'}
              alt={slide.title}
              fill
              priority={slide.id === 0} // Load first image with priority
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
            />

            <div className='dark:h-full dark:w-full dark:absolute dark:bg-black dark:opacity-50'></div>

            {/* Content overlay */}
            <div className='absolute inset-0 bg-black/30 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24'>
              <div className='max-w-2xl text-white'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4'>{slide.title}</h2>
                <p className='text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-md'>{slide.description}</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className='absolute bottom-6 left-6 sm:bottom-8 sm:left-12 md:bottom-10 md:left-16 lg:bottom-12 lg:left-24 '>
              <Button
                asChild
                size='lg'
                className='font-medium dark:bg-slate-950 bg-slate-100 text-black dark:text-slate-100'>
                <Link href={slide.buttonUrl}>{slide.buttonName}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 sm:p-3 transition-colors'
        aria-label='Previous slide'>
        <ChevronLeft className='h-5 w-5 sm:h-6 sm:w-6' />
      </button>

      <button
        onClick={nextSlide}
        className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 sm:p-3 transition-colors'
        aria-label='Next slide'>
        <ChevronRight className='h-5 w-5 sm:h-6 sm:w-6' />
      </button>

      {/* Slide indicators */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;
