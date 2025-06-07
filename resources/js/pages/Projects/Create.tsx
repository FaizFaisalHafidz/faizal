import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Camera,
    Car,
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
    foto_before: File[];
}

interface Props {
    jenisProjectOptions: Record<string, string>;
    jenisKendaraanOptions: Record<string, string>;
    prioritasOptions: Record<string, string>;
    statusPembayaranOptions: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Management', href: '/management' },
    { title: 'Projects', href: '/management/projects' },
    { title: 'Buat Project Baru', href: '#' },
];

export default function CreateProject({ 
    jenisProjectOptions, 
    jenisKendaraanOptions, 
    prioritasOptions, 
    statusPembayaranOptions 
}: Props) {
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        nama_project: '',
        deskripsi_project: '',
        jenis_project: '',
        plat_nomor: '',
        nama_pemilik: '',
        no_telp_pemilik: '',
        email_pemilik: '',
        alamat_pemilik: '',
        jenis_kendaraan: '',
        merk_kendaraan: '',
        tipe_kendaraan: '',
        tahun_kendaraan: '',
        warna_awal: '',
        warna_target: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_target_selesai: '',
        prioritas: 'normal',
        estimasi_biaya: '',
        status_pembayaran: 'belum_bayar',
        catatan_khusus: '',
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

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'foto_before') {
                value.forEach((file: File) => {
                    formData.append('foto_before[]', file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        post(route('projects.store'), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Project berhasil dibuat');
                router.visit(route('projects.index'));
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal membuat project');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Project Baru" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Buat Project Baru</h1>
                        <p className="text-muted-foreground">
                            Buat project kendaraan baru dengan task timeline otomatis
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('projects.index'))}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Informasi Project</CardTitle>
                            </div>
                            <CardDescription>
                                Detail dasar tentang project yang akan dikerjakan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nama_project">
                                        Nama Project <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nama_project"
                                        value={data.nama_project}
                                        onChange={(e) => setData('nama_project', e.target.value)}
                                        placeholder="Contoh: Custom Paint Honda Beat"
                                        className={errors.nama_project ? 'border-red-500' : ''}
                                    />
                                    {errors.nama_project && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.nama_project}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis_project">
                                        Jenis Project <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.jenis_project} onValueChange={(value) => setData('jenis_project', value)}>
                                        <SelectTrigger className={errors.jenis_project ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih jenis project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(jenisProjectOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.jenis_project && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.jenis_project}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi_project">Deskripsi Project</Label>
                                <Textarea
                                    id="deskripsi_project"
                                    value={data.deskripsi_project}
                                    onChange={(e) => setData('deskripsi_project', e.target.value)}
                                    placeholder="Deskripsi detail tentang project..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="prioritas">
                                        Prioritas <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.prioritas} onValueChange={(value) => setData('prioritas', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(prioritasOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <Badge 
                                                            variant={
                                                                key === 'urgent' ? 'destructive' : 
                                                                key === 'high' ? 'default' : 
                                                                key === 'normal' ? 'outline' : 'secondary'
                                                            }
                                                            className="w-2 h-2 p-0"
                                                        />
                                                        {label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_masuk">
                                        Tanggal Masuk <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tanggal_masuk"
                                        type="date"
                                        value={data.tanggal_masuk}
                                        onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                        className={errors.tanggal_masuk ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal_masuk && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.tanggal_masuk}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_target_selesai">
                                        Target Selesai <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tanggal_target_selesai"
                                        type="date"
                                        value={data.tanggal_target_selesai}
                                        onChange={(e) => setData('tanggal_target_selesai', e.target.value)}
                                        min={data.tanggal_masuk}
                                        className={errors.tanggal_target_selesai ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal_target_selesai && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.tanggal_target_selesai}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                <CardTitle>Informasi Kendaraan</CardTitle>
                            </div>
                            <CardDescription>
                                Detail kendaraan yang akan dikerjakan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="plat_nomor">
                                        Plat Nomor <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="plat_nomor"
                                        value={data.plat_nomor}
                                        onChange={(e) => setData('plat_nomor', e.target.value.toUpperCase())}
                                        placeholder="B 1234 ABC"
                                        className={errors.plat_nomor ? 'border-red-500' : ''}
                                    />
                                    {errors.plat_nomor && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.plat_nomor}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kendaraan">
                                        Jenis Kendaraan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.jenis_kendaraan} onValueChange={(value) => setData('jenis_kendaraan', value)}>
                                        <SelectTrigger className={errors.jenis_kendaraan ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih jenis kendaraan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(jenisKendaraanOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.jenis_kendaraan && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.jenis_kendaraan}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="merk_kendaraan">
                                        Merk <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="merk_kendaraan"
                                        value={data.merk_kendaraan}
                                        onChange={(e) => setData('merk_kendaraan', e.target.value)}
                                        placeholder="Honda, Yamaha, Toyota..."
                                        className={errors.merk_kendaraan ? 'border-red-500' : ''}
                                    />
                                    {errors.merk_kendaraan && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.merk_kendaraan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipe_kendaraan">
                                        Tipe <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tipe_kendaraan"
                                        value={data.tipe_kendaraan}
                                        onChange={(e) => setData('tipe_kendaraan', e.target.value)}
                                        placeholder="Beat, Vario, Avanza..."
                                        className={errors.tipe_kendaraan ? 'border-red-500' : ''}
                                    />
                                    {errors.tipe_kendaraan && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.tipe_kendaraan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tahun_kendaraan">Tahun</Label>
                                    <Input
                                        id="tahun_kendaraan"
                                        value={data.tahun_kendaraan}
                                        onChange={(e) => setData('tahun_kendaraan', e.target.value)}
                                        placeholder="2020"
                                        maxLength={4}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="warna_awal">Warna Awal</Label>
                                    <Input
                                        id="warna_awal"
                                        value={data.warna_awal}
                                        onChange={(e) => setData('warna_awal', e.target.value)}
                                        placeholder="Merah, Biru, Putih..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warna_target">Warna Target</Label>
                                    <Input
                                        id="warna_target"
                                        value={data.warna_target}
                                        onChange={(e) => setData('warna_target', e.target.value)}
                                        placeholder="Hitam Doff, Biru Metalik..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Owner Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Informasi Pemilik</CardTitle>
                            </div>
                            <CardDescription>
                                Data pemilik kendaraan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nama_pemilik">
                                        Nama Pemilik <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nama_pemilik"
                                        value={data.nama_pemilik}
                                        onChange={(e) => setData('nama_pemilik', e.target.value)}
                                        placeholder="Nama lengkap pemilik"
                                        className={errors.nama_pemilik ? 'border-red-500' : ''}
                                    />
                                    {errors.nama_pemilik && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.nama_pemilik}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="no_telp_pemilik">
                                        No. Telepon <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="no_telp_pemilik"
                                        value={data.no_telp_pemilik}
                                        onChange={(e) => setData('no_telp_pemilik', e.target.value)}
                                        placeholder="08123456789"
                                        className={errors.no_telp_pemilik ? 'border-red-500' : ''}
                                    />
                                    {errors.no_telp_pemilik && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.no_telp_pemilik}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email_pemilik">Email</Label>
                                <Input
                                    id="email_pemilik"
                                    type="email"
                                    value={data.email_pemilik}
                                    onChange={(e) => setData('email_pemilik', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alamat_pemilik">Alamat</Label>
                                <Textarea
                                    id="alamat_pemilik"
                                    value={data.alamat_pemilik}
                                    onChange={(e) => setData('alamat_pemilik', e.target.value)}
                                    placeholder="Alamat lengkap pemilik..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Budget Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                <CardTitle>Informasi Budget</CardTitle>
                            </div>
                            <CardDescription>
                                Estimasi biaya dan status pembayaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="estimasi_biaya">
                                        Estimasi Biaya <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="estimasi_biaya"
                                        type="number"
                                        value={data.estimasi_biaya}
                                        onChange={(e) => setData('estimasi_biaya', e.target.value)}
                                        placeholder="1000000"
                                        min="0"
                                        className={errors.estimasi_biaya ? 'border-red-500' : ''}
                                    />
                                    {errors.estimasi_biaya && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.estimasi_biaya}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status_pembayaran">
                                        Status Pembayaran <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.status_pembayaran} onValueChange={(value) => setData('status_pembayaran', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusPembayaranOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                <CardTitle>Dokumentasi & Catatan</CardTitle>
                            </div>
                            <CardDescription>
                                Foto kondisi awal dan catatan khusus
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="catatan_khusus">Catatan Khusus</Label>
                                <Textarea
                                    id="catatan_khusus"
                                    value={data.catatan_khusus}
                                    onChange={(e) => setData('catatan_khusus', e.target.value)}
                                    placeholder="Catatan khusus untuk project ini..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Foto Kondisi Awal (Maksimal 5 foto)</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('foto_before')?.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Foto
                                    </Button>
                                    <input
                                        id="foto_before"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {data.foto_before.length} foto dipilih
                                    </span>
                                </div>

                                {previewImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                        {previewImages.map((src, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={src}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('projects.index'))}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Menyimpan...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Simpan Project
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}