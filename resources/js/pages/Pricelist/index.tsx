import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Head, router } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState } from 'react';

// Initialize GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Define types
interface PriceItem {
  id: number;
  nama_paket: string;
  harga: number;
  deskripsi: string;
  kategori: string;
}

interface CartItem extends PriceItem {
  quantity: number;
}

interface GroupedPriceList {
  [key: string]: PriceItem[];
}

interface Props {
  daftarHarga: PriceItem[];
}

export default function PriceList({ daftarHarga }: Props) {
  const [groupedPrices, setGroupedPrices] = useState<GroupedPriceList>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Format currency to Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format category name from snake_case or lowercase to Title Case
  const formatCategoryName = (category: string): string => {
    // Handle snake_case
    if (category.includes('_')) {
      return category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Handle regular lowercase or other cases
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Add item to cart
  const addToCart = (item: PriceItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.harga * item.quantity), 0);
  };

  // Get total items count
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if item is in cart
  const isInCart = (itemId: number) => {
    return cartItems.some(item => item.id === itemId);
  };

  // Send cart to project form
  const sendCartToProjectForm = () => {
    if (cartItems.length === 0) return;
    
    // Encode cart data to pass to project form
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    const projectFormUrl = `/create-project?cart=${cartData}`;
    
    router.visit(projectFormUrl);
  };

  useEffect(() => {
    // Group prices by category
    const grouped = daftarHarga.reduce<GroupedPriceList>((acc, item) => {
      const category = item.kategori || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    setGroupedPrices(grouped);

    // GSAP animations
    gsap.from('.price-category', {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      scrollTrigger: {
        trigger: '#price-list-container',
        start: 'top 80%',
      }
    });

    // Add animations for price cards
    gsap.from('.price-card', {
      scale: 0.95,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      scrollTrigger: {
        trigger: '.price-category',
        start: 'top 85%',
      }
    });
  }, [daftarHarga]);

  return (
    <>
      <Head title="Daftar Harga - GARASI ARMSTRONG">
        <meta name="description" content="Daftar harga layanan premium di GARASI ARMSTRONG" />
      </Head>
      
      <div className="flex min-h-screen flex-col bg-black text-white">
        <Header />
        
        <main className="flex-grow pb-32 pt-32">
          <div className="container mx-auto px-6" id="price-list-container">
            {/* Hero Section */}
            <div className="mb-20 text-center">
              <h1 className="mb-3 text-5xl font-bold text-white sm:text-6xl">
                <span className="bg-gradient-to-r from-[#FF4433] to-orange-500 bg-clip-text text-transparent">Daftar Harga</span>
              </h1>
              <div className="mx-auto mb-6 h-1 w-24 bg-[#FF4433]"></div>
              <p className="mx-auto max-w-2xl text-gray-300">
                Temukan layanan berkualitas premium dengan harga terbaik yang sesuai dengan kebutuhan kendaraan Anda
              </p>
            </div>
            
            {Object.keys(groupedPrices).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900/50 py-20">
                <svg className="mb-4 h-20 w-20 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-2xl text-gray-400">Belum ada daftar harga tersedia</p>
                <p className="mt-2 text-gray-500">Silahkan cek kembali nanti</p>
              </div>
            ) : (
              Object.entries(groupedPrices).map(([category, prices]) => (
                <div key={category} className="price-category mb-20">
                  {/* Centered Category Title with Decorations */}
                  <div className="mb-12 flex items-center justify-center">
                    <div className="hidden h-[1px] w-16 bg-gradient-to-r from-transparent to-[#FF4433]/70 md:block"></div>
                    <h2 className="relative mx-4 text-center text-3xl font-bold text-white">
                      {formatCategoryName(category)}
                      <span className="absolute -bottom-3 left-1/2 h-1 w-12 -translate-x-1/2 transform bg-[#FF4433]"></span>
                    </h2>
                    <div className="hidden h-[1px] w-16 bg-gradient-to-l from-transparent to-[#FF4433]/70 md:block"></div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {prices.map((item) => (
                      <div 
                        key={item.id}
                        className={`price-card group relative overflow-hidden rounded-xl border p-6 transition-all duration-500 ${
                          isInCart(item.id) 
                            ? 'border-[#FF4433] bg-gradient-to-b from-[#FF4433]/10 to-black shadow-lg shadow-[#FF4433]/20' 
                            : 'border-gray-800 bg-gradient-to-b from-gray-900 to-black hover:border-[#FF4433] hover:shadow-lg hover:shadow-[#FF4433]/20'
                        }`}
                      >
                        {/* Glowing top border on hover */}
                        <div className="absolute -inset-0.5 -top-0.5 h-0.5 bg-gradient-to-r from-transparent via-[#FF4433] to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100"></div>
                        
                        {/* Selected indicator */}
                        {isInCart(item.id) && (
                          <div className="absolute right-3 top-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF4433]">
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-6 flex items-baseline justify-between">
                          <h3 className="text-xl font-bold text-white pr-8">{item.nama_paket}</h3>
                          <span className="rounded-full bg-[#FF4433]/10 px-4 py-1 text-lg font-bold text-[#FF4433]">
                            {formatCurrency(item.harga)}
                          </span>
                        </div>
                        
                        <p className="min-h-[60px] text-sm leading-relaxed text-gray-300">{item.deskripsi || "Layanan premium dengan kualitas terbaik untuk kendaraan Anda"}</p>
                        
                        <ul className="mb-6 mt-4 space-y-2">
                          <li className="flex items-center text-xs text-gray-400">
                            <svg className="mr-2 h-4 w-4 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Pengerjaan profesional
                          </li>
                          <li className="flex items-center text-xs text-gray-400">
                            <svg className="mr-2 h-4 w-4 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Material berkualitas tinggi
                          </li>
                          <li className="flex items-center text-xs text-gray-400">
                            <svg className="mr-2 h-4 w-4 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Garansi layanan
                          </li>
                        </ul>
                        
                        <div className="mt-6 flex space-x-2">
                          <button 
                            onClick={() => addToCart(item)}
                            className={`flex-1 rounded-lg px-4 py-3 text-center text-sm font-medium transition-all duration-300 ${
                              isInCart(item.id)
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-[#FF4433] text-white hover:bg-[#FF4433]/80'
                            }`}
                          >
                            <span className="flex items-center justify-center">
                              {isInCart(item.id) ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Ditambahkan
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6.28" />
                                  </svg>
                                  Tambah ke Keranjang
                                </>
                              )}
                            </span>
                          </button>
                          <button 
                            className="rounded-lg border border-gray-700 bg-transparent px-4 py-3 text-sm font-medium text-gray-300 transition-all hover:border-[#FF4433]/40 hover:bg-[#FF4433]/5 hover:text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {/* Call To Action Banner */}
            <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-black p-8 shadow-lg lg:p-12">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div>
                  <h3 className="text-2xl font-bold text-white lg:text-3xl">Butuh Penawaran Khusus?</h3>
                  <p className="mt-2 text-gray-300">Dapatkan harga spesial untuk proyek kustom atau kebutuhan khusus</p>
                </div>
                <a href="tel:+6281234567890" 
                  className="flex items-center rounded-lg bg-[#FF4433] px-6 py-3 text-base font-medium text-white transition-all hover:bg-[#FF4433]/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Minta Penawaran
                </a>
              </div>
            </div>
          </div>
        </main>
        
        {/* Floating Cart */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Cart Summary Bar */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4">
              <div className="container mx-auto flex items-center justify-between">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="flex items-center space-x-3 text-white"
                >
                  <div className="relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6.28" />
                    </svg>
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4433] text-xs text-white">
                      {getTotalItems()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{getTotalItems()} Item</p>
                    <p className="text-lg font-bold text-[#FF4433]">{formatCurrency(getTotalPrice())}</p>
                  </div>
                </button>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-600"
                  >
                    {isCartOpen ? 'Tutup' : 'Lihat Detail'}
                  </button>
                  <button
                    onClick={sendCartToProjectForm}
                    className="flex items-center rounded-lg bg-[#FF4433] px-6 py-2 text-sm font-medium text-white hover:bg-[#FF4433]/90"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Buat Permintaan Project
                  </button>
                </div>
              </div>
            </div>
            
            {/* Cart Details Panel */}
            {isCartOpen && (
              <div className="bg-black/95 backdrop-blur-sm border-t border-gray-800 max-h-96 overflow-y-auto">
                <div className="container mx-auto px-6 py-4">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{item.nama_paket}</h4>
                          <p className="text-sm text-gray-400">{formatCategoryName(item.kategori)}</p>
                          <p className="text-sm font-bold text-[#FF4433]">{formatCurrency(item.harga)}</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <p className="font-bold text-white">{formatCurrency(item.harga * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Footer />
      </div>
    </>
  );
}