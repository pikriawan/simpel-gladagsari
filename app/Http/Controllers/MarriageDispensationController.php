<?php

namespace App\Http\Controllers;

use App\Models\MarriageDispensation;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MarriageDispensationController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = MarriageDispensation::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('applicant_name', 'like', "%{$search}%")
                  ->orWhere('partner_name', 'like', "%{$search}%")
                  ->orWhere('letter_number', 'like', "%{$search}%")
                  ->orWhere('village_name', 'like', "%{$search}%");
            });
        }

        if ($from = $request->input('from')) {
            $query->whereDate('marriage_date', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('marriage_date', '<=', $to);
        }

        return $query;
    }

    public function history(Request $request): Response
    {
        $records = $this->buildQuery($request)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('marriage-dispensation/history', [
            'records' => $records,
            'filters' => $request->only(['search', 'from', 'to']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $records = $this->buildQuery($request)->orderBy('created_at', 'asc')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Dispensasi Nikah');
        $sheet->setShowGridLines(true);

        // ── 1. GROUP HEADERS (Row 1) ──────────────────────────────────────────
        $sheet->setCellValue('A1', 'DATA SURAT');
        $sheet->setCellValue('G1', 'PEMOHON');
        $sheet->setCellValue('M1', 'PASANGAN');
        $sheet->setCellValue('T1', 'PERNIKAHAN');
        $sheet->setCellValue('V1', 'KETERANGAN');

        $sheet->mergeCells('A1:F1');
        $sheet->mergeCells('G1:L1');
        $sheet->mergeCells('M1:S1');
        $sheet->mergeCells('T1:U1');
        $sheet->mergeCells('V1:W1');

        $sheet->getRowDimension(1)->setRowHeight(32);

        $groups = [
            'A1:F1' => '1F385C', // Navy Blue
            'G1:L1' => '0E4B3E', // Deep Teal / Pine Green
            'M1:S1' => '2B256B', // Indigo / Purple
            'T1:U1' => '8C3B0C', // Rust / Brown Orange
            'V1:W1' => '233241', // Dark Slate Gray
        ];

        foreach ($groups as $range => $hex) {
            $sheet->getStyle($range)->applyFromArray([
                'font' => [
                    'bold'  => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size'  => 11,
                    'name'  => 'Calibri',
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $hex],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);
        }

        // White border separation between groups in Row 1
        $sheet->getStyle('A1:W1')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color'       => ['rgb' => 'FFFFFF'],
                ],
            ],
        ]);

        // ── 2. SUB-HEADERS (Row 2) ────────────────────────────────────────────
        $subHeaders = [
            'A' => 'No',
            'B' => 'No. Surat Dispensasi',
            'C' => 'No. Urut',
            'D' => 'Tanggal Surat',
            'E' => 'Desa Pengantar',
            'F' => 'No. Surat Pengantar',
            'G' => 'Nama Pemohon',
            'H' => 'Tempat/Tanggal Lahir',
            'I' => 'Alamat',
            'J' => 'RT',
            'K' => 'RW',
            'L' => 'Desa',
            'M' => 'Nama Pasangan',
            'N' => 'Tempat/Tanggal Lahir',
            'O' => 'Agama',
            'P' => 'Alamat',
            'Q' => 'RT',
            'R' => 'RW',
            'S' => 'Desa',
            'T' => 'Hari & Tanggal Nikah',
            'U' => 'Tanggal Acara (Palson)',
            'V' => 'Waktu Input Sistem',
            'W' => 'Status Arsip',
        ];

        foreach ($subHeaders as $col => $title) {
            $sheet->setCellValue("{$col}2", $title);
        }

        $sheet->getRowDimension(2)->setRowHeight(26);

        $sheet->getStyle('A2:W2')->applyFromArray([
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => '000000'],
                'size'  => 10,
                'name'  => 'Calibri',
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E8EFF7'], // Soft light ice-blue
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'CBD5E1'],
                ],
            ],
        ]);

        // ── 3. DATA ROWS (Row 3+) ─────────────────────────────────────────────
        $rowNum = 3;
        foreach ($records as $index => $record) {
            $sheet->getRowDimension($rowNum)->setRowHeight(22);

            // 1. No
            $sheet->setCellValue("A{$rowNum}", $index + 1);

            // 2. No Surat & 3. No Urut
            $noSurat = '-';
            $noUrut = '-';
            if (!empty($record->letter_number)) {
                if (str_contains($record->letter_number, '/')) {
                    $noSurat = $record->letter_number;
                    $parts = explode('/', $record->letter_number);
                    $noUrut = $parts[1] ?? $record->letter_number;
                } else {
                    $noUrut = str_pad($record->letter_number, 3, '0', STR_PAD_LEFT);
                    $year = $record->letter_date
                        ? Carbon::parse($record->letter_date)->year
                        : ($record->created_at ? $record->created_at->year : date('Y'));
                    $noSurat = "474.2/{$noUrut}/6.20/{$year}";
                }
            }
            $sheet->setCellValue("B{$rowNum}", $noSurat);
            $sheet->getCell("C{$rowNum}")->setValueExplicit($noUrut, DataType::TYPE_STRING);

            // 4. Tanggal Surat
            $tanggalSurat = '-';
            if (!empty($record->letter_date)) {
                $tanggalSurat = Carbon::parse($record->letter_date)->locale('id')->isoFormat('D MMMM Y');
            }
            $sheet->setCellValue("D{$rowNum}", $tanggalSurat);

            // 5. Desa Pengantar
            $sheet->setCellValue("E{$rowNum}", $record->village_name ?: '-');

            // 6. No. Surat Pengantar
            $sheet->setCellValue("F{$rowNum}", $record->reference_letter_number ?: '-');

            // 7. Nama Pemohon
            $sheet->setCellValue("G{$rowNum}", $record->applicant_name ? mb_strtoupper($record->applicant_name) : '-');

            // 8. Tempat/Tanggal Lahir Pemohon
            $sheet->setCellValue("H{$rowNum}", $record->applicant_birth_place_date ? mb_strtoupper($record->applicant_birth_place_date) : '-');

            // 9-12. Alamat, RT, RW, Desa Pemohon
            $alamatPemohon = '-';
            $desaPemohon = $record->village_name ? mb_strtoupper($record->village_name) : '-';
            if (!empty($record->subvillage)) {
                if (str_contains($record->subvillage, ',')) {
                    $subParts = array_map('trim', explode(',', $record->subvillage, 2));
                    $alamatPemohon = mb_strtoupper($subParts[0]);
                    $desaPemohon = mb_strtoupper($subParts[1]);
                } else {
                    $alamatPemohon = mb_strtoupper($record->subvillage);
                }
            }
            $rtPemohon = ($record->rt !== null && $record->rt !== '') ? str_pad($record->rt, 3, '0', STR_PAD_LEFT) : '-';
            $rwPemohon = ($record->rw !== null && $record->rw !== '') ? str_pad($record->rw, 3, '0', STR_PAD_LEFT) : '-';

            $sheet->setCellValue("I{$rowNum}", $alamatPemohon);
            $sheet->getCell("J{$rowNum}")->setValueExplicit($rtPemohon, DataType::TYPE_STRING);
            $sheet->getCell("K{$rowNum}")->setValueExplicit($rwPemohon, DataType::TYPE_STRING);
            $sheet->setCellValue("L{$rowNum}", $desaPemohon);

            // 13. Nama Pasangan
            $sheet->setCellValue("M{$rowNum}", $record->partner_name ? mb_strtoupper($record->partner_name) : '-');

            // 14. Tempat/Tanggal Lahir Pasangan
            $sheet->setCellValue("N{$rowNum}", $record->partner_birth_place_date ? mb_strtoupper($record->partner_birth_place_date) : '-');

            // 15. Agama Pasangan
            $sheet->setCellValue("O{$rowNum}", $record->religion ? mb_strtoupper($record->religion) : '-');

            // 16-19. Alamat, RT, RW, Desa Pasangan
            $alamatPasangan = '-';
            $rtPasangan = '00';
            $rwPasangan = '00';
            $desaPasangan = '-';
            if (!empty($record->partner_address) && $record->partner_address !== '-') {
                $rawAddr = $record->partner_address;
                if (preg_match('/RT\.?\s*([0-9]+)/i', $rawAddr, $mRt)) {
                    $rtPasangan = str_pad($mRt[1], 2, '0', STR_PAD_LEFT);
                }
                if (preg_match('/RW\.?\s*([0-9]+)/i', $rawAddr, $mRw)) {
                    $rwPasangan = str_pad($mRw[1], 2, '0', STR_PAD_LEFT);
                }
                if (preg_match('/Desa\s+([^,]+)/i', $rawAddr, $mDesa)) {
                    $desaPasangan = mb_strtoupper(trim($mDesa[1]));
                }
                if (preg_match('/^(.*?)(?:,\s*RT|\s*RT)/i', $rawAddr, $mAlamat)) {
                    $alamatPasangan = mb_strtoupper(trim($mAlamat[1]));
                } else {
                    $alamatPasangan = mb_strtoupper(trim($rawAddr));
                }
            }
            $sheet->setCellValue("P{$rowNum}", $alamatPasangan);
            $sheet->getCell("Q{$rowNum}")->setValueExplicit($rtPasangan, DataType::TYPE_STRING);
            $sheet->getCell("R{$rowNum}")->setValueExplicit($rwPasangan, DataType::TYPE_STRING);
            $sheet->setCellValue("S{$rowNum}", $desaPasangan);

            // 20. Hari & Tanggal Nikah, 21. Tanggal Acara
            $hariTanggalNikah = '-';
            $tanggalAcara = '-';
            if (!empty($record->marriage_date)) {
                $mDate = Carbon::parse($record->marriage_date)->locale('id');
                $hariTanggalNikah = mb_strtoupper($mDate->isoFormat('dddd D MMMM Y'));
                $tanggalAcara = $mDate->format('Y-m-d');
            }
            $sheet->setCellValue("T{$rowNum}", $hariTanggalNikah);
            $sheet->setCellValue("U{$rowNum}", $tanggalAcara);

            // 22. Waktu Input Sistem
            $waktuInput = '-';
            if (!empty($record->created_at)) {
                $waktuInput = mb_strtoupper($record->created_at->locale('id')->isoFormat('D MMM Y, HH:mm'));
            }
            $sheet->setCellValue("V{$rowNum}", $waktuInput);

            // 23. Status Arsip
            $sheet->setCellValue("W{$rowNum}", 'Tersimpan / Terbit');

            $rowNum++;
        }

        $lastRow = max($rowNum - 1, 2);

        // Border & Alignment for Data rows
        if ($lastRow >= 3) {
            $sheet->getStyle("A3:W{$lastRow}")->applyFromArray([
                'font' => [
                    'size' => 10,
                    'name' => 'Calibri',
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color'       => ['rgb' => 'CBD5E1'],
                    ],
                ],
            ]);

            // Specific alignments for columns
            $centerCols = ['A', 'C', 'D', 'F', 'J', 'K', 'O', 'Q', 'R', 'T', 'U', 'V', 'W'];
            foreach ($centerCols as $col) {
                $sheet->getStyle("{$col}3:{$col}{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
        }

        // ── 4. AUTO SIZE COLUMNS WITH COMFORTABLE PADDING ─────────────────────
        foreach (range('A', 'W') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->calculateColumnWidths();
        foreach (range('A', 'W') as $col) {
            $colDim = $sheet->getColumnDimension($col);
            $width = $colDim->getWidth();
            $colDim->setAutoSize(false);
            $minWidth = match ($col) {
                'A'                     => 6,
                'C', 'J', 'K', 'Q', 'R' => 8,
                'U', 'V', 'W'           => 16,
                'B', 'D', 'T'           => 24,
                default                 => 18,
            };
            $colDim->setWidth(max($width + 4, $minWidth));
        }

        $filename = 'riwayat-dispensasi-nikah-' . now()->format('Y-m-d') . '.xlsx';
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    public function loadToEditor(MarriageDispensation $marriageDispensation): Response
    {
        return Inertia::render('marriage-dispensation/editor', [
            'record' => $marriageDispensation,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'letterNumber' => ['nullable', 'string', 'max:255'],
            'villageName' => ['nullable', 'string', 'max:255'],
            'referenceLetterNumber' => ['nullable', 'string', 'max:255'],
            'letterDate' => ['nullable', 'date'],
            'applicantName' => ['nullable', 'string', 'max:255'],
            'applicantBirthPlaceDate' => ['nullable', 'string', 'max:255'],
            'subvillage' => ['nullable', 'string', 'max:255'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
            'marriageDate' => ['nullable', 'date'],
            'partnerName' => ['nullable', 'string', 'max:255'],
            'partnerBirthPlaceDate' => ['nullable', 'string', 'max:255'],
            'religion' => ['nullable', 'string', 'max:255'],
            'partnerAddress' => ['nullable', 'string'],
        ]);

        MarriageDispensation::create([
            'letter_number'             => $validated['letterNumber'] ?? null,
            'village_name'              => $validated['villageName'] ?? null,
            'reference_letter_number'   => $validated['referenceLetterNumber'] ?? null,
            'letter_date'               => $validated['letterDate'] ?? null,
            'applicant_name'            => $validated['applicantName'] ?? null,
            'applicant_birth_place_date' => $validated['applicantBirthPlaceDate'] ?? null,
            'subvillage'                => $validated['subvillage'] ?? null,
            'rt'                        => $validated['rt'] ?? null,
            'rw'                        => $validated['rw'] ?? null,
            'marriage_date'             => $validated['marriageDate'] ?? null,
            'partner_name'              => $validated['partnerName'] ?? null,
            'partner_birth_place_date'  => $validated['partnerBirthPlaceDate'] ?? null,
            'religion'                  => $validated['religion'] ?? null,
            'partner_address'           => $validated['partnerAddress'] ?? null,
        ]);

        return back()->with('success', 'Surat berhasil disimpan.');
    }

    public function destroy(MarriageDispensation $marriageDispensation): RedirectResponse
    {
        $marriageDispensation->delete();

        return back()->with('success', 'Data riwayat berhasil dihapus.');
    }
}
