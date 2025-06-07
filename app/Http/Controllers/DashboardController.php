<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\DataProject;
use App\Models\User;

class DashboardController extends Controller
{

    /**
     * Display the dashboard
     */
    public function index()
    {
        // Get current month and year
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // 1. Stats Cards Data
        $stats = $this->getDashboardStats($startOfMonth, $endOfMonth, $startOfLastMonth, $endOfLastMonth);

        // 2. Sales Performance Data (Last 5 months)
        $salesData = $this->getSalesPerformanceData();

        // 3. Project Type Distribution
        $projectTypeData = $this->getProjectTypeDistribution();

        // 4. Project Status Inventory
        $projectStatusData = $this->getProjectStatusInventory();

        // 5. Recent Projects
        $recentProjects = $this->getRecentProjects();

        // 6. Top Projects by Revenue
        $topProjects = $this->getTopProjectsByRevenue();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'salesData' => $salesData,
            'projectTypeData' => $projectTypeData,
            'projectStatusData' => $projectStatusData,
            'recentProjects' => $recentProjects,
            'topProjects' => $topProjects,
        ]);
    }

    /**
     * Get dashboard statistics
     */
    private function getDashboardStats($startOfMonth, $endOfMonth, $startOfLastMonth, $endOfLastMonth)
    {
        // Current month stats
        $currentMonthRevenue = DataProject::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('biaya_aktual') ?? 0;
        
        $totalProjects = DataProject::count();
        
        $newProjects = DataProject::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        
        $todaySchedule = DataProject::whereDate('tanggal_target_selesai', Carbon::today())
            ->whereIn('status_project', ['confirmed', 'in_progress'])
            ->count();

        // Last month stats for comparison
        $lastMonthRevenue = DataProject::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('biaya_aktual') ?? 0;
        
        $lastMonthNewProjects = DataProject::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // Calculate growth percentages
        $revenueGrowth = $lastMonthRevenue > 0 ? 
            round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) : 0;
        
        $projectsGrowth = $lastMonthNewProjects > 0 ? 
            round((($newProjects - $lastMonthNewProjects) / $lastMonthNewProjects) * 100, 1) : 0;

        // Available vs Not Available projects
        $availableProjects = DataProject::whereIn('status_project', ['draft', 'confirmed'])->count();
        $notAvailableProjects = DataProject::whereIn('status_project', ['in_progress', 'completed', 'cancelled'])->count();

        return [
            'total_revenue_current_month' => $currentMonthRevenue,
            'revenue_growth' => $revenueGrowth,
            'total_projects' => $totalProjects,
            'available_projects' => $availableProjects,
            'not_available_projects' => $notAvailableProjects,
            'new_projects' => $newProjects,
            'projects_growth' => $projectsGrowth,
            'today_schedule' => $todaySchedule,
        ];
    }

    /**
     * Get sales performance data for charts (last 5 months)
     */
    private function getSalesPerformanceData()
    {
        $salesData = [];
        
        for ($i = 4; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();
            
            $actualRevenue = DataProject::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('biaya_aktual') ?? 0;
            
            $estimatedRevenue = DataProject::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('estimasi_biaya') ?? 0;
            
            $salesData[] = [
                'month' => $month->format('M'),
                'amount' => round($actualRevenue / 1000000), // Convert to millions
                'target' => round($estimatedRevenue / 1000000), // Convert to millions
            ];
        }
        
        return $salesData;
    }

    /**
     * Get project type distribution
     */
    private function getProjectTypeDistribution()
    {
        $typeDistribution = DataProject::select('jenis_project', DB::raw('count(*) as count'))
            ->groupBy('jenis_project')
            ->get();

        $colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#F59E0B'];
        $colorIndex = 0;

        return $typeDistribution->map(function ($item) use ($colors, &$colorIndex) {
            $color = $colors[$colorIndex % count($colors)];
            $colorIndex++;
            
            return [
                'name' => $item->jenis_project ?? 'Tidak Diketahui',
                'value' => $item->count,
                'color' => $color,
            ];
        })->toArray();
    }

    /**
     * Get project status inventory
     */
    private function getProjectStatusInventory()
    {
        $statusCounts = [
            'draft' => DataProject::where('status_project', 'draft')->count(),
            'confirmed' => DataProject::where('status_project', 'confirmed')->count(),
            'in_progress' => DataProject::where('status_project', 'in_progress')->count(),
            'completed' => DataProject::where('status_project', 'completed')->count(),
            'cancelled' => DataProject::where('status_project', 'cancelled')->count(),
        ];

        return [
            ['name' => 'Draft', 'count' => $statusCounts['draft'], 'color' => 'bg-gray-500'],
            ['name' => 'Confirmed', 'count' => $statusCounts['confirmed'], 'color' => 'bg-blue-500'],
            ['name' => 'In Progress', 'count' => $statusCounts['in_progress'], 'color' => 'bg-orange-500'],
            ['name' => 'Completed', 'count' => $statusCounts['completed'], 'color' => 'bg-green-500'],
            ['name' => 'Cancelled', 'count' => $statusCounts['cancelled'], 'color' => 'bg-red-500'],
        ];
    }

    /**
     * Get recent projects
     */
    private function getRecentProjects()
    {
        return DataProject::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->project_code ?? 'PRJ-' . $project->id,
                    'customer' => $project->nama_pemilik ?? 'N/A',
                    'project' => $project->nama_project ?? 'N/A',
                    'amount' => $project->biaya_aktual ?? $project->estimasi_biaya ?? 0,
                    'date' => $project->created_at->format('d M Y'),
                    'status' => $this->mapProjectStatus($project->status_project),
                ];
            })
            ->toArray();
    }

    /**
     * Get top projects by revenue
     */
    private function getTopProjectsByRevenue()
    {
        return DataProject::orderBy('biaya_aktual', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($project) {
                return [
                    'name' => $project->nama_project ?? 'Project #' . $project->id,
                    'revenue' => $project->biaya_aktual ?? $project->estimasi_biaya ?? 0,
                    'customer' => $project->nama_pemilik ?? 'N/A',
                    'status' => $project->status_project ?? 'draft',
                    'type' => $project->jenis_project ?? 'N/A',
                    'progress' => $project->progress_percentage ?? 0,
                ];
            })
            ->toArray();
    }

    /**
     * Map project status to transaction status
     */
    private function mapProjectStatus($status)
    {
        $statusMap = [
            'completed' => 'completed',
            'in_progress' => 'processing',
            'confirmed' => 'processing',
            'draft' => 'pending',
            'cancelled' => 'pending',
            'on_hold' => 'pending',
        ];

        return $statusMap[$status] ?? 'pending';
    }

    /**
     * Get chart data for AJAX requests
     */
    public function getChartData(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:sales,projects,revenue',
            'period' => 'nullable|string|in:week,month,quarter,year',
        ]);

        $type = $request->type;
        $period = $request->period ?? 'month';

        switch ($type) {
            case 'sales':
                $data = $this->getSalesChartData($period);
                break;
            case 'projects':
                $data = $this->getProjectsChartData($period);
                break;
            case 'revenue':
                $data = $this->getRevenueChartData($period);
                break;
            default:
                $data = [];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get sales chart data based on period
     */
    private function getSalesChartData($period)
    {
        $periods = $this->getPeriods($period);
        
        return collect($periods)->map(function ($periodData) {
            $revenue = DataProject::whereBetween('created_at', [$periodData['start'], $periodData['end']])
                ->sum('biaya_aktual') ?? 0;
            
            return [
                'period' => $periodData['label'],
                'value' => $revenue,
            ];
        })->toArray();
    }

    /**
     * Get projects chart data based on period
     */
    private function getProjectsChartData($period)
    {
        $periods = $this->getPeriods($period);
        
        return collect($periods)->map(function ($periodData) {
            $count = DataProject::whereBetween('created_at', [$periodData['start'], $periodData['end']])
                ->count();
            
            return [
                'period' => $periodData['label'],
                'value' => $count,
            ];
        })->toArray();
    }

    /**
     * Get revenue chart data based on period
     */
    private function getRevenueChartData($period)
    {
        $periods = $this->getPeriods($period);
        
        return collect($periods)->map(function ($periodData) {
            $actualRevenue = DataProject::whereBetween('created_at', [$periodData['start'], $periodData['end']])
                ->sum('biaya_aktual') ?? 0;
            
            $estimatedRevenue = DataProject::whereBetween('created_at', [$periodData['start'], $periodData['end']])
                ->sum('estimasi_biaya') ?? 0;
            
            return [
                'period' => $periodData['label'],
                'actual' => $actualRevenue,
                'estimated' => $estimatedRevenue,
            ];
        })->toArray();
    }

    /**
     * Generate periods based on type
     */
    private function getPeriods($period)
    {
        $periods = [];
        
        switch ($period) {
            case 'week':
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i);
                    $periods[] = [
                        'start' => $date->copy()->startOfDay(),
                        'end' => $date->copy()->endOfDay(),
                        'label' => $date->format('D'),
                    ];
                }
                break;
                
            case 'quarter':
                for ($i = 3; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i * 3);
                    $periods[] = [
                        'start' => $month->copy()->startOfQuarter(),
                        'end' => $month->copy()->endOfQuarter(),
                        'label' => 'Q' . $month->quarter,
                    ];
                }
                break;
                
            case 'year':
                for ($i = 4; $i >= 0; $i--) {
                    $year = Carbon::now()->subYears($i);
                    $periods[] = [
                        'start' => $year->copy()->startOfYear(),
                        'end' => $year->copy()->endOfYear(),
                        'label' => $year->format('Y'),
                    ];
                }
                break;
                
            default: // month
                for ($i = 5; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i);
                    $periods[] = [
                        'start' => $month->copy()->startOfMonth(),
                        'end' => $month->copy()->endOfMonth(),
                        'label' => $month->format('M'),
                    ];
                }
        }
        
        return $periods;
    }

    /**
     * Get summary data for specific date range
     */
    public function getSummary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        $summary = [
            'total_projects' => DataProject::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_revenue' => DataProject::whereBetween('created_at', [$startDate, $endDate])->sum('biaya_aktual') ?? 0,
            'completed_projects' => DataProject::whereBetween('created_at', [$startDate, $endDate])
                ->where('status_project', 'completed')->count(),
            'in_progress_projects' => DataProject::whereBetween('created_at', [$startDate, $endDate])
                ->where('status_project', 'in_progress')->count(),
            'average_project_value' => 0,
        ];

        $summary['average_project_value'] = $summary['total_projects'] > 0 ? 
            round($summary['total_revenue'] / $summary['total_projects'], 0) : 0;

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}
