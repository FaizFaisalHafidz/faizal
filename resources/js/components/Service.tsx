// components/Services.tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: 'spray-can',
    title: 'Cat Kustom Premium',
    description: 'Wujudkan imajinasi Anda dengan pilihan cat eksklusif dan teknik pengecatan presisi tinggi. Tampilan motor yang membuat semua mata tertuju pada Anda.'
  },
  {
    icon: 'palette',
    title: 'Color Matching Sempurna',
    description: 'Teknologi color matching canggih untuk memastikan warna sesuai dengan keinginan Anda, baik untuk perbaikan parsial maupun total repaint dengan hasil yang memukau.'
  },
  {
    icon: 'paint-brush',
    title: 'Airbrush Artistik',
    description: 'Sentuhan artistik dari seniman airbrush terbaik kami. Gambar, grafis, dan efek visual menakjubkan yang menjadikan motor Anda karya seni jalanan.'
  },
  {
    icon: 'magic',
    title: 'Restorasi Vintage',
    description: 'Mengembalikan kejayaan motor klasik Anda dengan teknik restorasi cat yang menghormati keaslian namun dengan kualitas modern yang tahan lama.'
  },
  {
    icon: 'shield-alt',
    title: 'Lapisan Pelindung Canggih',
    description: 'Perlindungan ekstra dengan teknologi nano-coating yang membuat cat motor tetap mengkilap dan terlindungi dari sinar UV, goresan, dan noda.'
  },
  {
    icon: 'wrench',
    title: 'Perbaikan & Touch-up',
    description: 'Solusi cepat dan presisi untuk perbaikan goresan dan kerusakan cat minor dengan hasil yang tidak meninggalkan bekas pada tampilan motor Anda.'
  }
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
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
    
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1,
          duration: 0.6,
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
          }
        }
      );
    }
    
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'spray-can':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'palette':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'paint-brush':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'magic':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'shield-alt':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'wrench':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="py-20 bg-gray-900"
    >
      <div className="container mx-auto px-6">
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Layanan <span className="text-[#FF4433]">Premium</span> Kami
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Di Garasi Armstrong, kami tidak sekadar mengecat motor, tapi menciptakan transformasi visual yang memukau dan tahan lama.
          </p>
        </div>
        
        <div 
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-gray-800 group p-8 rounded-lg transition-all duration-300 hover:translate-y-[-8px] hover:shadow-xl hover:shadow-[#FF4433]/10 border border-transparent hover:border-[#FF4433]/20"
            >
              <div className="text-[#FF4433] mb-5 transform transition-transform group-hover:scale-110">
                {renderIcon(service.icon)}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF4433] transition-colors">{service.title}</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{service.description}</p>
              <div className="mt-5 h-0.5 w-0 bg-gradient-to-r from-[#FF4433] to-transparent group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-6">
            Kami selalu menggunakan material berkualitas tertinggi dan teknologi terkini untuk hasil yang sempurna
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center px-8 py-4 bg-[#FF4433] text-white font-medium rounded-lg transition-all hover:bg-[#FF4433]/90 hover:shadow-lg hover:shadow-[#FF4433]/20"
          >
            Konsultasikan Kebutuhan Anda
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}