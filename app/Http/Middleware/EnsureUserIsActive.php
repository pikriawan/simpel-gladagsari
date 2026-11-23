<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->status !== 'active') {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'active' => false,
                    'message' => 'Akun Anda telah dinonaktifkan oleh administrator.',
                ], 401);
            }

            if ($request->header('X-Inertia')) {
                session()->flash('status', 'Akun Anda telah dinonaktifkan oleh administrator.');

                return Inertia::location(route('login'));
            }

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan oleh administrator.',
            ]);
        }

        return $next($request);
    }
}

