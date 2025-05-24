<?php

use App\Http\Controllers\CekProgresController;
use App\Http\Controllers\DaftarHargaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::redirect('/admin', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


Route::middleware(['auth'])->group(function () {


    Route::prefix('management')->group(function () {

        Route::prefix('daftar-harga')->group(function () {
            Route::get('', [DaftarHargaController::class, 'index'])->name('daftar-harga.index');
            Route::post('', [DaftarHargaController::class, 'store'])->name('daftar-harga.store');
            Route::post('{daftarHarga}', [DaftarHargaController::class, 'update'])->name('daftar-harga.update');
            Route::delete('{daftarHarga}', [DaftarHargaController::class, 'destroy'])->name('daftar-harga.destroy');
        });
    });
});


//Route Public

Route::get('/daftar-harga', [DaftarHargaController::class, 'pubicData'])->name('daftar-harga.pubic-data');
Route::get('cek-progress', [CekProgresController::class, 'index'])->name('cek-progress.index');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
