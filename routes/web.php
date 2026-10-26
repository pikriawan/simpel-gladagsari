<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::get('user-manager', [UserController::class, 'index'])->name('user-manager');
    });
});

require __DIR__.'/settings.php';
