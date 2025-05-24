import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-scroll';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Gunakan usePage dari Inertia untuk mendapatkan URL saat ini
  const { url } = usePage();
  const isHomePage = url === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Layanan', path: '/#services' },
    { name: 'Galeri', path: '/#gallery' },
    { name: 'Proses', path: '/#process' },
    { name: 'Testimoni', path: '/#testimonials' },
    { name: 'Kontak', path: '/#contact' },
    { name: 'Daftar Harga', path: '/daftar-harga' }
  ];

  const renderMenuLink = (item: any, isMobile = false) => {
    const className = isMobile 
      ? "text-white text-sm font-medium hover:text-[#FF4433] cursor-pointer transition-colors py-2 border-b border-gray-800"
      : "text-white text-sm font-medium hover:text-[#FF4433] cursor-pointer transition-colors";

    // Jika link adalah halaman terpisah atau kita tidak berada di home page
    // gunakan Inertia Link sebagai pengganti RouterLink
    if (item.path === '/daftar-harga' || !isHomePage) {
      return (
        <a 
          key={item.name}
          href={item.path}
          className={className}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          {item.name}
        </a>
      );
    } else {
      // Gunakan react-scroll Link untuk navigasi pada halaman yang sama
      return (
        <Link
          key={item.name}
          to={item.path.replace('/#', '')}
          spy={true}
          smooth={true}
          offset={-80}
          duration={500}
          className={className}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          {item.name}
        </Link>
      );
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="bg-gradient-to-r from-[#FF4433] to-orange-500 bg-clip-text font-bold text-transparent text-3xl">GARASI AMSTRONG</span>
          {/* <span className="ml-2 text-white font-black text-3xl">ARMSTRONG</span> */}
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item, index) => (
            <span key={index}>
              {renderMenuLink(item)}
            </span>
          ))}
          <a
            href="/cek-progress" 
            className="ml-4 bg-[#FF4433] text-white px-5 py-2 rounded-md font-medium hover:bg-[#D63626] transition-colors"
          >
            Cek Progres
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 absolute w-full py-4">
          <div className="container mx-auto px-6 flex flex-col gap-4">
            {menuItems.map((item, index) => (
              <span key={index}>
                {renderMenuLink(item, true)}
              </span>
            ))}
            <a 
              href="/cek-progress" 
              className="bg-[#FF4433] text-white text-center py-3 rounded-md font-medium hover:bg-[#D63626] transition-colors mt-2"
            >
              Cek Progres
            </a>
          </div>
        </div>
      )}
    </header>
  );
}