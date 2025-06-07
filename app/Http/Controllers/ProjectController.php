<?php

namespace App\Http\Controllers;

use App\Models\DataProject;
use App\Models\ProgressProject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects
     */
    public function index(Request $request): Response
    {
        $query = DataProject::with(['progressTasks']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_project', 'like', "%{$search}%")
                    ->orWhere('project_code', 'like', "%{$search}%")
                    ->orWhere('plat_nomor', 'like', "%{$search}%")
                    ->orWhere('nama_pemilik', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status_project', $request->status);
        }

        // Priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('prioritas', $request->priority);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $projects = $query->paginate(12)->withQueryString();

        // Transform data untuk frontend
        $projects->getCollection()->transform(function ($project) {
            $tasks = $project->progressTasks;
            $totalTasks = $tasks->count();
            $completedTasks = $tasks->where('status_task', 'completed')->count();

            // Calculate days remaining
            $targetDate = Carbon::parse($project->tanggal_target_selesai);
            $today = Carbon::today();
            $daysRemaining = $today->diffInDays($targetDate, false);
            $isOverdue = $daysRemaining < 0 && $project->status_project !== 'completed';

            return [
                'id' => $project->id,
                'project_code' => $project->project_code,
                'nama_project' => $project->nama_project,
                'deskripsi_project' => $project->deskripsi_project,
                'jenis_project' => $project->jenis_project,
                'plat_nomor' => $project->plat_nomor,
                'nama_pemilik' => $project->nama_pemilik,
                'no_telp_pemilik' => $project->no_telp_pemilik,
                'jenis_kendaraan' => $project->jenis_kendaraan,
                'merk_kendaraan' => $project->merk_kendaraan,
                'tipe_kendaraan' => $project->tipe_kendaraan,
                'tanggal_masuk' => $project->tanggal_masuk->toDateString(),
                'tanggal_target_selesai' => $project->tanggal_target_selesai->toDateString(),
                'tanggal_selesai_aktual' => $project->tanggal_selesai_aktual?->toDateString(),
                'status_project' => $project->status_project,
                'prioritas' => $project->prioritas,
                'estimasi_biaya' => (float) $project->estimasi_biaya,
                'biaya_aktual' => (float) $project->biaya_aktual,
                'total_pembayaran' => (float) $project->total_pembayaran,
                'status_pembayaran' => $project->status_pembayaran,
                'progress_percentage' => (float) $project->progress_percentage,
                'days_remaining' => $daysRemaining,
                'is_overdue' => $isOverdue,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'created_at' => $project->created_at->toDateString(),
                'updated_at' => $project->updated_at->toDateString(),
            ];
        });

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status', 'priority', 'sort_by', 'sort_order']),
            'statusOptions' => DataProject::STATUS_PROJECT,
            'priorityOptions' => DataProject::PRIORITAS,
        ]);
    }

    /**
     * Show the form for creating a new project
     */
    public function create(): Response
    {
        return Inertia::render('Projects/Create', [
            'jenisProjectOptions' => DataProject::JENIS_PROJECT,
            'jenisKendaraanOptions' => DataProject::JENIS_KENDARAAN,
            'prioritasOptions' => DataProject::PRIORITAS,
            'statusPembayaranOptions' => DataProject::STATUS_PEMBAYARAN,
        ]);
    }

    /**
     * Store a newly created project
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_project' => 'required|string|max:255',
            'deskripsi_project' => 'nullable|string',
            'jenis_project' => 'required|string',
            'plat_nomor' => 'required|string|max:20',
            'nama_pemilik' => 'required|string|max:255',
            'no_telp_pemilik' => 'required|string|max:20',
            'email_pemilik' => 'nullable|email|max:255',
            'alamat_pemilik' => 'nullable|string',
            'jenis_kendaraan' => 'required|string',
            'merk_kendaraan' => 'required|string|max:100',
            'tipe_kendaraan' => 'required|string|max:100',
            'tahun_kendaraan' => 'nullable|string|max:4',
            'warna_awal' => 'nullable|string|max:100',
            'warna_target' => 'nullable|string|max:100',
            'tanggal_masuk' => 'required|date',
            'tanggal_target_selesai' => 'required|date|after:tanggal_masuk',
            'prioritas' => 'required|string',
            'estimasi_biaya' => 'required|numeric|min:0',
            'total_pembayaran' => 'nullable|numeric|min:0',
            'status_pembayaran' => 'required|string',
            'catatan_khusus' => 'nullable|string',
            'foto_before' => 'nullable|array',
            'foto_before.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Generate project code
        $validated['project_code'] = $this->generateProjectCode();
        $validated['status_project'] = 'draft';
        $validated['progress_percentage'] = 0;
        $validated['created_by'] = auth()->user()->name ?? 'System';

        // Handle file uploads
        if ($request->hasFile('foto_before')) {
            $fotoBefore = [];
            foreach ($request->file('foto_before') as $file) {
                $path = $file->store('projects/before', 'public');
                $fotoBefore[] = $path;
            }
            $validated['foto_before'] = $fotoBefore;
        }

        $project = DataProject::create($validated);

        // Create default tasks based on project type
        $this->createDefaultTasks($project);

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Project berhasil dibuat');
    }

    /**
     * Display the specified project
     */
    public function show(DataProject $project): Response
    {
        $project->load(['progressTasks' => function ($query) {
            $query->orderBy('urutan_tampil')->orderBy('early_start');
        }]);

        // Calculate project statistics
        $tasks = $project->progressTasks;
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status_task', 'completed')->count();
        $criticalTasks = $tasks->where('is_critical', true)->count();

        $targetDate = Carbon::parse($project->tanggal_target_selesai);
        $today = Carbon::today();
        $daysRemaining = $today->diffInDays($targetDate, false);
        $isOverdue = $daysRemaining < 0 && $project->status_project !== 'completed';

        // Get critical path
        $criticalPath = $tasks->where('is_critical', true)->pluck('id')->toArray();

        // Transform tasks for frontend
        $transformedTasks = $tasks->map(function ($task) {
            return [
                'id' => $task->id,
                'task_code' => $task->task_code,
                'nama_task' => $task->nama_task,
                'deskripsi_task' => $task->deskripsi_task,
                'kategori_task' => $task->kategori_task,
                'kategori_task_label' => $task->kategori_task_label,
                'durasi_hari' => $task->durasi_hari,
                'early_start' => $task->early_start,
                'early_finish' => $task->early_finish,
                'late_start' => $task->late_start,
                'late_finish' => $task->late_finish,
                'total_float' => $task->total_float,
                'is_critical' => $task->is_critical,
                'status_task' => $task->status_task,
                'progress_percentage' => (float) $task->progress_percentage,
                'warna_display' => $task->warna_display,
                'tanggal_mulai_rencana' => $task->tanggal_mulai_rencana?->toDateString(),
                'tanggal_selesai_rencana' => $task->tanggal_selesai_rencana?->toDateString(),
                'tanggal_mulai_aktual' => $task->tanggal_mulai_aktual?->toDateString(),
                'tanggal_selesai_aktual' => $task->tanggal_selesai_aktual?->toDateString(),
                'pic_pengerjaan' => $task->pic_pengerjaan,
                'quality_status' => $task->quality_status,
                'estimasi_biaya_task' => (float) $task->estimasi_biaya_task,
                'biaya_aktual_task' => (float) $task->biaya_aktual_task,
            ];
        });

        // Transform project for frontend
        $transformedProject = [
            'id' => $project->id,
            'project_code' => $project->project_code,
            'nama_project' => $project->nama_project,
            'deskripsi_project' => $project->deskripsi_project,
            'jenis_project' => $project->jenis_project,
            'plat_nomor' => $project->plat_nomor,
            'nama_pemilik' => $project->nama_pemilik,
            'no_telp_pemilik' => $project->no_telp_pemilik,
            'email_pemilik' => $project->email_pemilik,
            'alamat_pemilik' => $project->alamat_pemilik,
            'jenis_kendaraan' => $project->jenis_kendaraan,
            'merk_kendaraan' => $project->merk_kendaraan,
            'tipe_kendaraan' => $project->tipe_kendaraan,
            'tahun_kendaraan' => $project->tahun_kendaraan,
            'warna_awal' => $project->warna_awal,
            'warna_target' => $project->warna_target,
            'tanggal_masuk' => $project->tanggal_masuk->toDateString(),
            'tanggal_target_selesai' => $project->tanggal_target_selesai->toDateString(),
            'tanggal_selesai_aktual' => $project->tanggal_selesai_aktual?->toDateString(),
            'status_project' => $project->status_project,
            'prioritas' => $project->prioritas,
            'estimasi_biaya' => (float) $project->estimasi_biaya,
            'biaya_aktual' => (float) $project->biaya_aktual,
            'total_pembayaran' => (float) $project->total_pembayaran,
            'status_pembayaran' => $project->status_pembayaran,
            'progress_percentage' => (float) $project->progress_percentage,
            'total_durasi_hari' => $project->total_durasi_hari,
            'catatan_khusus' => $project->catatan_khusus,
            'catatan_internal' => $project->catatan_internal,
            'foto_before' => $project->foto_before,
            'foto_after' => $project->foto_after,
            'created_at' => $project->created_at->toDateString(),
            'updated_at' => $project->updated_at->toDateString(),
        ];

        return Inertia::render('Projects/Show', [
            'project' => $transformedProject,
            'tasks' => $transformedTasks,
            'criticalPath' => $criticalPath,
            'projectStats' => [
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'critical_tasks' => $criticalTasks,
                'days_remaining' => $daysRemaining,
                'is_overdue' => $isOverdue,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified project
     */
    public function edit(DataProject $project): Response
    {
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'jenisProjectOptions' => DataProject::JENIS_PROJECT,
            'jenisKendaraanOptions' => DataProject::JENIS_KENDARAAN,
            'prioritasOptions' => DataProject::PRIORITAS,
            'statusProjectOptions' => DataProject::STATUS_PROJECT,
            'statusPembayaranOptions' => DataProject::STATUS_PEMBAYARAN,
        ]);
    }

    /**
     * Update the specified project
     */
    public function update(Request $request, DataProject $project)
    {
        $validated = $request->validate([
            'nama_project' => 'nullable|string|max:255',
            'deskripsi_project' => 'nullable|string',
            'jenis_project' => 'nullable|string',
            'plat_nomor' => 'nullable|string|max:20',
            'nama_pemilik' => 'nullable|string|max:255',
            'no_telp_pemilik' => 'nullable|string|max:20',
            'email_pemilik' => 'nullable|email|max:255',
            'alamat_pemilik' => 'nullable|string',
            'jenis_kendaraan' => 'nullable|string',
            'merk_kendaraan' => 'nullable|string|max:100',
            'tipe_kendaraan' => 'nullable|string|max:100',
            'tahun_kendaraan' => 'nullable|string|max:4',
            'warna_awal' => 'nullable|string|max:100',
            'warna_target' => 'nullable|string|max:100',
            'tanggal_target_selesai' => 'nullable|date',
            'prioritas' => 'nullable|string',
            'estimasi_biaya' => 'nullable|numeric|min:0',
            'catatan_khusus' => 'nullable|string',
        ]);

        $validated['updated_by'] = auth()->user()->name ?? 'System';

        $project->update($validated);

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Project berhasil diupdate');
    }

    /**
     * Remove the specified project
     */
    public function destroy(DataProject $project)
    {
        $project->progressTasks()->delete();
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project berhasil dihapus');
    }

    /**
     * Update project status
     */
    public function updateStatus(Request $request, DataProject $project)
    {
       try {
         $validated = $request->validate([
            'status' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $project->update([
            'status_project' => $validated['status'],
            'catatan_internal' => $validated['catatan'] ?
                ($project->catatan_internal . "\n\n" . now()->format('Y-m-d H:i') . " - " . $validated['catatan']) :
                $project->catatan_internal,
            'updated_by' => auth()->user()->name ?? 'System',
        ]);

        return redirect()->back()->with('success', 'Status project berhasil diperbarui');
       } catch (\Throwable $th) {
           return redirect()->back()->with('error', 'Gagal memperbarui status project: ' . $th->getMessage());
       }
    }

    /**
     * Recalculate CPM for project
     */
    public function recalculateCPM(DataProject $project)
    {
        try {
            $project->calculateCPM();

            // Redirect back dengan success message
            return redirect()->back()->with('success', 'CPM berhasil dikalkulasi ulang');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengkalkulasi CPM: ' . $e->getMessage());
        }
    }

    /**
     * Get dashboard data
     */
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_projects' => DataProject::count(),
            'active_projects' => DataProject::whereIn('status_project', ['confirmed', 'in_progress'])->count(),
            'completed_projects' => DataProject::where('status_project', 'completed')->count(),
            'overdue_projects' => DataProject::where('tanggal_target_selesai', '<', Carbon::today())
                ->where('status_project', '!=', 'completed')
                ->count(),
        ];

        return response()->json([
            'stats' => $stats,
        ]);
    }

    /**
     * Generate unique project code
     */
    private function generateProjectCode(): string
    {
        $prefix = 'PRJ';
        $year = date('Y');
        $lastProject = DataProject::where('project_code', 'like', "{$prefix}-{$year}-%")
            ->orderBy('project_code', 'desc')
            ->first();

        if ($lastProject) {
            $lastNumber = (int) substr($lastProject->project_code, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . '-' . $year . '-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Create default tasks based on project type
     */
    private function createDefaultTasks(DataProject $project): void
    {
        $defaultTasks = $this->getDefaultTasksByType($project->jenis_project);

        foreach ($defaultTasks as $index => $taskData) {
            ProgressProject::create([
                'project_id' => $project->id,
                'task_code' => 'TSK-' . $project->project_code . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'nama_task' => $taskData['nama_task'],
                'deskripsi_task' => $taskData['deskripsi_task'],
                'kategori_task' => $taskData['kategori_task'],
                'durasi_hari' => $taskData['durasi_hari'],
                'durasi_jam' => 8,
                'warna_display' => $taskData['warna_display'],
                'urutan_tampil' => $index + 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'quality_status' => 'pending',
                'created_by' => auth()->user()->name ?? 'System',
            ]);
        }

        // Calculate CPM after creating tasks
        $project->calculateCPM();
    }

    /**
     * Get default tasks configuration by project type
     */
    private function getDefaultTasksByType(string $projectType): array
    {
        $taskTemplates = [
            'custom_paint' => [
                [
                    'nama_task' => 'Bongkar Body',
                    'deskripsi_task' => 'Pembongkaran body dan komponen yang akan dicat',
                    'kategori_task' => 'bongkar_body',
                    'durasi_hari' => 1,
                    'warna_display' => '#C81E1E'
                ],
                [
                    'nama_task' => 'Pengampelasan',
                    'deskripsi_task' => 'Pengampelasan permukaan untuk persiapan cat',
                    'kategori_task' => 'pengampelasan',
                    'durasi_hari' => 1,
                    'warna_display' => '#A8A8A8'
                ],
                [
                    'nama_task' => 'Aplikasi Poxy',
                    'deskripsi_task' => 'Aplikasi lapisan dasar poxy primer',
                    'kategori_task' => 'poxy',
                    'durasi_hari' => 1,
                    'warna_display' => '#236D8A'
                ],
                [
                    'nama_task' => 'Base Coat',
                    'deskripsi_task' => 'Aplikasi cat dasar sebelum color coat',
                    'kategori_task' => 'base_coat',
                    'durasi_hari' => 1,
                    'warna_display' => '#E9742B'
                ],
                [
                    'nama_task' => 'Color Coat',
                    'deskripsi_task' => 'Aplikasi cat warna utama',
                    'kategori_task' => 'color_coat',
                    'durasi_hari' => 1,
                    'warna_display' => '#78AB46'
                ],
                [
                    'nama_task' => 'Clear Coat',
                    'deskripsi_task' => 'Aplikasi clear coat untuk finishing',
                    'kategori_task' => 'clear_coat',
                    'durasi_hari' => 1,
                    'warna_display' => '#444444'
                ],
                [
                    'nama_task' => 'Pemasangan Body',
                    'deskripsi_task' => 'Pemasangan kembali body dan komponen',
                    'kategori_task' => 'pemasangan_body',
                    'durasi_hari' => 1,
                    'warna_display' => '#FF4433'
                ]
            ],
            // Add other project types as needed
        ];

        return $taskTemplates[$projectType] ?? $taskTemplates['custom_paint'];
    }
}
