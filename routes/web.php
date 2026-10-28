<?php

use App\Http\Controllers\MarriageDispensationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('role:administrator')->group(function () {
        Route::get('user-manager', [UserController::class, 'index'])->name('user-manager');
        Route::post('user-manager', [UserController::class, 'store'])->name('user-manager.store');
        Route::put('user-manager/{user}', [UserController::class, 'update'])->name('user-manager.update');
        Route::delete('user-manager/{user}', [UserController::class, 'destroy'])->name('user-manager.destroy');
        Route::post('user-manager/{user}/two-factor', [UserController::class, 'enableTwoFactor'])->name('user-manager.two-factor.enable');
        Route::post('user-manager/{user}/two-factor/confirm', [UserController::class, 'confirmTwoFactor'])->name('user-manager.two-factor.confirm');
        Route::delete('user-manager/{user}/two-factor', [UserController::class, 'disableTwoFactor'])->name('user-manager.two-factor.disable');
    });

    Route::middleware('role:service')->group(function () {
        Route::inertia('marriage-dispensation/editor', 'marriage-dispensation/editor')->name('marriage-dispensation.editor');
        Route::get('marriage-dispensation/{marriageDispensation}/editor', [MarriageDispensationController::class, 'loadToEditor'])->name('marriage-dispensation.load-to-editor');
        Route::get('marriage-dispensation/history', [MarriageDispensationController::class, 'history'])->name('marriage-dispensation.history');
        Route::get('marriage-dispensation/export', [MarriageDispensationController::class, 'export'])->name('marriage-dispensation.export');
        Route::inertia('marriage-dispensation/village-data', 'marriage-dispensation/village-data')->name('marriage-dispensation.village-data');
        Route::inertia('marriage-dispensation/template-settings', 'marriage-dispensation/template-settings')->name('marriage-dispensation.template-settings');
        Route::post('marriage-dispensation', [MarriageDispensationController::class, 'store'])->name('marriage-dispensation.store');
        Route::delete('marriage-dispensation/{marriageDispensation}', [MarriageDispensationController::class, 'destroy'])->name('marriage-dispensation.destroy');
    });
});

require __DIR__.'/settings.php';
