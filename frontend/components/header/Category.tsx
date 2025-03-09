import { categories } from '@/db/data';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

function Category() {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  return (
    <>
      {/* Categories Mega Menu */}
      <div
        className='relative inline-block'
        onMouseEnter={() => setIsCategoryMenuOpen(true)}
        onMouseLeave={() => {
          setIsCategoryMenuOpen(false);
          setActiveCategory(null);
          setActiveSubcategory(null);
        }}>
        <button
          className='flex items-center text-sm font-medium hover:text-primary'
          aria-expanded={isCategoryMenuOpen}
          aria-haspopup='true'>
          Categories
          <ChevronDown className='ml-1 h-4 w-4' />
        </button>

        {/* Mega Menu Container */}
        {isCategoryMenuOpen && (
          <div className='absolute left-0 top-full z-50     rounded-md overflow-hidden'>
            <div className='flex max-w-full'>
              {/* First Level - Parent Categories */}
              <div className=' bg-white  border-2 min-h-[400px]'>
                <ul className='py-2'>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className={`px-4 py-1 hover:bg-muted cursor-pointer ${activeCategory === category.id ? 'bg-muted' : ''}`}
                      onMouseLeave={() => setActiveSubcategory(null)}
                      onMouseEnter={() => setActiveCategory(category.id)}>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-md pr-4'>{category.name}</span>
                        <ChevronRight className='h-4 w-4 text-muted-foreground' />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Second Level - Subcategories with Image */}
              {activeCategory && (
                <div className='w-3/4 flex'>
                  <div className='  bg-white  border-2 min-h-[400px] '>
                    <ul className='py-2'>
                      {categories
                        .find((c) => c.id === activeCategory)
                        ?.subcategories?.map((subcategory) => (
                          <li
                            key={subcategory.id}
                            className={`px-4 py-2 hover:bg-muted cursor-pointer ${activeSubcategory === subcategory.id ? 'bg-muted' : ''}`}
                            onMouseEnter={() => setActiveSubcategory(subcategory.id)}>
                            <div className='flex items-center justify-between'>
                              <span className='font-medium text-md pr-4'>{subcategory.name}</span>
                              {subcategory.children && subcategory.children.length > 0 && <ChevronRight className='h-4 w-4 text-muted-foreground' />}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Third Level - Subcategory Children */}
                  {activeSubcategory && (
                    <div className='  bg-white  border-2 min-h-[400px]'>
                      <ul className='py-2'>
                        {categories
                          ?.find((c) => c.id === activeCategory)
                          ?.subcategories?.find((s) => s.id === activeSubcategory)
                          ?.children?.map((child) => (
                            <li
                              key={child.id}
                              className='px-4 py-2 hover:bg-muted cursor-pointer'>
                              <Link
                                href={`/category/${child.slug}`}
                                className='block'>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Category;
