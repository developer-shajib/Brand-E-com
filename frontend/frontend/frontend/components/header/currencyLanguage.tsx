'use client';

import { Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const languages: Language[] = [
  { code: 'US', name: 'English', nativeName: 'English' },
  { code: 'FR', name: 'French', nativeName: 'Français' },
  { code: 'SA', name: 'Arabic', nativeName: 'العربية' }
];

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'BDT', symbol: '৳', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' }
];
function CurrencyLanguage() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Add or remove the "dark" class from the document root
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center gap-1 text-sm font-medium'>
            <Globe className='h-4 w-4' />
            <span>{selectedLanguage.code}</span>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-[200px]'>
          <div className='px-2 py-1.5 text-sm font-semibold'>Language</div>
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => setSelectedLanguage(language)}
              className='flex items-center justify-between cursor-pointer'>
              <span>{language.nativeName}</span>
              {selectedLanguage.code === language.code && <span className='h-2 w-2 rounded-full bg-primary' />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className='px-2 py-1.5 text-sm font-semibold'>Currency</div>
          {currencies.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => setSelectedCurrency(currency)}
              className='flex items-center justify-between cursor-pointer'>
              <span>
                {currency.symbol} {currency.code}
              </span>
              {selectedCurrency.code === currency.code && <span className='h-2 w-2 rounded-full bg-primary' />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant='ghost'
        size='icon'
        onClick={toggleTheme}
        className='h-9 w-9'>
        {theme === 'light' ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
        <span className='sr-only'>Toggle theme</span>
      </Button>
    </div>
  );
}

export default CurrencyLanguage;
