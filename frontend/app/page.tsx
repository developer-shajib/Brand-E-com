import Banner from '@/components/banner/page';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import ProductGrid from '@/components/product/productGrid';
import ProductGridLoading from '@/components/product/productGridLoading';
import { bannerSlides, products } from '@/db/data';
import { MoveRight } from 'lucide-react';
import { Suspense } from 'react';
import WhyChooseUs from '@/components/whyChoseUs/whyChoseUs';

export default function Home() {
  return (
    <>
      <Header />

      {/* Banner */}
      <Banner
        slides={bannerSlides}
        navigationArrows={bannerSlides.length > 1 ? true : false}
      />

      <main className='container mx-auto px-4 py-12 '>
        <h1 className='text-4xl font-bold mb-4 text-slate-600  dark:text-slate-300'>Welcome to ShopHub </h1>
        <p className='mb-4 font-bold flex items-center gap-2 text-slate-600 dark:text-slate-300'>
          Our Products
          <span className='text-slate-400'>
            <MoveRight />
          </span>
        </p>
        <Suspense fallback={<ProductGridLoading />}>
          <ProductGrid products={products} />
        </Suspense>
      </main>
      {/* Why Choose Us Section*/}

      <WhyChooseUs />
      <Footer />
    </>
  );
}
