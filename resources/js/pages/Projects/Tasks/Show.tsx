import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Camera,
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    FileText,
    HelpCircle,
    Image as ImageIcon,
    PlayCircle,
    Settings,
    Star,
    Target,
    User,
    Users,
    Wrench,
    X,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Project {
    id: number;
    project_code: string;
    nama_project: string;
    status_project: string;
    progress_percentage: number;
}

interface Task {
    id: number;
    task_code: string;
    nama_task: string;
    deskripsi_task?: string;
    kategori_task: string;
    durasi_hari: number;
    durasi_jam: number;
    predecessor_tasks?: number[];
    successor_tasks?: number[];
    early_start: number;
    early_finish: number;
    late_start: number;
    late_finish: number;
    total_float: number;
    is_critical: boolean;
    status_task: string;
    progress_percentage: number;
    tanggal_mulai_rencana?: string;
    tanggal_selesai_rencana?: string;
    tanggal_mulai_aktual?: string;
    tanggal_selesai_aktual?: string;
    pic_pengerjaan?: string;
    team_pengerjaan?: string[];
    peralatan_dibutuhkan?: string;
    material_dibutuhkan?: string;
    quality_status: string;
    catatan_quality?: string;
    catatan_progress?: string;
    estimasi_biaya_task: number;
    biaya_aktual_task: number;
    foto_progress?: string[];
    urutan_tampil: number;
    warna_display: string;
    can_start: boolean;
    is_overdue: boolean;
    days_overdue: number;
    estimated_completion?: string;
    predecessor_tasks_data: Task[];
    successor_tasks_data: Task[];
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    task: Task;
    kategoriOptions: Record<string, string>;
    statusOptions: Record<string, string>;
    qualityOptions: Record<string, string>;
}

