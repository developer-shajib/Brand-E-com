// Define the Category type
interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Category[];
  children?: Category[];
}

// Sample category data with multiple levels
export const categories: Category[] = [
  {
    id: '1',
    name: 'Women',
    slug: 'women',
    subcategories: [
      {
        id: '1-1',
        name: 'Clothing',
        slug: 'women-clothing',
        children: [
          { id: '1-1-1', name: 'Dresses', slug: 'women-dresses' },
          { id: '1-1-2', name: 'Tops', slug: 'women-tops' },
          { id: '1-1-3', name: 'Pants', slug: 'women-pants' },
          { id: '1-1-4', name: 'Skirts', slug: 'women-skirts' },
          { id: '1-1-5', name: 'Activewear', slug: 'women-activewear' }
        ]
      },
      {
        id: '1-2',
        name: 'Shoes',
        slug: 'women-shoes',
        children: [
          { id: '1-2-1', name: 'Heels', slug: 'women-heels' },
          { id: '1-2-2', name: 'Flats', slug: 'women-flats' },
          { id: '1-2-3', name: 'Sneakers', slug: 'women-sneakers' },
          { id: '1-2-4', name: 'Boots', slug: 'women-boots' }
        ]
      },
      {
        id: '1-3',
        name: 'Accessories',
        slug: 'women-accessories',
        children: [
          { id: '1-3-1', name: 'Jewelry', slug: 'women-jewelry' },
          { id: '1-3-2', name: 'Bags', slug: 'women-bags' },
          { id: '1-3-3', name: 'Scarves', slug: 'women-scarves' },
          { id: '1-3-4', name: 'Belts', slug: 'women-belts' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Men',
    slug: 'men',
    subcategories: [
      {
        id: '2-1',
        name: 'Clothing',
        slug: 'men-clothing',
        children: [
          { id: '2-1-1', name: 'Shirts', slug: 'men-shirts' },
          { id: '2-1-2', name: 'T-shirts', slug: 'men-tshirts' },
          { id: '2-1-3', name: 'Pants', slug: 'men-pants' },
          { id: '2-1-4', name: 'Suits', slug: 'men-suits' },
          { id: '2-1-5', name: 'Activewear', slug: 'men-activewear' }
        ]
      },
      {
        id: '2-2',
        name: 'Shoes',
        slug: 'men-shoes',
        children: [
          { id: '2-2-1', name: 'Dress Shoes', slug: 'men-dress-shoes' },
          { id: '2-2-2', name: 'Sneakers', slug: 'men-sneakers' },
          { id: '2-2-3', name: 'Boots', slug: 'men-boots' },
          { id: '2-2-4', name: 'Sandals', slug: 'men-sandals' }
        ]
      },
      {
        id: '2-3',
        name: 'Accessories',
        slug: 'men-accessories',
        children: [
          { id: '2-3-1', name: 'Watches', slug: 'men-watches' },
          { id: '2-3-2', name: 'Belts', slug: 'men-belts' },
          { id: '2-3-3', name: 'Ties', slug: 'men-ties' },
          { id: '2-3-4', name: 'Wallets', slug: 'men-wallets' }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Kids',
    slug: 'kids',
    subcategories: [
      {
        id: '3-1',
        name: 'Girls',
        slug: 'girls',
        children: [
          { id: '3-1-1', name: 'Dresses', slug: 'girls-dresses' },
          { id: '3-1-2', name: 'Tops', slug: 'girls-tops' },
          { id: '3-1-3', name: 'Bottoms', slug: 'girls-bottoms' }
        ]
      },
      {
        id: '3-2',
        name: 'Boys',
        slug: 'boys',
        children: [
          { id: '3-2-1', name: 'Shirts', slug: 'boys-shirts' },
          { id: '3-2-2', name: 'Pants', slug: 'boys-pants' },
          { id: '3-2-3', name: 'Outerwear', slug: 'boys-outerwear' }
        ]
      },
      {
        id: '3-3',
        name: 'Baby',
        slug: 'baby',
        children: [
          { id: '3-3-1', name: 'Bodysuits', slug: 'baby-bodysuits' },
          { id: '3-3-2', name: 'Sets', slug: 'baby-sets' },
          { id: '3-3-3', name: 'Accessories', slug: 'baby-accessories' }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Home',
    slug: 'home',
    subcategories: [
      {
        id: '4-1',
        name: 'Living Room',
        slug: 'living-room',
        children: [
          { id: '4-1-1', name: 'Sofas', slug: 'sofas' },
          { id: '4-1-2', name: 'Coffee Tables', slug: 'coffee-tables' },
          { id: '4-1-3', name: 'Decor', slug: 'living-room-decor' }
        ]
      },
      {
        id: '4-2',
        name: 'Bedroom',
        slug: 'bedroom',
        children: [
          { id: '4-2-1', name: 'Beds', slug: 'beds' },
          { id: '4-2-2', name: 'Bedding', slug: 'bedding' },
          { id: '4-2-3', name: 'Nightstands', slug: 'nightstands' }
        ]
      },
      {
        id: '4-3',
        name: 'Kitchen',
        slug: 'kitchen',
        children: [
          { id: '4-3-1', name: 'Cookware', slug: 'cookware' },
          { id: '4-3-2', name: 'Dinnerware', slug: 'dinnerware' },
          { id: '4-3-3', name: 'Utensils', slug: 'utensils' }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Beauty',
    slug: 'beauty',
    subcategories: [
      {
        id: '5-1',
        name: 'Skincare',
        slug: 'skincare',
        children: [
          { id: '5-1-1', name: 'Cleansers', slug: 'cleansers' },
          { id: '5-1-2', name: 'Moisturizers', slug: 'moisturizers' },
          { id: '5-1-3', name: 'Serums', slug: 'serums' }
        ]
      },
      {
        id: '5-2',
        name: 'Makeup',
        slug: 'makeup',
        children: [
          { id: '5-2-1', name: 'Face', slug: 'face-makeup' },
          { id: '5-2-2', name: 'Eyes', slug: 'eye-makeup' },
          { id: '5-2-3', name: 'Lips', slug: 'lip-makeup' }
        ]
      },
      {
        id: '5-3',
        name: 'Haircare',
        slug: 'haircare',
        children: [
          { id: '5-3-1', name: 'Shampoo', slug: 'shampoo' },
          { id: '5-3-2', name: 'Conditioner', slug: 'conditioner' },
          { id: '5-3-3', name: 'Styling', slug: 'hair-styling' }
        ]
      }
    ]
  }
];

export const bannerSlides = [
  {
    id: 1,
    imageUrl: '/bannerImage/banner1.jpg',
    title: 'Summer Collection 2024',
    description: 'Discover our latest arrivals for the summer season. Fresh styles for every occasion.',
    buttonName: 'Shop Now',
    buttonUrl: '/collections/summer'
  },
  {
    id: 2,
    imageUrl: '/bannerImage/banner2.jpg',
    title: 'Exclusive Deals',
    description: 'Up to 50% off on selected items. Limited time offer.',
    buttonName: 'View Offers',
    buttonUrl: '/sale'
  },
  {
    id: 3,
    imageUrl: '/bannerImage/banner3.jpg',
    title: 'New Arrivals',
    description: 'Be the first to explore our newest products and collections.',
    buttonName: 'Explore',
    buttonUrl: '/new-arrivals'
  },
  {
    id: 4,
    imageUrl: '/bannerImage/banner4.jpg',
    title: 'New Releases',
    description: 'Be the first to explore our newest products and collections.',
    buttonName: 'Explore',
    buttonUrl: '/new-arrivals'
  },
  {
    id: 5,
    imageUrl: '/bannerImage/banner5.png',
    title: 'Recently Browse',
    description: 'Explore recently browse our newest products and collections.',
    buttonName: 'Explore',
    buttonUrl: '/new-arrivals'
  }
];
// Sample product data
export const products = [
  {
    id: '1',
    title: '500ml Water Flask for Hot & Cold Drink With LED Temperature Display',
    image: '/products/p1.jpg',
    price: 349,
    originalPrice: 442,
    rating: 4.5,
    reviewCount: 206,
    hasVoucher: true
  },
  {
    id: '2',
    title: 'Wireless Bluetooth Headphones with Noise Cancellation',
    image: '/products/p2.jpg',
    price: 899,
    originalPrice: 1099,
    rating: 4.7,
    reviewCount: 154,
    hasVoucher: true
  },
  {
    id: '3',
    title: 'Smart Fitness Band with Heart Rate Monitor',
    image: '/products/p3.jpg',
    price: 1199,
    originalPrice: 1499,
    rating: 4.3,
    reviewCount: 312,
    hasVoucher: false
  },
  {
    id: '4',
    title: 'Portable Mini Air Cooler & Humidifier',
    image: '/products/p4.jpg',
    price: 799,
    originalPrice: 999,
    rating: 4.1,
    reviewCount: 87,
    hasVoucher: true
  },
  {
    id: '5',
    title: 'USB Rechargeable LED Desk Lamp with Touch Control',
    image: '/products/p3.jpg',
    price: 499,
    originalPrice: 650,
    rating: 4.6,
    reviewCount: 220,
    hasVoucher: false
  },
  {
    id: '6',
    title: 'Gaming Mouse with RGB Lighting and Adjustable DPI',
    image: '/products/p3.jpg',
    price: 899,
    originalPrice: 1099,
    rating: 4.8,
    reviewCount: 310,
    hasVoucher: true
  },
  {
    id: '7',
    title: 'Stainless Steel Electric Kettle 1.5L',
    image: '/products/p3.jpg',
    price: 649,
    originalPrice: 799,
    rating: 4.5,
    reviewCount: 165,
    hasVoucher: false
  },
  {
    id: '8',
    title: 'Smart Home WiFi Security Camera with Night Vision',
    image: '/products/p3.jpg',
    price: 1299,
    originalPrice: 1599,
    rating: 4.2,
    reviewCount: 290,
    hasVoucher: true
  },
  {
    id: '9',
    title: 'Wireless Charging Pad for Smartphones',
    image: '/products/p3.jpg',
    price: 599,
    originalPrice: 750,
    rating: 4.4,
    reviewCount: 180,
    hasVoucher: false
  },
  {
    id: '10',
    title: 'Digital Kitchen Weighing Scale - 10kg Capacity',
    image: '/products/p1.jpg',
    price: 399,
    originalPrice: 550,
    rating: 4.0,
    reviewCount: 97,
    hasVoucher: true
  },
  {
    id: '11',
    title: 'Ergonomic Office Chair with Lumbar Support',
    image: '/products/p1.jpg',
    price: 3499,
    originalPrice: 3999,
    rating: 4.6,
    reviewCount: 412,
    hasVoucher: true
  },
  {
    id: '12',
    title: 'Portable Bluetooth Speaker with Deep Bass',
    image: '/products/p2.jpg',
    price: 1299,
    originalPrice: 1499,
    rating: 4.7,
    reviewCount: 225,
    hasVoucher: false
  },
  {
    id: '13',
    title: 'Stainless Steel Insulated Travel Mug - 350ml',
    image: '/products/p3.jpg',
    price: 349,
    originalPrice: 449,
    rating: 4.3,
    reviewCount: 143,
    hasVoucher: true
  },
  {
    id: '14',
    title: 'Adjustable Laptop Stand for Desk & Bed',
    image: '/products/p4.jpg',
    price: 799,
    originalPrice: 999,
    rating: 4.5,
    reviewCount: 275,
    hasVoucher: true
  },
  {
    id: '15',
    title: 'Wireless Earbuds with Charging Case',
    image: '/products/p5.jpg',
    price: 1499,
    originalPrice: 1799,
    rating: 4.6,
    reviewCount: 362,
    hasVoucher: false
  }
];
