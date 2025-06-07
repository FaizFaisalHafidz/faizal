<?php
// filepath: /Users/flashcode/Documents/project_faizal/app/Exports/ProjectReportExport.php

namespace App\Exports;

use App\Models\DataProject;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class ProjectReportExport implements FromCollection, WithHeadings, WithMapping, WithTitle, WithStyles, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;
    protected $status;
    protected $type;

    public function __construct($startDate, $endDate, $status = null, $type = 'projects')
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->status = $status;
        $this->type = $type;
    }

    public function collection()
    {
        switch ($this->type) {
            case 'projects':
                return $this->getProjectsData();
            case 'revenue':
                return $this->getRevenueData();
            default:
                return collect();
        }
    }

    private function getProjectsData()
    {
        $query = DataProject::whereBetween('created_at', [$this->startDate, $this->endDate]);

        if ($this->status) {
            $query->where('status_project', $this->status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function getRevenueData()
    {
        return DataProject::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_projects'),
                DB::raw('SUM(CASE WHEN status_project = "completed" THEN 1 ELSE 0 END) as completed_projects'),
                DB::raw('SUM(biaya_aktual) as total_revenue'),
                DB::raw('SUM(CASE WHEN status_project = "completed" THEN biaya_aktual ELSE 0 END) as completed_revenue'),
                DB::raw('SUM(estimasi_biaya) as estimated_revenue'),
                DB::raw('SUM(total_pembayaran) as total_payments')
            )
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        switch ($this->type) {
            case 'projects':
                return [
                    'ID',
                    'Project Code',
                    'Nama Project',
                    'Nama Pemilik',
                    'No. Telp',
                    'Jenis Project',
                    'Status Project',
                    'Jenis Kendaraan',
                    'Plat Nomor',
                    'Estimasi Biaya',
                    'Biaya Aktual',
                    'Total Pembayaran',
                    'Status Pembayaran',
                    'Progress (%)',
                    'Tanggal Masuk',
                    'Target Selesai',
                    'Selesai Aktual',
                ];
            case 'revenue':
                return [
                    'Tanggal',
                    'Total Projects',
                    'Completed Projects',
                    'Estimasi Revenue',
                    'Actual Revenue',
                    'Completed Revenue',
                    'Total Payments',
                    'Completion Rate (%)',
                ];
            default:
                return [];
        }
    }

    public function map($row): array
    {
        switch ($this->type) {
            case 'projects':
                return [
                    $row->id,
                    $row->project_code ?? 'N/A',
                    $row->nama_project ?? 'N/A',
                    $row->nama_pemilik ?? 'N/A',
                    $row->no_telp_pemilik ?? 'N/A',
                    $row->jenis_project_label ?? 'N/A',
                    $row->status_project_label ?? 'N/A',
                    $row->jenis_kendaraan ?? 'N/A',
                    $row->plat_nomor ?? 'N/A',
                    'Rp ' . number_format($row->estimasi_biaya ?? 0, 0, ',', '.'),
                    'Rp ' . number_format($row->biaya_aktual ?? 0, 0, ',', '.'),
                    'Rp ' . number_format($row->total_pembayaran ?? 0, 0, ',', '.'),
                    $row->status_pembayaran_label ?? 'N/A',
                    ($row->progress_percentage ?? 0) . '%',
                    $row->tanggal_masuk ? $row->tanggal_masuk->format('d/m/Y') : 'N/A',
                    $row->tanggal_target_selesai ? $row->tanggal_target_selesai->format('d/m/Y') : 'N/A',
                    $row->tanggal_selesai_aktual ? $row->tanggal_selesai_aktual->format('d/m/Y') : 'N/A',
                ];
            case 'revenue':
                $completionRate = $row->total_projects > 0 ? 
                    round(($row->completed_projects / $row->total_projects) * 100, 1) : 0;
                return [
                    Carbon::parse($row->date)->format('d/m/Y'),
                    $row->total_projects,
                    $row->completed_projects,
                    'Rp ' . number_format($row->estimated_revenue ?? 0, 0, ',', '.'),
                    'Rp ' . number_format($row->total_revenue ?? 0, 0, ',', '.'),
                    'Rp ' . number_format($row->completed_revenue ?? 0, 0, ',', '.'),
                    'Rp ' . number_format($row->total_payments ?? 0, 0, ',', '.'),
                    $completionRate . '%',
                ];
            default:
                return [];
        }
    }

    public function title(): string
    {
        $titles = [
            'projects' => 'Projects Report',
            'revenue' => 'Revenue Report',
        ];

        return $titles[$this->type] ?? 'Report';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}