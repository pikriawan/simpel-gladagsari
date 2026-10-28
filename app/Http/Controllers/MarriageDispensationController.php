<?php

namespace App\Http\Controllers;

use App\Models\MarriageDispensation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MarriageDispensationController extends Controller
{
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
            'letter_number' => $validated['letterNumber'] ?? null,
            'village_name' => $validated['villageName'] ?? null,
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

        return back();
    }
}
