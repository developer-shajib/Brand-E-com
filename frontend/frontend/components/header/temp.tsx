// import React from 'react'

// type Props = {}

// const temp = (props: Props) => {
//   return (
//     <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
//       {/* Top bar - optional for announcements, etc. */}
//       <div className='hidden bg-primary text-primary-foreground py-2 px-4 text-center text-sm md:block'>Free shipping on orders over {selectedCurrency.symbol}50!</div>

//       {/* Main header */}
//       <div className='container mx-auto px-4 py-4'>
//         <div className='flex items-center justify-between'>
//           {/* Mobile menu */}
//           <div className='lg:hidden'>
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button
//                   variant='ghost'
//                   size='icon'
//                   className='mr-2'>
//                   <Menu className='h-6 w-6' />
//                   <span className='sr-only'>Toggle menu</span>
//                 </Button>
//               </SheetTrigger>
//               <SheetContent
//                 side='left'
//                 className='w-[300px] sm:w-[350px]'>
//                 <div className='flex flex-col gap-6 py-6'>
//                   <div className='flex items-center justify-between'>
//                     <Link
//                       href='/'
//                       className='flex items-center gap-2'>
//                       <Image
//                         src='/placeholder.svg?height=40&width=40'
//                         width={40}
//                         height={40}
//                         alt='ShopHub Logo'
//                       />
//                       <span className='text-xl font-bold'>ShopHub</span>
//                     </Link>
//                     <SheetClose asChild>
//                       <Button
//                         variant='ghost'
//                         size='icon'>
//                         <X className='h-5 w-5' />
//                       </Button>
//                     </SheetClose>
//                   </div>
//                   <div className='space-y-4'>
//                     <form
//                       onSubmit={handleSearch}
//                       className='relative'>
//                       <Input
//                         type='search'
//                         placeholder='Search products...'
//                         className='w-full pr-10'
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                       />
//                       <Button
//                         type='submit'
//                         variant='ghost'
//                         size='icon'
//                         className='absolute right-0 top-0'>
//                         <Search className='h-5 w-5' />
//                         <span className='sr-only'>Search</span>
//                       </Button>
//                     </form>
//                   </div>
//                   <nav className='flex flex-col space-y-6'>
//                     {renderMobileCategoryMenu()}
//                     <Link
//                       href='/new-arrivals'
//                       className='text-lg font-medium'>
//                       New Arrivals
//                     </Link>
//                     <Link
//                       href='/sale'
//                       className='text-lg font-medium'>
//                       Sale
//                     </Link>
//                     <Link
//                       href='/about'
//                       className='text-lg font-medium'>
//                       About
//                     </Link>
//                     <Link
//                       href='/contact'
//                       className='text-lg font-medium'>
//                       Contact
//                     </Link>
//                   </nav>
//                   <div className='mt-auto space-y-4'>
//                     <div className='flex items-center justify-between'>
//                       <span className='text-sm font-medium'>Currency</span>
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button
//                             variant='outline'
//                             className='w-[120px] justify-between'>
//                             {selectedCurrency.code} <ChevronDown className='h-4 w-4 ml-2' />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align='end'>
//                           {currencies.map((currency) => (
//                             <DropdownMenuItem
//                               key={currency.code}
//                               onClick={() => handleCurrencyChange(currency)}>
//                               {currency.code} ({currency.symbol})
//                             </DropdownMenuItem>
//                           ))}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                 </div>
//               </SheetContent>
//             </Sheet>
//           </div>

//           {/* Logo */}
//           <div className='flex items-center'>
//             <Link
//               href='/'
//               className='flex items-center gap-2'>
//               <Image
//                 src='/placeholder.svg?height=40&width=40'
//                 width={40}
//                 height={40}
//                 alt='ShopHub Logo'
//                 className='h-10 w-10'
//               />
//               <span className='text-xl font-bold hidden sm:inline-block'>ShopHub</span>
//             </Link>
//           </div>

//           {/* Desktop Navigation - hidden on mobile */}
//           <nav className='hidden lg:flex items-center space-x-6 mx-4'>
//             {/* Categories Mega Menu */}
//             <div
//               className='relative'
//               onMouseEnter={() => setIsCategoryMenuOpen(true)}
//               onMouseLeave={() => {
//                 setIsCategoryMenuOpen(false);
//                 setActiveCategory(null);
//                 setActiveSubcategory(null);
//               }}>
//               <button
//                 className='flex items-center text-sm font-medium hover:text-primary'
//                 aria-expanded={isCategoryMenuOpen}
//                 aria-haspopup='true'>
//                 Categories
//                 <ChevronDown className='ml-1 h-4 w-4' />
//               </button>

