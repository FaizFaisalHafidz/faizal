<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DataProject;
use App\Models\ProgressProject;
use Carbon\Carbon;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Project 1: Custom Paint Mobil
        $project1 = DataProject::create([
            'project_code' => 'PRJ-' . date('Y') . '-001',
            'nama_project' => 'Custom Paint Honda Civic',
            'deskripsi_project' => 'Custom paint dengan design flame dan airbrushing detail pada Honda Civic 2019',
            'jenis_project' => 'custom_paint',
            'plat_nomor' => 'B 1234 ABC',
            'nama_pemilik' => 'Budi Santoso',
            'no_telp_pemilik' => '081234567890',
            'email_pemilik' => 'budi.santoso@gmail.com',
            'alamat_pemilik' => 'Jl. Merdeka No. 123, Jakarta Selatan',
            'jenis_kendaraan' => 'mobil',
            'merk_kendaraan' => 'Honda',
            'tipe_kendaraan' => 'Civic Type R',
            'tahun_kendaraan' => '2019',
            'warna_awal' => 'Putih Championship',
            'warna_target' => 'Flame Red dengan Airbrushing',
            'tanggal_masuk' => Carbon::now()->subDays(5)->toDateString(),
            'tanggal_target_selesai' => Carbon::now()->addDays(10)->toDateString(),
            'status_project' => 'in_progress',
            'prioritas' => 'high',
            'estimasi_biaya' => 15000000,
            'biaya_aktual' => 0,
            'total_pembayaran' => 7500000, // DP 50%
            'status_pembayaran' => 'dp', // Ubah dari 'partial' ke 'dp'
            'progress_percentage' => 35,
            'catatan_khusus' => 'Customer request flame design di bagian samping dan hood. Airbrushing logo JDM di bagian belakang.',
            'created_by' => 'System',
            'created_at' => Carbon::now()->subDays(5),
            'updated_at' => Carbon::now(),
        ]);

        // Create tasks for Project 1
        $this->createDefaultTasks($project1, [
            [
                'nama_task' => 'Bongkar Body',
                'deskripsi_task' => 'Pembongkaran body dan komponen yang akan dicat',
                'kategori_task' => 'bongkar_body',
                'durasi_hari' => 1,
                'status_task' => 'completed',
                'progress_percentage' => 100,
                'warna_display' => '#C81E1E',
                'tanggal_mulai_aktual' => Carbon::now()->subDays(5)->toDateString(),
                'tanggal_selesai_aktual' => Carbon::now()->subDays(4)->toDateString(),
                'pic_pengerjaan' => 'Ahmad',
                'quality_status' => 'passed',
            ],
            [
                'nama_task' => 'Pengampelasan',
                'deskripsi_task' => 'Pengampelasan permukaan untuk persiapan cat',
                'kategori_task' => 'pengampelasan',
                'durasi_hari' => 1,
                'status_task' => 'completed',
                'progress_percentage' => 100,
                'warna_display' => '#A8A8A8',
                'tanggal_mulai_aktual' => Carbon::now()->subDays(4)->toDateString(),
                'tanggal_selesai_aktual' => Carbon::now()->subDays(3)->toDateString(),
                'pic_pengerjaan' => 'Joko',
                'quality_status' => 'passed',
                'predecessor_tasks' => [1],
            ],
            [
                'nama_task' => 'Aplikasi Poxy',
                'deskripsi_task' => 'Aplikasi lapisan dasar poxy primer',
                'kategori_task' => 'poxy',
                'durasi_hari' => 1,
                'status_task' => 'in_progress',
                'progress_percentage' => 60,
                'warna_display' => '#236D8A',
                'tanggal_mulai_aktual' => Carbon::now()->subDays(3)->toDateString(),
                'pic_pengerjaan' => 'Rudi',
                'quality_status' => 'pending',
                'predecessor_tasks' => [2],
            ],
            [
                'nama_task' => 'Base Coat',
                'deskripsi_task' => 'Aplikasi cat dasar sebelum color coat',
                'kategori_task' => 'base_coat',
                'durasi_hari' => 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#E9742B',
                'pic_pengerjaan' => 'Rudi',
                'quality_status' => 'pending',
                'predecessor_tasks' => [3],
            ],
            [
                'nama_task' => 'Color Coat & Flame Design',
                'deskripsi_task' => 'Aplikasi cat warna dengan custom flame design',
                'kategori_task' => 'color_coat',
                'durasi_hari' => 2,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#78AB46',
                'pic_pengerjaan' => 'Master Painter',
                'quality_status' => 'pending',
                'estimasi_biaya_task' => 5000000,
                'predecessor_tasks' => [4],
            ],
            [
                'nama_task' => 'Airbrushing Detail',
                'deskripsi_task' => 'Detail airbrushing logo dan finishing touches',
                'kategori_task' => 'other', // Karena 'detailing' tidak ada di enum
                'durasi_hari' => 2,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#9B59B6',
                'pic_pengerjaan' => 'Airbrush Specialist',
                'quality_status' => 'pending',
                'estimasi_biaya_task' => 3000000,
                'predecessor_tasks' => [5],
            ],
            [
                'nama_task' => 'Clear Coat',
                'deskripsi_task' => 'Aplikasi clear coat untuk finishing dan proteksi',
                'kategori_task' => 'clear_coat',
                'durasi_hari' => 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#444444',
                'pic_pengerjaan' => 'Rudi',
                'quality_status' => 'pending',
                'predecessor_tasks' => [6],
            ],
            [
                'nama_task' => 'Pemasangan Body',
                'deskripsi_task' => 'Pemasangan kembali body dan komponen',
                'kategori_task' => 'pemasangan_body',
                'durasi_hari' => 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#FF4433',
                'pic_pengerjaan' => 'Ahmad',
                'quality_status' => 'pending',
                'predecessor_tasks' => [7],
            ],
        ]);

        // Project 2: Restorasi Motor
        $project2 = DataProject::create([
            'project_code' => 'PRJ-' . date('Y') . '-002',
            'nama_project' => 'Restorasi Yamaha RX King',
            'deskripsi_project' => 'Full restorasi Yamaha RX King 1997 dengan cat original dan perbaikan mesin',
            'jenis_project' => 'full_restoration', // Ubah dari 'restoration' ke 'full_restoration'
            'plat_nomor' => 'B 5678 DEF',
            'nama_pemilik' => 'Andi Wijaya',
            'no_telp_pemilik' => '081987654321',
            'email_pemilik' => 'andi.wijaya@yahoo.com',
            'alamat_pemilik' => 'Jl. Veteran No. 456, Bekasi',
            'jenis_kendaraan' => 'motor',
            'merk_kendaraan' => 'Yamaha',
            'tipe_kendaraan' => 'RX King',
            'tahun_kendaraan' => '1997',
            'warna_awal' => 'Biru Pudar',
            'warna_target' => 'Biru Speed Original',
            'tanggal_masuk' => Carbon::now()->subDays(2)->toDateString(),
            'tanggal_target_selesai' => Carbon::now()->addDays(20)->toDateString(),
            'status_project' => 'confirmed',
            'prioritas' => 'normal',
            'estimasi_biaya' => 8500000,
            'biaya_aktual' => 0,
            'total_pembayaran' => 2500000, // DP 30%
            'status_pembayaran' => 'dp', // Ubah dari 'partial' ke 'dp'
            'progress_percentage' => 0,
            'catatan_khusus' => 'Motor kondisi original, owner ingin dikembalikan ke kondisi seperti baru. Perlu perbaikan karburator dan sistem kelistrikan.',
            'created_by' => 'System',
            'created_at' => Carbon::now()->subDays(2),
            'updated_at' => Carbon::now(),
        ]);

        // Create tasks for Project 2
        $this->createDefaultTasks($project2, [
            [
                'nama_task' => 'Inspeksi & Assessment',
                'deskripsi_task' => 'Pemeriksaan kondisi motor secara menyeluruh',
                'kategori_task' => 'quality_check',
                'durasi_hari' => 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#3498DB',
                'pic_pengerjaan' => 'Mekanik Senior',
                'quality_status' => 'pending',
            ],
            [
                'nama_task' => 'Bongkar Total',
                'deskripsi_task' => 'Pembongkaran total semua komponen motor',
                'kategori_task' => 'bongkar_body',
                'durasi_hari' => 2,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#E74C3C',
                'pic_pengerjaan' => 'Tim Mekanik',
                'quality_status' => 'pending',
                'predecessor_tasks' => [1],
            ],
            [
                'nama_task' => 'Overhaul Mesin',
                'deskripsi_task' => 'Overhaul lengkap mesin dan karburator',
                'kategori_task' => 'other', // Karena 'mesin' tidak ada di enum
                'durasi_hari' => 5,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#F39C12',
                'pic_pengerjaan' => 'Spesialis Mesin',
                'quality_status' => 'pending',
                'estimasi_biaya_task' => 3500000,
                'predecessor_tasks' => [2],
            ],
            [
                'nama_task' => 'Restorasi Body',
                'deskripsi_task' => 'Perbaikan dempul dan persiapan pengecatan',
                'kategori_task' => 'repair_body',
                'durasi_hari' => 3,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#95A5A6',
                'pic_pengerjaan' => 'Body Repair',
                'quality_status' => 'pending',
                'estimasi_biaya_task' => 1500000,
                'predecessor_tasks' => [2],
            ],
            [
                'nama_task' => 'Pengecatan Original',
                'deskripsi_task' => 'Pengecatan dengan warna original Yamaha RX King',
                'kategori_task' => 'color_coat',
                'durasi_hari' => 4,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#2E86AB',
                'pic_pengerjaan' => 'Painter',
                'quality_status' => 'pending',
                'estimasi_biaya_task' => 2000000,
                'predecessor_tasks' => [4],
            ],
            [
                'nama_task' => 'Perakitan Ulang',
                'deskripsi_task' => 'Perakitan ulang semua komponen',
                'kategori_task' => 'pemasangan_body',
                'durasi_hari' => 3,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#27AE60',
                'pic_pengerjaan' => 'Tim Assembly',
                'quality_status' => 'pending',
                'predecessor_tasks' => [3, 5],
            ],
            [
                'nama_task' => 'Test & Tuning',
                'deskripsi_task' => 'Testing performa dan fine tuning',
                'kategori_task' => 'other',
                'durasi_hari' => 2,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#8E44AD',
                'pic_pengerjaan' => 'Tuner',
                'quality_status' => 'pending',
                'predecessor_tasks' => [6],
            ],
            [
                'nama_task' => 'Final Check & Detailing',
                'deskripsi_task' => 'Pemeriksaan akhir dan detailing finishing',
                'kategori_task' => 'quality_check',
                'durasi_hari' => 1,
                'status_task' => 'not_started',
                'progress_percentage' => 0,
                'warna_display' => '#D35400',
                'pic_pengerjaan' => 'QC Team',
                'quality_status' => 'pending',
                'predecessor_tasks' => [7],
            ],
        ]);

        // Calculate CPM for both projects
        $project1->calculateCPM();
        $project2->calculateCPM();
    }

    /**
     * Create tasks for a project
     */
    private function createDefaultTasks(DataProject $project, array $tasksData): void
    {
        $createdTasks = [];

        foreach ($tasksData as $index => $taskData) {
            $task = ProgressProject::create([
                'project_id' => $project->id,
                'task_code' => 'TSK-' . $project->project_code . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'nama_task' => $taskData['nama_task'],
                'deskripsi_task' => $taskData['deskripsi_task'] ?? null,
                'kategori_task' => $taskData['kategori_task'],
                'durasi_hari' => $taskData['durasi_hari'],
                'durasi_jam' => 8, // Default 8 jam per hari
                'status_task' => $taskData['status_task'] ?? 'not_started',
                'progress_percentage' => $taskData['progress_percentage'] ?? 0,
                'warna_display' => $taskData['warna_display'],
                'urutan_tampil' => $index + 1,
                'pic_pengerjaan' => $taskData['pic_pengerjaan'] ?? null,
                'quality_status' => $taskData['quality_status'] ?? 'pending',
                'estimasi_biaya_task' => $taskData['estimasi_biaya_task'] ?? 0,
                'biaya_aktual_task' => $taskData['biaya_aktual_task'] ?? 0,
                'tanggal_mulai_aktual' => $taskData['tanggal_mulai_aktual'] ?? null,
                'tanggal_selesai_aktual' => $taskData['tanggal_selesai_aktual'] ?? null,
                'created_by' => 'System',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            $createdTasks[$index + 1] = $task;
        }

        // Update predecessor/successor relationships
        foreach ($tasksData as $index => $taskData) {
            if (isset($taskData['predecessor_tasks']) && !empty($taskData['predecessor_tasks'])) {
                $task = $createdTasks[$index + 1];
                $predecessorIds = [];

                foreach ($taskData['predecessor_tasks'] as $predecessorIndex) {
                    if (isset($createdTasks[$predecessorIndex])) {
                        $predecessorIds[] = $createdTasks[$predecessorIndex]->id;
                    }
                }

                if (!empty($predecessorIds)) {
                    $task->predecessor_tasks = $predecessorIds;
                    $task->save();

                    // Update successor relationships
                    foreach ($predecessorIds as $predecessorId) {
                        $predecessor = ProgressProject::find($predecessorId);
                        if ($predecessor) {
                            $successors = $predecessor->successor_tasks ?? [];
                            if (!in_array($task->id, $successors)) {
                                $successors[] = $task->id;
                                $predecessor->successor_tasks = $successors;
                                $predecessor->save();
                            }
                        }
                    }
                }
            }
        }
    }
}
