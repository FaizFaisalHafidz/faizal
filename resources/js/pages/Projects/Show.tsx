import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Edit,
    FileText,
    Image as ImageIcon,
    Mail,
    MapPin,
    PauseCircle,
    Phone,
    PlayCircle,
    Plus,
    RefreshCw,
    Settings,
    TrendingUp,
    User,
    ZoomIn
} from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

interface Project {
    id: number;
    project_code: string;
    nama_project: string;
    deskripsi_project?: string;
    jenis_project: string;
    plat_nomor: string;
    nama_pemilik: string;
    no_telp_pemilik: string;
    email_pemilik?: string;
    alamat_pemilik?: string;
    jenis_kendaraan: string;
    merk_kendaraan: string;
    tipe_kendaraan: string;
    tahun_kendaraan?: string;
    warna_awal?: string;
    warna_target?: string;
    tanggal_masuk: string;
    tanggal_target_selesai: string;
    tanggal_selesai_aktual?: string;
    status_project: string;
    prioritas: string;
    estimasi_biaya: number;
    biaya_aktual: number;
    total_pembayaran: number;
    status_pembayaran: string;
    progress_percentage: number;
    total_durasi_hari: number;
    catatan_khusus?: string;
    catatan_internal?: string;
    foto_before?: string[];
    foto_after?: string[];
    created_at: string;
    updated_at: string;
}

interface Task {
    id: number;
    task_code: string;
    nama_task: string;
    deskripsi_task?: string;
    kategori_task: string;
    kategori_task_label: string;
    durasi_hari: number;
    early_start: number;
    early_finish: number;
    late_start: number;
    late_finish: number;
    total_float: number;
    is_critical: boolean;
    status_task: string;
    progress_percentage: number;
    warna_display: string;
    tanggal_mulai_rencana?: string;
    tanggal_selesai_rencana?: string;
    tanggal_mulai_aktual?: string;
    tanggal_selesai_aktual?: string;
    pic_pengerjaan?: string;
    quality_status: string;
    estimasi_biaya_task: number;
    biaya_aktual_task: number;
}

interface ProjectStats {
    total_tasks: number;
    completed_tasks: number;
    critical_tasks: number;
    days_remaining: number;
    is_overdue: boolean;
}

interface Props {
    project: Project;
    tasks: Task[];
    criticalPath: number[];
    projectStats: ProjectStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Management', href: '/management' },
    { title: 'Projects', href: '/management/projects' },
    { title: 'Detail Project', href: '#' },
];

