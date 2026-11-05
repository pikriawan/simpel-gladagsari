<?php

namespace App\Http\Controllers;

use App\Models\PatenRegistration;
use App\Services\PatenSpreadsheetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PatenRegistrationController extends Controller
{
    public function index(): Response
    {
        $registration = PatenRegistration::query()->latest()->first();

        return Inertia::render('paten-registration', [
            'registration' => $registration ? [
                'id' => $registration->id,
                'filename' => $registration->filename,
                'file_size' => $registration->file_size,
                'sheet_data' => $registration->sheet_data,
                'updated_at' => $registration->updated_at?->toIso8601String(),
                'updated_by' => $registration->updater?->name,
            ] : null,
        ]);
    }

    public function store(Request $request, PatenSpreadsheetService $spreadsheetService): RedirectResponse
    {
        $validated = $request->validate([
            'data' => ['required', 'array'],
            'style' => ['nullable', 'array'],
            'merge' => ['nullable', 'array'],
            'columns' => ['nullable', 'array'],
            'rows' => ['nullable', 'array'],
            'sheets' => ['nullable', 'array'],
            'sheets.*.name' => ['nullable', 'string', 'max:100'],
            'sheets.*.data' => ['nullable', 'array'],
            'sheets.*.style' => ['nullable', 'array'],
            'sheets.*.merge' => ['nullable', 'array'],
            'sheets.*.columns' => ['nullable', 'array'],
            'sheets.*.rows' => ['nullable', 'array'],
        ]);

        $data = $validated['data'];
        $styles = $validated['style'] ?? null;
        $merges = $validated['merge'] ?? null;
        $columns = $validated['columns'] ?? null;
        $rows = $validated['rows'] ?? null;
        $sheets = $validated['sheets'] ?? null;

        $binary = $spreadsheetService->generateXlsxBinary($data, $styles, $merges, $sheets, $columns, $rows);
        $fileSize = strlen($binary);
        $filename = 'registrasi-paten.xlsx';
        $timestamp = now()->format('Ymd_His');
        $newFilePath = "paten/registrasi-paten_{$timestamp}_" . bin2hex(random_bytes(4)) . ".xlsx";

        $existing = PatenRegistration::query()->latest()->first();

        // Hapus file lama jika ada
        if ($existing && $existing->file_path && Storage::disk('local')->exists($existing->file_path)) {
            Storage::disk('local')->delete($existing->file_path);
        }

        // Simpan file baru di storage
        Storage::disk('local')->put($newFilePath, $binary);

        $sheetData = [
            'sheets' => $sheets ?: [
                [
                    'name' => 'Sheet1',
                    'data' => $data,
                    'style' => $styles,
                    'merge' => $merges,
                    'columns' => $columns,
                    'rows' => $rows,
                ]
            ],
            'data' => $data,
            'style' => $styles,
            'merge' => $merges,
            'columns' => $columns,
            'rows' => $rows,
        ];

        if ($existing) {
            $existing->update([
                'filename' => $filename,
                'file_path' => $newFilePath,
                'file_size' => $fileSize,
                'file_content' => base64_encode($binary),
                'sheet_data' => $sheetData,
                'updated_by' => Auth::id(),
            ]);
        } else {
            PatenRegistration::create([
                'filename' => $filename,
                'file_path' => $newFilePath,
                'file_size' => $fileSize,
                'file_content' => base64_encode($binary),
                'sheet_data' => $sheetData,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'File XLSX berhasil disimpan ke database.',
        ]);

        return back();
    }

    public function download(): StreamedResponse|RedirectResponse
    {
        $registration = PatenRegistration::query()->latest()->first();

        if (!$registration || !$registration->file_path || !Storage::disk('local')->exists($registration->file_path)) {
            return back()->with('error', 'File registrasi PATEN belum tersedia.');
        }

        return Storage::disk('local')->download($registration->file_path, $registration->filename);
    }

    public function export(Request $request, PatenSpreadsheetService $spreadsheetService): StreamedResponse
    {
        @set_time_limit(180);

        $data = $request->input('data', []);
        $styles = $request->input('style');
        $merges = $request->input('merge');
        $columns = $request->input('columns');
        $rows = $request->input('rows');
        $sheets = $request->input('sheets');

        $binary = $spreadsheetService->generateXlsxBinary($data, $styles, $merges, $sheets, $columns, $rows);

        return response()->streamDownload(function () use ($binary) {
            echo $binary;
        }, 'registrasi-paten.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request, PatenSpreadsheetService $spreadsheetService): JsonResponse
    {
        @set_time_limit(180);

        $request->validate([
            'file' => ['required', 'file', 'max:20480'], // max 20MB
        ]);

        $file = $request->file('file');

        try {
            $sheets = $spreadsheetService->parseXlsxFile($file->getRealPath());

            return response()->json([
                'success' => true,
                'message' => 'File Excel berhasil diimpor.',
                'sheets' => $sheets,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca file Excel: ' . $e->getMessage(),
            ], 422);
        }
    }
}