export default function TaskShow({ project, task, kategoriOptions, statusOptions, qualityOptions }: Props) {
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
    const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
    const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Management', href: '/management' },
        { title: 'Projects', href: '/management/projects' },
        { title: project.nama_project, href: `/management/projects/${project.id}` },
        { title: 'Tasks', href: `/management/projects/${project.id}/progress` },
        { title: task.nama_task, href: '#' },
    ];

    const { data: progressData, setData: setProgressData, post: postProgress, processing: processingProgress } = useForm({
        progress_percentage: task.progress_percentage,
        catatan_progress: task.catatan_progress || '',
    });

    const { data: qualityData, setData: setQualityData, post: postQuality, processing: processingQuality } = useForm({
        quality_status: task.quality_status,
        catatan_quality: task.catatan_quality || '',
    });

    const { data: photoData, setData: setPhotoData, post: postPhoto, processing: processingPhoto } = useForm({
        photos: [] as File[],
        description: '',
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; color: string }> = {
            not_started: { variant: 'secondary', icon: Clock, color: 'bg-gray-500' },
            in_progress: { variant: 'default', icon: PlayCircle, color: 'bg-blue-500' },
            completed: { variant: 'default', icon: CheckCircle, color: 'bg-green-500' },
            on_hold: { variant: 'secondary', icon: Clock, color: 'bg-yellow-500' },
            cancelled: { variant: 'destructive', icon: X, color: 'bg-red-500' },
        };

        const config = variants[status] || variants.not_started;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {statusOptions[status] || status}
            </Badge>
        );
    };

    const getQualityBadge = (quality: string) => {
        const variants: Record<string, any> = {
            pending: 'secondary',
            passed: 'default',
            failed: 'destructive',
            rework: 'outline',
        };

        return (
            <Badge variant={variants[quality] || 'secondary'}>
                {qualityOptions[quality] || quality}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateOnly = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleStartTask = () => {
        router.post(route('projects.tasks.start', [project.id, task.id]), {}, {
            onSuccess: () => {
                toast.success('Task berhasil dimulai');
                router.reload({ only: ['task'] });
            },
            onError: () => {
                toast.error('Gagal memulai task');
            },
        });
    };

    const handleCompleteTask = () => {
        router.post(route('projects.tasks.complete', [project.id, task.id]), {}, {
            onSuccess: () => {
                toast.success('Task berhasil diselesaikan');
                router.reload({ only: ['task'] });
            },
            onError: () => {
                toast.error('Gagal menyelesaikan task');
            },
        });
    };

    const handleUpdateProgress = () => {
        postProgress(route('projects.tasks.update-progress', [project.id, task.id]), {
            onSuccess: () => {
                toast.success('Progress berhasil diupdate');
                setIsProgressDialogOpen(false);
                router.reload({ only: ['task'] });
            },
            onError: () => {
                toast.error('Gagal mengupdate progress');
            },
        });
    };

    const handleQualityCheck = () => {
        postQuality(route('projects.tasks.quality-check', [project.id, task.id]), {
            onSuccess: () => {
                toast.success('Quality check berhasil diupdate');
                setIsQualityDialogOpen(false);
                router.reload({ only: ['task'] });
            },
            onError: () => {
                toast.error('Gagal mengupdate quality check');
            },
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            toast.error('Maksimal 5 foto yang bisa diupload');
            return;
        }

        setPhotoData('photos', files);

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const handleUploadPhotos = () => {
        const formData = new FormData();
        
        photoData.photos.forEach((file, index) => {
            formData.append(`photos[${index}]`, file);
        });
        
        if (photoData.description) {
            formData.append('description', photoData.description);
        }

        postPhoto(route('projects.tasks.upload-photo', [project.id, task.id]), {
            data: formData,
            onSuccess: () => {
                toast.success('Foto berhasil diupload');
                setIsPhotoDialogOpen(false);
                setPreviewImages([]);
                setPhotoData({ photos: [], description: '' });
                router.reload({ only: ['task'] });
            },
            onError: () => {
                toast.error('Gagal mengupload foto');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${task.nama_task} - Task Detail`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('projects.tasks.index', project.id))}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Tasks
                            </Button>
                            <Badge variant="outline" className="text-xs">
                                {task.task_code}
                            </Badge>
                            {task.is_critical && (
                                <Badge variant="destructive" className="text-xs">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Critical Path
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{task.nama_task}</h1>
                        <p className="text-muted-foreground">
                            {kategoriOptions[task.kategori_task]} • {project.nama_project}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {task.can_start && task.status_task === 'not_started' && (
                            <Button onClick={handleStartTask}>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Mulai Task
                            </Button>
                        )}
                        
                        {task.status_task === 'in_progress' && (
                            <>
                                <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Update Progress
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Update Progress</DialogTitle>
                                            <DialogDescription>
                                                Update progress percentage dan catatan
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Progress (%)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={progressData.progress_percentage}
                                                    onChange={(e) => setProgressData('progress_percentage', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Catatan Progress</Label>
                                                <Textarea
                                                    value={progressData.catatan_progress}
                                                    onChange={(e) => setProgressData('catatan_progress', e.target.value)}
                                                    placeholder="Tambahkan catatan progress..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                                                Batal
                                            </Button>
                                            <Button onClick={handleUpdateProgress} disabled={processingProgress}>
                                                {processingProgress ? 'Menyimpan...' : 'Update Progress'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                
                                <Button onClick={handleCompleteTask}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Selesaikan Task
                                </Button>
                            </>
                        )}

                        <Dialog open={isQualityDialogOpen} onOpenChange={setIsQualityDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Star className="mr-2 h-4 w-4" />
                                    Quality Check
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Quality Check</DialogTitle>
                                    <DialogDescription>
                                        Update status quality check untuk task ini
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status Quality</Label>
                                        <Select 
                                            value={qualityData.quality_status} 
                                            onValueChange={(value) => setQualityData('quality_status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(qualityOptions).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Catatan Quality</Label>
                                        <Textarea
                                            value={qualityData.catatan_quality}
                                            onChange={(e) => setQualityData('catatan_quality', e.target.value)}
                                            placeholder="Catatan hasil quality check..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsQualityDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button onClick={handleQualityCheck} disabled={processingQuality}>
                                        {processingQuality ? 'Menyimpan...' : 'Update Quality'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Upload Foto
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Upload Foto Progress</DialogTitle>
                                    <DialogDescription>
                                        Upload foto dokumentasi progress task (maksimal 5 foto)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Pilih Foto</Label>
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                    
                                    {previewImages.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Preview</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {previewImages.map((src, index) => (
                                                    <img
                                                        key={index}
                                                        src={src}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded border"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <Label>Deskripsi (Opsional)</Label>
                                        <Textarea
                                            value={photoData.description}
                                            onChange={(e) => setPhotoData('description', e.target.value)}
                                            placeholder="Deskripsi foto progress..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button 
                                        onClick={handleUploadPhotos} 
                                        disabled={processingPhoto || photoData.photos.length === 0}
                                    >
                                        {processingPhoto ? 'Uploading...' : 'Upload Foto'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Status Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {getStatusBadge(task.status_task)}
                                {getQualityBadge(task.quality_status)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{task.progress_percentage}%</div>
                            <Progress value={task.progress_percentage} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Durasi</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{task.durasi_hari}</div>
                            <p className="text-xs text-muted-foreground">hari kerja</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{formatCurrency(task.estimasi_biaya_task)}</div>
                            {task.biaya_aktual_task > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Aktual: {formatCurrency(task.biaya_aktual_task)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Alert for Overdue */}
                {task.is_overdue && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-medium">
                                    Task terlambat {task.days_overdue} hari dari jadwal
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Task Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {task.deskripsi_task && (
                                <div>
                                    <Label className="text-sm font-medium">Deskripsi</Label>
                                    <p className="mt-1 text-sm text-muted-foreground">{task.deskripsi_task}</p>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium">Kategori</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: task.warna_display }}
                                        />
                                        <span className="text-sm">{kategoriOptions[task.kategori_task]}</span>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Urutan</Label>
                                    <p className="mt-1 text-sm">{task.urutan_tampil}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium">Durasi</Label>
                                    <p className="mt-1 text-sm">{task.durasi_hari} hari ({task.durasi_jam} jam/hari)</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Float</Label>
                                    <p className="mt-1 text-sm">
                                        {task.total_float} hari
                                        {task.is_critical && (
                                            <Badge variant="destructive" className="ml-2 text-xs">
                                                Critical
                                            </Badge>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Label className="text-sm font-medium">CPM Analysis</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md p-4">
                                            <div className="space-y-2">
                                                <div className="font-semibold">Critical Path Method (CPM)</div>
                                                <div className="text-sm space-y-1">
                                                    <div><strong>Early Start (ES):</strong> Waktu paling awal task dapat dimulai</div>
                                                    <div><strong>Early Finish (EF):</strong> Waktu paling awal task dapat selesai</div>
                                                    <div><strong>Late Start (LS):</strong> Waktu paling akhir task dapat dimulai tanpa menunda project</div>
                                                    <div><strong>Late Finish (LF):</strong> Waktu paling akhir task dapat selesai</div>
                                                    <div><strong>Total Float:</strong> Slack time / waktu fleksibel yang tersedia</div>
                                                    <div className="pt-2 border-t text-red-600 font-medium">
                                                        Task dengan Float = 0 ada di Critical Path
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Early Start:</span>
                                                <span className="font-medium">Hari {task.early_start}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Early Finish:</span>
                                                <span className="font-medium">Hari {task.early_finish}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Late Start:</span>
                                                <span className="font-medium">Hari {task.late_start}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Late Finish:</span>
                                                <span className="font-medium">Hari {task.late_finish}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Total Float (Slack Time):</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${task.total_float === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {task.total_float} hari
                                                </span>
                                                {task.is_critical && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        <Target className="h-3 w-3 mr-1" />
                                                        Critical Path
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {task.total_float === 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                                                <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Critical Path - Deadline Alert
                                                </div>
                                                <div className="space-y-1 text-xs text-red-600">
                                                    <p>⚠️ <strong>Task ini ada di Critical Path!</strong></p>
                                                    <p>📅 <strong>Harus selesai di Hari {task.late_finish}</strong> untuk tidak menunda project</p>
                                                    <p>🚫 Tidak boleh ditunda sama sekali (Float = 0)</p>
                                                    <p>⏰ Jika terlambat, seluruh project akan terlambat</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {task.total_float > 0 && task.total_float <= 2 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                                                <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm mb-2">
                                                    <Clock className="h-4 w-4" />
                                                    Near Critical - Schedule Warning
                                                </div>
                                                <div className="space-y-1 text-xs text-yellow-600">
                                                    <p>⚡ <strong>Task mendekati Critical Path!</strong></p>
                                                    <p>📅 <strong>Mulai maksimal di Hari {task.late_start}</strong></p>
                                                    <p>⏱️ Fleksibilitas hanya {task.total_float} hari</p>
                                                    <p>⚠️ Perlu monitoring ketat untuk menghindari keterlambatan</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {task.total_float > 2 && (
                                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                                                <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Flexible Schedule
                                                </div>
                                                <div className="space-y-1 text-xs text-green-600">
                                                    <p>✅ <strong>Task memiliki fleksibilitas tinggi</strong></p>
                                                    <p>📅 <strong>Dapat dimulai kapan saja sebelum Hari {task.late_start}</strong></p>
                                                    <p>⏰ Fleksibilitas: {task.total_float} hari</p>
                                                    <p>💡 Dapat dijadwalkan ulang sesuai kebutuhan resource</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resources & Team */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Resources & Team
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {task.pic_pengerjaan && (
                                <div>
                                    <Label className="text-sm font-medium">PIC (Person In Charge)</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{task.pic_pengerjaan}</span>
                                    </div>
                                </div>
                            )}

                            {task.team_pengerjaan && task.team_pengerjaan.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium">Tim Pengerjaan</Label>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {task.team_pengerjaan.map((member, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {member}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {task.peralatan_dibutuhkan && (
                                <div>
                                    <Label className="text-sm font-medium">Peralatan Dibutuhkan</Label>
                                    <div className="mt-1 flex items-start gap-2">
                                        <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-sm">{task.peralatan_dibutuhkan}</span>
                                    </div>
                                </div>
                            )}

                            {task.material_dibutuhkan && (
                                <div>
                                    <Label className="text-sm font-medium">Material Dibutuhkan</Label>
                                    <div className="mt-1 flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-sm">{task.material_dibutuhkan}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Schedule & Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Jadwal & Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rencana Mulai:</span>
                                        <span>{formatDateOnly(task.tanggal_mulai_rencana)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rencana Selesai:</span>
                                        <span>{formatDateOnly(task.tanggal_selesai_rencana)}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Aktual Mulai:</span>
                                        <span>{formatDate(task.tanggal_mulai_aktual)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Aktual Selesai:</span>
                                        <span>{formatDate(task.tanggal_selesai_aktual)}</span>
                                    </div>
                                </div>

                                {task.estimated_completion && (
                                    <>
                                        <Separator />
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Estimasi Selesai:</span>
                                                <span>{formatDateOnly(task.estimated_completion)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Notes & Quality */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Catatan & Quality
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {task.catatan_progress && (
                                <div>
                                    <Label className="text-sm font-medium">Catatan Progress</Label>
                                    <p className="mt-1 text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                        {task.catatan_progress}
                                    </p>
                                </div>
                            )}

                            {task.catatan_quality && (
                                <div>
                                    <Label className="text-sm font-medium">Catatan Quality</Label>
                                    <p className="mt-1 text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                        {task.catatan_quality}
                                    </p>
                                </div>
                            )}

                            {!task.catatan_progress && !task.catatan_quality && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Belum ada catatan untuk task ini
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Dependencies */}
                {(task.predecessor_tasks_data.length > 0 || task.successor_tasks_data.length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Task Dependencies</CardTitle>
                            <CardDescription>
                                Task yang harus diselesaikan sebelum/sesudah task ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Predecessor Tasks */}
                                <div>
                                    <Label className="text-sm font-medium">Predecessor Tasks</Label>
                                    <div className="mt-2 space-y-2">
                                        {task.predecessor_tasks_data.length > 0 ? (
                                            task.predecessor_tasks_data.map((predecessor) => (
                                                <Link
                                                    key={predecessor.id}
                                                    href={route('projects.tasks.show', [project.id, predecessor.id])}
                                                    className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: predecessor.warna_display }}
                                                            />
                                                            <span className="font-medium">{predecessor.nama_task}</span>
                                                        </div>
                                                        {getStatusBadge(predecessor.status_task)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {predecessor.task_code}
                                                    </p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Tidak ada predecessor</p>
                                        )}
                                    </div>
                                </div>

                                {/* Successor Tasks */}
                                <div>
                                    <Label className="text-sm font-medium">Successor Tasks</Label>
                                    <div className="mt-2 space-y-2">
                                        {task.successor_tasks_data.length > 0 ? (
                                            task.successor_tasks_data.map((successor) => (
                                                <Link
                                                    key={successor.id}
                                                    href={route('projects.tasks.show', [project.id, successor.id])}
                                                    className="block p-3 border rounded hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: successor.warna_display }}
                                                            />
                                                            <span className="font-medium">{successor.nama_task}</span>
                                                        </div>
                                                        {getStatusBadge(successor.status_task)}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {successor.task_code}
                                                    </p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Tidak ada successor</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Photos */}
                {task.foto_progress && task.foto_progress.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Dokumentasi Progress
                            </CardTitle>
                            <CardDescription>
                                Foto-foto dokumentasi progress task
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {task.foto_progress.map((foto, index) => (
                                    <div
                                        key={index}
                                        className="relative cursor-pointer group"
                                        onClick={() => setSelectedImage(`/storage/${foto}`)}
                                    >
                                        <img
                                            src={`/storage/${foto}`}
                                            alt={`Progress ${index + 1}`}
                                            className="w-full h-32 object-cover rounded border group-hover:opacity-75 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Image Preview Dialog */}
                {selectedImage && (
                    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Preview Foto</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="max-w-full max-h-[70vh] object-contain rounded"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Task History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task History</CardTitle>
                        <CardDescription>
                            Timeline aktivitas task
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 border rounded">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium">Task dibuat</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(task.created_at)}</p>
                                </div>
                            </div>
                            
                            {task.tanggal_mulai_aktual && (
                                <div className="flex items-center gap-3 p-3 border rounded">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Task dimulai</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(task.tanggal_mulai_aktual)}</p>
                                    </div>
                                </div>
                            )}
                            
                            {task.tanggal_selesai_aktual && (
                                <div className="flex items-center gap-3 p-3 border rounded">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium">Task selesai</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(task.tanggal_selesai_aktual)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}