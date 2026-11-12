<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;

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
     * Enable two-factor authentication for the specified user.
     */
    public function enableTwoFactor(User $user, EnableTwoFactorAuthentication $enable): JsonResponse
    {
        abort_if($user->role === 'administrator', 403, 'Verifikasi 2 faktor tidak dapat diaktifkan untuk administrator.');

        $enable($user);

        $user->refresh();

        return response()->json([
            'svg' => $user->twoFactorQrCodeSvg(),
            'url' => $user->twoFactorQrCodeUrl(),
            'secretKey' => Fortify::currentEncrypter()->decrypt($user->two_factor_secret),
        ]);
    }

    /**
     * Confirm two-factor authentication for the specified user.
     */
    public function confirmTwoFactor(Request $request, User $user, ConfirmTwoFactorAuthentication $confirm): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        try {
            $confirm($user, $validated['code']);
        } catch (ValidationException $exception) {
            throw ValidationException::withMessages($exception->errors());
        }

        return response()->json([
            'message' => __('Verifikasi 2 faktor berhasil diaktifkan.'),
        ]);
    }

    /**
     * Disable two-factor authentication for the specified user.
     */
    public function disableTwoFactor(User $user, DisableTwoFactorAuthentication $disable): JsonResponse
    {
        $disable($user);

        return response()->json([
            'message' => __('Verifikasi 2 faktor berhasil dinonaktifkan.'),
        ]);
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
