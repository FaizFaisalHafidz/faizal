<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 15mm;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.3;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 18px;
            font-weight: bold;
        }
        
        .header p {
            margin: 3px 0;
            color: #666;
            font-size: 9px;
        }
        
        .stats {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .stat-card {
            display: table-cell;
            background: #f8f9fa;
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
            vertical-align: top;
            width: 25%;
        }
        
        .stat-card h3 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 10px;
            font-weight: bold;
        }
        
        .stat-card .value {
            font-size: 14px;
            font-weight: bold;
            color: #0066cc;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 8px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 4px 3px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 8px;
            text-align: center;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 8px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        .status {
            padding: 2px 4px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
            text-align: center;
        }
        
        .status.completed {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status.confirmed {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .status.in_progress {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status.draft {
            background-color: #f8f9fa;
            color: #495057;
        }
        
        .status.cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status.on_hold {
            background-color: #e2e3e5;
            color: #383d41;
        }
        
        .currency {
            text-align: right;
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7px;
        }
        
        .number {
            text-align: center;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .company-logo {
            float: left;
            width: 60px;
            height: 60px;
        }
        
        .company-info {
            float: right;
            text-align: right;
            font-size: 8px;
        }
        
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header clearfix">
        {{-- Uncomment jika ada logo --}}
        {{-- <div class="company-logo">
            <img src="{{ public_path('images/logo.png') }}" alt="Logo" style="width: 100%; height: auto;">
        </div> --}}
        
        <div class="company-info">
            <strong>GARASI AMSTRONG</strong><br>
            Alamat: Jl. Contoh No. 123<br>
            Telp: (021) 1234-5678
        </div>
        
        <div style="clear: both; text-align: center; margin-top: 20px;">
            <h1>{{ $title }}</h1>
            <p><strong>Periode:</strong> {{ $filters['start_date'] }} - {{ $filters['end_date'] }}</p>
            @if($filters['status'])
                <p><strong>Status:</strong> {{ ucfirst(str_replace('_', ' ', $filters['status'])) }}</p>
            @endif
            <p><strong>Dicetak pada:</strong> {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>

    <!-- Statistics -->
    <div class="stats">
        <div class="stat-card">
            <h3>Total Projects</h3>
            <div class="value">{{ number_format($stats['projects']['total']) }}</div>
        </div>
        <div class="stat-card">
            <h3>Completed</h3>
            <div class="value">{{ number_format($stats['projects']['completed']) }}</div>
        </div>
        <div class="stat-card">
            <h3>Actual Revenue</h3>
            <div class="value">Rp {{ number_format($stats['revenue']['total_actual'], 0, ',', '.') }}</div>
        </div>
        <div class="stat-card">
            <h3>Completion Rate</h3>
            <div class="value">{{ $stats['projects']['completion_rate'] }}%</div>
        </div>
    </div>

    <!-- Data Table -->
    @if($filters['type'] === 'projects')
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Data Projects</h3>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">ID</th>
                    <th style="width: 20%;">Nama Project</th>
                    <th style="width: 15%;">Nama Pemilik</th>
                    <th style="width: 8%;">Status</th>
                    <th style="width: 12%;">Jenis Project</th>
                    <th style="width: 12%;">Biaya Aktual</th>
                    <th style="width: 8%;">Progress</th>
                    <th style="width: 10%;">Tanggal Masuk</th>
                    <th style="width: 10%;">Target Selesai</th>
                </tr>
            </thead>
            <tbody>
                @forelse($data as $project)
                    <tr>
                        <td class="number">{{ $project->id }}</td>
                        <td>{{ $project->nama_project ?? 'N/A' }}</td>
                        <td>{{ $project->nama_pemilik ?? 'N/A' }}</td>
                        <td class="text-center">
                            <span class="status {{ $project->status_project ?? 'draft' }}">
                                {{ ucfirst(str_replace('_', ' ', $project->status_project ?? 'draft')) }}
                            </span>
                        </td>
                        <td>{{ $project->jenis_project ?? 'N/A' }}</td>
                        <td class="currency">Rp {{ number_format($project->biaya_aktual ?? 0, 0, ',', '.') }}</td>
                        <td class="number">{{ $project->progress_percentage ?? 0 }}%</td>
                        <td class="text-center">{{ $project->tanggal_masuk ? \Carbon\Carbon::parse($project->tanggal_masuk)->format('d/m/Y') : 'N/A' }}</td>
                        <td class="text-center">{{ $project->tanggal_target_selesai ? \Carbon\Carbon::parse($project->tanggal_target_selesai)->format('d/m/Y') : 'N/A' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" class="text-center">Tidak ada data untuk periode ini</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @elseif($filters['type'] === 'revenue')
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Data Revenue</h3>
        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">Tanggal</th>
                    <th style="width: 12%;">Total Projects</th>
                    <th style="width: 12%;">Completed</th>
                    <th style="width: 18%;">Estimasi Revenue</th>
                    <th style="width: 18%;">Actual Revenue</th>
                    <th style="width: 15%;">Total Payments</th>
                    <th style="width: 10%;">Rate</th>
                </tr>
            </thead>
            <tbody>
                @forelse($data as $item)
                    @php
                        $completionRate = $item->total_projects > 0 ? 
                            round(($item->completed_projects / $item->total_projects) * 100, 1) : 0;
                    @endphp
                    <tr>
                        <td class="text-center">{{ \Carbon\Carbon::parse($item->date)->format('d/m/Y') }}</td>
                        <td class="number">{{ $item->total_projects }}</td>
                        <td class="number">{{ $item->completed_projects }}</td>
                        <td class="currency">Rp {{ number_format($item->estimated_revenue ?? 0, 0, ',', '.') }}</td>
                        <td class="currency">Rp {{ number_format($item->total_revenue ?? 0, 0, ',', '.') }}</td>
                        <td class="currency">Rp {{ number_format($item->total_payments ?? 0, 0, ',', '.') }}</td>
                        <td class="number">{{ $completionRate }}%</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center">Tidak ada data untuk periode ini</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    <div class="footer">
        <p>© {{ date('Y') }} - Sistem Manajemen Project - Laporan digenerate secara otomatis pada {{ now()->format('d/m/Y H:i:s') }}</p>
        <p>Halaman ini dapat dicetak menggunakan Ctrl+P (Windows) atau Cmd+P (Mac)</p>
    </div>
</body>
</html>