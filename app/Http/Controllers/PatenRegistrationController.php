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
        return $this->editor();
    }

    public function editor(): Response
    {
        $snapshot = null;

        if (Storage::exists('paten-registration/snapshot.json')) {
            $decoded = json_decode(
                Storage::get('paten-registration/snapshot.json'),
                true,
            );

            if (is_array($decoded)) {
                $snapshot = $decoded;
            }
        }

        return Inertia::render('paten-registration/editor', [
            'snapshot' => $snapshot,
        ]);
    }

    public function template(): Response
    {
        $snapshot = null;

        if (Storage::exists('paten-registration/template-snapshot.json')) {
            $decoded = json_decode(
                Storage::get('paten-registration/template-snapshot.json'),
                true,
            );

            if (is_array($decoded)) {
                $snapshot = $decoded;
            }
        }

        return Inertia::render('paten-registration/template', [
            'snapshot' => $snapshot,
        ]);
    }

    public function templateSnapshot(): JsonResponse
    {
        $snapshot = null;

        if (Storage::exists('paten-registration/template-snapshot.json')) {
            $decoded = json_decode(
                Storage::get('paten-registration/template-snapshot.json'),
                true,
            );

            if (is_array($decoded)) {
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

        $path = ($validated['target'] ?? 'editor') === 'template'
            ? 'paten-registration/template-snapshot.json'
            : 'paten-registration/snapshot.json';

        Storage::put(
            $path,
            json_encode($validated['snapshot']),
        );

        return response()->json(['success' => true]);
    }
}
