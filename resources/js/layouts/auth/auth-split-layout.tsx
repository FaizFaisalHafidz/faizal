import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { type PropsWithChildren, useEffect } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    useEffect(() => {
        // Animasi untuk left panel
        gsap.fromTo(
            '.auth-logo',
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );

        gsap.fromTo(
            '.auth-quote',
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' }
        );
        
        // Animasi untuk mobile logo
        gsap.fromTo(
            '.mobile-logo',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
        
        // Animasi judul dan deskripsi
        gsap.fromTo(
            '.auth-title',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
        );
        
        gsap.fromTo(
            '.auth-description',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );
    }, []);

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                {/* Background dengan overlay gradien */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#2a2a2a]">
                    {/* Gambar background */}
                    <div 
                        className="absolute inset-0 opacity-40 bg-blend-multiply bg-center bg-cover" 
                        style={{
                            backgroundImage: 'url(/images/auth-bg-motorcycle.jpg)'
                        }}
                    ></div>
                    
                    {/* Overlay gradien */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-90"></div>
                </div>
                
                {/* Logo */}
                <Link href={route('home')} className="auth-logo relative z-20 flex items-center text-lg font-medium">
                    <div className="flex items-center bg-[#FF4433] p-2 rounded-lg mr-3">
                        <AppLogoIcon className="size-7 fill-current text-white" />
                    </div>
                    <div>
                        <span className="text-[#FF4433] font-bold text-2xl">GARASI</span>
                        <span className="ml-1 text-white font-black text-2xl">ARMSTRONG</span>
                    </div>
                </Link>
                
                {/* Highlight text */}
                <div className="relative z-20 mt-24">
                    <h2 className="text-3xl font-bold mb-4">Premium Motorcycle<br /> Repainting Services</h2>
                    <p className="text-gray-300 max-w-md">
                        Menyediakan layanan premium untuk repaint dan kustomisasi motor Anda dengan pilihan warna dan model terbaru.
                    </p>
                </div>
                
                {/* Quote */}
                {quote && (
                    <div className="auth-quote relative z-20 mt-auto bg-black/40 p-6 rounded-lg border border-gray-700">
                        <blockquote className="space-y-2">
                            <p className="text-lg italic">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-[#FF4433] font-medium">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            
            {/* Right panel - Form */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    {/* Mobile logo */}
                    <Link href={route('home')} className="mobile-logo relative z-20 flex items-center justify-center mb-8 lg:hidden">
                        <div className="flex items-center bg-[#FF4433] p-1 rounded-lg mr-2">
                            <AppLogoIcon className="h-8 fill-current text-white sm:h-8" />
                        </div>
                        <div>
                            <span className="text-[#FF4433] font-bold text-xl">GARASI</span>
                            <span className="ml-1 text-black font-black text-xl">ARMSTRONG</span>
                        </div>
                    </Link>
                    
                    {/* Form header */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="auth-title text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                        <p className="auth-description text-muted-foreground text-sm text-balance text-gray-500">{description}</p>
                    </div>
                    
                    {/* Form content */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm">
                        {children}
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Garasi Armstrong. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
}
