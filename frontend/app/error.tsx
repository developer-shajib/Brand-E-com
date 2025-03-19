'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Server } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

interface ErrorProps {
  error: Error & { digest?: string; statusCode?: number };
  reset: () => void;
}

const ErrorActions = ({ reset }: { reset: () => void }) => {
  return (
    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
      <Button
        onClick={reset}
        className='gap-2'>
        <RefreshCw className='h-4 w-4' />
        Try Again
      </Button>

      <Button
        variant='outline'
        onClick={() => window.history.back()}
        className='gap-2'>
        <ArrowLeft className='h-4 w-4' />
        Go Back
      </Button>

      <Button
        asChild
        variant='secondary'
        className='gap-2'>
        <Link href='/'>
          <Home className='h-4 w-4' />
          Back to Home
        </Link>
      </Button>
    </div>
  );
};

export default function Error({ error, reset }: ErrorProps) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Determine if this is a 404 error based on error message or status code
  const isNotFoundError = error.message?.toLowerCase().includes('not found') || error.statusCode === 404;

  // Log the error to console in development
  useEffect(() => {
    console.error('Application error:', error);
    setIsClient(true);
  }, [error]);

  // Format the error stack for better readability
  const formatStack = (stack?: string) => {
    if (!stack) return null;

    return stack
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const errorStack = formatStack(error.stack);

  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center px-4 py-16'>
      <div className='w-full max-w-2xl mx-auto'>
        {/* Error Icon */}
        <div className='flex justify-center mb-6'>
          {isNotFoundError ? (
            <div className='p-4 rounded-full bg-amber-100'>
              <AlertTriangle className='h-12 w-12 text-amber-600' />
            </div>
          ) : (
            <div className='p-4 rounded-full bg-red-100'>
              <Server className='h-12 w-12 text-red-600' />
            </div>
          )}
        </div>

        {/* Error Title & Description */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>{isNotFoundError ? 'Resource Not Found' : 'Something went wrong'}</h1>
          <p className='text-muted-foreground text-lg'>{isNotFoundError ? "We couldn't find the resource you're looking for." : "We've encountered an unexpected error."}</p>
        </div>

        {/* Main Error Alert */}
        <Alert
          variant='destructive'
          className='mb-6'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className='mt-2 font-mono text-sm break-words'>{error.message || 'An unknown error occurred'}</AlertDescription>
        </Alert>

        {/* Error Information */}
        {isClient && (
          <div className='mb-8 bg-slate-50 rounded-lg border p-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground mb-2'>
              <Bug className='h-4 w-4' />
              <span>Technical Information</span>
            </div>

            <div className='grid gap-2 text-sm'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='font-medium'>Location</div>
                <div className='col-span-2 font-mono'>{pathname}</div>
              </div>

              {error.digest && (
                <div className='grid grid-cols-3 gap-4'>
                  <div className='font-medium'>Error ID</div>
                  <div className='col-span-2 font-mono'>{error.digest}</div>
                </div>
              )}

              {error.statusCode && (
                <div className='grid grid-cols-3 gap-4'>
                  <div className='font-medium'>Status Code</div>
                  <div className='col-span-2 font-mono'>{error.statusCode}</div>
                </div>
              )}

              {errorStack && errorStack.length > 0 && (
                <Accordion
                  type='single'
                  collapsible
                  className='w-full'>
                  <AccordionItem value='stack-trace'>
                    <AccordionTrigger className='text-sm font-medium py-2'>Stack Trace</AccordionTrigger>
                    <AccordionContent>
                      <div className='bg-slate-100 p-3 rounded-md overflow-x-auto'>
                        <pre className='text-xs font-mono'>
                          {errorStack.map((line, i) => (
                            <div
                              key={i}
                              className='py-0.5'>
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        )}

        <Separator className='my-6' />

        {/* Action Buttons */}
        <ErrorActions reset={reset} />
      </div>
    </div>
  );
}
