import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Define interfaces for props
interface DashboardStats {
    total_revenue_current_month: number;
    revenue_growth: number;
    total_projects: number;
    available_projects: number;
    not_available_projects: number;
    new_projects: number;
    projects_growth: number;
    today_schedule: number;
}

interface SalesData {
    month: string;
    amount: number;
    target: number;
}

interface ProjectTypeData {
    name: string;
    value: number;
    color: string;
}

interface ProjectStatusData {
    name: string;
    count: number;
    color: string;
}

interface RecentProject {
    id: string;
    customer: string;
    project: string;
    amount: number;
    date: string;
    status: string;
}

interface TopProject {
    name: string;
    revenue: number;
    customer: string;
    status: string;
    type: string;
    progress: number;
}

interface Props {
    stats: DashboardStats;
    salesData: SalesData[];
    projectTypeData: ProjectTypeData[];
    projectStatusData: ProjectStatusData[];
    recentProjects: RecentProject[];
    topProjects: TopProject[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Selesai</span>;
        case 'processing':
            return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Diproses</span>;
        case 'pending':
            return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Pending</span>;
        default:
            return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">Unknown</span>;
    }
};

const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
        return <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">↑ {growth}% dari bulan lalu</p>;
    } else if (growth < 0) {
        return <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">↓ {Math.abs(growth)}% dari bulan lalu</p>;
    } else {
        return <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">= sama dengan bulan lalu</p>;
    }
};

export default function Dashboard({ stats, salesData, projectTypeData, projectStatusData, recentProjects, topProjects }: Props) {
    const [activeTab, setActiveTab] = useState('transactions');
    const [chartPeriod, setChartPeriod] = useState('month');
    const [loadingChart, setLoadingChart] = useState(false);

    // Load chart data when period changes
    const loadChartData = async () => {
        setLoadingChart(true);
        try {
            // You can implement dynamic chart loading here
            // const response = await fetch(route('dashboard.chart-data', { period: chartPeriod }));
            // const data = await response.json();
            // Update chart data state
        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            setLoadingChart(false);
        }
    };

    useEffect(() => {
        // loadChartData();
    }, [chartPeriod]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Project Management System" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Project Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Ringkasan bisnis dan performa project Anda.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Bulan Ini</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(stats.total_revenue_current_month)}
                                </h3>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                        </div>
                        {getGrowthIndicator(stats.revenue_growth)}
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{stats.total_projects}</h3>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            {stats.available_projects} tersedia, {stats.not_available_projects} tidak tersedia
                        </p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projects Baru</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{stats.new_projects}</h3>
                            </div>
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                        </div>
                        {getGrowthIndicator(stats.projects_growth)}
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Hari Ini</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{stats.today_schedule}</h3>
                            </div>
                            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            Projects yang target selesai hari ini
                        </p>
                    </div>
                </div>
                
                {/* Charts Section */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performa Revenue (2025)</h3>
                            <select 
                                value={chartPeriod} 
                                onChange={(e) => setChartPeriod(e.target.value)}
                                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                            >
                                <option value="week">Minggu</option>
                                <option value="month">Bulan</option>
                                <option value="quarter">Kuartal</option>
                                <option value="year">Tahun</option>
                            </select>
                        </div>
                        <div className="mt-4 h-64">
                            {loadingChart ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={salesData}
                                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis 
                                            tickFormatter={(value) => `${value}M`}
                                        />
                                        <Tooltip 
                                            formatter={(value: any) => [`${formatCurrency(value * 1000000)}`, 'Nilai']}
                                            labelFormatter={(label) => `Bulan: ${label}`}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="amount" 
                                            name="Actual Revenue" 
                                            stroke="#4F46E5" 
                                            strokeWidth={2} 
                                            dot={{ r: 6 }}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="target" 
                                            name="Estimated Revenue" 
                                            stroke="#94A3B8" 
                                            strokeDasharray="5 5"
                                            strokeWidth={2} 
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribusi Jenis Project</h3>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {projectTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} project`, 'Jumlah']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                {/* Project Status Inventory */}
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status Projects</h3>
                    <div className="mt-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={projectStatusData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} project`, 'Jumlah']} />
                                <Bar dataKey="count" name="Jumlah Projects">
                                    {projectStatusData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color.includes('gray') ? '#6B7280' : 
                                                  entry.color.includes('blue') ? '#3B82F6' :
                                                  entry.color.includes('orange') ? '#F97316' :
                                                  entry.color.includes('green') ? '#10B981' :
                                                  '#EF4444'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex" aria-label="Tabs">
                            <button
                                className={`px-4 py-3 text-sm font-medium ${
                                    activeTab === 'transactions' 
                                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab('transactions')}
                            >
                                Projects Terbaru
                            </button>
                            <button
                                className={`px-4 py-3 text-sm font-medium ${
                                    activeTab === 'topSelling' 
                                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab('topSelling')}
                            >
                                Top Revenue Projects
                            </button>
                        </nav>
                    </div>

                    <div className="p-4">
                        {activeTab === 'transactions' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                ID Project
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Customer
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Project
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Nilai
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Tanggal
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                        {recentProjects.map((project) => (
                                            <tr key={project.id}>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {project.id}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {project.customer}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {project.project}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {formatCurrency(project.amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {project.date}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {getStatusBadge(project.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'topSelling' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {topProjects.map((project, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h4 className="mt-3 font-medium text-gray-900 dark:text-white">{project.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer: {project.customer}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Progress: {project.progress}%</p>
                                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(project.revenue)}</p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {project.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}