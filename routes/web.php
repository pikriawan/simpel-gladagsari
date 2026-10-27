<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('role:administrator')->group(function () {
        Route::get('user-manager', [UserController::class, 'index'])->name('user-manager');
        Route::post('user-manager', [UserController::class, 'store'])->name('user-manager.store');
        Route::put('user-manager/{user}', [UserController::class, 'update'])->name('user-manager.update');
    });
});

require __DIR__.'/settings.php';
