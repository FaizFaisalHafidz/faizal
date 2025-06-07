<?php
// filepath: /Users/flashcode/Documents/project_faizal/app/Http/Controllers/ReportController.php

namespace App\Http\Controllers;

use App\Models\DaftarHarga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProjectReportExport;
use App\Models\DataProject;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
   
    /**
     * Display the report index page
     */
    public function index(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:draft,confirmed,in_progress,completed,cancelled,on_hold',
            'type' => 'nullable|string|in:projects,revenue',
            'per_page' => 'nullable|integer|min:10|max:100',
        ]);

        // Default date range - last 30 days
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();
        $status = $request->status;
        $type = $request->type ?? 'projects';
        $perPage = $request->per_page ?? 15;

        // Get filtered data based on type
        $data = $this->getReportData($type, $startDate, $endDate, $status, $perPage);

        // Get summary statistics
        $stats = $this->getReportStats($startDate, $endDate);

        return Inertia::render('Reports/Index', [
            'data' => $data,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => $status,
                'type' => $type,
                'per_page' => $perPage,
            ],
            'statusOptions' => [
                ['value' => '', 'label' => 'Semua Status'],
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'confirmed', 'label' => 'Confirmed'],
                ['value' => 'in_progress', 'label' => 'In Progress'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
                ['value' => 'on_hold', 'label' => 'On Hold'],
            ],
            'typeOptions' => [
                ['value' => 'projects', 'label' => 'Projects Report'],
                ['value' => 'revenue', 'label' => 'Revenue Report'],
            ],
        ]);
    }

    /**
     * Get report data based on type
     */
    private function getReportData($type, $startDate, $endDate, $status = null, $perPage = 15)
    {
        switch ($type) {
            case 'projects':
                return $this->getProjectsReport($startDate, $endDate, $status, $perPage);
            case 'revenue':
                return $this->getRevenueReport($startDate, $endDate, $perPage);
            default:
                return $this->getProjectsReport($startDate, $endDate, $status, $perPage);
        }
    }

    /**
     * Get projects report data
     */
    private function getProjectsReport($startDate, $endDate, $status = null, $perPage = 15)
    {
        $query = DataProject::whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status_project', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get revenue report data
     */
    private function getRevenueReport($startDate, $endDate, $perPage = 15)
    {
        $revenueData = DataProject::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_projects'),
                DB::raw('SUM(CASE WHEN status_project = "completed" THEN 1 ELSE 0 END) as completed_projects'),
                DB::raw('SUM(biaya_aktual) as total_revenue'),
                DB::raw('SUM(CASE WHEN status_project = "completed" THEN biaya_aktual ELSE 0 END) as completed_revenue'),
                DB::raw('SUM(estimasi_biaya) as estimated_revenue'),
                DB::raw('SUM(total_pembayaran) as total_payments')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->paginate($perPage);

        return $revenueData;
    }

    /**
     * Get summary statistics
     */
    private function getReportStats($startDate, $endDate)
    {
        // Projects statistics
        $totalProjects = DataProject::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedProjects = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_project', 'completed')->count();
        $confirmedProjects = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_project', 'confirmed')->count();
        $inProgressProjects = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_project', 'in_progress')->count();
        $draftProjects = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_project', 'draft')->count();

        // Revenue statistics - menggunakan field yang benar
        $totalEstimatedRevenue = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->sum('estimasi_biaya') ?? 0;
        $totalActualRevenue = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->sum('biaya_aktual') ?? 0;
        $totalPayments = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_pembayaran') ?? 0;
        $completedRevenue = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->where('status_project', 'completed')
            ->sum('biaya_aktual') ?? 0;

        // Project categories statistics
        $projectsByJenis = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('jenis_project')
            ->select('jenis_project', DB::raw('COUNT(*) as count'))
            ->get();

        // Projects by vehicle type
        $projectsByKendaraan = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('jenis_kendaraan')
            ->select('jenis_kendaraan', DB::raw('COUNT(*) as count'))
            ->get();

        // Payment status statistics
        $paymentStats = DataProject::whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status_pembayaran')
            ->select('status_pembayaran', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_pembayaran) as total_amount'))
            ->get();

        // Growth calculations (compare with previous period)
        $periodDays = $startDate->diffInDays($endDate);
        $previousStartDate = $startDate->copy()->subDays($periodDays);
        $previousEndDate = $startDate->copy()->subDay();

        $previousProjects = DataProject::whereBetween('created_at', [$previousStartDate, $previousEndDate])->count();
        $previousRevenue = DataProject::whereBetween('created_at', [$previousStartDate, $previousEndDate])->sum('biaya_aktual') ?? 0;

        $projectsGrowth = $previousProjects > 0 ? (($totalProjects - $previousProjects) / $previousProjects) * 100 : 0;
        $revenueGrowth = $previousRevenue > 0 ? (($totalActualRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;

        return [
            'projects' => [
                'total' => $totalProjects,
                'completed' => $completedProjects,
                'confirmed' => $confirmedProjects,
                'in_progress' => $inProgressProjects,
                'draft' => $draftProjects,
                'completion_rate' => $totalProjects > 0 ? round(($completedProjects / $totalProjects) * 100, 1) : 0,
                'growth' => round($projectsGrowth, 1),
                'by_jenis' => $projectsByJenis,
                'by_kendaraan' => $projectsByKendaraan,
            ],
            'revenue' => [
                'total_estimated' => $totalEstimatedRevenue,
                'total_actual' => $totalActualRevenue,
                'total_payments' => $totalPayments,
                'completed_revenue' => $completedRevenue,
                'average_per_project' => $totalProjects > 0 ? round($totalActualRevenue / $totalProjects, 0) : 0,
                'payment_completion_rate' => $totalActualRevenue > 0 ? round(($totalPayments / $totalActualRevenue) * 100, 1) : 0,
                'growth' => round($revenueGrowth, 1),
                'payment_stats' => $paymentStats,
            ],
        ];
    }

    /**
     * Export report to PDF
     */
    public function exportPdf(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'status' => 'nullable|string|in:draft,confirmed,in_progress,completed,cancelled,on_hold',
                'type' => 'required|string|in:projects,revenue',
            ]);

            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $status = $request->status;
            $type = $request->type;

            // Get all data for PDF (no pagination)
            $data = $this->getReportDataForExport($type, $startDate, $endDate, $status);
            $stats = $this->getReportStats($startDate, $endDate);

            $pdf = Pdf::loadView('reports.pdf', [
                'data' => $data,
                'stats' => $stats,
                'filters' => [
                    'start_date' => $startDate->format('d/m/Y'),
                    'end_date' => $endDate->format('d/m/Y'),
                    'status' => $status,
                    'type' => $type,
                ],
                'title' => $this->getReportTitle($type),
            ]);

            // Set paper size and orientation
            $pdf->setPaper('A4', 'landscape');
            
            $filename = 'report-' . $type . '-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.pdf';

            // Return PDF untuk ditampilkan di browser (bisa di-print)
            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF Export Error: ' . $e->getMessage());
            
            // Jika error, redirect back dengan pesan error
            return back()->with('error', 'Gagal menggenerate PDF: ' . $e->getMessage());
        }
    }

    /**
     * Export report to Excel
     */
    public function exportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:draft,confirmed,in_progress,completed,cancelled,on_hold',
            'type' => 'required|string|in:projects,revenue',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $status = $request->status;
        $type = $request->type;

        $filename = 'report-' . $type . '-' . $startDate->format('Y-m-d') . '-to-' . $endDate->format('Y-m-d') . '.xlsx';

        return Excel::download(
            new ProjectReportExport($startDate, $endDate, $status, $type),
            $filename
        );
    }

    /**
     * Get report data for export (no pagination)
     */
    private function getReportDataForExport($type, $startDate, $endDate, $status = null)
    {
        switch ($type) {
            case 'projects':
                $query = DataProject::whereBetween('created_at', [$startDate, $endDate]);
                if ($status) {
                    $query->where('status_project', $status);
                }
                return $query->orderBy('created_at', 'desc')->get();

            case 'revenue':
                return DataProject::select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('COUNT(*) as total_projects'),
                        DB::raw('SUM(CASE WHEN status_project = "completed" THEN 1 ELSE 0 END) as completed_projects'),
                        DB::raw('SUM(biaya_aktual) as total_revenue'),
                        DB::raw('SUM(CASE WHEN status_project = "completed" THEN biaya_aktual ELSE 0 END) as completed_revenue'),
                        DB::raw('SUM(estimasi_biaya) as estimated_revenue'),
                        DB::raw('SUM(total_pembayaran) as total_payments')
                    )
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('date', 'desc')
                    ->get();

            default:
                return collect();
        }
    }

    /**
     * Get report title based on type
     */
    private function getReportTitle($type)
    {
        $titles = [
            'projects' => 'Laporan Projects',
            'revenue' => 'Laporan Revenue',
        ];

        return $titles[$type] ?? 'Laporan';
    }

    /**
     * Get chart data for dashboard
     */
    public function getChartData(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'type' => 'required|string|in:projects,revenue',
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();
        $type = $request->type;

        $chartData = $this->generateChartData($type, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $chartData,
        ]);
    }

    /**
     * Generate chart data
     */
    private function generateChartData($type, $startDate, $endDate)
    {
        switch ($type) {
            case 'projects':
                return DataProject::select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('COUNT(*) as count')
                    )
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('Y-m-d'),
                            'value' => $item->count,
                        ];
                    });

            case 'revenue':
                return DataProject::select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('SUM(biaya_aktual) as revenue')
                    )
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('Y-m-d'),
                            'value' => $item->revenue ?? 0,
                        ];
                    });

            default:
                return collect();
        }
    }
}