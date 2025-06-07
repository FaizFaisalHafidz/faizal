<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ProgressProject extends Model
{
    use HasFactory;

    protected $table = 'tt_progress_project';

    protected $fillable = [
        'project_id',
        'task_code',
        'nama_task',
        'deskripsi_task',
        'kategori_task',
        'durasi_hari',
        'durasi_jam',
        'predecessor_tasks',
        'successor_tasks',
        'early_start',
        'early_finish',
        'late_start',
        'late_finish',
        'total_float',
        'is_critical',
        'status_task',
        'progress_percentage',
        'tanggal_mulai_rencana',
        'tanggal_selesai_rencana',
        'tanggal_mulai_aktual',
        'tanggal_selesai_aktual',
        'pic_pengerjaan',
        'team_pengerjaan',
        'peralatan_dibutuhkan',
        'material_dibutuhkan',
        'quality_status',
        'catatan_quality',
        'catatan_progress',
        'estimasi_biaya_task',
        'biaya_aktual_task',
        'foto_progress',
        'dokumentasi_task',
        'warna_display',
        'urutan_tampil',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'tanggal_mulai_rencana' => 'date',
        'tanggal_selesai_rencana' => 'date',
        'tanggal_mulai_aktual' => 'date',
        'tanggal_selesai_aktual' => 'date',
        'predecessor_tasks' => 'array',
        'successor_tasks' => 'array',
        'team_pengerjaan' => 'array',
        'foto_progress' => 'array',
        'estimasi_biaya_task' => 'decimal:2',
        'biaya_aktual_task' => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'early_start' => 'integer',
        'early_finish' => 'integer',
        'late_start' => 'integer',
        'late_finish' => 'integer',
        'total_float' => 'integer',
        'is_critical' => 'boolean',
        'urutan_tampil' => 'integer',
    ];

    // Konstanta untuk enum values
    const KATEGORI_TASK = [
        'bongkar_body' => 'Bongkar Body',
        'pengampelasan' => 'Pengampelasan',
        'repair_body' => 'Repair Body',
        'poxy' => 'Aplikasi Poxy',
        'base_coat' => 'Base Coat',
        'color_coat' => 'Color Coat',
        'clear_coat' => 'Clear Coat',
        'pemasangan_body' => 'Pemasangan Body',
        'quality_check' => 'Quality Check',
        'other' => 'Lainnya'
    ];

    const STATUS_TASK = [
        'not_started' => 'Belum Dimulai',
        'in_progress' => 'Sedang Dikerjakan',
        'completed' => 'Selesai',
        'on_hold' => 'Ditahan',
        'cancelled' => 'Dibatalkan'
    ];

    const QUALITY_STATUS = [
        'pending' => 'Menunggu QC',
        'passed' => 'Lolos QC',
        'failed' => 'Gagal QC',
        'rework' => 'Perlu Perbaikan'
    ];

    // Relationship
    public function project(): BelongsTo
    {
        return $this->belongsTo(DataProject::class, 'project_id');
    }

    // Boot method untuk auto-generate task code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->task_code)) {
                $model->task_code = $model->generateTaskCode();
            }
        });
    }

    // Method untuk generate task code
    private function generateTaskCode(): string
    {
        $prefix = 'TSK';
        $date = date('Y');
        $lastCode = static::where('task_code', 'like', "{$prefix}-{$date}-%")
                         ->orderBy('task_code', 'desc')
                         ->first();

        if ($lastCode) {
            $lastNumber = (int) substr($lastCode->task_code, -3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . '-' . $date . '-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }

    // Accessor methods
    public function getKategoriTaskLabelAttribute(): string
    {
        return self::KATEGORI_TASK[$this->kategori_task] ?? $this->kategori_task;
    }

    public function getStatusTaskLabelAttribute(): string
    {
        return self::STATUS_TASK[$this->status_task] ?? $this->status_task;
    }

    public function getQualityStatusLabelAttribute(): string
    {
        return self::QUALITY_STATUS[$this->quality_status] ?? $this->quality_status;
    }

    // CPM Related Methods
    public function getPredecessorTasks()
    {
        if (empty($this->predecessor_tasks)) {
            return collect();
        }

        return static::whereIn('id', $this->predecessor_tasks)->get();
    }

    public function getSuccessorTasks()
    {
        if (empty($this->successor_tasks)) {
            return collect();
        }

        return static::whereIn('id', $this->successor_tasks)->get();
    }

    /**
     * Start the task
     */
    public function startTask(): void
    {
        $this->status_task = 'in_progress';
        $this->progress_percentage = 1; // 1% to indicate started
        $this->tanggal_mulai_aktual = now();
        $this->updated_by = auth()->user()->name ?? 'System';
        
        $this->save();
        
        // Update project progress
        $this->project->updateProjectProgress();
    }

    /**
     * Complete the task
     */
    public function completeTask(): void
    {
        $this->status_task = 'completed';
        $this->progress_percentage = 100;
        $this->tanggal_selesai_aktual = now();
        $this->quality_status = 'passed'; // Auto set to passed when completed
        $this->updated_by = auth()->user()->name ?? 'System';
        
        $this->save();
        
        // Update project progress
        $this->project->updateProjectProgress();
    }

    /**
     * Update task progress
     */
    public function updateProgress(float $percentage): void
    {
        $this->progress_percentage = min(100, max(0, $percentage));
        
        // Auto update status based on progress
        if ($this->progress_percentage == 0) {
            $this->status_task = 'not_started';
            $this->tanggal_mulai_aktual = null;
        } elseif ($this->progress_percentage == 100) {
            $this->status_task = 'completed';
            $this->tanggal_selesai_aktual = now();
            $this->quality_status = 'passed';
        } else {
            $this->status_task = 'in_progress';
            if (!$this->tanggal_mulai_aktual) {
                $this->tanggal_mulai_aktual = now();
            }
        }
        
        $this->updated_by = auth()->user()->name ?? 'System';
        $this->save();
        
        // Update project progress
        $this->project->updateProjectProgress();
    }

    /**
     * Check if task can be started
     */
    public function canStart(): bool
    {
        if ($this->status_task !== 'not_started') {
            return false;
        }

        // Check if all predecessor tasks are completed
        if (empty($this->predecessor_tasks)) {
            return true;
        }

        $predecessors = static::whereIn('id', $this->predecessor_tasks)->get();
        
        return $predecessors->every(function ($predecessor) {
            return $predecessor->status_task === 'completed';
        });
    }

    /**
     * Check if task is overdue
     */
    public function isOverdue(): bool
    {
        if ($this->status_task === 'completed') {
            return false;
        }

        if (!$this->tanggal_selesai_rencana) {
            return false;
        }

        return Carbon::parse($this->tanggal_selesai_rencana)->isPast();
    }

    /**
     * Get days overdue
     */
    public function getDaysOverdue(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        return Carbon::today()->diffInDays(
            Carbon::parse($this->tanggal_selesai_rencana)
        );
    }

    /**
     * Get estimated completion date
     */
    public function getEstimatedCompletionDate(): ?string
    {
        if ($this->status_task === 'completed') {
            return $this->tanggal_selesai_aktual;
        }

        if ($this->tanggal_selesai_rencana) {
            return $this->tanggal_selesai_rencana;
        }

        // Calculate based on early finish if CPM is calculated
        if ($this->early_finish > 0) {
            $projectStart = $this->project->tanggal_mulai ?? now();
            return Carbon::parse($projectStart)->addDays($this->early_finish)->toDateString();
        }

        return null;
    }

    // Scope methods
    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status_task', $status);
    }

    public function scopeInProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeOrderedForDisplay($query)
    {
        return $query->orderBy('urutan_tampil')->orderBy('early_start')->orderBy('id');
    }
}
