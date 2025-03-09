import Banner from '@/components/banner/page';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { bannerSlides } from '@/db/data';
import { MoveRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Header />

      {/* Banner */}
      <Banner
        slides={bannerSlides}
        // className='h-[400px]'
      />

      <main className='container mx-auto px-4 py-12 '>
        <h1 className='text-4xl font-bold mb-4 text-slate-600'>Welcome to ShopHub</h1>
        <p className='mb-4 font-bold flex items-center gap-2 text-slate-600'>
          Our Products
          <span className='text-slate-400'>
            <MoveRight />
          </span>
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {/* Example product cards */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='border rounded-lg overflow-hidden'>
              <div className='bg-muted aspect-[4/3]' />
              <div className='p-4'>
                <h3 className='font-medium'>Product {i + 1}</h3>
                <p className='text-muted-foreground text-sm mt-1'>Product description goes here</p>
                <div className='mt-4 flex items-center justify-between'>
                  <span className='font-bold'>$99.99</span>
                  <button className='bg-primary text-primary-foreground px-3 py-1 rounded text-sm'>Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
