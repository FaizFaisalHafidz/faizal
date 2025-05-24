// components/Testimonials.tsx
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

// Testimonial data dengan konten yang ditingkatkan dalam Bahasa Indonesia
const testimonials = [
  {
    id: 1,
    name: 'Ahmad Supriyadi',
    role: 'Penggemar Motor Kustom',
    // Gunakan placeholder image yang valid, jangan gunakan "#"
    image: 'https://i.pravatar.cc/150?img=1',
    quote: 'Garasi Armstrong berhasil mengubah Yamaha tua saya menjadi karya seni jalanan. Perhatian mereka terhadap detail dan kualitas pengecatan jauh melampaui ekspektasi saya. Sangat direkomendasikan!',
    rating: 5,
    bike: 'Yamaha Vixion',
    service: 'Cat Kustom Metalik'
  },
  {
    id: 2,
    name: 'Dewi Kusumawardani',
    role: 'Anggota Klub Racing',
    image: 'https://i.pravatar.cc/150?img=5',
    quote: 'Saya membutuhkan livery racing khusus untuk Kawasaki saya, dan tim Garasi Armstrong memberikan hasil yang sempurna. Catnya mulus dan tetap tahan bahkan setelah kondisi balapan yang intens.',
    rating: 5,
    bike: 'Kawasaki Ninja 250',
    service: 'Racing Livery'
  },
  {
    id: 3,
    name: 'Budi Santoso',
    role: 'Kolektor Motor Klasik',
    image: 'https://i.pravatar.cc/150?img=3',
    quote: 'Sebagai kolektor motor vintage, saya membutuhkan kesempurnaan dalam restorasi. Garasi Armstrong memahami nilai sejarah motor saya dan merestorasi warna originalnya dengan sentuhan modern yang luar biasa.',
    rating: 5,
    bike: 'Honda CB100 1975',
    service: 'Restorasi Vintage'
  },
  {
    id: 4,
    name: 'Rini Pratiwi',
    role: 'Pengguna Harian',
    image: 'https://i.pravatar.cc/150?img=8',
    quote: 'Setelah kecelakaan merusak motor saya, Garasi Armstrong memperbaikinya hingga terlihat seperti baru. Proses pengerjaan cepat dan hasilnya sangat memuaskan, bahkan lebih bagus dari aslinya!',
    rating: 4,
    bike: 'Honda Vario 150',
    service: 'Perbaikan & Repaint'
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  // Untuk mencegah memory leak
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    
    // Pastikan elemen ada sebelum memanipulasi dengan GSAP
    if (!section || !headingRef.current || !testimonialsRef.current) return;
    
    // Setup GSAP animations
    const headingAnim = gsap.fromTo(
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
    
    const testimonialAnim = gsap.fromTo(
      testimonialsRef.current,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        }
      }
    );
    
    // Auto-rotate testimonials only if autoplay is enabled
    if (isAutoplay) {
      // Hapus interval sebelumnya jika ada
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
      
      // Set interval baru
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
    }
    
    // Cleanup function
    return () => {
      // Bersihkan ScrollTrigger
      if (headingAnim && headingAnim.scrollTrigger) {
        headingAnim.scrollTrigger.kill();
      }
      if (testimonialAnim && testimonialAnim.scrollTrigger) {
        testimonialAnim.scrollTrigger.kill();
      }
      
      // Bersihkan interval
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [isAutoplay]);

  const nextTestimonial = () => {
    setIsAutoplay(false);
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoplay(false);
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i}
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Memastikan situs akan tetap berfungsi bahkan jika komponen Testimonials bermasalah
  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#FF4433]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-[#FF4433]/5 rounded-full blur-3xl"></div>
      
      <div className="absolute -top-40 -left-40 w-80 h-80 border border-[#FF4433]/10 rounded-full"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 border border-[#FF4433]/10 rounded-full"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block bg-[#FF4433]/20 text-[#FF4433] text-sm font-semibold px-3 py-1 rounded-full mb-4">Kisah Pelanggan</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kata Mereka Tentang <span className="text-[#FF4433]">Karya Kami</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FF4433] to-transparent mx-auto mb-6"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Bukan sekedar janji, tapi bukti nyata kepuasan pelanggan kami yang telah merasakan keunggulan layanan Garasi Armstrong.
          </p>
        </div>
        
        <div 
          ref={testimonialsRef}
          className="max-w-5xl mx-auto relative pb-14"
        >
          {/* Large quotes icon */}
          <div className="absolute -top-10 left-10 text-[#FF4433]/10 z-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          
          {/* Main testimonial carousel */}
          <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm p-6 sm:p-10 rounded-2xl border border-gray-700 shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="sm:flex items-start">
                  {/* Person image and details */}
                  <div className="mb-6 sm:mb-0 sm:mr-8 flex flex-col items-center sm:w-48">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#FF4433]/30 p-1">
                        <img 
                          src={testimonials[activeIndex].image} 
                          alt={testimonials[activeIndex].name}
                          className="rounded-full w-full h-full object-cover"
                          onError={(e) => {
                            // Gunakan placeholder image yang valid jika gambar tidak dapat dimuat
                            e.currentTarget.src = 'https://via.placeholder.com/150?text=User';
                            // Hapus onerror handler setelah dijalankan sekali untuk mencegah loop
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-[#FF4433] text-white rounded-full p-1 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-center mt-4">{testimonials[activeIndex].name}</h3>
                    <p className="text-gray-400 text-sm text-center">{testimonials[activeIndex].role}</p>
                    
                    <div className="flex mt-2 justify-center">
                      {renderStars(testimonials[activeIndex].rating)}
                    </div>
                  </div>
                  
                  {/* Testimonial content */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <p className="text-gray-300 text-lg italic leading-relaxed">"{testimonials[activeIndex].quote}"</p>
                    </div>
                    
                    {/* Bike details */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex flex-wrap items-center justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF4433] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-white text-sm font-medium">{testimonials[activeIndex].bike}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF4433] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="text-white text-sm font-medium">{testimonials[activeIndex].service}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation arrows */}
            <div className="flex justify-between mt-8">
              <button 
                onClick={prevTestimonial}
                className="bg-gray-800 hover:bg-[#FF4433] text-white p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF4433]/50"
                aria-label="Previous testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setIsAutoplay(false);
                      setActiveIndex(index);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index ? 'w-8 bg-[#FF4433]' : 'w-2.5 bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextTestimonial}
                className="bg-gray-800 hover:bg-[#FF4433] text-white p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF4433]/50"
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Autoplay toggle */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <button 
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`flex items-center text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                isAutoplay ? 'bg-[#FF4433]/20 text-[#FF4433]' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {isAutoplay ? (
                <>
                  <span className="h-2 w-2 bg-[#FF4433] rounded-full mr-2 animate-pulse"></span>
                  Auto-Play Aktif
                </>
              ) : (
                <>
                  <span className="h-2 w-2 bg-gray-500 rounded-full mr-2"></span>
                  Auto-Play Nonaktif
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-20 text-center max-w-4xl mx-auto">
          <div className="bg-[#FF4433]/10 rounded-2xl border border-[#FF4433]/20 p-8 backdrop-blur-sm">
            <h3 className="text-white text-2xl font-bold mb-4">Bergabunglah dengan Ribuan Pelanggan Puas Kami</h3>
            <p className="text-gray-300 mb-6">
              Kami telah melayani lebih dari 2,000+ pelanggan dengan berbagai kebutuhan pengecatan motor. Jadilah yang berikutnya mendapatkan pengalaman premium!
            </p>
            <a 
              href="#contact" 
              className="inline-flex items-center px-6 py-3 bg-[#FF4433] text-white font-medium rounded-lg hover:bg-[#FF4433]/90 transition-colors"
            >
              Konsultasikan Kebutuhan Anda
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}