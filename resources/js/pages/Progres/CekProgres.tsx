import { Head } from '@inertiajs/react';
import { useState } from 'react';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

// Update interface KendaraanData
interface KendaraanData {
    platNomor: string;
    namaPemilik: string;
    jenisKendaraan: string;
    merkKendaraan: string;
    tipeKendaraan: string;
    warna: string;
    layanan: string;
    tanggalMasuk: string;
    estimasiSelesai: string;
    tanggalSelesaiAktual?: string;
    status: 'bongkar-body' | 'repair-body' | 'pengampelasan' | 'poxy' | 'repaint-clear' | 'pemasangan-body';
    statusDetail: string;
    currentStep: number;
    progressSteps: Array<{
        id: number;
        step: number;
        nama: string;
        kategori: string;
        status: string;
        progress: number;
        durasi: number;
        warna: string;
        isCritical: boolean;
        tanggalMulai?: string;
        tanggalSelesai?: string;
        estimasiSelesai?: string;
        pic?: string;
        catatan?: string;
        qualityStatus: string;
    }>;
    catatan?: string;
    catatanInternal?: string;
    harga: number;
    pembayaran: {
        status: 'belum' | 'sebagian' | 'lunas';
        dibayar: number;
        sisa: number;
    };
    projectStats: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        progressPercentage: number;
        daysRemaining: number;
        isOverdue: boolean;
        statusProject: string;
    };
    lastUpdate: string;
    projectCode: string;
    noTelp: string;
    email: string;
}

