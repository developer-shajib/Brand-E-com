'use client';

import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4'>
      <div className='max-w-lg mx-auto text-center'>
        {/* Visual Element */}
        <div className='mb-6 flex justify-center'>
          <div className='relative'>
            <div className='w-32 h-32 rounded-full bg-red-50 flex items-center justify-center'>
              <MapPin className='h-16 w-16 text-red-400' />
            </div>
            <span className='absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600'>?</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className='text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4'>Page not found</h1>

        <p className='text-lg text-slate-600 mb-8'>
          {`We couldn't find the page you're looking for. It might have been moved, 
          deleted, or perhaps never existed.`}
        </p>
      </div>

      {/* Footer */}
      <div className='mt-16 text-center text-sm text-slate-500'>
        <p>
          Error Code: 404 |
          <button
            onClick={() => window.history.back()}
            className='ml-1 text-primary hover:underline'>
            Go Back
          </button>
        </p>
      </div>
    </div>
  );
}
