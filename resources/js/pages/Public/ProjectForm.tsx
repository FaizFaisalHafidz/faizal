import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Camera,
    Car,
    CheckCircle,
    DollarSign,
    FileText,
    Save,
    Upload,
    User,
    X
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface FormData {
    nama_project: string;
    deskripsi_project: string;
    jenis_project: string;
    plat_nomor: string;
    nama_pemilik: string;
    no_telp_pemilik: string;
    email_pemilik: string;
    alamat_pemilik: string;
    jenis_kendaraan: string;
    merk_kendaraan: string;
    tipe_kendaraan: string;
    tahun_kendaraan: string;
    warna_awal: string;
    warna_target: string;
    tanggal_masuk: string;
    tanggal_target_selesai: string;
    prioritas: string;
    estimasi_biaya: string;
    status_pembayaran: string;
    catatan_khusus: string;
    layanan_dipilih: string;
    foto_before: File[];
}

interface CartItem {
    id: number;
    nama_paket: string;
    harga: number;
    deskripsi: string;
    kategori: string;
    quantity: number;
}

interface Props {
    jenisProjectOptions: Record<string, string>;
    jenisKendaraanOptions: Record<string, string>;
    prioritasOptions: Record<string, string>;
    statusPembayaranOptions: Record<string, string>;
    cartData?: CartItem[];
}

