<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PatenRegistrationController extends Controller
{
    public function index(): Response
    {
        $snapshot = null;

        if (Storage::disk('public')->exists('paten-registration/snapshot.json')) {
            $decoded = json_decode(
                Storage::disk('public')->get('paten-registration/snapshot.json'),
                true,
            );

            if (is_array($decoded)) {
                $snapshot = $decoded;
            }
        }

        return Inertia::render('paten-registration', [
            'snapshot' => $snapshot,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'snapshot' => ['required'],
        ]);

        Storage::disk('public')->put(
            'paten-registration/snapshot.json',
            json_encode($validated['snapshot']),
        );

        return response()->json(['success' => true]);
    }
}