export default function ShowProject({ project, tasks, criticalPath, projectStats }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    const { data, setData, post, processing } = useForm({
        status: project.status_project,
        catatan: '',
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; color: string }> = {
            draft: { variant: 'secondary', icon: PauseCircle, color: 'bg-gray-500' },
            confirmed: { variant: 'default', icon: CheckCircle, color: 'bg-blue-500' },
            in_progress: { variant: 'default', icon: PlayCircle, color: 'bg-orange-500' },
            completed: { variant: 'default', icon: CheckCircle, color: 'bg-green-500' },
            cancelled: { variant: 'destructive', icon: PauseCircle, color: 'bg-red-500' },
            on_hold: { variant: 'secondary', icon: PauseCircle, color: 'bg-yellow-500' },
        };

        const config = variants[status] || variants.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, { variant: any; color: string }> = {
            low: { variant: 'secondary', color: 'bg-gray-500' },
            normal: { variant: 'outline', color: 'bg-blue-500' },
            high: { variant: 'default', color: 'bg-orange-500' },
            urgent: { variant: 'destructive', color: 'bg-red-500' },
        };

        const config = variants[priority] || variants.normal;

        return (
            <Badge variant={config.variant}>
                {priority.toUpperCase()}
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleStatusUpdate = () => {
        post(route('projects.update-status', project.id), {
            onSuccess: () => {
                toast.success('Status project berhasil diupdate');
                setIsStatusDialogOpen(false);
                router.reload();
            },
            onError: () => {
                toast.error('Gagal mengupdate status');
            },
        });
    };

    const handleRecalculateCPM = () => {
        router.post(route('projects.recalculate-cpm', project.id), {}, {
            onSuccess: () => {
                toast.success('CPM berhasil dikalkulasi ulang');
                router.reload();
            },
            onError: () => {
                toast.error('Gagal mengkalkulasi CPM');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.nama_project} - Detail Project`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('projects.index'))}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                            <span className="text-sm text-muted-foreground">{project.project_code}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.nama_project}</h1>
                        <p className="text-muted-foreground">
                            {project.plat_nomor} • {project.merk_kendaraan} {project.tipe_kendaraan}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Update Status
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Status Project</DialogTitle>
                                    <DialogDescription>
                                        Ubah status project dan tambahkan catatan jika diperlukan
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Status Baru</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="on_hold">On Hold</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Catatan</Label>
                                        <Textarea
                                            value={data.catatan}
                                            onChange={(e) => setData('catatan', e.target.value)}
                                            placeholder="Catatan perubahan status..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button onClick={handleStatusUpdate} disabled={processing}>
                                            {processing ? 'Mengupdate...' : 'Update Status'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            onClick={handleRecalculateCPM}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Recalculate CPM
                        </Button>

                        <Button asChild>
                            <Link href={route('projects.edit', project.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Project
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Project Status Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status Project</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(project.status_project)}
                                {getPriorityBadge(project.prioritas)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold">{project.progress_percentage}%</div>
                                <Progress value={project.progress_percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {projectStats.completed_tasks} / {projectStats.total_tasks} tasks completed
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">
                                    {projectStats.is_overdue ? (
                                        <span className="text-red-600">
                                            {Math.abs(projectStats.days_remaining)} hari
                                        </span>
                                    ) : projectStats.days_remaining > 0 ? (
                                        <span>{projectStats.days_remaining} hari</span>
                                    ) : (
                                        <span className="text-green-600">Selesai</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {projectStats.is_overdue ? 'Terlambat' : 'Tersisa'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="text-xl font-bold">
                                    {formatCurrency(project.estimasi_biaya)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Paid: {formatCurrency(project.total_pembayaran)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline & Tasks</TabsTrigger>
                        <TabsTrigger value="documentation">Documentation</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Project Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Detail Project
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Nama Project</Label>
                                        <p className="mt-1">{project.nama_project}</p>
                                    </div>
                                    
                                    {project.deskripsi_project && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Deskripsi</Label>
                                            <p className="mt-1 text-sm">{project.deskripsi_project}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Jenis Project</Label>
                                            <p className="mt-1 capitalize">{project.jenis_project.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Prioritas</Label>
                                            <div className="mt-1">
                                                {getPriorityBadge(project.prioritas)}
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4" />
                                                <span>Masuk: {formatDate(project.tanggal_masuk)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4" />
                                                <span>Target: {formatDate(project.tanggal_target_selesai)}</span>
                                            </div>
                                            {project.tanggal_selesai_aktual && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>Selesai: {formatDate(project.tanggal_selesai_aktual)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {project.catatan_khusus && (
                                        <>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Catatan Khusus</Label>
                                                <p className="mt-1 text-sm">{project.catatan_khusus}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Vehicle & Owner Info */}
                            <div className="space-y-6">
                                {/* Vehicle Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Car className="h-5 w-5" />
                                            Informasi Kendaraan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Plat Nomor</Label>
                                                <p className="mt-1 font-semibold">{project.plat_nomor}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Jenis</Label>
                                                <p className="mt-1 capitalize">{project.jenis_kendaraan}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Merk</Label>
                                                <p className="mt-1">{project.merk_kendaraan}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Tipe</Label>
                                                <p className="mt-1">{project.tipe_kendaraan}</p>
                                            </div>
                                        </div>

                                        {project.tahun_kendaraan && (
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Tahun</Label>
                                                <p className="mt-1">{project.tahun_kendaraan}</p>
                                            </div>
                                        )}

                                        {(project.warna_awal || project.warna_target) && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {project.warna_awal && (
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Warna Awal</Label>
                                                        <p className="mt-1">{project.warna_awal}</p>
                                                    </div>
                                                )}
                                                {project.warna_target && (
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Warna Target</Label>
                                                        <p className="mt-1">{project.warna_target}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Owner Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Informasi Pemilik
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Nama</Label>
                                            <p className="mt-1 font-semibold">{project.nama_pemilik}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{project.no_telp_pemilik}</span>
                                            </div>
                                            
                                            {project.email_pemilik && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{project.email_pemilik}</span>
                                                </div>
                                            )}
                                            
                                            {project.alamat_pemilik && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                                    <span className="text-sm">{project.alamat_pemilik}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Budget Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Informasi Budget
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex justify-between">
                                                <Label className="text-sm font-medium text-muted-foreground">Estimasi</Label>
                                                <span className="font-semibold">{formatCurrency(project.estimasi_biaya)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <Label className="text-sm font-medium text-muted-foreground">Biaya Aktual</Label>
                                                <span>{formatCurrency(project.biaya_aktual)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <Label className="text-sm font-medium text-muted-foreground">Total Bayar</Label>
                                                <span className="text-green-600 font-semibold">{formatCurrency(project.total_pembayaran)}</span>
                                            </div>
                                            
                                            <Separator />
                                            
                                            <div className="flex justify-between">
                                                <Label className="text-sm font-medium text-muted-foreground">Status Bayar</Label>
                                                <Badge variant="outline" className="capitalize">
                                                    {project.status_pembayaran.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Project Timeline</h3>
                                <p className="text-sm text-muted-foreground">
                                    Total durasi: {project.total_durasi_hari} hari • Critical tasks: {projectStats.critical_tasks}
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={route('projects.tasks.index', project.id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Kelola Tasks
                                </Link>
                            </Button>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {tasks.map((task, index) => (
                                        <div key={task.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: task.warna_display }}
                                                    />
                                                    
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{task.nama_task}</h4>
                                                            {task.is_critical && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Critical
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span>{task.kategori_task_label}</span>
                                                            <span>•</span>
                                                            <span>{task.durasi_hari} hari</span>
                                                            <span>•</span>
                                                            <span>ES: {task.early_start}, EF: {task.early_finish}</span>
                                                            {task.total_float > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Float: {task.total_float}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {task.pic_pengerjaan && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <User className="h-3 w-3" />
                                                                <span>PIC: {task.pic_pengerjaan}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={task.progress_percentage} className="w-20 h-2" />
                                                            <span className="text-sm font-medium w-10">
                                                                {task.progress_percentage}%
                                                            </span>
                                                        </div>
                                                        
                                                        <Badge 
                                                            variant={
                                                                task.status_task === 'completed' ? 'default' :
                                                                task.status_task === 'in_progress' ? 'default' :
                                                                task.status_task === 'on_hold' ? 'secondary' :
                                                                'outline'
                                                            }
                                                            className="mt-1 text-xs"
                                                        >
                                                            {task.status_task.replace('_', ' ')}
                                                        </Badge>
                                                    </div>

                                                    {task.estimasi_biaya_task > 0 && (
                                                        <div className="text-right text-sm">
                                                            <div className="font-medium">
                                                                {formatCurrency(task.estimasi_biaya_task)}
                                                            </div>
                                                            {task.biaya_aktual_task > 0 && (
                                                                <div className="text-muted-foreground">
                                                                    Aktual: {formatCurrency(task.biaya_aktual_task)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documentation Tab */}
                    <TabsContent value="documentation" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Before Photos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Foto Sebelum
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.foto_before && project.foto_before.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {project.foto_before.map((foto, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={`/storage/${foto}`}
                                                        alt={`Before ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(`/storage/${foto}`)}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Belum ada foto sebelum</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* After Photos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Foto Sesudah
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {project.foto_after && project.foto_after.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {project.foto_after.map((foto, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={`/storage/${foto}`}
                                                        alt={`After ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(`/storage/${foto}`)}
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>Belum ada foto sesudah</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Internal Notes */}
                        {project.catatan_internal && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Catatan Internal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{project.catatan_internal}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Image Preview Modal */}
                {selectedImage && (
                    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                        <DialogContent className="max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Preview Foto</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="max-w-full max-h-[70vh] object-contain"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button asChild variant="outline">
                                    <a href={selectedImage} download target="_blank">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </a>
                                </Button>
                                <Button onClick={() => setSelectedImage(null)}>
                                    Tutup
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}