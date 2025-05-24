// components/Process.tsx
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const processSteps = [
  {
    number: '01',
    title: 'Konsultasi & Desain',
    description: 'Diskusi mendalam tentang keinginan dan kebutuhan Anda. Tim desainer kami menciptakan konsep visual untuk persetujuan Anda.',
    icon: 'chat'
  },
  {
    number: '02',
    title: 'Persiapan Permukaan',
    description: 'Pembongkaran komponen dengan hati-hati, pengamplasan cat lama, dan aplikasi primer untuk dasar yang sempurna.',
    icon: 'tools'
  },
  {
    number: '03',
    title: 'Lapisan Dasar',
    description: 'Pengaplikasian beberapa lapisan cat dasar berkualitas tinggi untuk menciptakan permukaan yang halus dan rata.',
    icon: 'layer'
  },
  {
    number: '04',
    title: 'Pengecatan Kustom',
    description: 'Pelukis ahli kami mewujudkan desain Anda dengan teknik presisi dan keterampilan artistik yang memukau.',
    icon: 'paint'
  },
  {
    number: '05',
    title: 'Clear Coat & Finishing',
    description: 'Beberapa lapisan clear coat diaplikasikan untuk melindungi cat dan menambah kedalaman serta kilau yang maksimal.',
    icon: 'shield'
  },
  {
    number: '06',
    title: 'Quality Control & Pengiriman',
    description: 'Inspeksi menyeluruh pada hasil akhir, perakitan kembali motor Anda, dan pengiriman dalam kondisi sempurna.',
    icon: 'check'
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    const steps = stepsRef.current?.children ? Array.from(stepsRef.current.children) : [];
    
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
    
    // Animate each step with stagger and scale effect
    gsap.fromTo(
      steps,
      { y: 50, opacity: 0, scale: 0.9 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        }
      }
    );
    
    // Animate the connecting path if it exists
    if (svgPathRef.current) {
      gsap.fromTo(
        svgPathRef.current,
        { drawSVG: "0%" },
        { 
          drawSVG: "100%", 
          duration: 1.5,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 40%",
          }
        }
      );
    }
    
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'chat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'tools':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'layer':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'paint':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      case 'check':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section 
      id="process" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#FF4433]/10 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#FF4433]/5 to-transparent rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div ref={headingRef} className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-[#FF4433] uppercase">Bagaimana Kami Bekerja</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Proses <span className="text-[#FF4433]">Pengecatan</span> Kami
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FF4433] to-transparent mx-auto my-6"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Kami mengikuti proses yang teliti dan terstandar untuk memastikan motor Anda mendapatkan hasil finishing sempurna yang layak didapatkan.
          </p>
        </div>
        
        {/* Timeline style process */}
        <div className="relative mb-20">
          <div className="hidden md:block absolute inset-0 z-0">
            <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
              <path 
                ref={svgPathRef}
                d="M0,150 C300,50 600,250 900,150 C1050,100 1150,200 1200,150" 
                className="stroke-[#FF4433]/30" 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                fill="none" 
              />
            </svg>
          </div>
          
          <div 
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {processSteps.map((step, index) => (
              <div 
                key={index} 
                className={`relative bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-[#FF4433]/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-lg hover:shadow-[#FF4433]/10 ${
                  index === activeStep ? 'ring-2 ring-[#FF4433] border-transparent' : ''
                }`}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Step number badge */}
                <div className="absolute top-0 right-0 -mt-4 -mr-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FF4433] to-[#FF5F50] shadow-lg transform group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                </div>
                
                {/* Icon with animated background */}
                <div className="inline-flex items-center justify-center p-3 bg-[#FF4433]/10 rounded-xl mb-5 border border-[#FF4433]/20 text-[#FF4433] relative overflow-hidden group-hover:bg-[#FF4433]/20 transition-all duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute -inset-[100%] bg-[#FF4433]/10 animate-[spin_9s_linear_infinite]">
                      <div className="w-full h-full opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent blur-md"></div>
                    </div>
                  </div>
                  {renderIcon(step.icon)}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF4433] transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {step.description}
                </p>
                
                {/* Animated underline */}
                <div className="mt-4 h-0.5 w-12 bg-[#FF4433]/30 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Additional assurance section */}
        <div className="mt-12 bg-[#FF4433]/5 backdrop-blur-sm border border-[#FF4433]/10 rounded-2xl p-8 md:p-10">
          <div className="md:flex items-center">
            <div className="mb-6 md:mb-0 md:w-2/3 md:pr-10">
              <h3 className="text-2xl font-bold text-white mb-4">Garansi Kepuasan Pelanggan</h3>
              <p className="text-gray-300 mb-4">
                Kami memberikan garansi kualitas pengecatan selama 1 tahun penuh. Jika ada masalah dengan hasil pengerjaan kami, kami akan memperbaikinya tanpa biaya tambahan.
              </p>
              <ul className="space-y-2">
                {['Pengerjaan oleh teknisi bersertifikat', 'Material cat premium berkualitas tinggi', 'Penggunaan teknologi terbaru', 'Hasil yang tahan lama'].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF4433]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-[#FF4433]/20 p-5 rounded-full">
                <div className="bg-[#FF4433]/30 p-5 rounded-full">
                  <div className="bg-[#FF4433] p-4 rounded-full text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a 
              href="#contact" 
              className="inline-flex items-center bg-[#FF4433] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#FF4433]/90 transition-colors"
            >
              Konsultasikan Kebutuhan Anda
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}