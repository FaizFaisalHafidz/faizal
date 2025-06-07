import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    DollarSign,
    FileSpreadsheet,
    FileText,
    Filter,
    FolderOpen,
    LineChart,
    RefreshCw,
    Search,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart as RechartsLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { toast, Toaster } from 'sonner';

interface Project {
    id: number;
    project_code: string;
    nama_project: string;
    nama_pemilik: string;
    no_telp_pemilik: string;
    email_pemilik: string;
    status_project: string; // Ganti dari status ke status_project
    jenis_project: string;
    jenis_kendaraan: string;
    plat_nomor: string;
    estimasi_biaya: number;
    biaya_aktual: number;
    total_pembayaran: number;
    status_pembayaran: string;
    progress_percentage: number;
    created_at: string;
    tanggal_masuk: string;
    tanggal_target_selesai: string;
    tanggal_selesai_aktual?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    projects_count: number;
    roles: Array<{
        display_name: string;
    }>;
}

interface RevenueData {
    date: string;
    total_projects: number;
    completed_projects: number;
    total_revenue: number;
    completed_revenue: number;
    estimated_revenue: number;
    total_payments: number;
}

interface PaginatedData {
    data: Project[] | User[] | RevenueData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Stats {
    projects: {
        total: number;
        completed: number;
        confirmed: number;
        in_progress: number;
        draft: number;
        completion_rate: number;
        growth: number;
        by_jenis: Array<{
            jenis_project: string;
            count: number;
        }>;
        by_kendaraan: Array<{
            jenis_kendaraan: string;
            count: number;
        }>;
    };
    revenue: {
        total_estimated: number;
        total_actual: number;
        total_payments: number;
        completed_revenue: number;
        average_per_project: number;
        payment_completion_rate: number;
        growth: number;
        payment_stats: Array<{
            status_pembayaran: string;
            count: number;
            total_amount: number;
        }>;
    };
}

interface StatusOption {
    value: string;
    label: string;
}

interface TypeOption {
    value: string;
    label: string;
}

interface Props {
    data: PaginatedData;
    stats: Stats;
    filters: {
        start_date: string;
        end_date: string;
        status: string;
        type: string;
        per_page: number;
    };
    statusOptions: StatusOption[];
    typeOptions: TypeOption[];
}

export default function ReportsIndex({ data, stats, filters, statusOptions, typeOptions }: Props) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan', href: '/laporan' },
    ];

    const { data: filterData, setData: setFilterData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status,
        type: filters.type,
        per_page: filters.per_page,
    });

    const handleSearch = () => {
        get(route('reports.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        setFilterData({
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0],
            status: '',
            type: 'projects',
            per_page: 15,
        });
        
        router.get(route('reports.index'), {
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0],
            status: '',
            type: 'projects',
            per_page: 15,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const loadChartData = async () => {
        setLoadingChart(true);
        try {
            const response = await fetch(route('reports.chart-data') + '?' + new URLSearchParams({
                start_date: filterData.start_date,
                end_date: filterData.end_date,
                type: filterData.type,
            }));
            
            const result = await response.json();
            if (result.success) {
                setChartData(result.data);
            }
        } catch (error) {
            toast.error('Gagal memuat data chart');
        } finally {
            setLoadingChart(false);
        }
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        setExporting(type);
        
        const params = new URLSearchParams({
            start_date: filterData.start_date,
            end_date: filterData.end_date,
            type: filterData.type,
            ...(filterData.status && { status: filterData.status }),
        });

        const url = type === 'pdf' 
            ? route('reports.export.pdf') + '?' + params
            : route('reports.export.excel') + '?' + params;

        if (type === 'pdf') {
            // Untuk PDF, buka di tab baru agar bisa di-print dan di-download
            const newWindow = window.open(url, '_blank');
            
            // Check if popup was blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                toast.error('Popup diblokir! Silakan izinkan popup untuk website ini.');
                setExporting(null);
                return;
            }
            
            setTimeout(() => {
                setExporting(null);
                toast.success('PDF berhasil dibuka di tab baru. Anda dapat mencetak dengan Ctrl+P');
            }, 1000);
        } else {
            // Untuk Excel, download langsung
            try {
                const link = document.createElement('a');
                link.href = url;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => {
                    setExporting(null);
                    toast.success('Excel berhasil didownload');
                }, 2000);
            } catch (error) {
                console.error('Download error:', error);
                setExporting(null);
                toast.error('Gagal mendownload file Excel');
            }
        }
    };

    useEffect(() => {
        loadChartData();
    }, [filters.start_date, filters.end_date, filters.type]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { variant: 'secondary' as const, icon: Clock, label: 'Draft' },
            confirmed: { variant: 'default' as const, icon: CheckCircle, label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
            in_progress: { variant: 'default' as const, icon: AlertCircle, label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
            completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed', className: 'bg-green-100 text-green-800' },
            cancelled: { variant: 'destructive' as const, icon: AlertCircle, label: 'Cancelled' },
            on_hold: { variant: 'secondary' as const, icon: Clock, label: 'On Hold' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getGrowthIndicator = (growth: number) => {
        if (growth > 0) {
            return (
                <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{growth.toFixed(1)}%</span>
                </div>
            );
        } else if (growth < 0) {
            return (
                <div className="flex items-center text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{growth.toFixed(1)}%</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center text-gray-600">
                    <span className="text-sm font-medium">0%</span>
                </div>
            );
        }
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <Toaster position="top-right" richColors />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
                        <p className="text-muted-foreground">
                            Analisis dan laporan komprehensif sistem
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={resetFilters} variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset Filter
                        </Button>
                        <Button onClick={loadChartData} variant="outline" size="sm" disabled={loadingChart}>
                            {loadingChart ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Refresh Chart
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.projects.total}</div>
                            {getGrowthIndicator(stats.projects.growth)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.projects.completion_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.projects.completed} dari {stats.projects.total} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Actual Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total_actual)}</div>
                            {getGrowthIndicator(stats.revenue.growth)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.revenue.payment_completion_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Pembayaran vs biaya aktual
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Export
                        </CardTitle>
                        <CardDescription>
                            Filter laporan berdasarkan kriteria dan export data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={filterData.start_date}
                                    onChange={(e) => setFilterData('start_date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={filterData.end_date}
                                    onChange={(e) => setFilterData('end_date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Jenis Laporan</Label>
                                <select
                                    id="type"
                                    value={filterData.type}
                                    onChange={(e) => setFilterData('type', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {typeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {filterData.type === 'projects' && (
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={filterData.status}
                                        onChange={(e) => setFilterData('status', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="per_page">Per Page</Label>
                                <select
                                    id="per_page"
                                    value={filterData.per_page.toString()}
                                    onChange={(e) => setFilterData('per_page', parseInt(e.target.value))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="15">15</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>&nbsp;</Label>
                                <Button onClick={handleSearch} className="w-full">
                                    <Search className="mr-2 h-4 w-4" />
                                    Apply Filter
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button 
                                onClick={() => handleExport('pdf')} 
                                variant="outline"
                                disabled={exporting === 'pdf'}
                            >
                                {exporting === 'pdf' ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        View PDF (Print Ready)
                                    </>
                                )}
                            </Button>
                            <Button 
                                onClick={() => handleExport('excel')} 
                                variant="outline"
                                disabled={exporting === 'excel'}
                            >
                                {exporting === 'excel' ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        Downloading Excel...
                                    </>
                                ) : (
                                    <>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Download Excel
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Add info text */}
                        <div className="text-xs text-muted-foreground mt-2 w-full">
                            <p>📄 PDF akan dibuka di tab baru dan siap untuk dicetak</p>
                            <p>📊 Excel akan didownload langsung ke komputer Anda</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Charts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Trend Analysis
                        </CardTitle>
                        <CardDescription>
                            Grafik trend {filterData.type} dalam periode yang dipilih
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingChart ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsLineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value: number) => [
                                            filterData.type === 'revenue' ? formatCurrency(value) : value,
                                            filterData.type === 'revenue' ? 'Revenue' : 'Count'
                                        ]}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                    />
                                </RechartsLineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data {typeOptions.find(t => t.value === filterData.type)?.label}</CardTitle>
                        <CardDescription>
                            {data.total} total records, menampilkan {data.from}-{data.to}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            {filterData.type === 'projects' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Code</TableHead>
                                            <TableHead>Nama Project</TableHead>
                                            <TableHead>Nama Pemilik</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Jenis Project</TableHead>
                                            <TableHead>Biaya Aktual</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data.data as Project[]).map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell className="font-mono">{project.project_code}</TableCell>
                                                <TableCell className="font-medium">{project.nama_project}</TableCell>
                                                <TableCell>{project.nama_pemilik || 'N/A'}</TableCell>
                                                <TableCell>{getStatusBadge(project.status_project)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{project.jenis_project}</Badge>
                                                </TableCell>
                                                <TableCell>{formatCurrency(project.biaya_aktual || 0)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{project.progress_percentage || 0}%</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(project.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {filterData.type === 'users' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Total Projects</TableHead>
                                            <TableHead>Bergabung</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data.data as User[]).map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-mono">#{user.id}</TableCell>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {role.display_name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{user.projects_count}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {filterData.type === 'revenue' && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Total Projects</TableHead>
                                            <TableHead>Completed</TableHead>
                                            <TableHead>Estimated Revenue</TableHead>
                                            <TableHead>Actual Revenue</TableHead>
                                            <TableHead>Total Payments</TableHead>
                                            <TableHead>Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data.data as RevenueData[]).map((item, index) => {
                                            const completionRate = item.total_projects > 0 
                                                ? ((item.completed_projects / item.total_projects) * 100).toFixed(1)
                                                : '0';
                                            
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>{formatDate(item.date)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{item.total_projects}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                                            {item.completed_projects}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(item.estimated_revenue)}</TableCell>
                                                    <TableCell>{formatCurrency(item.total_revenue)}</TableCell>
                                                    <TableCell>{formatCurrency(item.total_payments)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{completionRate}%</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {/* Pagination */}
                        {data.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {data.from} - {data.to} dari {data.total} records
                                </div>
                                <div className="flex items-center gap-2">
                                    {data.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}