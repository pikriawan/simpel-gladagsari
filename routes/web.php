<?php

use App\Http\Controllers\MarriageDispensationController;
use App\Http\Controllers\FrontendApiController;
use App\Http\Controllers\PatenRegistrationController;
use App\Http\Controllers\TemplateSettingController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    if ($request->user()->role === 'administrator') {
        return redirect('/admin');
    }

    abort_unless($request->user()->role === 'service', 403);

    return Inertia::render('root/dashboard');
})->middleware(['auth', 'verified'])->name('home');

Route::get('authentication', fn () => Inertia::render('root/authentication'))->name('frontend.authentication');

Route::prefix('api')->controller(FrontendApiController::class)->group(function () {
    Route::get('health', fn () => response()->json(['ok' => true]));
    Route::get('csrf', 'csrf');
    Route::post('auth/login', 'login')->middleware('throttle:login');
    Route::post('auth/verify', 'verify')->middleware('throttle:two-factor');
    Route::get('auth/me', 'me');
    Route::post('auth/logout', 'logout');
    Route::post('auth/forgot-password', 'forgotPassword')->middleware('throttle:6,1');
    Route::post('auth/reset-password', 'resetPassword')->middleware('throttle:6,1');

    Route::middleware('auth')->group(function () {
        Route::post('users/{user}/two-factor', [UserController::class, 'enableTwoFactor'])->middleware('role:administrator');
        Route::post('users/{user}/two-factor/confirm', [UserController::class, 'confirmTwoFactor'])->middleware('role:administrator');
        Route::delete('users/{user}/two-factor', [UserController::class, 'disableTwoFactor'])->middleware('role:administrator');
        Route::get('data', 'data');
        Route::put('data/{resource}', 'saveData')->whereIn('resource', ['desa', 'dukuhByDesa', 'draft', 'pegawai', 'template']);
        Route::post('data/riwayat', 'storeRecord')->middleware('role:service');
        Route::delete('data/riwayat/{id}', 'deleteRecord')->middleware('role:service');
        Route::put('profile', 'profile');
    });
});

Route::redirect('/registrasi-paten', '/paten-registration/editor');
Route::redirect('/registrasi-paten/editor', '/paten-registration/editor');
Route::redirect('/registrasi-paten/template', '/paten-registration/template');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn (Request $request) => redirect($request->user()->role === 'administrator' ? '/admin' : '/'))
        ->name('dashboard');

    Route::get('profil', fn () => Inertia::render('root/profil'))->name('frontend.profile');

    Route::middleware('role:administrator')->group(function () {
        Route::get('admin', fn () => Inertia::render('root/dashboard'))->name('frontend.admin.dashboard');
        Route::get('admin/pegawai', fn () => Inertia::render('root/pegawai'))->name('frontend.admin.employees');
    });

    Route::middleware('role:administrator')->group(function () {
        Route::redirect('user-manager', '/admin/pegawai')->name('user-manager');
        Route::post('user-manager', [UserController::class, 'store'])->name('user-manager.store');
        Route::put('user-manager/{user}', [UserController::class, 'update'])->name('user-manager.update');
        Route::delete('user-manager/{user}', [UserController::class, 'destroy'])->name('user-manager.destroy');
        Route::post('user-manager/{user}/two-factor', [UserController::class, 'enableTwoFactor'])->name('user-manager.two-factor.enable');
        Route::post('user-manager/{user}/two-factor/confirm', [UserController::class, 'confirmTwoFactor'])->name('user-manager.two-factor.confirm');
        Route::delete('user-manager/{user}/two-factor', [UserController::class, 'disableTwoFactor'])->name('user-manager.two-factor.disable');
    });

    Route::middleware('role:service')->group(function () {
        Route::get('surat-dispensasi-nikah/editor', fn () => Inertia::render('root/editor'))->name('frontend.marriage.editor');
        Route::get('surat-dispensasi-nikah/riwayat', fn () => Inertia::render('root/riwayat'))->name('frontend.marriage.history');
        Route::get('surat-dispensasi-nikah/data-desa-dukuh', fn () => Inertia::render('root/data-desa-dukuh'))->name('frontend.marriage.villages');
        Route::get('surat-dispensasi-nikah/pengaturan-template', fn () => Inertia::render('root/pengaturan-template'))->name('frontend.marriage.template');

        Route::redirect('marriage-dispensation/editor', '/surat-dispensasi-nikah/editor')->name('marriage-dispensation.editor');
        Route::redirect('marriage-dispensation/history', '/surat-dispensasi-nikah/riwayat')->name('marriage-dispensation.history');
        Route::redirect('marriage-dispensation/export', '/surat-dispensasi-nikah/riwayat')->name('marriage-dispensation.export');
        Route::redirect('marriage-dispensation/village-data', '/surat-dispensasi-nikah/data-desa-dukuh')->name('marriage-dispensation.village-data');
        Route::redirect('marriage-dispensation/template-settings', '/surat-dispensasi-nikah/pengaturan-template')->name('marriage-dispensation.template-settings');
        Route::redirect('marriage-dispensation/{marriageDispensation}/editor', '/surat-dispensasi-nikah/editor')->name('marriage-dispensation.load-to-editor');
        Route::post('marriage-dispensation/template-settings', [TemplateSettingController::class, 'store'])->name('marriage-dispensation.template-settings.store');
        Route::delete('marriage-dispensation/template-settings', [TemplateSettingController::class, 'reset'])->name('marriage-dispensation.template-settings.reset');
        Route::post('marriage-dispensation', [MarriageDispensationController::class, 'store'])->name('marriage-dispensation.store');
        Route::delete('marriage-dispensation/{marriageDispensation}', [MarriageDispensationController::class, 'destroy'])->name('marriage-dispensation.destroy');
        Route::get('paten-registration', [PatenRegistrationController::class, 'index'])->name('paten-registration');
        Route::get('paten-registration/editor', [PatenRegistrationController::class, 'editor'])->name('paten-registration.editor');
        Route::get('paten-registration/template', [PatenRegistrationController::class, 'template'])->name('paten-registration.template');
        Route::get('paten-registration/template-snapshot', [PatenRegistrationController::class, 'templateSnapshot'])->name('paten-registration.template-snapshot');
        Route::post('paten-registration', [PatenRegistrationController::class, 'store'])->name('paten-registration.store');
    });
});

require __DIR__.'/settings.php';

