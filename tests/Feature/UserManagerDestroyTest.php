<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function destroyAdmin(): User
{
    return User::factory()->create([
        'role' => 'administrator',
        'nip' => '000000001',
        'status' => 'active',
    ]);
}

test('administrator dapat menghapus user service', function () {
    $admin = destroyAdmin();
    $user = User::factory()->create([
        'email' => 'service@example.com',
        'nip' => '000000002',
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->delete("/user-manager/{$user->id}")
        ->assertRedirect();

    expect(User::find($user->id))->toBeNull();
});

test('administrator tidak dapat menghapus administrator lain', function () {
    $admin = destroyAdmin();
    $otherAdmin = User::factory()->create([
        'email' => 'admin2@example.com',
        'nip' => '000000002',
        'role' => 'administrator',
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->delete("/user-manager/{$otherAdmin->id}")
        ->assertForbidden();

    expect(User::find($otherAdmin->id))->not->toBeNull();
});
