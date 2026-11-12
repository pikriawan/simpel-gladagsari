<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'name' => 'Administrator',
            'email' => 'administrator@gladagsari.go.id',
            'nip' => '098765432123456788',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'administrator',
            'status' => 'active',
            'password_set' => true,
        ]);

        DB::table('users')->insert([
            'name' => 'Service',
            'email' => 'service@gladagsari.go.id',
            'nip' => '098765432123456787',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'service',
            'status' => 'active',
            'password_set' => true,
        ]);
    }
}
