<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();

        return Inertia::render('user-manager', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
        ]);

        // Administrator hanya boleh ada satu, sehingga akun baru selalu dibuat sebagai service.
        $user = User::create([
            ...$validated,
            'role' => 'service',
            'email_verified_at' => now(),
        ]);

        $user->markEmailAsVerified();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Pegawai berhasil ditambahkan.'),
        ]);

        return back();
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['required', 'string', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
        ]);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        // Role tidak ikut diperbarui agar tidak ada administrator baru dari halaman ini.
        $user->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Data pegawai berhasil diperbarui.'),
        ]);

        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->role === 'administrator', 403, 'Administrator tidak dapat dihapus.');

        $user->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Pegawai berhasil dihapus.'),
        ]);

        return back();
    }
}
