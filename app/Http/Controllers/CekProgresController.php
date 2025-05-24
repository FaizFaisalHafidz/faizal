<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CekProgresController extends Controller
{
    public function index()
    {
        return Inertia::render('Progres/CekProgres');
    }
}
