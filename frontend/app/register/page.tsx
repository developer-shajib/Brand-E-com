'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z
  .object({
    username: z.string().min(3, {
      message: 'Username must be at least 3 characters.'
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.'
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.'
    }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export default function RegisterPage() {
  // const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle form submission
  }

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-slate-700 dark:via-black dark:to-slate-400'>
        <div className='container mx-auto px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-md'>
            {/* Registration Card */}
            <div className='bg-white dark:bg-slate-600 rounded-lg shadow-lg p-6 sm:p-8'>
              <div className='relative mb-6'>
                <h1 className='text-xl font-medium text-gray-900 dark:text-slate-200'>Register Now</h1>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='username'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder='Username'
                            {...field}
                            className='h-12 border dark:border-slate-300 dark:placeholder:text-slate-300'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Email'
                            {...field}
                            className='h-12 border dark:border-slate-300 dark:placeholder:text-slate-300'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Password'
                              {...field}
                              className='h-12 border dark:border-slate-300 dark:placeholder:text-slate-300 pr-10'
                            />
                            <button
                              type='button'
                              onClick={() => setShowPassword(!showPassword)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                              {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5 dark:text-slate-300' />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Confirm Password'
                              {...field}
                              className='h-12 border dark:border-slate-300 dark:placeholder:text-slate-300 pr-10'
                            />
                            <button
                              type='button'
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                              {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5 dark:text-slate-300' />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      className='dark:border dark:border-slate-100'
                      id='terms'
                    />
                    <label
                      htmlFor='terms'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300'>
                      I agree to the <Link href='/terms'>terms and conditions</Link>
                    </label>
                  </div>

                  <Button
                    type='submit'
                    className='w-full h-12  bg-slate-600 text-slate-200 dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-700 dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-lg cursor-pointer'>
                    Register
                  </Button>

                  <div className='relative my-6'>
                    <div className='absolute inset-0 flex items-center'>
                      <Separator />
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className=' px-2 text-slate-900 dark:text-slate-300 '>Or continue with</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 '>
                    <Button
                      type='button'
                      variant='outline'
                      className='h-12 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer transition-all duration-300'
                      onClick={() => {
                        // Handle Google login
                      }}>
                      <Image
                        src='/socialLogo/google.png?height=20&width=20'
                        alt='Google'
                        width={20}
                        height={20}
                        className='mr-2'
                      />
                      Google
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      className='h-12 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer transition-all duration-300'
                      onClick={() => {
                        // Handle Facebook login
                      }}>
                      <Image
                        src='/socialLogo/fb.png?height=20&width=20'
                        alt='Facebook'
                        width={20}
                        height={20}
                        className='mr-2'
                      />
                      Facebook
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            {/* Footer Links */}
            <div className='mt-6 flex items-center justify-between text-sm text-gray-600'>
              <Link
                href='/login'
                className='hover:text-slate-100 dark:text-slate-300 hover:underline'>
                Sign In
              </Link>
              <Link
                href='/register'
                className='hover:text-slate-100 dark:text-slate-300 hover:underline'>
                {`Already have an account?`}
              </Link>
            </div>

            <div className='mt-4 text-center text-sm text-gray-600'>
              <Link
                href='/'
                className='hover:text-slate-100 dark:text-slate-300 hover:underline'>
                ← Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
