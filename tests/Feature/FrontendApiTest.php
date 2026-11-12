<?php

use App\Models\MarriageDispensation;
use App\Models\User;

test('frontend can authenticate with nip and use the laravel session', function () {
    $user = User::factory()->create([
        'nip' => '098765432123456789',
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->postJson('/api/auth/login', [
        'nip' => $user->nip,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('user.role', 'Pelayanan');

    $this->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('user.id', (string) $user->id);

    $this->getJson('/api/data')
        ->assertOk()
        ->assertJsonPath('template.logo', '/assets/Logo%20KOP.png');
});

test('frontend saves marriage records into the laravel records table', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user)->postJson('/api/data/riwayat', [
        'nomorSurat' => '474.2/12/6.20/2026',
        'desaPengantar' => 'Candisari',
        'namaPemohon' => 'Siti Aisyah',
        'tanggalNikah' => '2026-11-12',
        'namaPasangan' => 'Budi Santoso',
    ])->assertCreated()->assertJsonPath('record.nomorUrut', '12');

    expect(MarriageDispensation::query()->where('letter_number', '474.2/12/6.20/2026')->exists())->toBeTrue();
});

test('service users cannot change administrator template settings', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->putJson('/api/data/template', ['namaPejabat' => 'Tidak Diizinkan'])
        ->assertForbidden();
});

test('paten editor route renders the friends inertia page', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get('/paten-registration/editor')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('paten-registration/editor'));
});

test('legacy marriage pages redirect to the root React frontend', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get('/marriage-dispensation/editor')
        ->assertRedirect('/surat-dispensasi-nikah/editor');

    $this->actingAs($user)
        ->get('/marriage-dispensation/template-settings')
        ->assertRedirect('/surat-dispensasi-nikah/pengaturan-template');

    $this->actingAs($user)
        ->get('/surat-dispensasi-nikah/pengaturan-template')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('root/pengaturan-template'));
});