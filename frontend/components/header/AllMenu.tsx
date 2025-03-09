import Link from 'next/link';
import React from 'react';

function AllMenu({ className = 'text-md' }: { className?: string }) {
  return (
    <>
      <Link
        href='/new-arrivals'
        className={` font-medium hover:text-primary hover:bg-slate-300 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all duration-300 ${className}`}>
        New Arrivals
      </Link>
      <Link
        href='/sale'
        className={` font-medium hover:text-primary hover:bg-slate-300 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all duration-300 ${className}`}>
        Sale
      </Link>
      <Link
        href='/about'
        className={` font-medium hover:text-primary hover:bg-slate-300 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all duration-300 ${className}`}>
        About
      </Link>
      <Link
        href='/contact'
        className={` font-medium hover:text-primary hover:bg-slate-300 dark:hover:bg-slate-800 px-3 py-1 rounded-md transition-all duration-300 ${className}`}>
        Contact
      </Link>
    </>
  );
}

export default AllMenu;
