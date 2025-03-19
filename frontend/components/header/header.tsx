'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Category from './Category';
import { COMPANY_NAME } from '@/lib/constants';
import { UserRound } from 'lucide-react';
import CurrencyLanguage from './currencyLanguage';

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 dark:bg-slate-900 ${state.isScrolled ? 'bg-slate-100 shadow-md' : 'bg-slate-100'}`}>
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

            {/* Search bar  */}
            <div className='hidden bg-white dark:bg-slate-600 md:block flex-1 max-w-md mx-4'>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    // variant='ghost'
                    size='icon'
                    className='  bg-slate-300 hover:bg-slate-500 dark:hover:bg-slate-400 dark:bg-slate-600 transition-all duration-300 p-2 text-4xl rounded-full cursor-pointer'>
                    <UserRound className='h-52 w-52 text-black dark:text-slate-200' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56'>
                  <DropdownMenuGroup>
                    <Link
                      className='flex item justify-center py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 text-sm  px-2'
                      href='/login'>
                      Sign In
                    </Link>
                    <DropdownMenuSeparator />
                    <Link
                      className='flex item justify-center py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 text-sm  px-2'
                      href='/register'>
                      Sign Up
                    </Link>
                    <DropdownMenuSeparator />
                    <Link
                      className='flex item justify-center py-2 dark:hover:bg-slate-700 hover:bg-slate-200 transition-all duration-300 text-sm  px-2'
                      href='/register'>
                      Logout
                    </Link>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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

        <div className=' mx-auto px-4 py-1 border-t-2 dark:border-slate-700'>
          <div className='container mx-auto px-4 flex items-center justify-between'>
            <Category />
          </div>
        </div>
      </header>
    </>
  );
}
