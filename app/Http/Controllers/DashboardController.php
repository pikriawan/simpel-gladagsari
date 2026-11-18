<?php

namespace App\Http\Controllers;

use App\Models\MarriageDispensation;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        if ($user?->role === 'administrator') {
            return Inertia::render('dashboard', [
                'stats' => [
                    'totalUsers' => User::count(),
                    'activeUsers' => User::where('status', 'active')->count(),
                    'inactiveUsers' => User::where('status', 'inactive')->count(),
                    'serviceUsers' => User::where('role', 'service')->count(),
                ],
                'recentUsers' => User::latest()->take(5)->get(['id', 'name', 'email', 'role', 'status', 'created_at']),
            ]);
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalMarriageDispensations' => MarriageDispensation::count(),
            ],
            'recentMarriageDispensations' => MarriageDispensation::latest()->take(5)->get([
                'id', 'letter_number', 'applicant_name', 'partner_name', 'marriage_date', 'village', 'created_at',
            ]),
        ]);
    }
}
