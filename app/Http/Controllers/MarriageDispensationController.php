<?php

namespace App\Http\Controllers;

use App\Models\MarriageDispensation;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
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
                    ->orWhere('village', 'like', "%{$search}%")
                    ->orWhere('subvillage', 'like', "%{$search}%");
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

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Dispensasi Nikah');

        $sheet->setCellValue('A1', 'Nomor Surat dan Tanggal');
        $sheet->setCellValue('E1', 'Data Pemohon');
        $sheet->setCellValue('H1', 'Tanggal Pernikahan');
        $sheet->setCellValue('I1', 'Data Pasangan');

        $sheet->mergeCells('A1:D1');
        $sheet->mergeCells('E1:G1');
        $sheet->mergeCells('I1:L1');

        $subHeaders = [
            'A' => 'Nomor urut',
            'B' => 'Nama desa pengantar',
            'C' => 'Nomor surat pengantar',
            'D' => 'Tanggal surat dikeluarkan',
            'E' => 'Nama pemohon',
            'F' => 'Tempat/tanggal lahir',
            'G' => 'Alamat',
            'H' => 'Tanggal pernikahan',
            'I' => 'Nama pasangan',
            'J' => 'Tempat/tanggal lahir',
            'K' => 'Agama',
            'L' => 'Alamat',
        ];

        foreach ($subHeaders as $col => $title) {
            $sheet->setCellValue("{$col}2", $title);
        }

        $rowNum = 3;
        foreach ($records as $record) {
            $alamatPemohon = '-';
            $alamatParts = [];
            if (! empty($record->subvillage)) {
                $alamatParts[] = mb_strtoupper($record->subvillage);
            }
            if (! empty($record->rt) || ! empty($record->rw)) {
                $alamatParts[] = 'RT '.str_pad($record->rt ?? '0', 3, '0', STR_PAD_LEFT)
                    .'/RW '.str_pad($record->rw ?? '0', 3, '0', STR_PAD_LEFT);
            }
            if (! empty($record->village)) {
                $alamatParts[] = 'DESA '.mb_strtoupper($record->village);
            }
            if (! empty($alamatParts)) {
                $alamatParts[] = 'KEC. GLADAGSARI';
                $alamatPemohon = implode(', ', $alamatParts);
            }

            $tanggalSurat = '-';
            if (! empty($record->letter_date)) {
                $tanggalSurat = Carbon::parse($record->letter_date)->locale('id')->isoFormat('D MMMM Y');
            }

            $tanggalPernikahan = '-';
            if (! empty($record->marriage_date)) {
                $tanggalPernikahan = Carbon::parse($record->marriage_date)->locale('id')->isoFormat('D MMMM Y');
            }

            $sheet->setCellValue("A{$rowNum}", $record->letter_number ?: '-');
            $sheet->setCellValue("B{$rowNum}", $record->village ?: '-');
            $sheet->setCellValue("C{$rowNum}", $record->reference_letter_number ?: '-');
            $sheet->setCellValue("D{$rowNum}", $tanggalSurat);
            $sheet->setCellValue("E{$rowNum}", $record->applicant_name ? mb_strtoupper($record->applicant_name) : '-');
            $sheet->setCellValue("F{$rowNum}", $record->applicant_birth_place_date ? mb_strtoupper($record->applicant_birth_place_date) : '-');
            $sheet->setCellValue("G{$rowNum}", $alamatPemohon);
            $sheet->setCellValue("H{$rowNum}", $tanggalPernikahan);
            $sheet->setCellValue("I{$rowNum}", $record->partner_name ? mb_strtoupper($record->partner_name) : '-');
            $sheet->setCellValue("J{$rowNum}", $record->partner_birth_place_date ? mb_strtoupper($record->partner_birth_place_date) : '-');
            $sheet->setCellValue("K{$rowNum}", $record->religion ? mb_strtoupper($record->religion) : '-');
            $sheet->setCellValue("L{$rowNum}", $record->partner_address ?: '-');

            $rowNum++;
        }

        $lastRow = max($rowNum - 1, 2);

        $sheet->getStyle("A1:L{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        $sheet->getStyle('A1:L1')->getFont()->setBold(true);
        $sheet->getStyle('A2:L2')->getFont()->setBold(true);
        $sheet->getStyle('A2:L2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A2:L2')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        $sheet->getStyle('A1:D1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1:D1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('E1:G1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('E1:G1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('H1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('H1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('I1:L1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I1:L1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        $sheet->calculateColumnWidths();
        $defaultWidth = $sheet->getDefaultColumnDimension()->getWidth();

        foreach (range('A', 'L') as $col) {
            $colDim = $sheet->getColumnDimension($col);
            $width = $colDim->getWidth();
            $colDim->setAutoSize(false);
            $colDim->setWidth(max($defaultWidth, $width + 2));
        }

        $filename = 'riwayat-dispensasi-nikah-'.now()->format('Y-m-d').'.xlsx';
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'max-age=0',
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
            'village' => ['nullable', 'string', 'max:255'],
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
            'letter_number' => $validated['letterNumber'] ?? null,
            'village' => $validated['village'] ?? $validated['villageName'] ?? null,
            'reference_letter_number' => $validated['referenceLetterNumber'] ?? null,
            'letter_date' => $validated['letterDate'] ?? null,
            'applicant_name' => $validated['applicantName'] ?? null,
            'applicant_birth_place_date' => $validated['applicantBirthPlaceDate'] ?? null,
            'subvillage' => $validated['subvillage'] ?? null,
            'rt' => $validated['rt'] ?? null,
            'rw' => $validated['rw'] ?? null,
            'marriage_date' => $validated['marriageDate'] ?? null,
            'partner_name' => $validated['partnerName'] ?? null,
            'partner_birth_place_date' => $validated['partnerBirthPlaceDate'] ?? null,
            'religion' => $validated['religion'] ?? null,
            'partner_address' => $validated['partnerAddress'] ?? null,
        ]);

        return back()->with('success', 'Surat berhasil disimpan.');
    }

    public function destroy(MarriageDispensation $marriageDispensation): RedirectResponse
    {
        $marriageDispensation->delete();

        return back()->with('success', 'Data riwayat berhasil dihapus.');
    }
}
