<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DataProject extends Model
{
    use HasFactory;

    protected $table = 'tt_data_project';

    protected $fillable = [
        'project_code',
        'nama_project',
        'deskripsi_project',
        'jenis_project',
        'plat_nomor',
        'nama_pemilik',
        'no_telp_pemilik',
        'email_pemilik',
        'alamat_pemilik',
        'jenis_kendaraan',
        'merk_kendaraan',
        'tipe_kendaraan',
        'tahun_kendaraan',
        'warna_awal',
        'warna_target',
        'tanggal_masuk',
        'tanggal_target_selesai',
        'tanggal_selesai_aktual',
        'status_project',
        'prioritas',
        'estimasi_biaya',
        'biaya_aktual',
        'total_pembayaran',
        'status_pembayaran',
        'total_durasi_hari',
        'critical_path',
        'progress_percentage',
        'catatan_khusus',
        'catatan_internal',
        'foto_before',
        'foto_after',
        'dokumentasi_progress',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_target_selesai' => 'date',
        'tanggal_selesai_aktual' => 'date',
        'estimasi_biaya' => 'decimal:2',
        'biaya_aktual' => 'decimal:2',
        'total_pembayaran' => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'critical_path' => 'array',
        'foto_before' => 'array',
        'foto_after' => 'array',
        'dokumentasi_progress' => 'array',
    ];

    // Konstanta untuk enum values
    const JENIS_PROJECT = [
        'custom_paint' => 'Custom Paint',
        'body_repair' => 'Body Repair',
        'full_restoration' => 'Full Restoration',
        'maintenance' => 'Maintenance',
        'modification' => 'Modification',
        'other' => 'Other'
    ];

    const STATUS_PROJECT = [
        'draft' => 'Draft',
        'confirmed' => 'Confirmed',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'on_hold' => 'On Hold'
    ];

    const PRIORITAS = [
        'low' => 'Low',
        'normal' => 'Normal',
        'high' => 'High',
        'urgent' => 'Urgent'
    ];

    const JENIS_KENDARAAN = [
        'motor' => 'Motor',
        'mobil' => 'Mobil',
        'truck' => 'Truck',
        'other' => 'Other'
    ];

    const STATUS_PEMBAYARAN = [
        'belum_bayar' => 'Belum Bayar',
        'dp' => 'DP',
        'cicilan' => 'Cicilan',
        'lunas' => 'Lunas'
    ];

    // Relationships
    public function progressTasks(): HasMany
    {
        return $this->hasMany(ProgressProject::class, 'project_id');
    }

    public function activeTasks(): HasMany
    {
        return $this->progressTasks()->whereIn('status_task', ['not_started', 'in_progress']);
    }

    public function completedTasks(): HasMany
    {
        return $this->progressTasks()->where('status_task', 'completed');
    }

    public function criticalTasks(): HasMany
    {
        return $this->progressTasks()->where('is_critical', true);
    }

    // Boot method untuk auto-generate project code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->project_code)) {
                $model->project_code = $model->generateProjectCode();
            }
        });
    }

    // Method untuk generate project code
    private function generateProjectCode(): string
    {
        $prefix = 'PRJ';
        $date = now()->format('Ymd');
        $randomString = Str::upper(Str::random(4));
        
        do {
            $code = $prefix . '-' . $date . '-' . $randomString;
            $exists = self::where('project_code', $code)->exists();
            if ($exists) {
                $randomString = Str::upper(Str::random(4));
            }
        } while ($exists);

        return $code;
    }

    // Accessor untuk format display
    public function getJenisProjectLabelAttribute(): string
    {
        return self::JENIS_PROJECT[$this->jenis_project] ?? $this->jenis_project;
    }

    public function getStatusProjectLabelAttribute(): string
    {
        return self::STATUS_PROJECT[$this->status_project] ?? $this->status_project;
    }

    public function getPrioritasLabelAttribute(): string
    {
        return self::PRIORITAS[$this->prioritas] ?? $this->prioritas;
    }

    public function getStatusPembayaranLabelAttribute(): string
    {
        return self::STATUS_PEMBAYARAN[$this->status_pembayaran] ?? $this->status_pembayaran;
    }

    /**
     * Update project progress based on tasks completion
     */
    public function updateProjectProgress(): void
    {
        $tasks = $this->progressTasks;
        
        if ($tasks->isEmpty()) {
            $this->progress_percentage = 0;
            $this->save();
            return;
        }

        // Calculate progress based on task completion
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status_task', 'completed')->count();
        $inProgressTasks = $tasks->where('status_task', 'in_progress');
        
        // Base progress from completed tasks
        $baseProgress = ($completedTasks / $totalTasks) * 100;
        
        // Add partial progress from in-progress tasks
        $partialProgress = 0;
        foreach ($inProgressTasks as $task) {
            $taskProgress = ($task->progress_percentage / 100) * (1 / $totalTasks) * 100;
            $partialProgress += $taskProgress;
        }
        
        $totalProgress = $baseProgress + $partialProgress;
        $this->progress_percentage = min(100, round($totalProgress, 2));
        
        // Update project status based on progress
        if ($this->progress_percentage >= 100) {
            $this->status_project = 'completed';
            if (!$this->tanggal_selesai_aktual) {
                $this->tanggal_selesai_aktual = now();
            }
        } elseif ($this->progress_percentage > 0) {
            $this->status_project = 'in_progress';
        } else {
            $this->status_project = 'not_started';
        }
        
        $this->save();
    }

    /**
     * Calculate Critical Path Method for project scheduling
     * Following proper CPM algorithm with Forward Pass and Backward Pass
     * Based on PDM (Precedence Diagramming Method) network
     */
    public function calculateCPM(): void
    {
        $tasks = $this->progressTasks()->orderBy('urutan_tampil')->get();
        
        if ($tasks->isEmpty()) {
            return;
        }

        // Auto-fix dependencies if they are missing
        $this->autoFixTaskDependencies();

        // Reload tasks after potential dependency fixes
        $tasks = $this->progressTasks()->orderBy('urutan_tampil')->get();

        // Reset all calculations
        foreach ($tasks as $task) {
            $task->early_start = 0;
            $task->early_finish = 0;
            $task->late_start = 0;
            $task->late_finish = 0;
            $task->total_float = 0;
            $task->is_critical = false;
        }

        // Create task lookup by task_code for easier dependency resolution
        $tasksByCode = $tasks->keyBy('task_code');

        // Step 1: FORWARD PASS - Calculate Early Start (ES) and Early Finish (EF)
        // Process tasks in topological order (respecting dependencies)
        $processed = [];
        $iterations = 0;
        $maxIterations = count($tasks) * 2; // Prevent infinite loops

        while (count($processed) < count($tasks) && $iterations < $maxIterations) {
            $progressMade = false;
            
            foreach ($tasks as $task) {
                if (in_array($task->task_code, $processed)) {
                    continue; // Already processed
                }
                
                // Check if all predecessors are processed
                $canProcess = true;
                $maxPredecessorFinish = 0;
                
                if (!empty($task->predecessor_tasks)) {
                    foreach ($task->predecessor_tasks as $predecessorCode) {
                        if (!in_array($predecessorCode, $processed)) {
                            $canProcess = false;
                            break;
                        }
                        
                        if (isset($tasksByCode[$predecessorCode])) {
                            $predecessor = $tasksByCode[$predecessorCode];
                            $maxPredecessorFinish = max($maxPredecessorFinish, $predecessor->early_finish);
                        }
                    }
                }
                
                if ($canProcess) {
                    // Calculate ES and EF for this task
                    $task->early_start = $maxPredecessorFinish;
                    $task->early_finish = $task->early_start + $task->durasi_hari;
                    
                    $processed[] = $task->task_code;
                    $progressMade = true;
                }
            }
            
            if (!$progressMade) {
                // If no progress, there might be circular dependencies
                // Process remaining tasks in order
                foreach ($tasks as $task) {
                    if (!in_array($task->task_code, $processed)) {
                        $task->early_start = 0;
                        $task->early_finish = $task->durasi_hari;
                        $processed[] = $task->task_code;
                    }
                }
                break;
            }
            
            $iterations++;
        }

        // Find project duration (maximum EF)
        $projectDuration = $tasks->max('early_finish');

        // Step 2: BACKWARD PASS - Calculate Late Start (LS) and Late Finish (LF)
        // Find end tasks (tasks with no successors)
        $endTasks = [];
        foreach ($tasks as $task) {
            if (empty($task->successor_tasks)) {
                $endTasks[] = $task;
                $task->late_finish = $task->early_finish; // End tasks: LF = EF
                $task->late_start = $task->late_finish - $task->durasi_hari;
            }
        }

        // Process tasks in reverse topological order
        $processed = [];
        $iterations = 0;

        // Mark end tasks as processed
        foreach ($endTasks as $task) {
            $processed[] = $task->task_code;
        }

        while (count($processed) < count($tasks) && $iterations < $maxIterations) {
            $progressMade = false;
            
            foreach ($tasks->reverse() as $task) {
                if (in_array($task->task_code, $processed)) {
                    continue;
                }
                
                // Check if all successors are processed
                $canProcess = true;
                $minSuccessorStart = PHP_INT_MAX;
                
                if (!empty($task->successor_tasks)) {
                    foreach ($task->successor_tasks as $successorCode) {
                        if (!in_array($successorCode, $processed)) {
                            $canProcess = false;
                            break;
                        }
                        
                        if (isset($tasksByCode[$successorCode])) {
                            $successor = $tasksByCode[$successorCode];
                            $minSuccessorStart = min($minSuccessorStart, $successor->late_start);
                        }
                    }
                } else {
                    // Tasks with no successors should already be processed
                    $canProcess = false;
                }
                
                if ($canProcess && $minSuccessorStart !== PHP_INT_MAX) {
                    // Calculate LS and LF for this task
                    $task->late_finish = $minSuccessorStart;
                    $task->late_start = $task->late_finish - $task->durasi_hari;
                    
                    $processed[] = $task->task_code;
                    $progressMade = true;
                }
            }
            
            if (!$progressMade) {
                break;
            }
            
            $iterations++;
        }

        // Step 3: Calculate Total Float and identify Critical Path
        foreach ($tasks as $task) {
            // Total Float = LS - ES (or LF - EF, should be same)
            $task->total_float = $task->late_start - $task->early_start;
            
            // Critical tasks have zero float
            $task->is_critical = ($task->total_float == 0);
        }

        // Update project duration
        $this->total_durasi_hari = $projectDuration;

        // Save all calculations
        foreach ($tasks as $task) {
            $task->saveQuietly(); // Use saveQuietly to avoid triggering events
        }
        
        $this->save();
        
        // Log CPM calculation for debugging
        Log::info("CPM Calculation completed for project: {$this->nama_project}", [
            'project_id' => $this->id,
            'total_duration' => $projectDuration,
            'critical_tasks' => $tasks->where('is_critical', true)->pluck('nama_task')->toArray(),
            'task_count' => $tasks->count()
        ]);
    }

    /**
     * Auto-fix task dependencies if they are missing
     */
    private function autoFixTaskDependencies(): void
    {
        $tasks = $this->progressTasks()->orderBy('urutan_tampil')->get();
        
        // Check if tasks have proper dependencies
        $hasProperDependencies = false;
        foreach ($tasks as $task) {
            if (!empty($task->predecessor_tasks)) {
                $hasProperDependencies = true;
                break;
            }
        }

        // If no dependencies exist, auto-create them based on workflow
        if (!$hasProperDependencies) {
            $this->createDefaultDependencies($tasks);
        }
    }

    /**
     * Create default dependencies based on paint workflow (PDM Network)
     * Following the exact CPM structure provided with proper parallel activities
     */
    private function createDefaultDependencies($tasks): void
    {
        // CPM structure based on the provided table:
        // A->B,C->D->E->F->G,H->I->J->K,L->M
        $workflowRules = [
            // A - Start node (no predecessors)
            'bongkar body' => [],
            
            // B and C can run in parallel after A
            'repair' => ['bongkar body'],
            'repair body' => ['bongkar body'],
            'pembersihan sasis' => ['bongkar body'],
            
            // D depends on both B and C (merge point)
            'pengampelasan' => ['repair', 'pembersihan sasis'],
            
            // Alternative name mapping for D
            'pengampelasan' => ['repair body', 'pembersihan sasis'],
            
            // E depends on D
            'pembersihan body' => ['pengampelasan'],
            'pembersihan' => ['pengampelasan'],
            
            // F depends on E
            'aplikasi poxy' => ['pembersihan body'],
            'poxy' => ['pembersihan body'],
            'aplikasi poxy' => ['pembersihan'],
            'poxy' => ['pembersihan'],
            
            // G and H can run in parallel after F
            'base coat' => ['aplikasi poxy'],
            'pencampuran cat' => ['aplikasi poxy'],
            'base coat' => ['poxy'],
            'pencampuran cat' => ['poxy'],
            
            // I depends on both G and H (merge point)
            'color coat' => ['base coat', 'pencampuran cat'],
            'cat warna' => ['base coat', 'pencampuran cat'],
            
            // J depends on I
            'clear coat' => ['color coat'],
            'clear coat' => ['cat warna'],
            
            // K and L can start after J (parallel activities)
            'pemasangan body' => ['clear coat'],
            'quality check' => ['clear coat'],
            'cek kualitas' => ['clear coat'],
            
            // M depends on both K and L (final merge)
            'final review' => ['pemasangan body', 'quality check'],
            'final review' => ['pemasangan body', 'cek kualitas'],
        ];

        // Create task lookup by name for easier dependency resolution
        $tasksByName = [];
        foreach ($tasks as $task) {
            $normalizedName = strtolower(trim($task->nama_task));
            $tasksByName[$normalizedName] = $task;
        }

        // Reset all dependencies first
        foreach ($tasks as $task) {
            $task->predecessor_tasks = [];
            $task->successor_tasks = [];
        }

        // Apply logical dependencies
        foreach ($tasks as $task) {
            $taskName = strtolower(trim($task->nama_task));
            
            // Find matching rule
            $requiredPredecessors = null;
            if (isset($workflowRules[$taskName])) {
                $requiredPredecessors = $workflowRules[$taskName];
            } else {
                // Check for partial matches
                foreach ($workflowRules as $ruleName => $ruleDependencies) {
                    if (str_contains($taskName, $ruleName) || str_contains($ruleName, $taskName)) {
                        $requiredPredecessors = $ruleDependencies;
                        break;
                    }
                }
            }
            
            if ($requiredPredecessors !== null) {
                // Find actual task codes for the required predecessors
                $predecessorCodes = [];
                foreach ($requiredPredecessors as $predecessorName) {
                    $predecessorNameLower = strtolower(trim($predecessorName));
                    
                    // Find matching task
                    foreach ($tasksByName as $name => $candidateTask) {
                        if ($name === $predecessorNameLower || 
                            str_contains($name, $predecessorNameLower) ||
                            str_contains($predecessorNameLower, $name)) {
                            $predecessorCodes[] = $candidateTask->task_code;
                            break;
                        }
                    }
                }
                
                if (!empty($predecessorCodes)) {
                    $task->predecessor_tasks = array_unique($predecessorCodes);
                }
            }
        }

        // Build successor relationships based on predecessor relationships
        foreach ($tasks as $task) {
            if (!empty($task->predecessor_tasks)) {
                foreach ($task->predecessor_tasks as $predecessorCode) {
                    $predecessor = $tasks->firstWhere('task_code', $predecessorCode);
                    if ($predecessor) {
                        $successors = $predecessor->successor_tasks ?? [];
                        if (!in_array($task->task_code, $successors)) {
                            $successors[] = $task->task_code;
                            $predecessor->successor_tasks = $successors;
                        }
                    }
                }
            }
        }

        // Save all dependency changes
        foreach ($tasks as $task) {
            $task->saveQuietly(); // Save without triggering events
        }

        Log::info("Created default dependencies for project: {$this->nama_project}", [
            'project_id' => $this->id,
            'tasks_with_dependencies' => $tasks->filter(function($task) {
                return !empty($task->predecessor_tasks);
            })->count(),
            'total_tasks' => $tasks->count()
        ]);
    }

    /**
     * Update successor tasks for all tasks
     */
    private function updateAllSuccessorTasks($tasks): void
    {
        foreach ($tasks as $task) {
            if (!empty($task->predecessor_tasks)) {
                foreach ($task->predecessor_tasks as $predecessorId) {
                    $predecessor = $tasks->firstWhere('id', $predecessorId);
                    if ($predecessor) {
                        $successors = $predecessor->successor_tasks ?? [];
                        if (!in_array($task->id, $successors)) {
                            $successors[] = $task->id;
                            $predecessor->successor_tasks = $successors;
                            $predecessor->saveQuietly();
                        }
                    }
                }
            }
        }
    }

    /**
     * Get project statistics
     */
    public function getProjectStats(): array
    {
        $tasks = $this->progressTasks;
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status_task', 'completed')->count();
        $inProgressTasks = $tasks->where('status_task', 'in_progress')->count();
        $notStartedTasks = $tasks->where('status_task', 'not_started')->count();
        $criticalTasks = $tasks->where('is_critical', true)->count();
        $overdueTasks = $tasks->filter(function ($task) {
            return $task->isOverdue();
        })->count();

        return [
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'in_progress_tasks' => $inProgressTasks,
            'not_started_tasks' => $notStartedTasks,
            'critical_tasks' => $criticalTasks,
            'overdue_tasks' => $overdueTasks,
            'progress_percentage' => $this->progress_percentage,
        ];
    }

    /**
     * Check if project is overdue
     */
    public function isOverdue(): bool
    {
        if ($this->status_project === 'completed') {
            return false;
        }

        return $this->tanggal_target_selesai && 
               Carbon::parse($this->tanggal_target_selesai)->isPast();
    }

    /**
     * Get days remaining or overdue
     */
    public function getDaysRemaining(): int
    {
        if (!$this->tanggal_target_selesai) {
            return 0;
        }

        return Carbon::today()->diffInDays(
            Carbon::parse($this->tanggal_target_selesai), 
            false
        );
    }
}
