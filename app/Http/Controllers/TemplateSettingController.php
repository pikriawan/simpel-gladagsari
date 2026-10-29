<?php

namespace App\Http\Controllers;

use App\Models\TemplateSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateSettingController extends Controller
{
    /**
     * @var list<string>
     */
    private const ALLOWED_KEYS = [
        'baris1',
        'baris2',
        'baris3',
        'baris4',
        'namaPejabat',
        'jabatanUtama',
        'subJabatan',
        'pangkat',
        'nipPejabat',
        'dasarHukum1',
        'dasarHukum2',
        'alasan',
    ];

    private function loadSettings(): array
    {
        return TemplateSetting::query()
            ->whereIn('key', self::ALLOWED_KEYS)
            ->pluck('value', 'key')
            ->toArray();
    }

    public function index(): Response
    {
        return Inertia::render('marriage-dispensation/template-settings', [
            'settings' => $this->loadSettings(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string'],
        ]);

        foreach (self::ALLOWED_KEYS as $key) {
            if (array_key_exists($key, $validated['settings'])) {
                TemplateSetting::query()->updateOrCreate(
                    ['key' => $key],
                    ['value' => $validated['settings'][$key]],
                );
            }
        }

        return back();
    }

    public function reset(): RedirectResponse
    {
        TemplateSetting::query()->delete();

        return back();
    }
}
