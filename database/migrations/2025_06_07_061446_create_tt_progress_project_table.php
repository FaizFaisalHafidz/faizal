<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tt_progress_project', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke Project
            $table->foreignId('project_id')->constrained('tt_data_project')
                  ->onUpdate('cascade')->onDelete('cascade');
            
            // Informasi Task/Progress
            $table->string('task_code')->comment('Kode unik untuk task (AUTO-GENERATED)');
            $table->string('nama_task');
            $table->text('deskripsi_task')->nullable();
            $table->enum('kategori_task', [
                'bongkar_body',
                'repair_body', 
                'pengampelasan',
                'poxy',
                'base_coat',
                'color_coat',
                'clear_coat',
                'polishing',
                'pemasangan_body',
                'quality_check',
                'other'
            ]);
            
            // CPM Properties
            $table->integer('durasi_hari')->default(1)->comment('Durasi pengerjaan dalam hari');
            $table->integer('durasi_jam')->default(8)->comment('Durasi pengerjaan dalam jam');
            $table->json('predecessor_tasks')->nullable()->comment('Array of task IDs yang harus selesai dulu');
            $table->json('successor_tasks')->nullable()->comment('Array of task IDs yang bergantung pada task ini');
            
            // CPM Calculated Fields
            $table->integer('early_start')->default(0)->comment('Earliest Start Time (ES)');
            $table->integer('early_finish')->default(0)->comment('Earliest Finish Time (EF)');
            $table->integer('late_start')->default(0)->comment('Latest Start Time (LS)');
            $table->integer('late_finish')->default(0)->comment('Latest Finish Time (LF)');
            $table->integer('total_float')->default(0)->comment('Total Float/Slack Time');
            $table->boolean('is_critical')->default(false)->comment('Apakah task ini ada di critical path');
            
            // Status & Progress
            $table->enum('status_task', [
                'not_started',
                'in_progress', 
                'completed',
                'on_hold',
                'cancelled'
            ])->default('not_started');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->date('tanggal_mulai_rencana')->nullable();
            $table->date('tanggal_selesai_rencana')->nullable();
            $table->date('tanggal_mulai_aktual')->nullable();
            $table->date('tanggal_selesai_aktual')->nullable();
            
            // Resource & Assignment
            $table->string('pic_pengerjaan')->nullable()->comment('Person in Charge');
            $table->json('team_pengerjaan')->nullable()->comment('Array team members');
            $table->text('peralatan_dibutuhkan')->nullable();
            $table->text('material_dibutuhkan')->nullable();
            
            // Quality & Documentation
            $table->enum('quality_status', ['pending', 'passed', 'failed', 'rework'])->default('pending');
            $table->text('catatan_quality')->nullable();
            $table->text('catatan_progress')->nullable();
            $table->json('foto_progress')->nullable()->comment('Array foto progress task');
            
            // Cost Tracking
            $table->decimal('estimasi_biaya_task', 12, 2)->default(0);
            $table->decimal('biaya_aktual_task', 12, 2)->default(0);
            
            // Ordering & Display
            $table->integer('urutan_tampil')->default(0)->comment('Urutan untuk display di UI');
            $table->string('warna_display', 7)->default('#FF4433')->comment('Warna untuk display timeline');
            
            // Metadata
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'status_task']);
            $table->index(['project_id', 'urutan_tampil']);
            $table->index(['is_critical', 'status_task']);
            $table->index('task_code');
            $table->unique(['project_id', 'task_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_progress_project');
    }
};
