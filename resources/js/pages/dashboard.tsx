import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Data dummy untuk dashboard
const salesData = [
    { month: "Jan", amount: 2890, target: 3000 },
    { month: "Feb", amount: 3100, target: 3000 },
    { month: "Mar", amount: 3600, target: 3200 },
    { month: "Apr", amount: 3200, target: 3200 },
    { month: "Mei", amount: 3800, target: 3500 }
];

const vehicleTypeData = [
    { name: "SUV", value: 23, color: "#3B82F6" },
    { name: "MPV", value: 17, color: "#8B5CF6" },
    { name: "Sedan", value: 14, color: "#EC4899" },
    { name: "Pickup", value: 9, color: "#F97316" },
    { name: "Sport", value: 5, color: "#10B981" },
];

const recentTransactions = [
    { 
        id: "TRX-001", 
        customer: "Ahmad Fauzi", 
        vehicle: "Toyota Fortuner 2023", 
        amount: 450000000, 
        date: "24 Mei 2025",
        status: "completed" 
    },
    { 
        id: "TRX-002", 
        customer: "Siti Rahmah", 
        vehicle: "Honda CR-V 2024", 
        amount: 520000000, 
        date: "23 Mei 2025",
        status: "processing" 
    },
    { 
        id: "TRX-003", 
        customer: "Budi Santoso", 
        vehicle: "Mitsubishi Xpander 2024", 
        amount: 310000000, 
        date: "21 Mei 2025",
        status: "completed" 
    },
    { 
        id: "TRX-004", 
        customer: "Diana Putri", 
        vehicle: "BMW X5 2022", 
        amount: 980000000, 
        date: "20 Mei 2025",
        status: "completed" 
    },
    { 
        id: "TRX-005", 
        customer: "Hendro Wibowo", 
        vehicle: "Toyota Camry 2024", 
        amount: 670000000, 
        date: "18 Mei 2025",
        status: "pending" 
    },
];

const vehicleStatus = [
    { name: "Tersedia", count: 42, color: "bg-green-500" },
    { name: "Dalam Perbaikan", count: 8, color: "bg-orange-500" },
    { name: "Dalam Pemesanan", count: 12, color: "bg-blue-500" },
    { name: "Terjual (Bulan Ini)", count: 15, color: "bg-purple-500" },
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

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('transactions');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - GARASI AMSTRONG" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Selamat Datang di GARASI AMSTRONG</h1>
                    <p className="text-gray-600 dark:text-gray-400">Ringkasan bisnis dan performa penjualan Anda.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Penjualan Bulan Ini</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(3800000000)}</h3>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">↑ 12.5% dari bulan lalu</p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kendaraan</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">77</h3>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                                    <circle cx="7" cy="17" r="2"></circle>
                                    <circle cx="17" cy="17" r="2"></circle>
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">42 tersedia, 35 tidak tersedia</p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pelanggan Baru</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">24</h3>
                            </div>
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                        </div>
                        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">↑ 8.2% dari bulan lalu</p>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jadwal Hari Ini</p>
                                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">7</h3>
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
                        <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">3 test drive, 4 showroom</p>
                    </div>
                </div>
                
                {/* Charts Section - Recharts */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performa Penjualan (2025)</h3>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={salesData}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis 
                                        tickFormatter={(value) => `${value}M`}
                                        domain={[2000, 4000]}
                                    />
                                    <Tooltip 
                                        formatter={(value: any) => [`${formatCurrency(value * 1000000)}`, 'Nilai']}
                                        labelFormatter={(label) => `Bulan: ${label}`}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        name="Penjualan" 
                                        stroke="#4F46E5" 
                                        strokeWidth={2} 
                                        dot={{ r: 6 }}
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="target" 
                                        name="Target" 
                                        stroke="#94A3B8" 
                                        strokeDasharray="5 5"
                                        strokeWidth={2} 
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribusi Tipe Kendaraan</h3>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={vehicleTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {vehicleTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} unit`, 'Jumlah']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                {/* Status Inventaris - Dengan Bar Chart */}
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Status Inventaris Kendaraan</h3>
                    <div className="mt-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={vehicleStatus}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} unit`, 'Jumlah']} />
                                <Bar dataKey="count" name="Jumlah Kendaraan">
                                    {vehicleStatus.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color.replace('bg-', '').includes('green') ? '#10B981' : 
                                                  entry.color.replace('bg-', '').includes('orange') ? '#F97316' :
                                                  entry.color.replace('bg-', '').includes('blue') ? '#3B82F6' :
                                                  '#8B5CF6'} 
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
                                Transaksi Terbaru
                            </button>
                            <button
                                className={`px-4 py-3 text-sm font-medium ${
                                    activeTab === 'topSelling' 
                                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab('topSelling')}
                            >
                                Kendaraan Terlaris
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
                                                ID Transaksi
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Pelanggan
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Kendaraan
                                            </th>
                                            <th scope="col" className="px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Nominal
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
                                        {recentTransactions.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {transaction.id}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.customer}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.vehicle}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {formatCurrency(transaction.amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.date}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {getStatusBadge(transaction.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {activeTab === 'topSelling' && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                            [Toyota Fortuner]
                                        </div>
                                    </div>
                                    <h4 className="mt-3 font-medium text-gray-900 dark:text-white">Toyota Fortuner 2023</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Terjual: 24 unit</p>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Rp 450.000.000 - Rp 570.000.000</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                            [Honda CR-V]
                                        </div>
                                    </div>
                                    <h4 className="mt-3 font-medium text-gray-900 dark:text-white">Honda CR-V 2024</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Terjual: 21 unit</p>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Rp 520.000.000 - Rp 620.000.000</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                                        <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                            [Mitsubishi Xpander]
                                        </div>
                                    </div>
                                    <h4 className="mt-3 font-medium text-gray-900 dark:text-white">Mitsubishi Xpander 2024</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Terjual: 18 unit</p>
                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Rp 310.000.000 - Rp 370.000.000</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}