'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NoticeBar from './noticeBar';
import AllMenu from './AllMenu';
import Category from './Category';
import { COMPANY_NAME } from '@/lib/constants';
import { UserRound } from 'lucide-react';
import CurrencyLanguage from './currencyLanguage';

interface StateType {
  isScrolled: boolean;
  searchQuery: string;
  cartItems: number;
  wishlistItems: number;
}

export default function Header() {
  const [state, setState] = useState<StateType>({
    isScrolled: false,
    searchQuery: '',
    cartItems: 3,
    wishlistItems: 5
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setState((prevState) => ({ ...prevState, isScrolled: true }));
      } else {
        setState((prevState) => ({ ...prevState, isScrolled: false }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', state.searchQuery);
    // Implement search functionality here
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 dark:bg-slate-950 ${state.isScrolled ? 'bg-slate-100 shadow-md' : 'bg-slate-100'}`}>
        {/* Top bar - optional for announcements, etc. */}
        {!state.isScrolled && (
          <NoticeBar
            // img='/logo.svg'
            noticeText='🎉 Big News! Try our latest feature today.'
            buttonName={'Try Now'}
            buttonLink={'https://www.facebook.com'}
          />
        )}

        {/* Main header */}
        <div className='container mx-auto px-4 py-2'>
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center'>
              <Link
                href='/'
                className='flex items-center gap-2'>
                <Image
                  src='/logo.svg'
                  width={40}
                  height={40}
                  alt='ShopHub Logo'
                  className='h-10 w-10'
                />
                <span className='text-xl font-bold hidden sm:inline-block'>{COMPANY_NAME}</span>
              </Link>
            </div>

            {/* Desktop Navigation - hidden on mobile */}
            <nav className='hidden lg:flex items-center mx-4'>
              <AllMenu />
            </nav>

            {/* Search bar  */}
            <div className='hidden bg-white md:block flex-1 max-w-md mx-4'>
              <form
                onSubmit={handleSearch}
                className='relative'>
                <Input
                  type='search'
                  placeholder='Search products...'
                  className='w-full pr-10'
                  value={state.searchQuery}
                  onChange={(e) => setState((prevState) => ({ ...prevState, searchQuery: e.target.value }))}
                />
                <Button
                  type='submit'
                  variant='ghost'
                  size='icon'
                  className='absolute right-0 top-0'>
                  <Search className='h-5 w-5' />
                  <span className='sr-only'>Search</span>
                </Button>
              </form>
            </div>

            {/* Right side actions */}
            <div className='flex items-center space-x-2 '>
              {/* Currency Switcher */}

              <CurrencyLanguage />

              {/* Cart button */}
              <Button
                variant='ghost'
                size='icon'
                className='relative cursor-pointer'>
                <ShoppingCart className='h-5 w-5' />
                {state.cartItems > 0 && <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground'>{state.cartItems}</span>}
                <span className='sr-only'>Cart</span>
              </Button>
              {/* Account Button */}
              <Button
                // variant='ghost'
                size='icon'
                className='  bg-slate-600 p-2 text-4xl rounded-full cursor-pointer'>
                {/* <ShoppingCart className='h-5 w-5' /> */}
                {/* <Image
                  src='/avatar.png'
                  width={20}
                  height={20}
                  alt='user_name'
                /> */}
                <UserRound className='h-52 w-52 text-white' />
              </Button>
            </div>
          </div>

          {/* Mobile search - only visible on mobile */}
          <div className='mt-4 md:hidden'>
            <form
              onSubmit={handleSearch}
              className='relative'>
              <Input
                type='search'
                placeholder='Search products...'
                className='w-full pr-10'
                value={state.searchQuery}
                onChange={(e) => setState((prevState) => ({ ...prevState, searchQuery: e.target.value }))}
              />
              <Button
                type='submit'
                variant='ghost'
                size='icon'
                className='absolute right-0 top-0'>
                <Search className='h-5 w-5' />
                <span className='sr-only'>Search</span>
              </Button>
            </form>
          </div>
        </div>
        {/* Category Header */}

        <div className=' mx-auto px-4 py-1 border-t-2'>
          <div className='container mx-auto px-4 flex items-center justify-between'>
            <Category />
            <nav className='flex lg:hidden items-center mx-4'>
              <AllMenu className='text-sm' />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
