<?php

use App\Models\User;

test('returns a successful response', function () {
    $this->get(route('home'))->assertRedirect('/login');
});

test('authenticated root renders the React dashboard as an Inertia page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('root/dashboard'));
});

    test('administrator is sent to the administrator dashboard from the root', function () {
        $administrator = User::factory()->create(['role' => 'administrator']);

        $this->actingAs($administrator)
        ->get(route('home'))
        ->assertRedirect('/admin');
    });
