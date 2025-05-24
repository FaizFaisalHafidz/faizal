import { usePage } from '@inertiajs/react';
import { Link } from 'react-scroll';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { url } = usePage();
  const isHomePage = url === '/';
  
  const renderScrollOrLink = (to: string, label: string) => {
    if (!isHomePage) {
      return (
        <a 
          href={`/#${to}`} 
          className="text-gray-400 hover:text-[#FF4433] cursor-pointer transition-colors flex items-center group"
        >
          <span className="h-1 w-0 bg-[#FF4433] group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
          {label}
        </a>
      );
    }
    
    return (
      <Link
        to={to}
        spy={true}
        smooth={true}
        offset={-80}
        duration={500}
        className="text-gray-400 hover:text-[#FF4433] cursor-pointer transition-colors flex items-center group"
      >
        <span className="h-1 w-0 bg-[#FF4433] group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
        {label}
      </Link>
    );
  };
  
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white pt-20 pb-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4433]/30 to-transparent"></div>
      <div className="absolute -top-64 -right-64 w-96 h-96 rounded-full bg-[#FF4433]/5 blur-3xl"></div>
      <div className="absolute -bottom-64 -left-64 w-96 h-96 rounded-full bg-[#FF4433]/5 blur-3xl"></div>
      
      {/* Motorcycle silhouette as decorative element */}
     
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Logo & About */}
          <div>
            <div className="flex items-center mb-6">
              <div className="relative">
                <span className="text-[#FF4433] font-extrabold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-[#FF4433] to-[#FF6347]">GARASI</span>
                <span className="ml-2 text-white font-black text-3xl">ARMSTRONG</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#FF4433] to-transparent"></div>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Bengkel cat motor premium dengan standar kualitas internasional. 
              Kami mengutamakan kepuasan pelanggan dan hasil pengecatan yang tahan lama.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="#" className="bg-gray-800 hover:bg-[#FF4433] text-gray-300 hover:text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#FF4433] text-gray-300 hover:text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#FF4433] text-gray-300 hover:text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-[#FF4433] text-gray-300 hover:text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
              <a href="https://wa.me/6281234567890?text=Halo%20Garasi%20Armstrong,%20saya%20ingin%20konsultasi" className="bg-[#25D366] hover:bg-[#20BD5C] text-white p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Menu Links */}
          <div className="md:ml-8">
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Menu Navigasi
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#FF4433]"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { to: 'home', label: 'Beranda' },
                { to: 'services', label: 'Layanan' },
                { to: 'gallery', label: 'Galeri' },
                { to: 'process', label: 'Proses' },
                { to: 'testimonials', label: 'Testimoni' },
                { to: 'contact', label: 'Kontak' }
              ].map((item) => (
                <li key={item.to}>
                  {renderScrollOrLink(item.to, item.label)}
                </li>
              ))}
              <li>
                <a 
                  href="/daftar-harga" 
                  className="text-gray-400 hover:text-[#FF4433] cursor-pointer transition-colors flex items-center group"
                >
                  <span className="h-1 w-0 bg-[#FF4433] group-hover:w-3 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                  Daftar Harga
                </a>
              </li>
            </ul>
          </div>
          
          {/* Informasi Kontak */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Informasi Kontak
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#FF4433]"></div>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="text-[#FF4433] mr-3 mt-1 group-hover:bg-[#FF4433]/20 p-1 rounded-full transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  Jl. Merdeka No. 123, Bandung, Jawa Barat
                </span>
              </li>
              <li className="flex items-start group">
                <div className="text-[#FF4433] mr-3 mt-1 group-hover:bg-[#FF4433]/20 p-1 rounded-full transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <a href="tel:+6281234567890" className="text-gray-400 group-hover:text-gray-300 hover:text-[#FF4433] transition-colors">
                  +62 812 3456 7890
                </a>
              </li>
              <li className="flex items-start group">
                <div className="text-[#FF4433] mr-3 mt-1 group-hover:bg-[#FF4433]/20 p-1 rounded-full transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:info@garasiarmstrong.com" className="text-gray-400 group-hover:text-gray-300 hover:text-[#FF4433] transition-colors">
                  info@garasiarmstrong.com
                </a>
              </li>
            </ul>
            
            <div className="mt-8">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cek Status Pesanan
                </h4>
                <p className="text-gray-400 text-xs mb-3">
                  Masukkan nomor pesanan Anda untuk melacak progres pengecatan motor
                </p>
                <form className="flex">
                  <input 
                    type="text" 
                    placeholder="No. Pesanan"
                    className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#FF4433]"
                  />
                  <button 
                    type="submit"
                    className="bg-[#FF4433] text-white px-3 py-2 rounded-r-md hover:bg-[#D63626] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Jam Operasional */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Jam Operasional
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#FF4433]"></div>
            </h3>
            <ul className="space-y-2.5">
              <li className="flex justify-between items-center">
                <span className="text-gray-400">Senin - Jumat:</span>
                <span className="text-white text-sm bg-gray-800 px-3 py-1 rounded-md">08:00 - 18:00</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-400">Sabtu:</span>
                <span className="text-white text-sm bg-gray-800 px-3 py-1 rounded-md">09:00 - 16:00</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-400">Minggu:</span>
                <span className="text-white text-sm bg-[#FF4433]/20 text-[#FF4433] px-3 py-1 rounded-md">Tutup</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <div className="bg-[#FF4433]/10 backdrop-blur-sm border border-[#FF4433]/20 p-4 rounded-lg relative overflow-hidden">
                
                <h4 className="text-white text-sm font-medium mb-2">Layanan Premium</h4>
                <p className="text-gray-300 text-xs mb-4">
                  Dapatkan layanan prioritas dengan jadwal fleksibel untuk kebutuhan custom Anda
                </p>
                <a 
                  href="tel:+6281234567890" 
                  className="bg-[#FF4433] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#D63626] transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider dengan gradient */}
        <div className="relative h-px w-full bg-gray-800 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4433]/30 to-transparent"></div>
        </div>
        
        {/* Awards and badges */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2 inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 block">Garansi</span>
              <span className="text-white text-sm font-medium">1 Tahun Garansi</span>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2 inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 block">Sertifikasi</span>
              <span className="text-white text-sm font-medium">Teknisi Berpengalaman</span>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2 inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 block">Keunggulan</span>
              <span className="text-white text-sm font-medium">Material Premium</span>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-800 p-3 rounded-lg mb-2 inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#FF4433]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400 block">Support</span>
              <span className="text-white text-sm font-medium">Layanan Purna Jual</span>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Garasi Armstrong. Hak Cipta Dilindungi | Dibuat dengan ❤️ untuk para penggemar motor
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400 transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}