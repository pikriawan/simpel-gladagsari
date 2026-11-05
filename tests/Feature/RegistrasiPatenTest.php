<?php

use App\Models\PatenRegistration;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

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

test('user service dapat menyimpan file spreadsheet registrasi paten ke database', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $payload = [
        'data' => [
            ['No', 'Nama Pemohon', 'Alamat'],
            ['1', 'Budi Santoso', 'Gladagsari'],
        ],
        'style' => [
            'A1' => 'font-weight: bold; border-bottom: 1px solid black;',
            'B1' => 'font-weight: bold; border-bottom: 1px solid black;',
            'C1' => 'font-weight: bold; border-bottom: 1px solid black;',
        ],
        'merge' => [
            'A1' => [1, 1],
        ],
    ];

    $response = $this->post(route('paten-registration.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseCount('paten_registrations', 1);

    $registration = PatenRegistration::first();
    expect($registration->filename)->toBe('registrasi-paten.xlsx')
        ->and($registration->file_path)->not->toBeEmpty()
        ->and($registration->file_size)->toBeGreaterThan(0)
        ->and($registration->file_content)->not->toBeEmpty()
        ->and($registration->sheet_data['data'][1][1])->toBe('Budi Santoso')
        ->and($registration->created_by)->toBe($user->id);

    Storage::disk('local')->assertExists($registration->file_path);
});

test('user service dapat menyimpan multiple sheets ke database dan storage', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $payload = [
        'data' => [
            ['No', 'Nama Pemohon'],
            ['1', 'Sheet 1 Data'],
        ],
        'style' => [],
        'merge' => [],
        'sheets' => [
            [
                'name' => 'Data Pemohon',
                'data' => [
                    ['No', 'Nama Pemohon'],
                    ['1', 'Sheet 1 Data'],
                ],
                'style' => ['A1' => 'font-weight: bold;'],
                'merge' => [],
            ],
            [
                'name' => 'Data Desa',
                'data' => [
                    ['Kode', 'Nama Desa'],
                    ['3309', 'Gladagsari'],
                ],
                'style' => ['A1' => 'font-weight: bold;'],
                'merge' => [],
            ],
        ],
    ];

    $response = $this->post(route('paten-registration.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseCount('paten_registrations', 1);

    $registration = PatenRegistration::first();
    expect($registration->sheet_data['sheets'])->toHaveCount(2)
        ->and($registration->sheet_data['sheets'][0]['name'])->toBe('Data Pemohon')
        ->and($registration->sheet_data['sheets'][1]['name'])->toBe('Data Desa')
        ->and($registration->sheet_data['sheets'][1]['data'][1][1])->toBe('Gladagsari');

    Storage::disk('local')->assertExists($registration->file_path);
});

test('menyimpan perubahan akan menghapus file lama di storage dan menggantikannya dengan file baru', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    // Simpan data pertama
    $this->post(route('paten-registration.store'), [
        'data' => [
            ['No', 'Nama'],
            ['1', 'Data Pertama'],
        ],
        'style' => [],
        'merge' => [],
    ]);

    $firstRegistration = PatenRegistration::first();
    $oldFilePath = $firstRegistration->file_path;
    Storage::disk('local')->assertExists($oldFilePath);

    // Simpan perubahan kedua
    $this->post(route('paten-registration.store'), [
        'data' => [
            ['No', 'Nama'],
            ['1', 'Data Kedua Diperbarui'],
        ],
        'style' => [
            'A1' => 'font-weight: bold;',
        ],
        'merge' => [],
    ]);

    // Hanya ada 1 record di database
    $this->assertDatabaseCount('paten_registrations', 1);

    $updatedRegistration = PatenRegistration::first();
    expect($updatedRegistration->sheet_data['data'][1][1])->toBe('Data Kedua Diperbarui')
        ->and($updatedRegistration->file_path)->not->toBe($oldFilePath);

    // File lama harus sudah terhapus
    Storage::disk('local')->assertMissing($oldFilePath);

    // File baru harus ada di storage
    Storage::disk('local')->assertExists($updatedRegistration->file_path);
});

test('halaman registrasi paten memuat data spreadsheet yang sudah tersimpan', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    PatenRegistration::create([
        'filename' => 'registrasi-paten.xlsx',
        'file_path' => 'paten/test.xlsx',
        'file_size' => 1234,
        'sheet_data' => [
            'data' => [['Header 1', 'Header 2']],
            'style' => ['A1' => 'font-weight: bold;'],
            'merge' => [],
        ],
        'created_by' => $user->id,
        'updated_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('paten-registration'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('paten-registration')
        ->has('registration')
        ->where('registration.filename', 'registrasi-paten.xlsx')
        ->where('registration.sheet_data.data.0.0', 'Header 1')
    );
});

test('user service dapat mendownload file paten yang sudah tersimpan', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $filePath = 'paten/registrasi-paten_sample.xlsx';
    Storage::disk('local')->put($filePath, 'dummy content');

    PatenRegistration::create([
        'filename' => 'registrasi-paten.xlsx',
        'file_path' => $filePath,
        'file_size' => 13,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('paten-registration.download'));

    $response->assertOk();
    $response->assertDownload('registrasi-paten.xlsx');
});

test('user service dapat menyimpan lebar kolom dan tinggi baris ke database', function () {
    Storage::fake('local');

    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $payload = [
        'data' => [
            ['Kode', 'Deskripsi'],
            ['P01', 'Paten Inovasi'],
        ],
        'style' => [],
        'merge' => [],
        'columns' => [
            ['width' => 120],
            ['width' => 350],
        ],
        'rows' => [
            0 => ['height' => 40],
        ],
        'sheets' => [
            [
                'name' => 'Sheet1',
                'data' => [
                    ['Kode', 'Deskripsi'],
                    ['P01', 'Paten Inovasi'],
                ],
                'style' => [],
                'merge' => [],
                'columns' => [
                    ['width' => 120],
                    ['width' => 350],
                ],
                'rows' => [
                    0 => ['height' => 40],
                ],
            ]
        ],
    ];

    $response = $this->post(route('paten-registration.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseCount('paten_registrations', 1);

    $registration = PatenRegistration::first();
    expect($registration->sheet_data['sheets'][0]['columns'][0]['width'])->toBe(120)
        ->and($registration->sheet_data['sheets'][0]['columns'][1]['width'])->toBe(350)
        ->and($registration->sheet_data['sheets'][0]['rows'][0]['height'])->toBe(40);

    Storage::disk('local')->assertExists($registration->file_path);
});

test('user service dapat mengekspor spreadsheet ke format binary excel', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $payload = [
        'data' => [
            ['Header 1', 'Header 2'],
            ['Val 1', 'Val 2'],
        ],
        'style' => [],
        'merge' => [],
        'sheets' => [
            [
                'name' => 'Sheet1',
                'data' => [
                    ['Header 1', 'Header 2'],
                    ['Val 1', 'Val 2'],
                ],
                'style' => [],
                'merge' => [],
            ]
        ],
    ];

    $response = $this->post(route('paten-registration.export'), $payload);

    $response->assertOk();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $response->assertHeader('content-disposition', 'attachment; filename=registrasi-paten.xlsx');
});

test('user service dapat mengimpor file excel dan menghasilkan array sheets', function () {
    $user = User::factory()->create([
        'role' => 'service',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    // Buat file excel sementara untuk diimpor
    $spreadsheetService = app(\App\Services\PatenSpreadsheetService::class);
    $binary = $spreadsheetService->generateXlsxBinary(
        data: [['Col A', 'Col B'], ['Data 1', 'Data 2']],
        sheets: [
            [
                'name' => 'ImportedSheet',
                'data' => [['Col A', 'Col B'], ['Data 1', 'Data 2']],
                'style' => ['A1' => 'font-weight: bold;'],
                'merge' => [],
            ]
        ]
    );

    $tempFile = tempnam(sys_get_temp_dir(), 'test_import_') . '.xlsx';
    file_put_contents($tempFile, $binary);

    $uploadedFile = new \Illuminate\Http\UploadedFile(
        $tempFile,
        'test_import.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this->post(route('paten-registration.import'), [
        'file' => $uploadedFile,
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);

    $json = $response->json();
    expect($json['sheets'])->toBeArray()
        ->and($json['sheets'][0]['name'])->toBe('ImportedSheet')
        ->and($json['sheets'][0]['data'][0][0])->toBe('Col A')
        ->and($json['sheets'][0]['data'][1][0])->toBe('Data 1');

    if (file_exists($tempFile)) {
        unlink($tempFile);
    }
});
