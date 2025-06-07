<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
     */
    public function calculateCPM(): void
    {
        $tasks = $this->progressTasks()->orderBy('urutan_tampil')->get();
        
        if ($tasks->isEmpty()) {
            return;
        }

        // Reset all calculations
        foreach ($tasks as $task) {
            $task->early_start = 0;
            $task->early_finish = 0;
            $task->late_start = 0;
            $task->late_finish = 0;
            $task->total_float = 0;
            $task->is_critical = false;
        }

        // Forward pass - calculate Early Start and Early Finish
        foreach ($tasks as $task) {
            $maxEarlyFinish = 0;
            
            if (!empty($task->predecessor_tasks)) {
                foreach ($task->predecessor_tasks as $predecessorId) {
                    $predecessor = $tasks->firstWhere('id', $predecessorId);
                    if ($predecessor) {
                        $maxEarlyFinish = max($maxEarlyFinish, $predecessor->early_finish);
                    }
                }
            }
            
            $task->early_start = $maxEarlyFinish;
            $task->early_finish = $task->early_start + $task->durasi_hari;
        }

        // Find project duration
        $projectDuration = $tasks->max('early_finish');

        // Backward pass - calculate Late Start and Late Finish
        foreach ($tasks->reverse() as $task) {
            $minLateStart = $projectDuration;
            
            if (!empty($task->successor_tasks)) {
                foreach ($task->successor_tasks as $successorId) {
                    $successor = $tasks->firstWhere('id', $successorId);
                    if ($successor) {
                        $minLateStart = min($minLateStart, $successor->late_start);
                    }
                }
            }
            
            $task->late_finish = $minLateStart;
            $task->late_start = $task->late_finish - $task->durasi_hari;
            
            // Calculate total float
            $task->total_float = $task->late_start - $task->early_start;
            
            // Mark as critical if total float is 0
            $task->is_critical = ($task->total_float == 0);
        }

        // Save all calculations
        foreach ($tasks as $task) {
            $task->saveQuietly(); // Use saveQuietly to avoid triggering events
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
