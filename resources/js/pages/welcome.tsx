import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

// Import Components
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Process from '@/components/Process';
import Services from '@/components/Service';
import Testimonials from '@/components/Testimonials';

// Initialize GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        // Initialize any global animations if needed
        gsap.to("body", { opacity: 1, duration: 0.6 });
    }, []);

    return (
        <>
            <Head title="Garasi Armstrong - Premium Motorcycle Repainting Services">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <meta name="description" content="Garasi Armstrong offers premium motorcycle repainting services with high quality craftsmanship and customer satisfaction guaranteed." />
            </Head>
            
            <div className="flex min-h-screen flex-col bg-black text-white">
                {/* Header */}
                <Header />
                
                {/* Main Content */}
                <main>
                    {/* Hero Section */}
                    <Hero />
                    
                    {/* Services Section */}
                    <Services />
                    
                    {/* Gallery Section */}
                    <Gallery />
                    
                    {/* Process Section */}
                    <Process />
                    
                    {/* Testimonials Section */}
                    <Testimonials />
                    
                    {/* Contact Section */}
                    <Contact />
                </main>
                
                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
