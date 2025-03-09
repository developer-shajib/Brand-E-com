'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COMPANY_NAME } from '@/lib/constants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    // Show loading state
    setSubscriptionStatus('loading');

    // Simulate API call
    setTimeout(() => {
      // Check for valid email format
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (isValidEmail) {
        setSubscriptionStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setEmail('');
          setSubscriptionStatus('idle');
        }, 3000);
      } else {
        setSubscriptionStatus('error');
      }
    }, 1000);
  };

  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className=' bg-slate-100 text-black dark:bg-black dark:text-slate-100'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Column 1: Logo */}
          <div className='flex flex-col'>
            <Link
              href='/'
              className='flex items-center gap-3  mb-6 '>
              <Image
                src='/logo.svg?height=60&width=180'
                alt={COMPANY_NAME}
                width={180}
                height={60}
                className='h-12 w-auto'
              />
              <h3 className='font-medium'>{COMPANY_NAME}</h3>
            </Link>
            <p
              className='text-black
dark:text-slate-100 mb-6'>{`We're dedicated to providing exceptional products and services to our customers worldwide.`}</p>
            <div className='mt-auto'>
              <p
                className='text-sm text-black
dark:text-slate-100'>
                123 Business Avenue
                <br />
                Suite 500
                <br />
                New York, NY 10001
              </p>
            </div>
          </div>

          {/* Column 2: Main Links */}
          <div>
            <h3
              className='text-lg font-semibold mb-6 text-black
dark:text-slate-100'>
              Company
            </h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href='/about'
                  className='text-black dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/careers'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href='/blog'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href='/press'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Press Releases
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Secondary Links */}
          <div>
            <h3
              className='text-lg font-semibold mb-6 text-black
dark:text-slate-100  '>
              Resources
            </h3>
            <ul className='space-y-4'>
              <li>
                <Link
                  href='/help'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='text-black
dark:text-slate-100 hover:text-slate-600 transition-colors  '>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media & Subscription */}
          <div>
            <h3
              className='text-lg font-semibold mb-6 text-black
dark:text-slate-100'>
              Stay Connected
            </h3>

            {/* Social Media Icons */}
            <div className='flex space-x-4 mb-6'>
              <Link
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-slate-700 text-slate-100
dark:bg-slate-900 p-2 rounded-full hover:bg-slate-700 transition-colors'>
                <Facebook className='h-5 w-5' />
                <span className='sr-only'>Facebook</span>
              </Link>
              <Link
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-slate-700 text-slate-100
dark:bg-slate-900 p-2 rounded-full hover:bg-slate-700 transition-colors'>
                <Instagram className='h-5 w-5' />
                <span className='sr-only'>Instagram</span>
              </Link>
              <Link
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-slate-700 text-slate-100
dark:bg-slate-900 p-2 rounded-full hover:bg-slate-700 transition-colors'>
                <Twitter className='h-5 w-5' />
                <span className='sr-only'>Twitter</span>
              </Link>
              <Link
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-slate-700 text-slate-100
dark:bg-slate-900 p-2 rounded-full hover:bg-slate-700 transition-colors'>
                <Linkedin className='h-5 w-5' />
                <span className='sr-only'>LinkedIn</span>
              </Link>
              <Link
                href='https://youtube.com'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-slate-700 text-slate-100
dark:bg-slate-900 p-2 rounded-full hover:bg-slate-700 transition-colors'>
                <Youtube className='h-5 w-5' />
                <span className='sr-only'>YouTube</span>
              </Link>
            </div>

            {/* Subscription Form */}
            <div>
              <h4 className='text-sm font-medium mb-3 text-slate-900 dark:text-slate-100'>Subscribe to our newsletter</h4>
              <form
                onSubmit={handleSubscribe}
                className='space-y-2'>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400' />
                  <Input
                    type='email'
                    placeholder='Your email address'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-slate-500'
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full flex items-center justify-center bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  disabled={subscriptionStatus === 'loading'}>
                  {subscriptionStatus === 'loading' ? (
                    'Subscribing...'
                  ) : subscriptionStatus === 'success' ? (
                    'Subscribed!'
                  ) : subscriptionStatus === 'error' ? (
                    'Please enter a valid email'
                  ) : (
                    <>
                      Subscribe <ArrowRight className='ml-2 h-4 w-4' />
                    </>
                  )}
                </Button>
              </form>
              {subscriptionStatus === 'success' && <p className='text-green-400 text-sm mt-2'>Thank you for subscribing!</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className='border-t text-slate-300'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-sm text-slate-900 dark:text-slate-100 mb-4 md:mb-0'>
              © {currentYear} {COMPANY_NAME}. All rights reserved.
            </p>
            <div className='flex space-x-6'>
              <Link
                href='/privacy'
                className='text-sm text-slate-900 dark:text-slate-100 hover:text-white transition-colors'>
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-sm text-slate-900 dark:text-slate-100 hover:text-white transition-colors'>
                Terms of Service
              </Link>
              <Link
                href='/cookies'
                className='text-sm text-slate-900 dark:text-slate-100 hover:text-white transition-colors'>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
