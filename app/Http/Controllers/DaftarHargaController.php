<?php

namespace App\Http\Controllers;

use App\Models\DaftarHarga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DaftarHargaController extends Controller
{
    public function index()
    {
        $daftarHarga = DaftarHarga::get();

        return Inertia::render('Management/DaftarHarga/index', [
            'daftarHarga' => $daftarHarga,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'nullable|string|max:30',
            'nama_paket' => 'nullable|string|max:50',
            'harga' => 'nullable|integer',
            'deskripsi' => 'nullable|string',
        ]);

        DaftarHarga::create($validated);

        return redirect()->route('daftar-harga.index')
            ->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, DaftarHarga $daftarHarga)
    {
        $validated = $request->validate([
            'kategori' => 'nullable|string|max:30',
            'nama_paket' => 'nullable|string|max:50',
            'harga' => 'nullable|integer',
            'deskripsi' => 'nullable|string',
        ]);

        $daftarHarga->update($validated);

        return redirect()->route('daftar-harga.index')
            ->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(DaftarHarga $daftarHarga)
    {
        $daftarHarga->delete();

        return redirect()->route('daftar-harga.index')
            ->with('success', 'Data berhasil dihapus.');
    }

    public function pubicData()
    {
        $daftarHarga = DaftarHarga::get();

        return Inertia::render('Pricelist/index', [
            'daftarHarga' => $daftarHarga,
        ]);
    }
}
