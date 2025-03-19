import Image from 'next/image';
import { whyChooseUsData } from '@/db/data.ts';

export default function WhyChooseUs() {
  return (
    <section className='py-16 bg-slate-200 dark:bg-slate-900'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='flex justify-center mb-16'>
          <div className='relative inline-flex items-center bg-gray-100 dark:bg-black rounded-full px-6 py-2'>
            <span className='text-xl font-semibold'>Why Choose Us</span>
            <div className='absolute -right-[27px] w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-200 flex items-center justify-center text-white dark:text-black font-bold'>01</div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
          {/* Left Side - Image */}
          <div className='relative h-[600px] w-full hidden lg:block'>
            <Image
              src='/choose-us.png'
              alt='choose us'
              fill
              className='  object-center '
            />
          </div>

          {/* Right Side - Content */}
          <div>
            <div className='mb-8'>
              <h3 className='text-rose-500 font-medium mb-4'>WHY CHOOSE US</h3>
              <h2 className='text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4'>Reason for chosen us</h2>
              <p className='text-slate-600 dark:text-slate-200'>
                We are a trusted global brand with a verified USA LLC, selling high-quality, authentic products across international marketplaces. With secure order processing, reliable delivery partners, and dedicated customer support, we ensure a
                seamless shopping experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Feature 1 */}

              {whyChooseUsData.map((item) => (
                <div
                  key={item.id}
                  className='flex'>
                  <div className='relative mr-4 flex-shrink-0'>
                    <div className='w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center'>
                      <item.icon className='h-8 w-8 text-slate-800 dark:text-slate-200' />
                    </div>
                    <div className='absolute -left-1 top-0 bottom-0 w-1 bg-rose-500'></div>
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2'>{item.title}</h3>
                    <p className='text-slate-600 dark:text-slate-200 text-sm '>{item.description} </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
