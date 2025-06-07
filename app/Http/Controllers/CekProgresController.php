<?php

namespace App\Http\Controllers;

use App\Models\DataProject;
use App\Models\ProgressProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class CekProgresController extends Controller
{
    /**
     * Display the progress check page
     */
    public function index(): Response
    {
        return Inertia::render('Progres/CekProgres');
    }

    /**
     * Check progress by plate number
     */
    public function checkProgress(Request $request): JsonResponse
    {
        $request->validate([
            'plat_nomor' => 'required|string|min:3|max:15'
        ], [
            'plat_nomor.required' => 'Plat nomor kendaraan harus diisi',
            'plat_nomor.min' => 'Plat nomor minimal 3 karakter',
            'plat_nomor.max' => 'Plat nomor maksimal 15 karakter'
        ]);

        $platNomor = strtoupper(trim($request->plat_nomor));

        // Cari project berdasarkan plat nomor
        $project = DataProject::with(['progressTasks' => function ($query) {
                $query->orderBy('urutan_tampil')->orderBy('early_start');
            }])
            ->where('plat_nomor', 'LIKE', "%{$platNomor}%")
            ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan dengan plat nomor tersebut tidak ditemukan dalam sistem kami.'
            ], 404);
        }

        // Calculate project statistics
        $tasks = $project->progressTasks;
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status_task', 'completed')->count();
        $inProgressTasks = $tasks->where('status_task', 'in_progress')->count();
        $currentTask = $tasks->where('status_task', 'in_progress')->first() ?? 
                      $tasks->where('status_task', 'not_started')->first();

        // Calculate days remaining
        $targetDate = Carbon::parse($project->tanggal_target_selesai);
        $today = Carbon::today();
        $daysRemaining = $today->diffInDays($targetDate, false);
        $isOverdue = $daysRemaining < 0 && $project->status_project !== 'completed';

        // Get current step based on progress
        $currentStep = $this->getCurrentStep($tasks);
        
        // Map status project ke format yang diharapkan frontend
        $statusMapping = $this->getStatusMapping($currentTask, $project);

        // Transform tasks untuk progress timeline
        $progressSteps = $this->transformTasksToSteps($tasks);

        // Prepare response data
        $responseData = [
            'success' => true,
            'data' => [
                'platNomor' => $project->plat_nomor,
                'namaPemilik' => $project->nama_pemilik,
                'jenisKendaraan' => $this->getJenisKendaraanLabel($project->jenis_kendaraan),
                'merkKendaraan' => $project->merk_kendaraan,
                'tipeKendaraan' => $project->tipe_kendaraan,
                'warna' => $project->warna_target ?? $project->warna_awal ?? 'Tidak disebutkan',
                'layanan' => $this->getJenisProjectLabel($project->jenis_project),
                'tanggalMasuk' => Carbon::parse($project->tanggal_masuk)->format('d M Y'),
                'estimasiSelesai' => Carbon::parse($project->tanggal_target_selesai)->format('d M Y'),
                'tanggalSelesaiAktual' => $project->tanggal_selesai_aktual ? 
                    Carbon::parse($project->tanggal_selesai_aktual)->format('d M Y') : null,
                'status' => $statusMapping['status'],
                'statusDetail' => $statusMapping['statusDetail'],
                'currentStep' => $currentStep,
                'progressSteps' => $progressSteps,
                'catatan' => $project->catatan_khusus,
                'catatanInternal' => $project->catatan_internal,
                'harga' => (float) $project->estimasi_biaya,
                'pembayaran' => [
                    'status' => $this->getPembayaranStatus($project),
                    'dibayar' => (float) $project->total_pembayaran,
                    'sisa' => (float) ($project->estimasi_biaya - $project->total_pembayaran)
                ],
                'projectStats' => [
                    'totalTasks' => $totalTasks,
                    'completedTasks' => $completedTasks,
                    'inProgressTasks' => $inProgressTasks,
                    'progressPercentage' => (float) $project->progress_percentage,
                    'daysRemaining' => $daysRemaining,
                    'isOverdue' => $isOverdue,
                    'statusProject' => $project->status_project
                ],
                'lastUpdate' => Carbon::parse($project->updated_at)->format('d M Y H:i'),
                'projectCode' => $project->project_code,
                'estimasiBiaya' => (float) $project->estimasi_biaya,
                'biayaAktual' => (float) $project->biaya_aktual,
                'noTelp' => $project->no_telp_pemilik,
                'email' => $project->email_pemilik,
            ]
        ];

        return response()->json($responseData);
    }

    /**
     * Get current step based on task progress
     */
    private function getCurrentStep($tasks): int
    {
        $completedCount = $tasks->where('status_task', 'completed')->count();
        $inProgressCount = $tasks->where('status_task', 'in_progress')->count();
        
        // Jika ada task yang sedang in progress, return step tersebut
        if ($inProgressCount > 0) {
            $inProgressTask = $tasks->where('status_task', 'in_progress')->first();
            return $tasks->search(function ($task) use ($inProgressTask) {
                return $task->id === $inProgressTask->id;
            }) + 1;
        }
        
        // Jika semua sudah completed, return step terakhir
        if ($completedCount === $tasks->count() && $tasks->count() > 0) {
            return $tasks->count();
        }
        
        // Jika belum ada yang dimulai atau ada yang completed, return step berikutnya
        return $completedCount + 1;
    }

    /**
     * Map project status to frontend format
     */
    private function getStatusMapping($currentTask, $project): array
    {
        if ($project->status_project === 'completed') {
            return [
                'status' => 'pemasangan-body',
                'statusDetail' => 'Pengerjaan telah selesai dan kendaraan siap diambil'
            ];
        }

        if (!$currentTask) {
            // Jika tidak ada current task, ambil task pertama yang belum dimulai
            $firstTask = $project->progressTasks()->orderBy('urutan_tampil')->first();
            if ($firstTask) {
                return [
                    'status' => 'bongkar-body', // Default ke step pertama
                    'statusDetail' => 'Menunggu dimulai: ' . $firstTask->nama_task
                ];
            }
            return [
                'status' => 'bongkar-body',
                'statusDetail' => 'Project belum dimulai'
            ];
        }

        // Map kategori task ke status frontend berdasarkan kategori aktual
        $taskToStatusMap = [
            'quality_check' => [
                'status' => 'bongkar-body',
                'statusDetail' => 'Sedang dalam proses inspeksi dan quality check'
            ],
            'bongkar_body' => [
                'status' => 'bongkar-body',
                'statusDetail' => 'Sedang dalam proses pembongkaran body dan persiapan'
            ],
            'repair_body' => [
                'status' => 'repair-body', 
                'statusDetail' => 'Sedang dalam proses perbaikan body dan restorasi'
            ],
            'pengampelasan' => [
                'status' => 'pengampelasan',
                'statusDetail' => 'Sedang dalam proses pengampelasan permukaan body'
            ],
            'poxy' => [
                'status' => 'poxy',
                'statusDetail' => 'Sedang dalam proses aplikasi lapisan dasar poxy primer'
            ],
            'base_coat' => [
                'status' => 'repaint-clear',
                'statusDetail' => 'Sedang dalam proses aplikasi base coat'
            ],
            'color_coat' => [
                'status' => 'repaint-clear',
                'statusDetail' => 'Sedang dalam proses pengecatan warna utama'
            ],
            'clear_coat' => [
                'status' => 'repaint-clear',
                'statusDetail' => 'Sedang dalam proses aplikasi clear coat finishing'
            ],
            'pemasangan_body' => [
                'status' => 'pemasangan-body',
                'statusDetail' => 'Sedang dalam proses pemasangan kembali body dan assembly'
            ],
            'other' => [
                'status' => 'repair-body',
                'statusDetail' => 'Sedang dalam proses pengerjaan: ' . $currentTask->nama_task
            ]
        ];

        $mapping = $taskToStatusMap[$currentTask->kategori_task] ?? [
            'status' => 'bongkar-body',
            'statusDetail' => 'Sedang dalam proses pengerjaan: ' . $currentTask->nama_task
        ];

        // Add progress percentage to status detail if available
        if ($currentTask->progress_percentage > 0) {
            $mapping['statusDetail'] .= ' (' . $currentTask->progress_percentage . '% selesai)';
        }

        return $mapping;
    }

    /**
     * Transform tasks to progress steps for timeline
     */
    private function transformTasksToSteps($tasks): array
    {
        return $tasks->map(function ($task, $index) {
            return [
                'id' => $task->id,
                'step' => $index + 1,
                'nama' => $task->nama_task,
                'kategori' => $task->kategori_task,
                'status' => $task->status_task,
                'progress' => (float) $task->progress_percentage,
                'durasi' => $task->durasi_hari,
                'warna' => $task->warna_display,
                'isCritical' => $task->is_critical,
                'tanggalMulai' => $task->tanggal_mulai_aktual ? 
                    Carbon::parse($task->tanggal_mulai_aktual)->format('d M Y') : null,
                'tanggalSelesai' => $task->tanggal_selesai_aktual ? 
                    Carbon::parse($task->tanggal_selesai_aktual)->format('d M Y') : null,
                'estimasiSelesai' => $task->tanggal_selesai_rencana ? 
                    Carbon::parse($task->tanggal_selesai_rencana)->format('d M Y') : null,
                'pic' => $task->pic_pengerjaan,
                'catatan' => $task->catatan_progress,
                'qualityStatus' => $task->quality_status
            ];
        })->toArray();
    }

    /**
     * Get jenis kendaraan label
     */
    private function getJenisKendaraanLabel($jenis): string
    {
        $labels = [
            'motor' => 'Sepeda Motor',
            'mobil' => 'Mobil',
            'truck' => 'Truck'
        ];

        return $labels[$jenis] ?? ucfirst($jenis);
    }

    /**
     * Get jenis project label
     */
    private function getJenisProjectLabel($jenis): string
    {
        $labels = [
            'custom_paint' => 'Custom Paint',
            'full_restoration' => 'Full Restoration',
            'partial_restoration' => 'Partial Restoration',
            'body_repair' => 'Body Repair',
            'maintenance' => 'Maintenance',
            'modification' => 'Modification'
        ];

        return $labels[$jenis] ?? ucfirst(str_replace('_', ' ', $jenis));
    }

    /**
     * Get payment status in Indonesian
     */
    private function getPembayaranStatus($project): string
    {
        $statusMap = [
            'belum_bayar' => 'belum',
            'dp' => 'sebagian',
            'cicilan' => 'sebagian',
            'lunas' => 'lunas'
        ];

        return $statusMap[$project->status_pembayaran] ?? 'belum';
    }

    /**
     * Get all projects for public tracking (optional - for dropdown/suggestion)
     */
    public function getPublicProjects(): JsonResponse
    {
        $projects = DataProject::select('plat_nomor', 'nama_pemilik', 'merk_kendaraan', 'tipe_kendaraan', 'status_project')
            ->where('status_project', '!=', 'cancelled')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'plat_nomor' => $project->plat_nomor,
                    'display' => $project->plat_nomor . ' - ' . $project->nama_pemilik . ' (' . $project->merk_kendaraan . ' ' . $project->tipe_kendaraan . ')',
                    'status' => $project->status_project
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * Get project photos for public view (if exists)
     */
    public function getProjectPhotos(Request $request): JsonResponse
    {
        $request->validate([
            'plat_nomor' => 'required|string'
        ]);

        $platNomor = strtoupper(trim($request->plat_nomor));
        
        $project = DataProject::where('plat_nomor', 'LIKE', "%{$platNomor}%")->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan'
            ], 404);
        }

        // Get photos from project and tasks
        $photos = [
            'before' => $project->foto_before ?? [],
            'progress' => [],
            'after' => $project->foto_after ?? []
        ];

        // Get progress photos from tasks
        $progressPhotos = $project->progressTasks()
            ->whereNotNull('foto_progress')
            ->get()
            ->pluck('foto_progress')
            ->flatten()
            ->filter()
            ->values()
            ->toArray();

        $photos['progress'] = $progressPhotos;

        return response()->json([
            'success' => true,
            'data' => $photos
        ]);
    }
}
