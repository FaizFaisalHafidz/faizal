// components/Gallery.tsx
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

// Data galeri yang ditingkatkan dengan deskripsi dan informasi tambahan
const galleryItems = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Kawasaki Ninja ZX6R',
    category: 'Cat Kustom',
    desc: 'Kombinasi warna hijau metalik dan hitam doff untuk tampilan agresif dan modern'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Honda CB Vintage',
    category: 'Restorasi',
    desc: 'Pengembalian warna original dengan sentuhan modern dan perlindungan ekstra'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1604794050755-761a3e01b0f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Yamaha R15 Racing',
    category: 'Cat Kustom',
    desc: 'Livery racing terinspirasi MotoGP dengan bahan tahan panas dan goresan'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Harley Davidson Doff',
    category: 'Ubah Warna',
    desc: 'Transformasi total dengan cat hitam doff premium dan aksen chrome terjaga'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1564422369833-3c7ea9da629b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Suzuki GSX-R Grafis',
    category: 'Airbrush',
    desc: 'Karya seni urban dengan teknik airbrush presisi tinggi dan lapisan pelindung'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1511994312181-a26b75486e8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Honda CB Klasik',
    category: 'Restorasi',
    desc: 'Restorasi warna asli tahun 70-an dengan kualitas cat modern anti pudar'
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1620447789324-67effb439c14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Vespa Sprint Kalem',
    category: 'Ubah Warna',
    desc: 'Paduan warna pastel dan glossy finish untuk tampilan klasik yang abadi'
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1614026480418-bd11fdf8a3da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    title: 'Royal Enfield Flames',
    category: 'Airbrush',
    desc: 'Efek api yang realistis dengan gradasi warna merah-orange dan detail terperinci'
  },
];

// Kategori untuk filter dengan nama Indonesia
const categories = ['Semua', 'Cat Kustom', 'Restorasi', 'Ubah Warna', 'Airbrush'];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [visibleItems, setVisibleItems] = useState(galleryItems);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [hoverItem, setHoverItem] = useState<number | null>(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    
    gsap.fromTo(
      headingRef.current,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        }
      }
    );
    
    if (galleryRef.current) {
      gsap.fromTo(
        galleryRef.current.children,
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1,
          duration: 0.5,
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
          }
        }
      );
    }
  }, []);
  
  useEffect(() => {
    if (activeCategory === 'Semua') {
      setVisibleItems(galleryItems);
    } else {
      setVisibleItems(galleryItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory]);

  const openLightbox = (item: any) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <section 
      id="gallery" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-900 to-gray-800"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Galeri <span className="text-[#FF4433]">Karya</span> Kami
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FF4433] to-transparent mx-auto mb-6"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Jelajahi portfolio hasil pengecatan motor kustom kami dan temukan inspirasi untuk transformasi motor kesayangan Anda.
          </p>
        </div>
        
        {/* Filter Buttons - improved styling */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 relative">
          <div className="absolute inset-0 blur-xl bg-[#FF4433]/10 rounded-full"></div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-[#FF4433] text-white shadow-lg shadow-[#FF4433]/20' 
                  : 'bg-gray-700/70 backdrop-blur-sm text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </button>
          ))}
        </div>
        
        {/* Gallery Grid with improved animations */}
        <AnimatePresence>
          <motion.div 
            ref={galleryRef}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
          >
            {visibleItems.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-xl bg-gray-900 shadow-xl shadow-black/20 cursor-pointer"
                onClick={() => openLightbox(item)}
                onMouseEnter={() => setHoverItem(item.id)}
                onMouseLeave={() => setHoverItem(null)}
              >
                {/* Image with hover effects */}
                <div className="h-72 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hoverItem === item.id ? 'scale-110 filter brightness-90' : ''
                    }`}
                  />
                </div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-[#FF4433] text-xs font-medium py-1 px-3 rounded-full">
                  {item.category}
                </div>
                
                {/* Caption/Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-xl font-bold">{item.title}</h3>
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">{item.desc}</p>
                    
                    <div className="flex items-center mt-4">
                      <span className="text-white text-xs bg-[#FF4433]/30 border border-[#FF4433]/50 px-3 py-1 rounded-full inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Detail
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state when no items match filter */}
        {visibleItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl text-white font-medium mb-2">Belum Ada Karya</h3>
            <p className="text-gray-400 max-w-md">Kami belum memiliki contoh untuk kategori ini. Silakan pilih kategori lain atau hubungi kami untuk proyek kustom.</p>
            <button 
              onClick={() => setActiveCategory('Semua')} 
              className="mt-6 px-5 py-2 bg-[#FF4433] text-white rounded-md hover:bg-[#FF4433]/90 transition-colors"
            >
              Lihat Semua Karya
            </button>
          </div>
        )}
        
        {/* View More Button - enhanced styling */}
        <div className="text-center mt-16">
          <a 
            href="#contact" 
            className="inline-flex items-center bg-gradient-to-r from-[#FF4433] to-[#FF5F50] px-8 py-4 rounded-lg font-medium text-white shadow-lg shadow-[#FF4433]/20 hover:shadow-xl hover:shadow-[#FF4433]/30 hover:-translate-y-1 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Konsultasikan Proyek Kustom Anda
          </a>
          <p className="text-gray-400 text-sm mt-4">
            Setiap motor memiliki karakter tersendiri, begitu juga dengan warna yang akan kami aplikasikan
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={closeLightbox}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeLightbox} 
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-[#FF4433] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="md:flex">
                {/* Image side */}
                <div className="md:w-2/3">
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Details side */}
                <div className="md:w-1/3 p-6 bg-gray-900">
                  <div className="inline-block px-3 py-1 bg-[#FF4433]/20 text-[#FF4433] text-sm font-medium rounded-md mb-4">
                    {selectedItem.category}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{selectedItem.title}</h3>
                  <p className="text-gray-300 mb-6">{selectedItem.desc}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-white mb-2">Spesifikasi</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433] mr-2"></span>
                        Cat premium anti-gores
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433] mr-2"></span>
                        Lapisan UV protection
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433] mr-2"></span>
                        Garansi warna 2 tahun
                      </li>
                    </ul>
                  </div>
                  
                  <a 
                    href="#contact" 
                    className="block w-full bg-[#FF4433] text-white text-center py-3 rounded-lg font-medium hover:bg-[#FF4433]/90 transition-colors"
                    onClick={closeLightbox}
                  >
                    Buat yang Serupa
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}