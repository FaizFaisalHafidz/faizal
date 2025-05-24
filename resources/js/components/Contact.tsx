// components/Contact.tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const mapRef = useRef(null);
  const [formStatus, setFormStatus] = useState('idle');
  
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
    
    gsap.fromTo(
      formRef.current,
      { x: -50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8,
        delay: 0.2,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        }
      }
    );
    
    gsap.fromTo(
      infoRef.current,
      { x: 50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8,
        delay: 0.4,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        }
      }
    );
    
    gsap.fromTo(
      mapRef.current,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        delay: 0.6,
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 90%",
        }
      }
    );
    
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setFormStatus('loading');
    
    // Simulasi pengiriman form
    setTimeout(() => {
      setFormStatus('success');
      
      // Reset form setelah beberapa detik
      setTimeout(() => {
        setFormStatus('idle');
        e.target.reset();
      }, 3000);
    }, 1500);
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-black to-gray-900 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-64 -right-64 w-96 h-96 rounded-full bg-[#FF4433]/5 blur-3xl"></div>
      <div className="absolute -bottom-64 -left-64 w-96 h-96 rounded-full bg-[#FF4433]/5 blur-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-[#FF4433]/20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 rounded-full bg-[#FF4433]/20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div ref={headingRef} className="text-center mb-16">
          <span className="inline-block bg-[#FF4433]/10 text-[#FF4433] text-sm font-semibold px-4 py-1 rounded-full mb-4">
            Hubungi Kami
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Konsultasikan <span className="text-[#FF4433]">Kebutuhan</span> Anda
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FF4433] to-transparent mx-auto my-6"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Siap mengubah tampilan motor Anda? Hubungi kami untuk konsultasi atau membuat janji pengecatan kustom.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div 
            ref={formRef} 
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 shadow-xl relative overflow-hidden"
          >
            {/* Subtle glow effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4433]/50 to-transparent"></div>
            
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Kirim Pesan kepada Kami
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2 text-sm">Nama Anda</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      id="name" 
                      required
                      className="w-full bg-gray-700/70 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4433] placeholder-gray-500 transition-all duration-300"
                      placeholder="Masukkan nama lengkap"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2 text-sm">Alamat Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      id="email" 
                      required
                      className="w-full bg-gray-700/70 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4433] placeholder-gray-500 transition-all duration-300"
                      placeholder="email@domain.com"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-300 mb-2 text-sm">Nomor Telepon</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full bg-gray-700/70 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4433] placeholder-gray-500 transition-all duration-300"
                    placeholder="Contoh: 081234567890"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="service" className="block text-gray-300 mb-2 text-sm">Jenis Layanan</label>
                <div className="relative">
                  <select 
                    id="service" 
                    className="w-full bg-gray-700/70 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4433] appearance-none transition-all duration-300"
                  >
                    <option value="" disabled selected className="text-gray-500">Pilih layanan yang Anda butuhkan</option>
                    <option value="custom-paint">Cat Kustom Premium</option>
                    <option value="restoration">Restorasi Vintage</option>
                    <option value="airbrush">Airbrush Artistik</option>
                    <option value="protection">Lapisan Pelindung</option>
                    <option value="repair">Perbaikan & Touch-up</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-300 mb-2 text-sm">Pesan Anda</label>
                <div className="relative">
                  <textarea 
                    id="message" 
                    rows={5}
                    required
                    className="w-full bg-gray-700/70 text-white px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4433] placeholder-gray-500 resize-none transition-all duration-300"
                    placeholder="Ceritakan tentang proyek pengecatan motor Anda..."
                  ></textarea>
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={formStatus === 'loading' || formStatus === 'success'}
                className={`w-full relative py-4 rounded-lg font-medium text-white transition-all duration-300 overflow-hidden group
                  ${formStatus === 'idle' ? 'bg-[#FF4433] hover:bg-[#D63626]' : 
                    formStatus === 'loading' ? 'bg-[#FF4433]/70 cursor-wait' :
                      'bg-green-500'
                  }`}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {formStatus === 'idle' && (
                    <>
                      Kirim Pesan
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                  
                  {formStatus === 'loading' && (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  )}
                  
                  {formStatus === 'success' && (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Pesan Terkirim
                    </>
                  )}
                </span>
                
                {/* Button Background Animation */}
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#FF4433] via-[#FF5F50] to-[#FF4433] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-shimmer"></span>
              </button>
              
              <p className="text-gray-400 text-xs text-center mt-4">
                Kami akan segera menghubungi Anda dalam 1x24 jam setelah pesan diterima.
              </p>
            </form>
          </div>
          
          <div ref={infoRef} className="lg:pl-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 shadow-xl h-full">
              {/* Subtle glow effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4433]/50 to-transparent"></div>
              
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Kontak
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-[#FF4433]/10 p-3 rounded-lg text-[#FF4433] mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Lokasi Bengkel</h4>
                    <p className="text-gray-400 mt-1">
                      Jl. Merdeka No. 123, Bandung<br />
                      Jawa Barat, Indonesia, 40115
                    </p>
                    <a href="https://goo.gl/maps/1234" className="text-[#FF4433] text-sm flex items-center mt-2 hover:underline">
                      <span>Lihat di Google Maps</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#FF4433]/10 p-3 rounded-lg text-[#FF4433] mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Telepon Kami</h4>
                    <p className="text-gray-400 mt-1">
                      <a href="tel:+6281234567890" className="hover:text-[#FF4433] transition-colors">+62 812 3456 7890</a><br />
                      <a href="tel:+6285712345678" className="hover:text-[#FF4433] transition-colors">+62 857 1234 5678</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#FF4433]/10 p-3 rounded-lg text-[#FF4433] mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email Kami</h4>
                    <p className="text-gray-400 mt-1">
                      <a href="mailto:info@garasiarmstrong.com" className="hover:text-[#FF4433] transition-colors">info@garasiarmstrong.com</a><br />
                      <a href="mailto:booking@garasiarmstrong.com" className="hover:text-[#FF4433] transition-colors">booking@garasiarmstrong.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#FF4433]/10 p-3 rounded-lg text-[#FF4433] mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Jam Operasional</h4>
                    <ul className="text-gray-400 mt-1 space-y-1">
                      <li className="flex items-center justify-between">
                        <span>Senin - Jumat:</span>
                        <span className="ml-8 font-medium text-white">08:00 - 18:00</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Sabtu:</span>
                        <span className="ml-8 font-medium text-white">09:00 - 16:00</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Minggu:</span>
                        <span className="ml-8 text-[#FF4433]">Tutup</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 border-t border-gray-700 pt-6">
                <h4 className="text-white font-medium mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a2.5 2.5 0 015 0v6a2.5 2.5 0 11-5 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 8h2a2 2 0 012 2v4a2 2 0 01-2 2h-2v-4h2a2 2 0 100-4h-2v-4z" />
                  </svg>
                  Ikuti Kami
                </h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-700 hover:bg-[#FF4433]/80 text-white p-2.5 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-700 hover:bg-[#FF4433]/80 text-white p-2.5 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-700 hover:bg-[#FF4433]/80 text-white p-2.5 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a href="#" className="bg-gray-700 hover:bg-[#FF4433]/80 text-white p-2.5 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20" ref={mapRef}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
            <div className="relative h-80">
              <h3 className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lokasi Garasi Armstrong
              </h3>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347863129!2d107.57311687143536!3d-6.903444341687889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e815b2!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1676154723800!5m2!1sen!2sid" 
                className="w-full h-full rounded-xl"
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          
          {/* Additional info card */}
          <div className="mt-8 bg-[#FF4433]/10 backdrop-blur-sm rounded-xl border border-[#FF4433]/20 p-6 text-center">
            <h4 className="text-white text-lg font-medium mb-2">Butuh Konsultasi Segera?</h4>
            <p className="text-gray-300 mb-4">
              Hubungi tim kami melalui WhatsApp untuk konsultasi cepat dan pemesanan jadwal pengecatan.
            </p>
            <a 
              href="https://wa.me/6281234567890?text=Halo%20Garasi%20Armstrong,%20saya%20ingin%20konsultasi%20tentang%20pengecatan%20motor"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20BD5C] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg viewBox="0 0 32 32" className="h-5 w-5 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-.143-.176-.287-.103-.144-.694-1.76-.933-2.419-.143-.435-.287-.935-.587-.935-.101 0-.23.025-.345.07-.544.229-.772.819-.772 1.605 0 .505.086 1.33.401 2.138.446 1.18 1.333 2.652 2.093 3.528.4.435 2.051 3.049 4.92 3.049.433 0 .865-.058 1.209-.17.692-.231.935-.848 1.021-1.11.101-.242.101-.434.287-.434.086 0 .201.043.287.101.602.368 1.061.632 1.619.775.162.045.45.115.718.143.16 0 .287 0 .387-.029 0-.085.029-.232.029-.36.001-.929-.934-.842-.934-1.762 0-.216.215-.517.43-.736.215-.22.4-.388.458-.458 0-.086-.086-.689-.372-1.319C20.915 15.87 20.714 17.205 19.11 17.205zM16.211 1.92c-7.933 0-14.4 6.469-14.4 14.4 0 3.299 1.145 6.39 3.033 8.849l-1.993 5.929 6.104-1.935c2.323 1.517 5.065 2.407 8.026 2.407 7.93 0 14.4-6.467 14.4-14.4 0-7.932-6.4-14.4-14.4-14.4z M16.211 3.75c6.932 0 12.571 5.638 12.571 12.57 0 6.93-5.639 12.57-12.57 12.57a12.57 12.57 0 0 1-6.296-1.693l-.964-.636-1.079.343-2.484.786.808-2.408.337-1.005-.626-.943a12.57 12.57 0 0 1-1.694-6.297c0-6.93 5.639-12.57 12.57-12.57z">
                </path>
              </svg>
              Chat via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}