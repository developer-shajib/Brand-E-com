import React, { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  img?: string;
  noticeText?: string;
  buttonName?: string;
  buttonLink?: string;
};

// Announcement or notice bar at the top of the page
function NoticeBar({ img, noticeText, buttonName, buttonLink = 'https:/www.facebook.com' }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className='relative w-full bg-gray-900 duration-300'>
      <div className='absolute inset-0'>
        <Image
          src={img ? img : '/announcement.jpg'}
          alt='noticeBar'
          layout='fill'
          objectFit='cover'
          className='opacity-50'
        />
      </div>

      <div className='relative flex items-center justify-between px-6 py-3 text-white'>
        {/* Left side text */}
        {noticeText && <p className='text-md font-medium'>{noticeText}</p>}

        <div className='flex items-center space-x-6'>
          {/* button name */}
          {buttonName && (
            <Link
              href={buttonLink}
              target='_blank'
              className='text-black bg-slate-200 px-4 rounded-2xl hover:bg-slate-300 duration-300 text-[12px] md:text-base'>
              {buttonName}
            </Link>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className='text-white hover:text-gray-300'>
            <X className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticeBar;
