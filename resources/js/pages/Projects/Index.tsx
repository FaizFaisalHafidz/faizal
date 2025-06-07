import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Bike,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    PauseCircle,
    PlayCircle,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    Truck
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
    jenis_kendaraan: string;
    merk_kendaraan: string;
    tipe_kendaraan: string;
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
    days_remaining: number;
    is_overdue: boolean;
    total_tasks: number;
    completed_tasks: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    projects: {
        data: Project[];
        links: any;
        meta: any;
    };
    filters: {
        status?: string;
        priority?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
    statusOptions: Record<string, string>;
    priorityOptions: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Management', href: '/management' },
    { title: 'Projects', href: '/management/projects' },
];

export default function ProjectsIndex({ projects, filters, statusOptions, priorityOptions }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Statistics
    const stats = useMemo(() => {
        const data = projects.data;
        return {
            total: data.length,
            active: data.filter(p => ['confirmed', 'in_progress'].includes(p.status_project)).length,
            completed: data.filter(p => p.status_project === 'completed').length,
            overdue: data.filter(p => p.is_overdue).length,
        };
    }, [projects.data]);

    const handleSearch = () => {
        router.get(route('projects.index'), {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus project ini?')) {
            router.delete(route('projects.destroy', id), {
                onSuccess: () => toast.success('Project berhasil dihapus'),
                onError: () => toast.error('Gagal menghapus project'),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any }> = {
            draft: { variant: 'secondary', icon: PauseCircle },
            confirmed: { variant: 'default', icon: CheckCircle },
            in_progress: { variant: 'default', icon: PlayCircle },
            completed: { variant: 'default', icon: CheckCircle },
            cancelled: { variant: 'destructive', icon: PauseCircle },
            on_hold: { variant: 'secondary', icon: PauseCircle },
        };

        const config = variants[status] || variants.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {statusOptions[status]}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, string> = {
            low: 'secondary',
            normal: 'outline',
            high: 'default',
            urgent: 'destructive',
        };

        return (
            <Badge variant={variants[priority] as any}>
                {priorityOptions[priority]}
            </Badge>
        );
    };

    const getVehicleIcon = (type: string) => {
        const icons: Record<string, any> = {
            motor: Bike,
            mobil: Car,
            truck: Truck,
        };
        return icons[type] || Car;
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
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Management" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
                        <p className="text-muted-foreground">
                            Kelola semua project kendaraan dengan sistem CPM terintegrasi
                        </p>
                    </div>
                    <Link href={route('projects.create')}>
                        <Button size="lg" className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Project Baru
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Semua project</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">Sedang dikerjakan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Selesai dikerjakan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">Terlambat dari jadwal</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter & Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Search Projects</label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari berdasarkan nama project, kode, plat nomor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {Object.entries(statusOptions).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full md:w-48">
                                <label className="text-sm font-medium">Prioritas</label>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Prioritas</SelectItem>
                                        {Object.entries(priorityOptions).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleSearch} className="w-full md:w-auto">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* View Toggle */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {projects.data.length} dari {projects.meta?.total || 0} projects
                    </p>
                    
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                        <TabsList>
                            <TabsTrigger value="grid">Grid</TabsTrigger>
                            <TabsTrigger value="list">List</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Projects Content */}
                <Tabs value={viewMode} className="space-y-4">
                    {/* Grid View */}
                    <TabsContent value="grid" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.data.map((project) => {
                                const VehicleIcon = getVehicleIcon(project.jenis_kendaraan);
                                
                                return (
                                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg leading-tight">
                                                        {project.nama_project}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <VehicleIcon className="h-4 w-4" />
                                                        <span>{project.plat_nomor}</span>
                                                        <span>•</span>
                                                        <span>{project.merk_kendaraan}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {project.project_code}
                                                    </p>
                                                </div>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('projects.show', project.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Detail
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('projects.edit', project.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(project.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Status & Priority */}
                                            <div className="flex items-center justify-between">
                                                {getStatusBadge(project.status_project)}
                                                {getPriorityBadge(project.prioritas)}
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{project.progress_percentage}%</span>
                                                </div>
                                                <Progress value={project.progress_percentage} className="h-2" />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{project.completed_tasks} / {project.total_tasks} tasks</span>
                                                    <span>
                                                        {project.is_overdue ? (
                                                            <span className="text-red-600 flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                {Math.abs(project.days_remaining)} hari terlambat
                                                            </span>
                                                        ) : project.days_remaining > 0 ? (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {project.days_remaining} hari lagi
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-600">Selesai</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Owner Info */}
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium">{project.nama_pemilik}</p>
                                                <p className="text-muted-foreground">{project.no_telp_pemilik}</p>
                                            </div>

                                            {/* Timeline */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Masuk: {formatDate(project.tanggal_masuk)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Target: {formatDate(project.tanggal_target_selesai)}</span>
                                                </div>
                                            </div>

                                            {/* Budget */}
                                            <div className="pt-2 border-t">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Estimasi:</span>
                                                    <span className="font-medium">{formatCurrency(project.estimasi_biaya)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* List View */}
                    <TabsContent value="list" className="space-y-4">
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {projects.data.map((project) => {
                                        const VehicleIcon = getVehicleIcon(project.jenis_kendaraan);
                                        
                                        return (
                                            <div key={project.id} className="p-6 hover:bg-muted/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <VehicleIcon className="h-8 w-8 text-muted-foreground" />
                                                        </div>
                                                        
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-lg font-semibold">{project.nama_project}</h3>
                                                                {getStatusBadge(project.status_project)}
                                                                {getPriorityBadge(project.prioritas)}
                                                            </div>
                                                            
                                                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>{project.project_code}</span>
                                                                <span>•</span>
                                                                <span>{project.plat_nomor}</span>
                                                                <span>•</span>
                                                                <span>{project.merk_kendaraan} {project.tipe_kendaraan}</span>
                                                                <span>•</span>
                                                                <span>{project.nama_pemilik}</span>
                                                            </div>

                                                            <div className="mt-2 flex items-center gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Progress value={project.progress_percentage} className="w-24 h-2" />
                                                                    <span className="text-sm">{project.progress_percentage}%</span>
                                                                </div>
                                                                
                                                                <div className="text-sm text-muted-foreground">
                                                                    {project.completed_tasks} / {project.total_tasks} tasks
                                                                </div>

                                                                <div className="text-sm">
                                                                    {project.is_overdue ? (
                                                                        <span className="text-red-600 flex items-center gap-1">
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {Math.abs(project.days_remaining)} hari terlambat
                                                                        </span>
                                                                    ) : project.days_remaining > 0 ? (
                                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                                            <Clock className="h-3 w-3" />
                                                                            {project.days_remaining} hari lagi
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-green-600">Selesai</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right text-sm">
                                                            <div className="font-medium">{formatCurrency(project.estimasi_biaya)}</div>
                                                            <div className="text-muted-foreground">Target: {formatDate(project.tanggal_target_selesai)}</div>
                                                        </div>
                                                        
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('projects.show', project.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Detail
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('projects.edit', project.id)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="text-red-600"
                                                                    onClick={() => handleDelete(project.id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Pagination */}
                {projects.links && (
                    <div className="flex items-center justify-center space-x-2">
                        {projects.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}