import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { ChromePicker } from 'react-color';
import { HondaCBModel } from './HondaCBModel';

// Tipe warna
type ColorOption = {
  hex: string;
  metalness: number;
};

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption>({ 
    hex: '#ff2d2d', // Merah default
    metalness: 0.8 
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Animasi teks intro
  useEffect(() => {
    const tl = gsap.timeline();

    if (textRef.current) {
      tl.fromTo(
        textRef.current.querySelectorAll('div'), 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 }
      );
    }

    if (buttonRef.current) {
      tl.fromTo(
        buttonRef.current, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5 }
      );
    }
  }, []);

  const handleColorChange = (color: any) => {
    setSelectedColor({ 
      hex: color.hex,
      metalness: 0.8
    });
  };

  return (
    <section id="home" className="relative h-screen overflow-hidden bg-gradient-to-b from-black to-gray-900">
      <div className="absolute inset-0 z-10">
        <div className="relative container mx-auto flex h-full flex-col items-center px-4 pt-16 sm:px-6 lg:flex-row lg:items-center lg:justify-center">
          {/* Left side - Text content */}
          <div ref={textRef} className="z-20 mb-6 w-full text-center lg:mb-0 lg:w-1/2 lg:text-left">
            <div>
              <span className="font-semibold tracking-wider text-[#FF4433] uppercase text-xs sm:text-sm">Premium Motorcycle Repainting</span>
            </div>
            <div>
              <h1 className="mt-2 text-3xl leading-tight font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Transforming
                <span className="text-[#FF4433]"> Rides</span>
                <br className="hidden xs:block sm:hidden" />
                <span className="hidden xs:inline sm:hidden"> </span>
                dengan
                <span className="text-[#FF4433]"> Passion</span>
              </h1>
            </div>
            <div>
              <p className="mt-3 sm:mt-4 mx-auto text-sm sm:text-base lg:text-lg text-gray-300 max-w-xs sm:max-w-md lg:mx-0">
                Bengkel Garasi Armstrong menyediakan layanan repaint motor premium. 
                Kustomisasi kendaraan Anda dengan pilihan warna eksklusif kami.
              </p>
            </div>

            {/* Improved buttons styling for both mobile and desktop */}
            <div ref={buttonRef} className="mt-6 sm:mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <a
                href="#services"
                className="group rounded-md bg-[#FF4433] px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-center text-sm sm:text-sm md:text-base font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-[#D63626] hover:translate-y-[-2px] active:translate-y-[1px] relative overflow-hidden"
              >
                <span className="relative z-10">Lihat Layanan Kami</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF4433] to-[#F53B2A] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>
              
              <a
                href="#contact"
                className="group rounded-md border-2 border-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-center text-sm sm:text-sm md:text-base font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#FF4433]/60 hover:bg-white/10 hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                <span className="relative z-10">Hubungi Kami</span>
              </a>
            </div>
          </div>

          {/* Right side - 3D model */}
          <div className="relative z-20 h-[300px] xs:h-[350px] sm:h-[400px] w-full lg:h-[500px] lg:w-1/2">
            {/* Color picker di pojok kanan bawah */}
            <div className="absolute right-2 bottom-2 z-30 flex items-center sm:right-4 sm:bottom-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-full py-1 px-2 border border-white/20 shadow-lg">
                <div 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-gray-800" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Color Picker Popup - adjusted for right bottom position */}
              {showColorPicker && (
                <div className="absolute bottom-10 right-0 z-40">
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="relative z-40">
                    <ChromePicker
                      color={selectedColor.hex}
                      onChange={handleColorChange}
                      disableAlpha={true}
                      styles={{
                        default: {
                          picker: {
                            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                            borderRadius: '8px',
                            // Mobile optimization for picker
                            width: window.innerWidth < 480 ? '280px' : '225px'
                          }
                        }
                      }}
                    />
                    <div className="absolute -bottom-4 right-0 left-0 flex justify-center">
                      <button 
                        onClick={() => setShowColorPicker(false)}
                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-xs font-medium py-1 px-4 rounded-full border border-white/20"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="h-full w-full overflow-hidden rounded-lg bg-transparent"
              onMouseEnter={() => setAutoRotate(false)}
              onMouseLeave={() => setAutoRotate(true)}
            >
              <Canvas shadows dpr={[1, 1.5]}>
                <PerspectiveCamera makeDefault position={[8, 2, 0]} fov={40} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />

                <HondaCBModel
                  position={[0, -0.6, 0]}
                  scale={1}
                  color={selectedColor.hex}
                  metalness={selectedColor.metalness}
                  autoRotate={autoRotate}
                />

                <ContactShadows
                  rotation-x={Math.PI / 2}
                  position={[0, -1.2, 0]}
                  opacity={0.6}
                  width={10}
                  height={10}
                  blur={2}
                  far={1.4}
                />

                <OrbitControls
                  enablePan={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 2}
                  enableZoom={true}
                  minDistance={3}
                  maxDistance={10}
                  target={[0, 0, 0]}
                />

                <Environment preset="city" />
              </Canvas>
            </div>
            <p className="mt-1 text-center text-xs sm:text-sm text-gray-400">Geser untuk memutar model</p>
          </div>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div className="absolute right-0 bottom-6 left-0 z-10 flex animate-bounce justify-center">
        <a href="#services" className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 sm:h-8 sm:w-8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}