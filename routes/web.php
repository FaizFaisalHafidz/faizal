<?php

use App\Http\Controllers\CekProgresController;
use App\Http\Controllers\DaftarHargaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProgressProjectController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::redirect('/admin', '/dashboard');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::middleware(['auth', 'role:admin'])->group(function () {

    

    Route::prefix('management')->group(function () {

        // Daftar Harga Routes
        Route::prefix('daftar-harga')->group(function () {
            Route::get('', [DaftarHargaController::class, 'index'])->name('daftar-harga.index');
            Route::post('', [DaftarHargaController::class, 'store'])->name('daftar-harga.store');
            Route::post('{daftarHarga}', [DaftarHargaController::class, 'update'])->name('daftar-harga.update');
            Route::delete('{daftarHarga}', [DaftarHargaController::class, 'destroy'])->name('daftar-harga.destroy');
        });

        // Project Management Routes
        Route::prefix('projects')->name('projects.')->group(function () {
            // Main CRUD Routes
            Route::get('', [ProjectController::class, 'index'])->name('index');
            Route::get('create', [ProjectController::class, 'create'])->name('create');
            Route::post('', [ProjectController::class, 'store'])->name('store');
            Route::get('{project}', [ProjectController::class, 'show'])->name('show');
            Route::get('{project}/edit', [ProjectController::class, 'edit'])->name('edit');
            Route::put('{project}', [ProjectController::class, 'update'])->name('update');
            Route::delete('{project}', [ProjectController::class, 'destroy'])->name('destroy');

            // Special Actions
            Route::post('{project}/status', [ProjectController::class, 'updateStatus'])->name('update-status');
            Route::get('{project}/timeline', [ProjectController::class, 'timeline'])->name('timeline');
            Route::post('{project}/recalculate-cpm', [ProjectController::class, 'recalculateCPM'])->name('recalculate-cpm');

            // Project Tasks Management
            Route::prefix('{project}/tasks')->name('tasks.')->group(function () {
                Route::get('', [ProgressProjectController::class, 'index'])->name('index');
                Route::post('', [ProgressProjectController::class, 'store'])->name('store');
                Route::get('{task}', [ProgressProjectController::class, 'show'])->name('show');
                Route::put('{task}', [ProgressProjectController::class, 'update'])->name('update');
                Route::delete('{task}', [ProgressProjectController::class, 'destroy'])->name('destroy');

                // Task Actions
                Route::post('{task}/start', [ProgressProjectController::class, 'startTask'])->name('start');
                Route::post('{task}/complete', [ProgressProjectController::class, 'completeTask'])->name('complete');
                Route::post('{task}/update-progress', [ProgressProjectController::class, 'updateProgress'])->name('update-progress');
                Route::post('{task}/quality-check', [ProgressProjectController::class, 'qualityCheck'])->name('quality-check');
                Route::post('{task}/upload-photo', [ProgressProjectController::class, 'uploadPhoto'])->name('upload-photo');

                // Bulk Actions
                Route::post('bulk-update', [ProgressProjectController::class, 'bulkUpdate'])->name('bulk-update');
                Route::post('reorder', [ProgressProjectController::class, 'reorder'])->name('reorder');
            });
        });

       


        // Dashboard & Reports
       
    });
});

Route::middleware(['auth', 'role:admin|owner'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/chart-data', [DashboardController::class, 'getChartData'])->name('dashboard.chart-data');
    Route::get('/dashboard/summary', [DashboardController::class, 'getSummary'])->name('dashboard.summary');
    // Dashboard Routes
    //Route Laporan
     Route::prefix('/management/users')->name('users.')->group(function () {
            // Main CRUD Routes
            Route::get('', [UserController::class, 'index'])->name('index');
            Route::get('create', [UserController::class, 'create'])->name('create');
            Route::post('', [UserController::class, 'store'])->name('store');
            Route::get('{user}', [UserController::class, 'show'])->name('show');
            Route::get('{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('{user}', [UserController::class, 'update'])->name('update');
            Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');

            // Additional user actions
            Route::post('{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('{user}/send-password-reset', [UserController::class, 'sendPasswordReset'])->name('send-password-reset');
            Route::get('{user}/activity-logs', [UserController::class, 'activityLogs'])->name('activity-logs');

            // Bulk actions
            Route::post('bulk-action', [UserController::class, 'bulkAction'])->name('bulk-action');
        });


    // Report Routes
    Route::prefix('laporan')->name('reports.')->group(function () {
        Route::get('', [ReportController::class, 'index'])->name('index');
        Route::get('export/pdf', [ReportController::class, 'exportPdf'])->name('export.pdf');
        Route::get('export/excel', [ReportController::class, 'exportExcel'])->name('export.excel');
        Route::get('chart-data', [ReportController::class, 'getChartData'])->name('chart-data');
    });
});

// Public Routes
Route::get('/daftar-harga', [DaftarHargaController::class, 'pubicData'])->name('daftar-harga.pubic-data');
Route::get('cek-progress', [CekProgresController::class, 'index'])->name('cek-progress.index');

// Public Progress Check Routes
Route::get('/progress', [CekProgresController::class, 'index'])->name('progress.index');
Route::post('/progress/check', [CekProgresController::class, 'checkProgress'])->name('progress.check');
Route::get('/progress/projects', [CekProgresController::class, 'getPublicProjects'])->name('progress.projects');
Route::post('/progress/photos', [CekProgresController::class, 'getProjectPhotos'])->name('progress.photos');

// API Routes untuk public access
Route::prefix('api/public')->name('api.public.')->group(function () {
    Route::get('projects/{projectCode}/status', [ProjectController::class, 'publicStatus'])->name('project.status');
    Route::get('projects/{projectCode}/timeline', [ProjectController::class, 'publicTimeline'])->name('project.timeline');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
