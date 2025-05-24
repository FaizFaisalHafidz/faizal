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
        Schema::create('data_daftar_harga', function (Blueprint $table) {
            $table->id();
            $table->string('kategori', 30)->nullable();
            $table->string('nama_paket', 50)->nullable();
            $table->integer('harga')->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_daftar_harga');
    }
};