export default function ProjectForm({ 
    jenisProjectOptions, 
    jenisKendaraanOptions, 
    prioritasOptions, 
    statusPembayaranOptions,
    cartData 
}: Props) {
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    // Get cart data from URL if not provided as prop
    const getCartDataFromUrl = () => {
        if (cartData) return cartData;
        
        const urlParams = new URLSearchParams(window.location.search);
        const cartParam = urlParams.get('cart');
        if (cartParam) {
            try {
                return JSON.parse(decodeURIComponent(cartParam));
            } catch (e) {
                console.error('Error parsing cart data:', e);
                return null;
            }
        }
        return null;
    };

    const finalCartData = getCartDataFromUrl();

    // Calculate total price from cart
    const getTotalPrice = () => {
        if (!finalCartData) return 0;
        return finalCartData.reduce((total: number, item: CartItem) => total + (item.harga * item.quantity), 0);
    };

    // Format currency to Indonesian Rupiah
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format category name
    const formatCategoryName = (category: string): string => {
        if (category.includes('_')) {
            return category
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }
        
        return category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        nama_project: '',
        deskripsi_project: '',
        jenis_project: 'custom_paint',
        plat_nomor: '',
        nama_pemilik: '',
        no_telp_pemilik: '',
        email_pemilik: '',
        alamat_pemilik: '',
        jenis_kendaraan: 'motor',
        merk_kendaraan: '',
        tipe_kendaraan: '',
        tahun_kendaraan: '',
        warna_awal: '',
        warna_target: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_target_selesai: '',
        prioritas: 'normal',
        estimasi_biaya: getTotalPrice().toString(),
        status_pembayaran: 'belum_bayar',
        catatan_khusus: '',
        layanan_dipilih: finalCartData ? JSON.stringify(finalCartData) : '',
        foto_before: [],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length + data.foto_before.length > 5) {
            toast.error('Maksimal 5 foto');
            return;
        }

        const newFiles = [...data.foto_before, ...files];
        setData('foto_before', newFiles);

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newFiles = data.foto_before.filter((_, i) => i !== index);
        const newPreviews = previewImages.filter((_, i) => i !== index);
        
        setData('foto_before', newFiles);
        setPreviewImages(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/create-project', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permintaan project berhasil dikirim!');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal mengirim permintaan project');
            },
        });
    };

    return (
        <>
            <Head title="Form Permintaan Project - GARASI ARMSTRONG">
                <meta name="description" content="Form permintaan project layanan di GARASI ARMSTRONG" />
            </Head>
            
            <div className="flex min-h-screen flex-col bg-black text-white">
                <Header />
                <Toaster position="top-right" richColors />
                
                <main className="flex-grow pb-32 pt-32">
                    <div className="container mx-auto px-6">
                        {/* Hero Section */}
                        <div className="mb-12 text-center">
                            <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
                                <span className="bg-gradient-to-r from-[#FF4433] to-orange-500 bg-clip-text text-transparent">Form Permintaan Project</span>
                            </h1>
                            <div className="mx-auto mb-6 h-1 w-24 bg-[#FF4433]"></div>
                            <p className="mx-auto max-w-2xl text-gray-300">
                                Isi form di bawah ini untuk mengajukan permintaan project. Tim kami akan menghubungi Anda segera.
                            </p>
                        </div>

                        {/* Selected Services Summary */}
                        {finalCartData && finalCartData.length > 0 && (
                            <Card className="mb-8 border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                        Layanan yang Dipilih
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {finalCartData.map((item: CartItem, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">{item.nama_paket}</h4>
                                                    <p className="text-sm text-gray-400">{formatCategoryName(item.kategori)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                    <p className="font-bold text-[#FF4433]">{formatCurrency(item.harga * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-700 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-white">Total Estimasi:</span>
                                                <span className="text-xl font-bold text-[#FF4433]">{formatCurrency(getTotalPrice())}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Informasi Project */}
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <FileText className="mr-2 h-5 w-5" />
                                        Informasi Project
                                    </CardTitle>
                                    <CardDescription>
                                        Detail project yang akan dikerjakan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_project" className="text-gray-300">Nama Project *</Label>
                                            <Input
                                                id="nama_project"
                                                value={data.nama_project}
                                                onChange={(e) => setData('nama_project', e.target.value)}
                                                placeholder="Contoh: Custom Paint Motor Honda CB"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.nama_project && <p className="text-red-400 text-sm">{errors.nama_project}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="jenis_project" className="text-gray-300">Jenis Project *</Label>
                                            <Select value={data.jenis_project} onValueChange={(value) => setData('jenis_project', value)}>
                                                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                                                    <SelectValue placeholder="Pilih jenis project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(jenisProjectOptions).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.jenis_project && <p className="text-red-400 text-sm">{errors.jenis_project}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deskripsi_project" className="text-gray-300">Deskripsi Project</Label>
                                        <Textarea
                                            id="deskripsi_project"
                                            value={data.deskripsi_project}
                                            onChange={(e) => setData('deskripsi_project', e.target.value)}
                                            placeholder="Jelaskan detail project yang diinginkan..."
                                            className="border-gray-700 bg-gray-800 text-white min-h-[100px]"
                                        />
                                        {errors.deskripsi_project && <p className="text-red-400 text-sm">{errors.deskripsi_project}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Informasi Pemilik */}
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <User className="mr-2 h-5 w-5" />
                                        Informasi Pemilik
                                    </CardTitle>
                                    <CardDescription>
                                        Data pribadi pemilik kendaraan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_pemilik" className="text-gray-300">Nama Lengkap *</Label>
                                            <Input
                                                id="nama_pemilik"
                                                value={data.nama_pemilik}
                                                onChange={(e) => setData('nama_pemilik', e.target.value)}
                                                placeholder="Nama lengkap pemilik"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.nama_pemilik && <p className="text-red-400 text-sm">{errors.nama_pemilik}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="no_telp_pemilik" className="text-gray-300">No. Telepon *</Label>
                                            <Input
                                                id="no_telp_pemilik"
                                                value={data.no_telp_pemilik}
                                                onChange={(e) => setData('no_telp_pemilik', e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.no_telp_pemilik && <p className="text-red-400 text-sm">{errors.no_telp_pemilik}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email_pemilik" className="text-gray-300">Email</Label>
                                            <Input
                                                id="email_pemilik"
                                                type="email"
                                                value={data.email_pemilik}
                                                onChange={(e) => setData('email_pemilik', e.target.value)}
                                                placeholder="email@contoh.com"
                                                className="border-gray-700 bg-gray-800 text-white"
                                            />
                                            {errors.email_pemilik && <p className="text-red-400 text-sm">{errors.email_pemilik}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="plat_nomor" className="text-gray-300">Plat Nomor *</Label>
                                            <Input
                                                id="plat_nomor"
                                                value={data.plat_nomor}
                                                onChange={(e) => setData('plat_nomor', e.target.value)}
                                                placeholder="B 1234 ABC"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.plat_nomor && <p className="text-red-400 text-sm">{errors.plat_nomor}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alamat_pemilik" className="text-gray-300">Alamat</Label>
                                        <Textarea
                                            id="alamat_pemilik"
                                            value={data.alamat_pemilik}
                                            onChange={(e) => setData('alamat_pemilik', e.target.value)}
                                            placeholder="Alamat lengkap..."
                                            className="border-gray-700 bg-gray-800 text-white"
                                        />
                                        {errors.alamat_pemilik && <p className="text-red-400 text-sm">{errors.alamat_pemilik}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Informasi Kendaraan */}
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <Car className="mr-2 h-5 w-5" />
                                        Informasi Kendaraan
                                    </CardTitle>
                                    <CardDescription>
                                        Detail kendaraan yang akan dikerjakan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="jenis_kendaraan" className="text-gray-300">Jenis Kendaraan *</Label>
                                            <Select value={data.jenis_kendaraan} onValueChange={(value) => setData('jenis_kendaraan', value)}>
                                                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                                                    <SelectValue placeholder="Pilih jenis kendaraan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(jenisKendaraanOptions).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.jenis_kendaraan && <p className="text-red-400 text-sm">{errors.jenis_kendaraan}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="merk_kendaraan" className="text-gray-300">Merk Kendaraan *</Label>
                                            <Input
                                                id="merk_kendaraan"
                                                value={data.merk_kendaraan}
                                                onChange={(e) => setData('merk_kendaraan', e.target.value)}
                                                placeholder="Honda, Yamaha, Toyota, dll"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.merk_kendaraan && <p className="text-red-400 text-sm">{errors.merk_kendaraan}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="tipe_kendaraan" className="text-gray-300">Tipe Kendaraan *</Label>
                                            <Input
                                                id="tipe_kendaraan"
                                                value={data.tipe_kendaraan}
                                                onChange={(e) => setData('tipe_kendaraan', e.target.value)}
                                                placeholder="CB150R, Vario 125, Avanza, dll"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.tipe_kendaraan && <p className="text-red-400 text-sm">{errors.tipe_kendaraan}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tahun_kendaraan" className="text-gray-300">Tahun Kendaraan</Label>
                                            <Input
                                                id="tahun_kendaraan"
                                                value={data.tahun_kendaraan}
                                                onChange={(e) => setData('tahun_kendaraan', e.target.value)}
                                                placeholder="2020"
                                                className="border-gray-700 bg-gray-800 text-white"
                                            />
                                            {errors.tahun_kendaraan && <p className="text-red-400 text-sm">{errors.tahun_kendaraan}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="warna_awal" className="text-gray-300">Warna Awal</Label>
                                            <Input
                                                id="warna_awal"
                                                value={data.warna_awal}
                                                onChange={(e) => setData('warna_awal', e.target.value)}
                                                placeholder="Merah, Biru, Hitam, dll"
                                                className="border-gray-700 bg-gray-800 text-white"
                                            />
                                            {errors.warna_awal && <p className="text-red-400 text-sm">{errors.warna_awal}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="warna_target" className="text-gray-300">Warna Target</Label>
                                            <Input
                                                id="warna_target"
                                                value={data.warna_target}
                                                onChange={(e) => setData('warna_target', e.target.value)}
                                                placeholder="Warna yang diinginkan"
                                                className="border-gray-700 bg-gray-800 text-white"
                                            />
                                            {errors.warna_target && <p className="text-red-400 text-sm">{errors.warna_target}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Jadwal dan Biaya */}
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <DollarSign className="mr-2 h-5 w-5" />
                                        Jadwal dan Biaya
                                    </CardTitle>
                                    <CardDescription>
                                        Informasi jadwal dan estimasi biaya
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_masuk" className="text-gray-300">Tanggal Masuk *</Label>
                                            <Input
                                                id="tanggal_masuk"
                                                type="date"
                                                value={data.tanggal_masuk}
                                                onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.tanggal_masuk && <p className="text-red-400 text-sm">{errors.tanggal_masuk}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_target_selesai" className="text-gray-300">Target Selesai *</Label>
                                            <Input
                                                id="tanggal_target_selesai"
                                                type="date"
                                                value={data.tanggal_target_selesai}
                                                onChange={(e) => setData('tanggal_target_selesai', e.target.value)}
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                            />
                                            {errors.tanggal_target_selesai && <p className="text-red-400 text-sm">{errors.tanggal_target_selesai}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="estimasi_biaya" className="text-gray-300">Estimasi Biaya *</Label>
                                            <Input
                                                id="estimasi_biaya"
                                                type="number"
                                                value={data.estimasi_biaya}
                                                onChange={(e) => setData('estimasi_biaya', e.target.value)}
                                                placeholder="0"
                                                className="border-gray-700 bg-gray-800 text-white"
                                                required
                                                readOnly={finalCartData && finalCartData.length > 0}
                                            />
                                            {errors.estimasi_biaya && <p className="text-red-400 text-sm">{errors.estimasi_biaya}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="prioritas" className="text-gray-300">Prioritas</Label>
                                            <Select value={data.prioritas} onValueChange={(value) => setData('prioritas', value)}>
                                                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                                                    <SelectValue placeholder="Pilih prioritas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(prioritasOptions).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>{value}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.prioritas && <p className="text-red-400 text-sm">{errors.prioritas}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Foto dan Catatan */}
                            <Card className="border-gray-800 bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <Camera className="mr-2 h-5 w-5" />
                                        Foto dan Catatan
                                    </CardTitle>
                                    <CardDescription>
                                        Upload foto kendaraan dan tambahkan catatan khusus
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="foto_before" className="text-gray-300">Foto Kendaraan (Maksimal 5 foto)</Label>
                                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <div className="space-y-2">
                                                <p className="text-gray-400">Drag & drop foto atau klik untuk memilih</p>
                                                <Input
                                                    id="foto_before"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('foto_before')?.click()}
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                                >
                                                    Pilih Foto
                                                </Button>
                                            </div>
                                        </div>
                                        {errors.foto_before && <p className="text-red-400 text-sm">{errors.foto_before}</p>}
                                    </div>

                                    {/* Preview Images */}
                                    {previewImages.length > 0 && (
                                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                            {previewImages.map((src, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={src}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-700"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="catatan_khusus" className="text-gray-300">Catatan Khusus</Label>
                                        <Textarea
                                            id="catatan_khusus"
                                            value={data.catatan_khusus}
                                            onChange={(e) => setData('catatan_khusus', e.target.value)}
                                            placeholder="Tambahkan catatan atau permintaan khusus..."
                                            className="border-gray-700 bg-gray-800 text-white min-h-[100px]"
                                        />
                                        {errors.catatan_khusus && <p className="text-red-400 text-sm">{errors.catatan_khusus}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/daftar-harga')}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali ke Daftar Harga
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#FF4433] hover:bg-[#FF4433]/90 text-white"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Mengirim...' : 'Kirim Permintaan Project'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
                
                <Footer />
            </div>
        </>
    );
}