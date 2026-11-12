<?php

namespace App\Http\Controllers;

use App\Models\PatenRegistrationSnapshot;
use App\Models\PatenRegistrationTemplateSnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PatenRegistrationController extends Controller
{
    public function index(): Response
    {
        return $this->editor();
    }

    public function editor(): Response
    {
        $snapshot = PatenRegistrationSnapshot::first();

        if ($snapshot) {
            $decoded = json_decode(
                $snapshot->snapshot,
                true,
            );

            if (is_array($decoded)) {
                // Pastikan `styles` tetap objek (bukan array kosong `[]`),
                // agar style workbook tidak hilang saat serialisasi JSON.
                if (isset($decoded['styles']) && is_array($decoded['styles']) && array_is_list($decoded['styles'])) {
                    $decoded['styles'] = new \stdClass();
                }
                $snapshot = $decoded;
            }
        }

        return Inertia::render('paten-registration/editor', [
            'snapshot' => $snapshot,
        ]);
    }

    public function template(): Response
    {
        $snapshot = PatenRegistrationTemplateSnapshot::first();

        if ($snapshot) {
            $decoded = json_decode(
                $snapshot->snapshot,
                true,
            );

            if (is_array($decoded)) {
                if (isset($decoded['styles']) && is_array($decoded['styles']) && array_is_list($decoded['styles'])) {
                    $decoded['styles'] = new \stdClass();
                }
                $snapshot = $decoded;
            }
        }

        return Inertia::render('paten-registration/template', [
            'snapshot' => $snapshot,
        ]);
    }

    public function templateSnapshot(): JsonResponse
    {
        $snapshot = PatenRegistrationTemplateSnapshot::first();;

        if ($snapshot) {
            $decoded = json_decode(
                $snapshot->snapshot,
                true,
            );

            if (is_array($decoded)) {
                if (isset($decoded['styles']) && is_array($decoded['styles']) && array_is_list($decoded['styles'])) {
                    $decoded['styles'] = new \stdClass();
                }
                $snapshot = $decoded;
            }
        }

        return response()->json(['snapshot' => $snapshot]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'snapshot' => ['required'],
            'target' => ['nullable', 'string', 'in:editor,template'],
        ]);

        $model = ($validated['target'] ?? 'editor') === 'template'
            ? PatenRegistrationTemplateSnapshot::class
            : PatenRegistrationSnapshot::class;

        $snapshotData = $validated['snapshot'];

        // Pastikan `styles` tetap objek JSON (bukan array kosong `[]`),
        // agar style workbook tidak hilang saat round-trip JSON.
        if (is_array($snapshotData) && isset($snapshotData['styles']) && is_array($snapshotData['styles']) && array_is_list($snapshotData['styles'])) {
            $snapshotData['styles'] = new \stdClass();
        }

        $snapshot = $model::first();

        if (!$snapshot) {
            $model::create([
                'snapshot' => json_encode($snapshotData),
            ]);
        } else {
            $snapshot->snapshot = json_encode($snapshotData);
            $snapshot->save();
        }

        return response()->json(['success' => true]);
    }
}
