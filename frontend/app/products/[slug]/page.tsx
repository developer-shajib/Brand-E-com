import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw, Star, StarHalf, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';

export default function ProductLandingPage() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />

      <main>
        {/* Hero Section */}
        <section className='py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              <div className='order-2 lg:order-1'>
                <Badge className='mb-4'>New Release</Badge>
                <h1 className='text-4xl md:text-5xl font-bold mb-6'>Premium Wireless Noise-Cancelling Headphones</h1>
                <p className='text-lg text-slate-600 mb-6'>
                  Experience crystal-clear sound with our premium wireless headphones. Featuring advanced noise-cancellation technology, 40-hour battery life, and ultra-comfortable design for all-day listening.
                </p>

                <div className='flex items-center mb-6'>
                  <span className='text-3xl font-bold mr-3'>$299.99</span>
                  <span className='text-lg text-slate-500 line-through'>$399.99</span>
                  <Badge
                    variant='destructive'
                    className='ml-3'>
                    25% OFF
                  </Badge>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 mb-8'>
                  <Button
                    size='lg'
                    className='text-base'>
                    Buy Now
                  </Button>
                  <Button
                    size='lg'
                    variant='outline'
                    className='text-base'>
                    Add to Cart
                  </Button>
                </div>

                <div className='flex flex-wrap gap-6'>
                  <div className='flex items-center'>
                    <ShieldCheck className='h-5 w-5 text-primary mr-2' />
                    <span className='text-sm'>Secure Payment</span>
                  </div>
                  <div className='flex items-center'>
                    <Truck className='h-5 w-5 text-primary mr-2' />
                    <span className='text-sm'>Free Shipping</span>
                  </div>
                  <div className='flex items-center'>
                    <RotateCcw className='h-5 w-5 text-primary mr-2' />
                    <span className='text-sm'>30-Day Returns</span>
                  </div>
                </div>
              </div>

              <div className='order-1 lg:order-2 flex justify-center'>
                <div className='relative w-full max-w-md aspect-square'>
                  <Image
                    src='/products/p1.jpg?height=600&width=600'
                    alt='Premium Wireless Headphones'
                    fill
                    className='object-contain'
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Product Section */}
        <section
          className='py-16 bg-white'
          id='features'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Why Choose Our Headphones?</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='bg-slate-50 p-6 rounded-lg'>
                <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-primary'>
                    <path d='M3 18v-6a9 9 0 0 1 18 0v6'></path>
                    <path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'></path>
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Superior Sound Quality</h3>
                <p className='text-slate-600'>Experience studio-quality sound with our custom-engineered 40mm drivers and advanced audio processing technology.</p>
              </div>

              <div className='bg-slate-50 p-6 rounded-lg'>
                <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-primary'>
                    <path d='M2 12h6'></path>
                    <path d='M22 12h-6'></path>
                    <path d='M12 2v6'></path>
                    <path d='M12 22v-6'></path>
                    <path d='M17 12a5 5 0 0 0-5-5'></path>
                    <path d='M12 17a5 5 0 0 0 5-5'></path>
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Active Noise Cancellation</h3>
                <p className='text-slate-600'>Block out unwanted noise with our advanced ANC technology that adapts to your environment in real-time.</p>
              </div>

              <div className='bg-slate-50 p-6 rounded-lg'>
                <div className='bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-primary'>
                    <path d='M5 6.2A3.1 3.1 0 0 1 8.1 3h7.8A3.1 3.1 0 0 1 19 6.2v11.6A3.1 3.1 0 0 1 15.9 21H8.1A3.1 3.1 0 0 1 5 17.8V6.2Z'></path>
                    <path d='M9 3v18'></path>
                    <path d='M6 14h3'></path>
                    <path d='M6 10h3'></path>
                    <path d='M15 3v18'></path>
                  </svg>
                </div>
                <h3 className='text-xl font-semibold mb-2'>All-Day Battery Life</h3>
                <p className='text-slate-600'>Enjoy up to 40 hours of playback on a single charge, with quick-charge technology providing 5 hours of use from just 10 minutes of charging.</p>
              </div>
            </div>

            <div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-slate-50 p-6 rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>Designed for Comfort</h3>
                <p className='text-slate-600 mb-4'>Our headphones feature memory foam ear cushions and an adjustable headband designed for extended listening sessions without discomfort.</p>
                <ul className='space-y-2'>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Lightweight design (just 250g)</span>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Premium memory foam ear cushions</span>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Adjustable headband with soft padding</span>
                  </li>
                </ul>
              </div>

              <div className='bg-slate-50 p-6 rounded-lg'>
                <h3 className='text-xl font-semibold mb-4'>Smart Features</h3>
                <p className='text-slate-600 mb-4'>Packed with intelligent features to enhance your listening experience and make your life easier.</p>
                <ul className='space-y-2'>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Touch controls for playback and calls</span>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Voice assistant compatibility</span>
                  </li>
                  <li className='flex items-start'>
                    <CheckCircle2 className='h-5 w-5 text-primary mr-2 mt-0.5' />
                    <span>Automatic pause when removed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Chart */}
        <section className='py-16 bg-slate-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>How We Compare</h2>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse'>
                <thead>
                  <tr className='bg-slate-100'>
                    <th className='p-4 text-left font-semibold border'>Features</th>
                    <th className='p-4 text-center font-semibold border bg-primary/10'>Our Headphones</th>
                    <th className='p-4 text-center font-semibold border'>Competitor A</th>
                    <th className='p-4 text-center font-semibold border'>Competitor B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='p-4 border font-medium'>Price</td>
                    <td className='p-4 border text-center bg-primary/5'>$299.99</td>
                    <td className='p-4 border text-center'>$349.99</td>
                    <td className='p-4 border text-center'>$399.99</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Battery Life</td>
                    <td className='p-4 border text-center bg-primary/5'>40 hours</td>
                    <td className='p-4 border text-center'>30 hours</td>
                    <td className='p-4 border text-center'>35 hours</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Noise Cancellation</td>
                    <td className='p-4 border text-center bg-primary/5'>Advanced ANC</td>
                    <td className='p-4 border text-center'>Basic ANC</td>
                    <td className='p-4 border text-center'>Advanced ANC</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Sound Quality</td>
                    <td className='p-4 border text-center bg-primary/5'>Hi-Res Audio</td>
                    <td className='p-4 border text-center'>Standard</td>
                    <td className='p-4 border text-center'>Hi-Res Audio</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Comfort</td>
                    <td className='p-4 border text-center bg-primary/5'>Memory Foam</td>
                    <td className='p-4 border text-center'>Standard Foam</td>
                    <td className='p-4 border text-center'>Leather</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Water Resistance</td>
                    <td className='p-4 border text-center bg-primary/5'>IPX4</td>
                    <td className='p-4 border text-center'>IPX2</td>
                    <td className='p-4 border text-center'>IPX4</td>
                  </tr>
                  <tr>
                    <td className='p-4 border font-medium'>Warranty</td>
                    <td className='p-4 border text-center bg-primary/5'>2 Years</td>
                    <td className='p-4 border text-center'>1 Year</td>
                    <td className='p-4 border text-center'>2 Years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Product Images & Video */}
        <section className='py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Product Gallery</h2>

            <Tabs
              defaultValue='images'
              className='w-full'>
              <TabsList className='grid w-full max-w-md mx-auto grid-cols-2 mb-8'>
                <TabsTrigger value='images'>Images</TabsTrigger>
                <TabsTrigger value='video'>Video</TabsTrigger>
              </TabsList>

              <TabsContent
                value='images'
                className='mt-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p2.jpg?height=400&width=400'
                      alt='Product front view'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p3.jpg?height=400&width=400'
                      alt='Product side view'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p4.jpg?height=400&width=400'
                      alt='Product folded view'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p1.jpg?height=400&width=400'
                      alt='Product in use - lifestyle'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p2.jpg?height=400&width=400'
                      alt='Product detail view'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='rounded-lg overflow-hidden border'>
                    <Image
                      src='/products/p3.jpg?height=400&width=400'
                      alt='Product accessories'
                      width={400}
                      height={400}
                      className='w-full h-auto'
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='video'>
                <div className='aspect-video max-w-3xl mx-auto border rounded-lg overflow-hidden'>
                  <div className='w-full h-full bg-slate-100 flex items-center justify-center'>
                    <iframe
                      width='560'
                      height='315'
                      src='https://www.youtube.com/embed/LGWFqeT9UcQ?si=G_WUrtKVcU25X0Rs'
                      title='YouTube video player'
                      //   frameborder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                      //   referrerpolicy='strict-origin-when-cross-origin'
                      //   allowfullscreen
                    ></iframe>
                    {/* <div className='text-center p-8'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='48'
                        height='48'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='mx-auto mb-4 text-slate-400'>
                        <circle
                          cx='12'
                          cy='12'
                          r='10'></circle>
                        <polygon points='10 8 16 12 10 16 10 8'></polygon>
                      </svg>
                      <p className='text-slate-500'>Product Demo Video</p>
                    </div> */}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Customer Reviews */}
        <section
          className='py-16 bg-slate-50'
          id='reviews'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-4'>Customer Reviews</h2>
            <div className='flex items-center justify-center mb-12'>
              <div className='flex'>
                <Star className='h-6 w-6 fill-yellow-400 text-yellow-400' />
                <Star className='h-6 w-6 fill-yellow-400 text-yellow-400' />
                <Star className='h-6 w-6 fill-yellow-400 text-yellow-400' />
                <Star className='h-6 w-6 fill-yellow-400 text-yellow-400' />
                <StarHalf className='h-6 w-6 fill-yellow-400 text-yellow-400' />
              </div>
              <span className='ml-2 text-lg font-medium'>4.7 out of 5</span>
              <span className='ml-2 text-slate-500'>(128 reviews)</span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-start mb-4'>
                  <div className='mr-4'>
                    <div className='w-12 h-12 rounded-full bg-slate-200 overflow-hidden'>
                      <Image
                        src='/products/p4.jpg?height=48&width=48'
                        alt='User avatar'
                        width={48}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center mb-1'>
                      <h4 className='font-semibold'>Sarah Johnson</h4>
                      <Badge
                        variant='outline'
                        className='ml-2 text-xs'>
                        Verified Purchase
                      </Badge>
                    </div>
                    <div className='flex mb-2'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    </div>
                    <p className='text-sm text-slate-500'>Reviewed on May 15, 2023</p>
                  </div>
                </div>
                <h5 className='font-medium mb-2'>Incredible sound quality and comfort!</h5>
                <p className='text-slate-600 mb-4'>
                  {` I've tried many headphones over the years, but these are by far the best. The noise cancellation is incredible - I can't hear my noisy neighbors at all when I'm working. The sound quality is crisp and balanced, and they're
                  comfortable enough to wear all day.`}
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-start mb-4'>
                  <div className='mr-4'>
                    <div className='w-12 h-12 rounded-full bg-slate-200 overflow-hidden'>
                      <Image
                        src='/products/p1.jpg?height=48&width=48'
                        alt='User avatar'
                        width={48}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center mb-1'>
                      <h4 className='font-semibold'>Michael Chen</h4>
                      <Badge
                        variant='outline'
                        className='ml-2 text-xs'>
                        Verified Purchase
                      </Badge>
                    </div>
                    <div className='flex mb-2'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 text-slate-300' />
                    </div>
                    <p className='text-sm text-slate-500'>Reviewed on April 3, 2023</p>
                  </div>
                </div>
                <h5 className='font-medium mb-2'>Great battery life, decent sound</h5>
                <p className='text-slate-600 mb-4'>
                  The battery life on these headphones is amazing - I only need to charge them once a week with daily use. The sound quality is good, though the bass could be a bit stronger. The noise cancellation works well in most environments.
                  Overall, very satisfied with my purchase.
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-start mb-4'>
                  <div className='mr-4'>
                    <div className='w-12 h-12 rounded-full bg-slate-200 overflow-hidden'>
                      <Image
                        src='/products/p2.jpg?height=48&width=48'
                        alt='User avatar'
                        width={48}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center mb-1'>
                      <h4 className='font-semibold'>Emily Rodriguez</h4>
                      <Badge
                        variant='outline'
                        className='ml-2 text-xs'>
                        Verified Purchase
                      </Badge>
                    </div>
                    <div className='flex mb-2'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    </div>
                    <p className='text-sm text-slate-500'>Reviewed on June 22, 2023</p>
                  </div>
                </div>
                <h5 className='font-medium mb-2'>Perfect for travel and work</h5>
                <p className='text-slate-600 mb-4'>
                  I bought these for a long international flight and they were a lifesaver. The noise cancellation blocked out the engine noise completely, and they were comfortable enough to wear for the entire 12-hour flight. Now I use them daily
                  for work calls too - the microphone quality is excellent.
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='flex items-start mb-4'>
                  <div className='mr-4'>
                    <div className='w-12 h-12 rounded-full bg-slate-200 overflow-hidden'>
                      <Image
                        src='/products/p3.jpg?height=48&width=48'
                        alt='User avatar'
                        width={48}
                        height={48}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  </div>
                  <div>
                    <div className='flex items-center mb-1'>
                      <h4 className='font-semibold'>David Wilson</h4>
                      <Badge
                        variant='outline'
                        className='ml-2 text-xs'>
                        Verified Purchase
                      </Badge>
                    </div>
                    <div className='flex mb-2'>
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                      <Star className='h-4 w-4 text-slate-300' />
                    </div>
                    <p className='text-sm text-slate-500'>Reviewed on May 30, 2023</p>
                  </div>
                </div>
                <h5 className='font-medium mb-2'>Worth the investment</h5>
                <p className='text-slate-600 mb-4'>
                  {`I was hesitant about spending this much on headphones, but after using them for a month, I can say they're worth every penny. The sound quality is exceptional, especially for classical music. My only minor complaint is that the
                  touch controls can be a bit sensitive.`}
                </p>
              </div>
            </div>

            <div className='mt-8 text-center'>
              <Button variant='outline'>Read All Reviews</Button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section
          className='py-16 bg-white'
          id='faq'>
          <div className='container mx-auto px-4'>
            <h2 className='text-3xl font-bold text-center mb-12'>Frequently Asked Questions</h2>

            <div className='max-w-3xl mx-auto'>
              <Accordion
                type='single'
                collapsible
                className='w-full'>
                <AccordionItem value='item-1'>
                  <AccordionTrigger>Are these headphones waterproof?</AccordionTrigger>
                  <AccordionContent>Our headphones have an IPX4 rating, which means they are splash and sweat resistant. They can handle light rain and workouts, but should not be submerged in water or worn during heavy rainfall.</AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-2'>
                  <AccordionTrigger>How long is the battery life?</AccordionTrigger>
                  <AccordionContent>
                    {`Our headphones offer up to 40 hours of playback time on a single charge with ANC turned on. With ANC off, you can get up to 50 hours. A quick 10-minute charge provides up to 5 hours of listening time when you're in a hurry.`}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-3'>
                  <AccordionTrigger>Can I connect to multiple devices at once?</AccordionTrigger>
                  <AccordionContent>
                    Yes, our headphones support multipoint connection, allowing you to connect to two devices simultaneously. This means you can be connected to your laptop for a video call and still receive calls from your phone without having to
                    disconnect and reconnect.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4'>
                  <AccordionTrigger>How long is the delivery time?</AccordionTrigger>
                  <AccordionContent>
                    Standard delivery takes 3-5 business days within the continental US. Express shipping (1-2 business days) is available for an additional fee. International shipping typically takes 7-14 business days depending on the destination
                    country.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-5'>
                  <AccordionTrigger>Do these headphones come with a warranty?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all our headphones come with a 2-year limited warranty that covers manufacturing defects and hardware malfunctions. The warranty does not cover damage from accidents, misuse, or normal wear and tear. Extended warranty options
                    are available at checkout.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-6'>
                  <AccordionTrigger>Are replacement ear cushions available?</AccordionTrigger>
                  <AccordionContent>
                    Yes, replacement ear cushions are available for purchase on our website. We recommend replacing the ear cushions every 12-18 months depending on usage to maintain optimal comfort and sound quality.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
