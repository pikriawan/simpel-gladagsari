<?php

use App\Models\User;

test('tamu diarahkan ke halaman login', function () {
    $response = $this->get(route('paten-registration'));

    $response->assertRedirect(route('login'));
});

test('user service dapat mengakses halaman registrasi paten', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('paten-registration'));

    $response->assertOk();
});

test('user administrator tidak dapat mengakses halaman registrasi paten', function () {
    $user = User::factory()->create([
        'role' => 'administrator',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('paten-registration'));

    $response->assertForbidden();
});
