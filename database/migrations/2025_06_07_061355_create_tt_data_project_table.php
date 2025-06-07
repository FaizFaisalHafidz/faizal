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
        Schema::create('tt_data_project', function (Blueprint $table) {
            $table->id();
            
            // Informasi Dasar Project
            $table->string('project_code')->unique()->comment('Kode unik project (AUTO-GENERATED)');
            $table->string('nama_project');
            $table->text('deskripsi_project')->nullable();
            $table->enum('jenis_project', [
                'custom_paint', 
                'body_repair', 
                'full_restoration', 
                'maintenance', 
                'modification',
                'other'
            ])->default('custom_paint');
            
            // Informasi Kendaraan
            $table->string('plat_nomor');
            $table->string('nama_pemilik');
            $table->string('no_telp_pemilik');
            $table->string('email_pemilik')->nullable();
            $table->string('alamat_pemilik')->nullable();
            $table->enum('jenis_kendaraan', ['motor', 'mobil', 'truck', 'other'])->default('motor');
            $table->string('merk_kendaraan');
            $table->string('tipe_kendaraan');
            $table->string('tahun_kendaraan')->nullable();
            $table->string('warna_awal')->nullable();
            $table->string('warna_target')->nullable();
            
            // Timeline & Status
            $table->date('tanggal_masuk');
            $table->date('tanggal_target_selesai');
            $table->date('tanggal_selesai_aktual')->nullable();
            $table->enum('status_project', [
                'draft',
                'confirmed', 
                'in_progress', 
                'completed', 
                'cancelled',
                'on_hold'
            ])->default('draft');
            $table->enum('prioritas', ['low', 'normal', 'high', 'urgent'])->default('normal');
            
            // Informasi Biaya
            $table->decimal('estimasi_biaya', 15, 2)->default(0);
            $table->decimal('biaya_aktual', 15, 2)->default(0);
            $table->decimal('total_pembayaran', 15, 2)->default(0);
            $table->enum('status_pembayaran', ['belum_bayar', 'dp', 'cicilan', 'lunas'])->default('belum_bayar');
            
            // CPM Data
            $table->integer('total_durasi_hari')->default(0)->comment('Total durasi dari CPM calculation');
            $table->json('critical_path')->nullable()->comment('Array dari task IDs yang ada di critical path');
            $table->decimal('progress_percentage', 5, 2)->default(0)->comment('Persentase progress keseluruhan');
            
            // Catatan & Dokumentasi
            $table->text('catatan_khusus')->nullable();
            $table->text('catatan_internal')->nullable();
            $table->json('foto_before')->nullable()->comment('Array foto sebelum pengerjaan');
            $table->json('foto_after')->nullable()->comment('Array foto setelah pengerjaan');
            $table->json('dokumentasi_progress')->nullable()->comment('Array foto progress per tahap');
            
            // Metadata
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['status_project', 'prioritas']);
            $table->index(['tanggal_masuk', 'tanggal_target_selesai']);
            $table->index('plat_nomor');
            $table->index('project_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tt_data_project');
    }
};