export default function CekProgres() {
    const [platNomor, setPlatNomor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [kendaraanData, setKendaraanData] = useState<KendaraanData | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Fungsi untuk mendapatkan CSRF token
    const getCSRFToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    };

    // Fungsi untuk menangani submit form pencarian
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!platNomor.trim()) {
            setError('Plat nomor kendaraan harus diisi');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Gunakan URL langsung karena route helper tidak tersedia di client
            const response = await fetch('/progress/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCSRFToken(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    plat_nomor: platNomor.trim()
                })
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server tidak mengembalikan response JSON yang valid');
            }

            const result = await response.json();

            if (response.ok && result.success) {
                setKendaraanData(result.data);
                setIsSubmitted(true);
                setError(null);
            } else {
                // Handle both HTTP errors and application errors
                const errorMessage = result.message || 
                    (response.status === 404 ? 'Kendaraan tidak ditemukan' : 'Terjadi kesalahan pada server');
                setError(errorMessage);
                setKendaraanData(null);
                setIsSubmitted(false);
            }
        } catch (err) {
            console.error('Error checking progress:', err);
            
            // More specific error messages
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Tidak dapat menghubungi server. Periksa koneksi internet Anda.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak diketahui. Mohon coba lagi.');
            }
            
            setKendaraanData(null);
            setIsSubmitted(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Update fungsi getCurrentStep untuk menggunakan data dari API
    const getCurrentStep = (kendaraanData: KendaraanData) => {
        // Gunakan currentStep dari API, tapi validasi dengan progressSteps
        const apiCurrentStep = kendaraanData.currentStep;
        const steps = kendaraanData.progressSteps;
        
        // Hitung berdasarkan status task yang sebenarnya
        const completedTasks = steps.filter(step => step.status === 'completed').length;
        const inProgressTasks = steps.filter(step => step.status === 'in_progress');
        
        if (inProgressTasks.length > 0) {
            // Jika ada task in progress, return step task tersebut
            return inProgressTasks[0].step;
        }
        
        if (completedTasks === steps.length && steps.length > 0) {
            // Jika semua completed, return step terakhir
            return steps.length;
        }
        
        // Return step berikutnya setelah completed tasks
        return Math.min(completedTasks + 1, 6); // Max 6 untuk tampilan chevron
    };

    // Update fungsi untuk mendapatkan status berdasarkan step yang benar
    const getStatusFromStep = (step: number): KendaraanData['status'] => {
        const stepToStatus: Record<number, KendaraanData['status']> = {
            1: 'bongkar-body',
            2: 'repair-body', 
            3: 'pengampelasan',
            4: 'poxy',
            5: 'repaint-clear',
            6: 'pemasangan-body'
        };
        
        return stepToStatus[Math.min(step, 6)] || 'bongkar-body';
    };

    // Update fungsi getStatusInfo untuk menerima step number
    const getStatusInfo = (step: number) => {
        const statusMap = {
            1: {
                label: 'Bongkar Body',
                step: 1,
                description: 'Pembongkaran body dan inspeksi awal',
            },
            2: {
                label: 'Repair Body',
                step: 2,
                description: 'Perbaikan body dan restorasi',
            },
            3: {
                label: 'Pengampelasan',
                step: 3,
                description: 'Pengampelasan permukaan',
            },
            4: {
                label: 'Poxy',
                step: 4,
                description: 'Aplikasi lapisan dasar poxy',
            },
            5: {
                label: 'Repaint & Clear',
                step: 5,
                description: 'Pengecatan dan pelapisan pernis',
            },
            6: {
                label: 'Pemasangan Body',
                step: 6,
                description: 'Pemasangan kembali body (Selesai)',
            },
        };

        return statusMap[step] || statusMap[1];
    };

    // Render icons based on step
    const renderStepIcon = (step: number, currentStep: number) => {
        const stepIcons = [
            // Bongkar Body
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
            </svg>,

            // Repair Body
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>,

            // Pengampelasan
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
            </svg>,

            // Poxy
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
            </svg>,

            // Repaint & Clear
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
            </svg>,

            // Pemasangan Body
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>,
        ];

        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
            <div className={`rounded-full p-2 ${isCompleted ? 'bg-[#FF4433]' : isActive ? 'bg-[#FF4433] ring-4 ring-[#FF4433]/20' : 'bg-gray-300'}`}>
                {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <div className={`${isActive ? 'text-white' : 'text-gray-600'}`}>{stepIcons[step - 1]}</div>
                )}
            </div>
        );
    };

    // Format angka ke dalam format Rupiah
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Update komponen ChevronProgressBar untuk menampilkan centang
    const ChevronProgressBar = ({ currentStep, progressSteps }: { 
        currentStep: number; 
        progressSteps: KendaraanData['progressSteps'] 
    }) => {
        const steps = [
            { id: 1, label: 'Bongkar Body', color: '#C81E1E' },
            { id: 2, label: 'Repair Body', color: '#E9742B' },
            { id: 3, label: 'Pengampelasan', color: '#A8A8A8' },
            { id: 4, label: 'Poxy', color: '#236D8A' },
            { id: 5, label: 'Repaint', color: '#78AB46' },
            { id: 6, label: 'Selesai', color: '#444444' }
        ];

        // Hitung step yang sudah completed berdasarkan progress steps
        const getStepStatus = (stepId: number) => {
            // Mapping step chevron ke kategori tasks
            const stepToCategories: Record<number, string[]> = {
                1: ['quality_check', 'bongkar_body'],
                2: ['repair_body', 'other'],
                3: ['pengampelasan'],
                4: ['poxy', 'base_coat'],
                5: ['color_coat', 'clear_coat'],
                6: ['pemasangan_body']
            };

            const categories = stepToCategories[stepId] || [];
            const relatedTasks = progressSteps.filter(task => 
                categories.includes(task.kategori)
            );

            if (relatedTasks.length === 0) {
                return stepId < currentStep ? 'completed' : 
                       stepId === currentStep ? 'active' : 'pending';
            }

            const allCompleted = relatedTasks.every(task => task.status === 'completed');
            const hasInProgress = relatedTasks.some(task => task.status === 'in_progress');

            if (allCompleted) return 'completed';
            if (hasInProgress || stepId === currentStep) return 'active';
            return 'pending';
        };

        return (
            <div className="w-full overflow-hidden pt-1 pb-5">
                <div className="relative flex">
                    {steps.map((step, index) => {
                        const stepStatus = getStepStatus(step.id);
                        const isActive = stepStatus === 'active';
                        const isCompleted = stepStatus === 'completed';
                        const isLast = index === steps.length - 1;

                        return (
                            <div
                                key={step.id}
                                className="relative flex h-12 flex-1 items-center justify-center"
                                style={{
                                    backgroundColor: (isActive || isCompleted) ? step.color : '#d1d5db',
                                    color: (isActive || isCompleted) ? 'white' : '#6b7280',
                                    clipPath: isLast
                                        ? 'polygon(0 0, 100% 0%, 100% 100%, 0% 100%, 10% 50%)'
                                        : 'polygon(0 0, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                                    marginRight: isLast ? '0' : '-12px',
                                    zIndex: steps.length - index
                                }}
                            >
                                <div className="flex items-center px-2 font-semibold">
                                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                                        {isCompleted ? (
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            step.id
                                        )}
                                    </span>
                                    <span className="hidden whitespace-nowrap sm:inline">{step.label}</span>
                                    <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Cek Progres Pengerjaan">
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>

            <Header />
            <section className="relative bg-gradient-to-b from-gray-900 to-black py-16 md:py-24">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 h-1/3 w-1/3 rounded-full bg-[#FF4433]/5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-1/3 w-1/2 rounded-full bg-[#FF4433]/5 blur-3xl"></div>

                <div className="container mx-auto px-4 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center">
                            <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                                Cek Progres <span className="text-[#FF4433]">Pengerjaan</span>
                            </h1>
                            <div className="mx-auto mb-6 h-1 w-20 bg-gradient-to-r from-[#FF4433] to-transparent"></div>
                            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                                Pantau status pengerjaan kendaraan Anda dengan memasukkan plat nomor di bawah ini.
                            </p>
                        </div>

                        {/* Form pencarian dengan plat nomor */}
                        <div className="mb-10 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="platNomor" className="mb-2 block font-medium text-white">
                                        Plat Nomor Kendaraan
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            id="platNomor"
                                            value={platNomor}
                                            onChange={(e) => setPlatNomor(e.target.value)}
                                            placeholder="Contoh: B 1234 XYZ"
                                            className="flex-1 rounded-l-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-[#FF4433] focus:outline-none"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="rounded-r-lg bg-[#FF4433] px-6 py-3 font-medium text-white transition-colors hover:bg-[#E03A2A] focus:ring-2 focus:ring-[#FF4433] focus:ring-offset-1 focus:ring-offset-gray-800 focus:outline-none disabled:opacity-70"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <svg
                                                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Mencari...
                                                </div>
                                            ) : (
                                                'Cek Status'
                                            )}
                                        </button>
                                    </div>
                                    {error && (
                                        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                                            <p className="text-sm text-red-300 flex items-center">
                                                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {error}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-sm text-gray-400">
                                    <p>Masukkan plat nomor kendaraan Anda untuk melihat status pengerjaan saat ini.</p>
                                </div>
                            </form>
                        </div>

                        {/* Hasil pencarian */}
                        {isSubmitted && kendaraanData && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                {/* Progress bar steps */}
                                <div className="mb-12">
                                    {(() => {
                                        const actualCurrentStep = getCurrentStep(kendaraanData);
                                        const statusInfo = getStatusInfo(actualCurrentStep);
                                        
                                        return (
                                            <>
                                                <h2 className="mb-6 text-xl font-semibold text-white">
                                                    Status Pengerjaan: <span className="text-[#FF4433]">{statusInfo.label}</span>
                                                </h2>

                                                <ChevronProgressBar 
                                                    currentStep={actualCurrentStep} 
                                                    progressSteps={kendaraanData.progressSteps} 
                                                />

                                                {/* Current status details */}
                                                <div className="mt-8 rounded-lg border border-[#FF4433]/20 bg-[#FF4433]/10 p-4">
                                                    <h3 className="flex items-center font-medium text-white">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="mr-2 h-5 w-5 text-[#FF4433]"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Detail Status Saat Ini
                                                    </h3>
                                                    <p className="mt-1 ml-7 text-gray-300">{kendaraanData.statusDetail}</p>

                                                    <div className="mt-3 ml-7 text-sm">
                                                        <div className="flex items-center text-gray-400">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="mr-1 h-4 w-4 text-[#FF4433]"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Estimasi: {statusInfo.description}
                                                        </div>
                                                        
                                                        {/* Progress steps detail */}
                                                        <div className="mt-4 space-y-2">
                                                            <h4 className="text-sm font-medium text-white">Detail Progress Tasks:</h4>
                                                            <div className="grid gap-2 max-h-32 overflow-y-auto">
                                                                {kendaraanData.progressSteps.slice(0, 5).map((step) => (
                                                                    <div key={step.id} className="flex items-center justify-between text-xs bg-gray-800/30 rounded p-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div 
                                                                                className="w-2 h-2 rounded-full"
                                                                                style={{ backgroundColor: step.warna }}
                                                                            />
                                                                            <span className="text-gray-300">{step.nama}</span>
                                                                            {step.isCritical && (
                                                                                <span className="text-red-400 text-xs">●</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                                step.status === 'completed' ? 'bg-green-600 text-white' :
                                                                                step.status === 'in_progress' ? 'bg-blue-600 text-white' :
                                                                                'bg-gray-600 text-gray-300'
                                                                            }`}>
                                                                                {step.status === 'completed' ? 'Selesai' :
                                                                                 step.status === 'in_progress' ? 'Progress' : 'Menunggu'}
                                                                            </span>
                                                                            <span className="text-gray-400">{step.progress}%</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {kendaraanData.progressSteps.length > 5 && (
                                                                    <div className="text-xs text-gray-400 text-center">
                                                                        +{kendaraanData.progressSteps.length - 5} tasks lainnya
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                {/* Data kendaraan */}
                                <div className="mb-6 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                    <h2 className="mb-6 flex items-center text-xl font-semibold text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2 h-6 w-6 text-[#FF4433]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Informasi Kendaraan
                                    </h2>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Plat Nomor</dt>
                                                    <dd className="font-medium text-white">{kendaraanData.platNomor}</dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Nama Pemilik</dt>
                                                    <dd className="text-white">{kendaraanData.namaPemilik}</dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Kendaraan</dt>
                                                    <dd className="text-white">
                                                        {kendaraanData.merkKendaraan} {kendaraanData.tipeKendaraan}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Jenis Kendaraan</dt>
                                                    <dd className="text-white">{kendaraanData.jenisKendaraan}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Warna</dt>
                                                    <dd className="text-white">{kendaraanData.warna}</dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Layanan</dt>
                                                    <dd className="text-white">{kendaraanData.layanan}</dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Tanggal Masuk</dt>
                                                    <dd className="text-white">{kendaraanData.tanggalMasuk}</dd>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <dt className="text-gray-400">Estimasi Selesai</dt>
                                                    <dd className="text-white">{kendaraanData.estimasiSelesai}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {kendaraanData.catatan && (
                                        <div className="mt-6 rounded-lg bg-gray-800/60 p-4">
                                            <h3 className="mb-2 flex items-center font-medium text-white">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="mr-2 h-5 w-5 text-[#FF4433]"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Catatan Tambahan
                                            </h3>
                                            <p className="text-gray-300">{kendaraanData.catatan}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Informasi pembayaran */}
                                <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/70 to-gray-900/70 p-6 shadow-xl backdrop-blur-sm sm:p-10">
                                    <h2 className="mb-6 flex items-center text-xl font-semibold text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2 h-6 w-6 text-[#FF4433]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        Informasi Pembayaran
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Total Biaya</span>
                                            <span className="text-xl font-bold text-white">{formatRupiah(kendaraanData.harga)}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Sudah Dibayar</span>
                                            <span className="font-medium text-[#4CAF50]">{formatRupiah(kendaraanData.pembayaran.dibayar)}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400">Sisa Pembayaran</span>
                                            <span className="font-medium text-[#FF9800]">
                                                {formatRupiah(kendaraanData.harga - kendaraanData.pembayaran.dibayar)}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-700 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Status Pembayaran</span>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                        kendaraanData.pembayaran.status === 'lunas'
                                                            ? 'bg-green-900/30 text-green-300'
                                                            : kendaraanData.pembayaran.status === 'sebagian'
                                                              ? 'bg-yellow-900/30 text-yellow-300'
                                                              : 'bg-red-900/30 text-red-300'
                                                    }`}
                                                >
                                                    {kendaraanData.pembayaran.status === 'lunas'
                                                        ? 'Lunas'
                                                        : kendaraanData.pembayaran.status === 'sebagian'
                                                          ? 'Sebagian'
                                                          : 'Belum Bayar'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="mb-4 text-gray-400">Ada pertanyaan tentang pengerjaan kendaraan Anda?</p>
                                        <a
                                            href="https://wa.me/62812345678?text=Halo%20Garasi%20Armstrong,%20saya%20ingin%20bertanya%20tentang%20progres%20pengerjaan%20motor%20saya"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-lg bg-[#25D366] px-6 py-3 text-white shadow-lg transition-colors hover:bg-[#20BD5C]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                            </svg>
                                            Hubungi via WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
