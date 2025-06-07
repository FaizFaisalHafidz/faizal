import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    Activity,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    ChevronDown,
    Clock,
    Clock1,
    Eye,
    Kanban,
    List,
    MoreHorizontal,
    PauseCircle,
    Play,
    PlayCircle,
    Plus,
    Search,
    Target,
    Trash2,
    User,
    Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
    created_at: string;
    updated_at: string;
}

interface Props {
    project: Project;
    tasks: Task[];
    kategoriOptions: Record<string, string>;
    statusOptions: Record<string, string>;
    qualityOptions: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Management', href: '/management' },
    { title: 'Projects', href: '/management/projects' },
    { title: 'Tasks', href: '#' },
];

export default function TasksIndex({ project, tasks, kategoriOptions, statusOptions, qualityOptions }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isStartTaskDialogOpen, setIsStartTaskDialogOpen] = useState(false);
    const [selectedTaskForAction, setSelectedTaskForAction] = useState<Task | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: processingCreate, reset: resetCreate } = useForm({
        nama_task: '',
        deskripsi_task: '',
        kategori_task: '',
        durasi_hari: 1,
        durasi_jam: 8,
        predecessor_tasks: [],
        pic_pengerjaan: '',
        estimasi_biaya_task: 0,
        warna_display: '#FF4433',
    });

    const { data: actionData, setData: setActionData, post: postAction, processing: processingAction } = useForm({
        task_ids: [],
        action: '',
        data: {},
    });

    // Filtered and sorted tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.nama_task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.task_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (task.pic_pengerjaan?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
            
            const matchesStatus = statusFilter === 'all' || task.status_task === statusFilter;
            const matchesCategory = categoryFilter === 'all' || task.kategori_task === categoryFilter;
            const matchesCritical = !showCriticalOnly || task.is_critical;

            return matchesSearch && matchesStatus && matchesCategory && matchesCritical;
        }).sort((a, b) => a.urutan_tampil - b.urutan_tampil);
    }, [tasks, searchTerm, statusFilter, categoryFilter, showCriticalOnly]);

    // Task statistics
    const taskStats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status_task === 'completed').length;
        const inProgress = tasks.filter(t => t.status_task === 'in_progress').length;
        const notStarted = tasks.filter(t => t.status_task === 'not_started').length;
        const critical = tasks.filter(t => t.is_critical).length;
        const overdue = tasks.filter(t => t.is_overdue).length;
        const canStart = tasks.filter(t => t.can_start && t.status_task === 'not_started').length;

        return {
            total,
            completed,
            inProgress,
            notStarted,
            critical,
            overdue,
            canStart
        };
    }, [tasks]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any; color: string }> = {
            not_started: { variant: 'secondary', icon: PauseCircle, color: 'bg-gray-500' },
            in_progress: { variant: 'default', icon: PlayCircle, color: 'bg-blue-500' },
            completed: { variant: 'default', icon: CheckCircle, color: 'bg-green-500' },
            on_hold: { variant: 'secondary', icon: PauseCircle, color: 'bg-yellow-500' },
            cancelled: { variant: 'destructive', icon: PauseCircle, color: 'bg-red-500' },
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
            month: 'short',
            year: 'numeric',
        });
    };

    const handleCreateTask = () => {
        postCreate(route('projects.tasks.store', project.id), {
            onSuccess: () => {
                toast.success('Task berhasil dibuat');
                setIsCreateDialogOpen(false);
                resetCreate();
                router.reload({ only: ['tasks'] });
            },
            onError: (errors) => {
                toast.error('Gagal membuat task');
                console.error(errors);
            },
        });
    };

    const handleStartTask = (task: Task) => {
        router.post(route('projects.tasks.start', [project.id, task.id]), {}, {
            onSuccess: () => {
                toast.success('Task berhasil dimulai');
                router.reload({ only: ['tasks'] });
            },
            onError: () => {
                toast.error('Gagal memulai task');
            },
        });
    };

    const handleCompleteTask = (task: Task) => {
        router.post(route('projects.tasks.complete', [project.id, task.id]), {}, {
            onSuccess: () => {
                toast.success('Task berhasil diselesaikan');
                router.reload({ only: ['tasks'] });
            },
            onError: () => {
                toast.error('Gagal menyelesaikan task');
            },
        });
    };

    const handleDeleteTask = (task: Task) => {
        if (confirm('Apakah Anda yakin ingin menghapus task ini?')) {
            router.delete(route('projects.tasks.destroy', [project.id, task.id]), {
                onSuccess: () => {
                    toast.success('Task berhasil dihapus');
                    router.reload({ only: ['tasks'] });
                },
                onError: () => {
                    toast.error('Gagal menghapus task');
                },
            });
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedTasks.length === 0) {
            toast.error('Pilih task terlebih dahulu');
            return;
        }

        setActionData({
            task_ids: selectedTasks,
            action: action,
            data: {},
        });

        postAction(route('projects.tasks.bulk-update', project.id), {
            onSuccess: () => {
                toast.success('Bulk action berhasil');
                setSelectedTasks([]);
                router.reload({ only: ['tasks'] });
            },
            onError: () => {
                toast.error('Gagal melakukan bulk action');
            },
        });
    };

    const handleSelectTask = (taskId: number) => {
        setSelectedTasks(prev => 
            prev.includes(taskId) 
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTasks.length === filteredTasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(filteredTasks.map(task => task.id));
        }
    };

    const TaskCard = ({ task }: { task: Task }) => (
        <Card className={`transition-all duration-200 hover:shadow-md ${task.is_critical ? 'border-red-200 bg-red-50/30' : ''} ${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleSelectTask(task.id)}
                            className="rounded border-gray-300"
                        />
                        <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: task.warna_display }}
                        />
                        <div>
                            <CardTitle className="text-base font-semibold">{task.nama_task}</CardTitle>
                            <CardDescription className="text-sm">
                                {task.task_code} • {kategoriOptions[task.kategori_task]}
                            </CardDescription>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {task.is_critical && (
                            <Badge variant="destructive" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Critical
                            </Badge>
                        )}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('projects.tasks.show', [project.id, task.id])}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Detail
                                    </Link>
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem asChild>
                                    <Link href={route('projects.tasks.edit', [project.id, task.id])}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem> */}
                                <DropdownMenuSeparator />
                                {task.can_start && task.status_task === 'not_started' && (
                                    <DropdownMenuItem onClick={() => handleStartTask(task)}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Task
                                    </DropdownMenuItem>
                                )}
                                {task.status_task === 'in_progress' && (
                                    <DropdownMenuItem onClick={() => handleCompleteTask(task)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Complete
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => handleDeleteTask(task)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {task.deskripsi_task && (
                    <p className="text-sm text-muted-foreground">{task.deskripsi_task}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{task.durasi_hari} hari</span>
                        </div>
                        {task.pic_pengerjaan && (
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{task.pic_pengerjaan}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {getStatusBadge(task.status_task)}
                        {getQualityBadge(task.quality_status)}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{task.progress_percentage}%</span>
                    </div>
                    <Progress value={task.progress_percentage} className="h-2" />
                </div>

                {task.is_overdue && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Terlambat {task.days_overdue} hari</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ES: {task.early_start} | EF: {task.early_finish}</span>
                    {task.total_float > 0 && (
                        <span>Float: {task.total_float}</span>
                    )}
                </div>

                {task.estimasi_biaya_task > 0 && (
                    <div className="text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium">{formatCurrency(task.estimasi_biaya_task)}</span>
                        </div>
                        {task.biaya_aktual_task > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Aktual:</span>
                                <span>{formatCurrency(task.biaya_aktual_task)}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.nama_project} - Tasks Management`} />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('projects.show', project.id))}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Project
                            </Button>
                            <span className="text-sm text-muted-foreground">{project.project_code}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
                        <p className="text-muted-foreground">{project.nama_project}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Tambah Task Baru</DialogTitle>
                                    <DialogDescription>
                                        Buat task baru untuk project ini
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Task</Label>
                                            <Input
                                                value={createData.nama_task}
                                                onChange={(e) => setCreateData('nama_task', e.target.value)}
                                                placeholder="Masukkan nama task..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kategori</Label>
                                            <Select value={createData.kategori_task} onValueChange={(value) => setCreateData('kategori_task', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(kategoriOptions).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Deskripsi</Label>
                                        <Textarea
                                            value={createData.deskripsi_task}
                                            onChange={(e) => setCreateData('deskripsi_task', e.target.value)}
                                            placeholder="Deskripsi task..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Durasi (Hari)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={createData.durasi_hari}
                                                onChange={(e) => setCreateData('durasi_hari', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>PIC</Label>
                                            <Input
                                                value={createData.pic_pengerjaan}
                                                onChange={(e) => setCreateData('pic_pengerjaan', e.target.value)}
                                                placeholder="Penanggung jawab"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Warna</Label>
                                            <Input
                                                type="color"
                                                value={createData.warna_display}
                                                onChange={(e) => setCreateData('warna_display', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Estimasi Biaya</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={createData.estimasi_biaya_task}
                                            onChange={(e) => setCreateData('estimasi_biaya_task', parseFloat(e.target.value))}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button onClick={handleCreateTask} disabled={processingCreate}>
                                        {processingCreate ? 'Menyimpan...' : 'Simpan Task'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <List className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{taskStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {taskStats.completed} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
                            <p className="text-xs text-muted-foreground">
                                {taskStats.canStart} can start
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical Path</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{taskStats.critical}</div>
                            <p className="text-xs text-muted-foreground">
                                Critical tasks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                            <p className="text-xs text-muted-foreground">
                                Need attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Controls */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>
                                
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {Object.entries(statusOptions).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {Object.entries(kategoriOptions).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant={showCriticalOnly ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Critical Only
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    {selectedTasks.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
                                </Button>

                                {selectedTasks.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                Bulk Actions ({selectedTasks.length})
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleBulkAction('start')}>
                                                <Play className="mr-2 h-4 w-4" />
                                                Start Tasks
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleBulkAction('complete')}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Complete Tasks
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => handleBulkAction('delete')}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Tasks
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}

                                <Separator orientation="vertical" className="h-6" />

                                <div className="flex items-center border rounded-md">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-r-none"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('kanban')}
                                        className="rounded-none"
                                    >
                                        <Kanban className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('timeline')}
                                        className="rounded-l-none"
                                    >
                                        <Clock1 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Tasks Content */}
                <div className="space-y-4">
                    {viewMode === 'list' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    )}

                    {viewMode === 'kanban' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {Object.entries(statusOptions).map(([status, label]) => (
                                <Card key={status}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                                            {label}
                                            <Badge variant="secondary">
                                                {filteredTasks.filter(t => t.status_task === status).length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {filteredTasks
                                            .filter(task => task.status_task === status)
                                            .map((task) => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {viewMode === 'timeline' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Timeline</CardTitle>
                                <CardDescription>
                                    Gantt chart view of all tasks with dependencies
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {filteredTasks.map((task, index) => (
                                        <div key={task.id} className="flex items-center gap-4 p-3 border rounded">
                                            <div className="flex items-center gap-3 w-80">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: task.warna_display }}
                                                />
                                                <div>
                                                    <div className="font-medium">{task.nama_task}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {task.durasi_hari} hari • ES: {task.early_start}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="relative h-6 bg-gray-100 rounded">
                                                    <div
                                                        className="absolute h-full rounded"
                                                        style={{
                                                            backgroundColor: task.warna_display,
                                                            left: `${(task.early_start / (tasks.reduce((max, t) => Math.max(max, t.early_finish), 0))) * 100}%`,
                                                            width: `${(task.durasi_hari / (tasks.reduce((max, t) => Math.max(max, t.early_finish), 0))) * 100}%`,
                                                            opacity: task.is_critical ? 1 : 0.7
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                                        {task.progress_percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {task.is_critical && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Critical
                                                    </Badge>
                                                )}
                                                {getStatusBadge(task.status_task)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {filteredTasks.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <List className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak ada tasks</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    {tasks.length === 0 
                                        ? "Belum ada task yang dibuat untuk project ini." 
                                        : "Tidak ada task yang sesuai dengan filter yang dipilih."
                                    }
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Task Pertama
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}