//               {/* Mega Menu Container */}
//               {isCategoryMenuOpen && (
//                 <div className='absolute left-0 top-full z-50 mt-1 w-screen max-w-6xl bg-white shadow-lg rounded-md overflow-hidden'>
//                   <div className='flex'>
//                     {/* First Level - Parent Categories */}
//                     <div className='w-1/4 bg-muted/30 min-h-[400px]'>
//                       <ul className='py-2'>
//                         {categories.map((category) => (
//                           <li
//                             key={category.id}
//                             className={`px-4 py-3 hover:bg-muted cursor-pointer ${activeCategory === category.id ? 'bg-muted' : ''}`}
//                             onMouseEnter={() => setActiveCategory(category.id)}>
//                             <div className='flex items-center justify-between'>
//                               <span className='font-medium'>{category.name}</span>
//                               <ChevronRight className='h-4 w-4 text-muted-foreground' />
//                             </div>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     {/* Second Level - Subcategories with Image */}
//                     {activeCategory && (
//                       <div className='w-3/4 flex'>
//                         <div className='w-1/3 min-h-[400px] border-l border-muted'>
//                           <ul className='py-2'>
//                             {categories
//                               .find((c) => c.id === activeCategory)
//                               ?.subcategories.map((subcategory) => (
//                                 <li
//                                   key={subcategory.id}
//                                   className={`px-4 py-2 hover:bg-muted cursor-pointer ${activeSubcategory === subcategory.id ? 'bg-muted' : ''}`}
//                                   onMouseEnter={() => setActiveSubcategory(subcategory.id)}>
//                                   <div className='flex items-center justify-between'>
//                                     <span>{subcategory.name}</span>
//                                     {subcategory.children && subcategory.children.length > 0 && <ChevronRight className='h-4 w-4 text-muted-foreground' />}
//                                   </div>
//                                 </li>
//                               ))}
//                           </ul>
//                         </div>

//                         {/* Third Level - Subcategory Children */}
//                         <div className='w-1/3 min-h-[400px] border-l border-muted'>
//                           {activeSubcategory && (
//                             <ul className='py-2'>
//                               {categories
//                                 .find((c) => c.id === activeCategory)
//                                 ?.subcategories.find((s) => s.id === activeSubcategory)
//                                 ?.children?.map((child) => (
//                                   <li
//                                     key={child.id}
//                                     className='px-4 py-2 hover:bg-muted cursor-pointer'>
//                                     <Link
//                                       href={`/category/${child.slug}`}
//                                       className='block'>
//                                       {child.name}
//                                     </Link>
//                                   </li>
//                                 ))}
//                             </ul>
//                           )}
//                         </div>

//                         {/* Category Image */}
//                         <div className='w-1/3 p-4 flex items-center justify-center border-l border-muted'>
//                           {activeCategory && (
//                             <div className='text-center'>
//                               <div className='relative w-full h-48 mb-4 overflow-hidden rounded-md'>
//                                 <Image
//                                   src={categories.find((c) => c.id === activeCategory)?.image || '/placeholder.svg?height=200&width=300'}
//                                   alt={categories.find((c) => c.id === activeCategory)?.name || 'Category'}
//                                   fill
//                                   className='object-cover'
//                                 />
//                               </div>
//                               <Link
//                                 href={`/category/${categories.find((c) => c.id === activeCategory)?.slug}`}
//                                 className='inline-block px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90'>
//                                 Shop All {categories.find((c) => c.id === activeCategory)?.name}
//                               </Link>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Link
//               href='/new-arrivals'
//               className='text-sm font-medium hover:text-primary'>
//               New Arrivals
//             </Link>
//             <Link
//               href='/sale'
//               className='text-sm font-medium hover:text-primary'>
//               Sale
//             </Link>
//             <Link
//               href='/about'
//               className='text-sm font-medium hover:text-primary'>
//               About
//             </Link>
//             <Link
//               href='/contact'
//               className='text-sm font-medium hover:text-primary'>
//               Contact
//             </Link>
//           </nav>

//           {/* Search bar - hidden on mobile, shown in desktop */}
//           <div className='hidden md:block flex-1 max-w-md mx-4'>
//             <form
//               onSubmit={handleSearch}
//               className='relative'>
//               <Input
//                 type='search'
//                 placeholder='Search products...'
//                 className='w-full pr-10'
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <Button
//                 type='submit'
//                 variant='ghost'
//                 size='icon'
//                 className='absolute right-0 top-0'>
//                 <Search className='h-5 w-5' />
//                 <span className='sr-only'>Search</span>
//               </Button>
//             </form>
//           </div>

//           {/* Right side actions */}
//           <div className='flex items-center space-x-2'>
//             {/* Currency Switcher */}
//             <DropdownMenu>
//               <DropdownMenuTrigger
//                 asChild
//                 className='hidden md:flex'>
//                 <Button
//                   variant='ghost'
//                   size='sm'
//                   className='gap-1'>
//                   {selectedCurrency.symbol} {selectedCurrency.code}
//                   <ChevronDown className='h-4 w-4' />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align='end'>
//                 {currencies.map((currency) => (
//                   <DropdownMenuItem
//                     key={currency.code}
//                     onClick={() => handleCurrencyChange(currency)}>
//                     {currency.symbol} {currency.code} - {currency.name}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* Wishlist button */}
//             <Button
//               variant='ghost'
//               size='icon'
//               className='relative'>
//               <Heart className='h-5 w-5' />
//               {wishlistItems > 0 && <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground'>{wishlistItems}</span>}
//               <span className='sr-only'>Wishlist</span>
//             </Button>

//             {/* Cart button */}
//             <Button
//               variant='ghost'
//               size='icon'
//               className='relative'>
//               <ShoppingCart className='h-5 w-5' />
//               {cartItems > 0 && <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground'>{cartItems}</span>}
//               <span className='sr-only'>Cart</span>
//             </Button>
//           </div>
//         </div>

//         {/* Mobile search - only visible on mobile */}
//         <div className='mt-4 md:hidden'>
//           <form
//             onSubmit={handleSearch}
//             className='relative'>
//             <Input
//               type='search'
//               placeholder='Search products...'
//               className='w-full pr-10'
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <Button
//               type='submit'
//               variant='ghost'
//               size='icon'
//               className='absolute right-0 top-0'>
//               <Search className='h-5 w-5' />
//               <span className='sr-only'>Search</span>
//             </Button>
//           </form>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default temp
