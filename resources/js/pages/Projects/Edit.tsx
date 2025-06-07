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
    Eye,
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
    tanggal_target_selesai: string;
    prioritas: string;
    estimasi_biaya: string;
    status_project: string;
    status_pembayaran: string;
    total_pembayaran: string;
    catatan_khusus: string;
    foto_before: File[];
    foto_after: File[];
}

interface Project {
    id: number;
    project_code: string;
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
    tanggal_selesai_aktual: string | null;
    status_project: string;
    prioritas: string;
    estimasi_biaya: number;
    biaya_aktual: number;
    total_pembayaran: number;
    status_pembayaran: string;
    progress_percentage: number;
    catatan_khusus: string;
    catatan_internal: string;
    foto_before: string[];
    foto_after: string[];
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    jenisProjectOptions: Record<string, string>;
    jenisKendaraanOptions: Record<string, string>;
    prioritasOptions: Record<string, string>;
    statusProjectOptions: Record<string, string>;
    statusPembayaranOptions: Record<string, string>;
}

export default function EditProject({ 
    project,
    jenisProjectOptions, 
    jenisKendaraanOptions, 
    prioritasOptions,
    statusProjectOptions,
    statusPembayaranOptions 
}: Props) {
    const [previewImagesBefore, setPreviewImagesBefore] = useState<string[]>([]);
    const [previewImagesAfter, setPreviewImagesAfter] = useState<string[]>([]);
    const [existingImagesBefore, setExistingImagesBefore] = useState<string[]>(project.foto_before || []);
    const [existingImagesAfter, setExistingImagesAfter] = useState<string[]>(project.foto_after || []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Management', href: '/management' },
        { title: 'Projects', href: '/management/projects' },
        { title: project.nama_project, href: `/management/projects/${project.id}` },
        { title: 'Edit', href: '#' },
    ];

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        nama_project: project.nama_project || '',
        deskripsi_project: project.deskripsi_project || '',
        jenis_project: project.jenis_project || '',
        plat_nomor: project.plat_nomor || '',
        nama_pemilik: project.nama_pemilik || '',
        no_telp_pemilik: project.no_telp_pemilik || '',
        email_pemilik: project.email_pemilik || '',
        alamat_pemilik: project.alamat_pemilik || '',
        jenis_kendaraan: project.jenis_kendaraan || '',
        merk_kendaraan: project.merk_kendaraan || '',
        tipe_kendaraan: project.tipe_kendaraan || '',
        tahun_kendaraan: project.tahun_kendaraan || '',
        warna_awal: project.warna_awal || '',
        warna_target: project.warna_target || '',
        tanggal_target_selesai: project.tanggal_target_selesai || '',
        prioritas: project.prioritas || 'normal',
        estimasi_biaya: project.estimasi_biaya?.toString() || '',
        status_project: project.status_project || '',
        status_pembayaran: project.status_pembayaran || '',
        total_pembayaran: project.total_pembayaran?.toString() || '0',
        catatan_khusus: project.catatan_khusus || '',
        foto_before: [],
        foto_after: [],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const files = Array.from(e.target.files || []);
        const currentFiles = type === 'before' ? data.foto_before : data.foto_after;
        const existingImages = type === 'before' ? existingImagesBefore : existingImagesAfter;
        
        if (files.length + currentFiles.length + existingImages.length > 10) {
            toast.error('Maksimal 10 foto per kategori');
            return;
        }

        const newFiles = [...currentFiles, ...files];
        if (type === 'before') {
            setData('foto_before', newFiles);
        } else {
            setData('foto_after', newFiles);
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        if (type === 'before') {
            setPreviewImagesBefore(prev => [...prev, ...newPreviews]);
        } else {
            setPreviewImagesAfter(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number, type: 'before' | 'after') => {
        if (type === 'before') {
            const newFiles = data.foto_before.filter((_, i) => i !== index);
            const newPreviews = previewImagesBefore.filter((_, i) => i !== index);
            setData('foto_before', newFiles);
            setPreviewImagesBefore(newPreviews);
        } else {
            const newFiles = data.foto_after.filter((_, i) => i !== index);
            const newPreviews = previewImagesAfter.filter((_, i) => i !== index);
            setData('foto_after', newFiles);
            setPreviewImagesAfter(newPreviews);
        }
    };

    const removeExistingImage = (index: number, type: 'before' | 'after') => {
        if (type === 'before') {
            const newExisting = existingImagesBefore.filter((_, i) => i !== index);
            setExistingImagesBefore(newExisting);
        } else {
            const newExisting = existingImagesAfter.filter((_, i) => i !== index);
            setExistingImagesAfter(newExisting);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        
        // Add regular form data
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'foto_before' || key === 'foto_after') {
                value.forEach((file: File) => {
                    formData.append(`${key}[]`, file);
                });
            } else {
                formData.append(key, value as string);
            }
        });

        // Add existing images that should be kept
        formData.append('existing_foto_before', JSON.stringify(existingImagesBefore));
        formData.append('existing_foto_after', JSON.stringify(existingImagesAfter));

        put(route('projects.update', project.id), {
            data: formData,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Project berhasil diupdate');
                router.visit(route('projects.show', project.id));
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal mengupdate project');
            },
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'in_progress':
                return 'secondary';
            case 'confirmed':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'destructive';
            case 'high':
                return 'default';
            case 'normal':
                return 'outline';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Project - ${project.nama_project}`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
                            <Badge variant="outline" className="text-xs">
                                {project.project_code}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Update informasi project dan dokumentasi
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('projects.show', project.id))}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Project
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('projects.index'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </div>
                </div>

                {/* Project Status Info */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Status Project</Label>
                                <div className="mt-1">
                                    <Badge variant={getStatusBadgeVariant(project.status_project)}>
                                        {statusProjectOptions[project.status_project] || project.status_project}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Progress</Label>
                                <div className="mt-1 font-medium">
                                    {project.progress_percentage}%
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Tanggal Masuk</Label>
                                <div className="mt-1 font-medium">
                                    {new Date(project.tanggal_masuk).toLocaleDateString('id-ID')}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Prioritas</Label>
                                <div className="mt-1">
                                    <Badge variant={getPriorityBadgeVariant(project.prioritas)}>
                                        {prioritasOptions[project.prioritas] || project.prioritas}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                <CardTitle>Informasi Project</CardTitle>
                            </div>
                            <CardDescription>
                                Update detail dasar tentang project
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
                                                            variant={getPriorityBadgeVariant(key)}
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
                                    <Label htmlFor="status_project">
                                        Status Project <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.status_project} onValueChange={(value) => setData('status_project', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusProjectOptions).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <Badge 
                                                            variant={getStatusBadgeVariant(key)}
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
                                    <Label htmlFor="tanggal_target_selesai">
                                        Target Selesai <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tanggal_target_selesai"
                                        type="date"
                                        value={data.tanggal_target_selesai}
                                        onChange={(e) => setData('tanggal_target_selesai', e.target.value)}
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
                                Update detail kendaraan yang dikerjakan
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
                                Update data pemilik kendaraan
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
                                <CardTitle>Informasi Budget & Pembayaran</CardTitle>
                            </div>
                            <CardDescription>
                                Update estimasi biaya dan status pembayaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
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
                                    <Label htmlFor="total_pembayaran">Total Pembayaran</Label>
                                    <Input
                                        id="total_pembayaran"
                                        type="number"
                                        value={data.total_pembayaran}
                                        onChange={(e) => setData('total_pembayaran', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                    />
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

                            {/* Biaya Aktual (Read-only info) */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Biaya Aktual</Label>
                                        <div className="mt-1 font-medium">
                                            Rp {project.biaya_aktual?.toLocaleString('id-ID') || '0'}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Sisa Pembayaran</Label>
                                        <div className="mt-1 font-medium">
                                            Rp {(project.estimasi_biaya - project.total_pembayaran)?.toLocaleString('id-ID') || '0'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documentation */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                <CardTitle>Dokumentasi & Catatan</CardTitle>
                            </div>
                            <CardDescription>
                                Update foto dan catatan project
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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

                            {/* Foto Before */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Foto Kondisi Awal</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('foto_before')?.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Tambah Foto
                                    </Button>
                                </div>
                                <input
                                    id="foto_before"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'before')}
                                    className="hidden"
                                />

                                {/* Existing Images Before */}
                                {existingImagesBefore.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Foto Existing</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                            {existingImagesBefore.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={`/storage/${src}`}
                                                        alt={`Existing before ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeExistingImage(index, 'before')}
                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images Before */}
                                {previewImagesBefore.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Foto Baru</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                            {previewImagesBefore.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={src}
                                                        alt={`New before ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeNewImage(index, 'before')}
                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Foto After */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Foto Hasil Akhir</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('foto_after')?.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Tambah Foto
                                    </Button>
                                </div>
                                <input
                                    id="foto_after"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'after')}
                                    className="hidden"
                                />

                                {/* Existing Images After */}
                                {existingImagesAfter.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Foto Existing</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                            {existingImagesAfter.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={`/storage/${src}`}
                                                        alt={`Existing after ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeExistingImage(index, 'after')}
                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images After */}
                                {previewImagesAfter.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Foto Baru</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                            {previewImagesAfter.map((src, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={src}
                                                        alt={`New after ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeNewImage(index, 'after')}
                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
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
                                    onClick={() => router.visit(route('projects.show', project.id))}
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
                                            Update Project
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