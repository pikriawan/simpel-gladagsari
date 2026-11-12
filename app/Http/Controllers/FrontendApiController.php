<?php

namespace App\Http\Controllers;

use App\Models\MarriageDispensation;
use App\Models\TemplateSetting;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\TwoFactorAuthenticationProvider;

class FrontendApiController extends Controller
{
    private const TEMPLATE_DEFAULTS = [
        'baris1' => 'PEMERINTAH KABUPATEN BOYOLALI',
        'baris2' => 'KECAMATAN GLADAGSARI',
        'baris3' => 'Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345',
        'baris4' => 'website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id',
        'baris5' => '',
        'logo' => '/assets/Logo%20KOP.png',
        'namaPejabat' => 'Gilang Pamungkas',
        'jabatanUtama' => 'a.n. Camat Gladagsari',
        'subJabatan' => 'Kasi Pelayanan',
        'pangkat' => 'Penata Tingkat I',
        'nipPejabat' => '19850101 201001 1 001',
        'dasarHukum1' => 'Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sebagaimana telah diubah dengan Undang-Undang Nomor 16 Tahun 2019.',
        'dasarHukum2' => 'Peraturan Mahkamah Agung Nomor 5 Tahun 2019 tentang Pedoman Mengadili Permohonan Dispensasi Kawin.',
        'alasan' => 'Dispensasi nikah diberikan untuk memenuhi persyaratan administrasi pencatatan perkawinan.',
    ];

    private const TEMPLATE_KEYS = [
        'baris1', 'baris2', 'baris3', 'baris4', 'baris5', 'logo',
        'namaPejabat', 'jabatanUtama', 'subJabatan', 'pangkat', 'nipPejabat',
        'dasarHukum1', 'dasarHukum2', 'alasan',
    ];

    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['token' => $request->session()->token()]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'nip' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('nip', trim($credentials['nip']))->first();
        if (! $user || $user->status !== 'active' || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['error' => 'NIP atau password salah.'], 401);
        }

        if ($user->two_factor_confirmed_at) {
            $challenge = Str::random(48);
            $request->session()->put([
                'frontend_login_challenge' => $challenge,
                'frontend_login_user_id' => $user->id,
            ]);

            return response()->json([
                'needsCode' => true,
                'pendingToken' => $challenge,
                'user' => $this->publicUser($user),
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $this->publicUser($user)]);
    }

    public function verify(Request $request, TwoFactorAuthenticationProvider $provider): JsonResponse
    {
        $validated = $request->validate(['code' => ['required', 'digits:6']]);
        $challenge = $request->session()->get('frontend_login_challenge');
        $userId = $request->session()->get('frontend_login_user_id');

        if (! $challenge || ! $userId || ! hash_equals($challenge, (string) $request->input('pendingToken'))) {
            return response()->json(['error' => 'Sesi autentikasi tidak berlaku. Silakan login kembali.'], 401);
        }

        $user = User::query()->find($userId);
        if (! $user || $user->status !== 'active' || ! $user->two_factor_confirmed_at || ! $user->two_factor_secret) {
            return response()->json(['error' => 'Sesi autentikasi tidak berlaku. Silakan login kembali.'], 401);
        }

        $secret = Fortify::currentEncrypter()->decrypt($user->two_factor_secret);
        if (! $provider->verify($secret, $validated['code'])) {
            return response()->json(['error' => 'Kode autentikasi tidak valid.'], 422);
        }

        Auth::login($user);
        $request->session()->forget(['frontend_login_challenge', 'frontend_login_user_id']);
        $request->session()->regenerate();

        return response()->json(['user' => $this->publicUser($user)]);
    }

    public function me(): JsonResponse
    {
        $user = Auth::user();
        if (! $user || $user->status !== 'active') {
            return response()->json(['error' => 'Sesi tidak berlaku.'], 401);
        }

        return response()->json(['user' => $this->publicUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);
        $status = Password::sendResetLink($validated);

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['error' => __($status)], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8'],
        ]);
        $validated['password_confirmation'] = $validated['password'];

        $status = Password::reset($validated, function (User $user, string $password): void {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
                'password_set' => true,
            ])->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['error' => __($status)], 422);
        }

        return response()->json(['ok' => true]);
    }

    public function profile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'currentPassword' => ['nullable', 'string'],
            'newPassword' => ['nullable', 'string', 'min:8'],
        ]);

        $user->name = trim($validated['nama']);
        $user->email = $validated['email'];

        if (! empty($validated['newPassword'])) {
            if (! Hash::check($validated['currentPassword'] ?? '', $user->password)) {
                return response()->json(['error' => 'Password saat ini salah.'], 422);
            }
            $user->password = Hash::make($validated['newPassword']);
            $user->password_set = true;
        }

        $user->save();

        return response()->json(['user' => $this->publicUser($user)]);
    }

    public function data(Request $request): JsonResponse
    {
        $template = array_merge(
            self::TEMPLATE_DEFAULTS,
            TemplateSetting::query()->whereIn('key', self::TEMPLATE_KEYS)->pluck('value', 'key')->toArray(),
        );

        $data = [
            'riwayat' => MarriageDispensation::query()->latest()->get()
                ->map(fn (mixed $record) => $this->publicRecord($record))->values(),
            'template' => $template,
            'draft' => $this->getFrontendValue('draft'),
        ];

        $desa = $this->getFrontendValue('desa');
        $dukuhByDesa = $this->getFrontendValue('dukuhByDesa');
        if ($desa !== null) {
            $data['desa'] = $desa;
        }
        if ($dukuhByDesa !== null) {
            $data['dukuhByDesa'] = $dukuhByDesa;
        }

        if ($this->actor($request)->role === 'administrator') {
            $data['pegawai'] = User::query()->orderBy('name')->get()
                ->map(fn (mixed $user) => $this->publicUser($user))->values();
        }

        return response()->json($data);
    }

    public function saveData(Request $request, string $resource): JsonResponse
    {
        $value = json_decode($request->getContent(), true);

        if ($resource === 'pegawai') {
            return $this->saveUsers($request, $value);
        }

        if ($resource === 'template') {
            abort_unless($this->actor($request)->role === 'administrator', 403, 'Akses administrator diperlukan.');

            foreach (self::TEMPLATE_KEYS as $key) {
                if (array_key_exists($key, $value ?? [])) {
                    TemplateSetting::query()->updateOrCreate(
                        ['key' => $key],
                        ['value' => (string) ($value[$key] ?? '')],
                    );
                }
            }

            return response()->json(['ok' => true]);
        }

        if (! in_array($resource, ['desa', 'dukuhByDesa', 'draft'], true)) {
            return response()->json(['error' => 'Data yang diminta tidak dikenal.'], 404);
        }

        DB::table('frontend_data')->updateOrInsert(
            ['key' => $resource],
            ['value' => json_encode($value, JSON_THROW_ON_ERROR), 'updated_at' => now()],
        );

        return response()->json(['ok' => true]);
    }

    public function storeRecord(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nomorSurat' => ['required', 'string', 'max:255'],
            'desaPengantar' => ['nullable', 'string', 'max:255'],
            'nomorSuratPengantar' => ['nullable', 'string', 'max:255'],
            'tanggalSurat' => ['nullable', 'date'],
            'namaPemohon' => ['required', 'string', 'max:255'],
            'ttlPemohon' => ['nullable', 'string', 'max:255'],
            'dukuh' => ['nullable', 'string', 'max:255'],
            'rt' => ['nullable', 'string', 'max:10'],
            'rw' => ['nullable', 'string', 'max:10'],
            'tanggalNikah' => ['required', 'date'],
            'namaPasangan' => ['required', 'string', 'max:255'],
            'ttlPasangan' => ['nullable', 'string', 'max:255'],
            'agama' => ['nullable', 'string', 'max:255'],
            'alamatPasangan' => ['nullable', 'string'],
        ]);

        $record = MarriageDispensation::query()->create([
            'letter_number' => $validated['nomorSurat'],
            'village' => $validated['desaPengantar'] ?? null,
            'reference_letter_number' => $validated['nomorSuratPengantar'] ?? null,
            'letter_date' => $validated['tanggalSurat'] ?? null,
            'applicant_name' => $validated['namaPemohon'],
            'applicant_birth_place_date' => $validated['ttlPemohon'] ?? null,
            'subvillage' => $validated['dukuh'] ?? null,
            'rt' => $validated['rt'] ?? null,
            'rw' => $validated['rw'] ?? null,
            'marriage_date' => $validated['tanggalNikah'],
            'partner_name' => $validated['namaPasangan'],
            'partner_birth_place_date' => $validated['ttlPasangan'] ?? null,
            'religion' => $validated['agama'] ?? null,
            'partner_address' => $validated['alamatPasangan'] ?? null,
        ]);

        return response()->json(['record' => $this->publicRecord($record)], 201);
    }

    public function deleteRecord(int $id): JsonResponse
    {
        MarriageDispensation::query()->findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    private function saveUsers(Request $request, mixed $value): JsonResponse
    {
        $actor = $this->actor($request);
        abort_unless($actor->role === 'administrator', 403, 'Akses administrator diperlukan.');
        if (! is_array($value) || ! array_is_list($value)) {
            throw ValidationException::withMessages(['pegawai' => 'Daftar pegawai tidak valid.']);
        }

        $users = User::query()->get()->keyBy(fn (User $user) => (string) $user->id);
        $incomingIds = [];

        DB::transaction(function () use ($request, $value, $users, $actor, &$incomingIds): void {
            foreach ($value as $row) {
                if (! is_array($row)) {
                    throw ValidationException::withMessages(['pegawai' => 'Data pegawai tidak valid.']);
                }

                $id = isset($row['id']) ? (string) $row['id'] : '';
                $user = $users->get($id);
                $validated = validator($row, [
                    'nip' => ['required', 'regex:/^\d{18}$/', Rule::unique('users', 'nip')->ignore($user?->id)],
                    'nama' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
                    'role' => ['required', 'in:Pelayanan,Administrator'],
                    'status' => ['nullable', 'in:Aktif,Nonaktif'],
                    'password' => ['nullable', 'string', 'min:8'],
                ])->validate();

                if ($user) {
                    $user->name = trim($validated['nama']);
                    $user->nip = $validated['nip'];
                    $user->email = $validated['email'];
                    $user->status = ($validated['status'] ?? 'Aktif') === 'Aktif' ? 'active' : 'inactive';
                    if (! empty($validated['password'])) {
                        $user->password = Hash::make($validated['password']);
                        $user->password_set = true;
                    }
                    $user->save();
                    $incomingIds[] = (string) $user->id;
                    continue;
                }

                if ($validated['role'] !== 'Pelayanan') {
                    throw ValidationException::withMessages(['role' => 'Pegawai baru hanya dapat diberi role Pelayanan.']);
                }

                $user = User::query()->create([
                    'name' => trim($validated['nama']),
                    'nip' => $validated['nip'],
                    'email' => $validated['email'],
                    'role' => 'service',
                    'status' => ($validated['status'] ?? 'Aktif') === 'Aktif' ? 'active' : 'inactive',
                    'password' => Hash::make($validated['password'] ?? Str::random(48)),
                    'password_set' => ! empty($validated['password']),
                    'email_verified_at' => now(),
                ]);
                $incomingIds[] = (string) $user->id;
            }

            $actorId = (string) $actor->id;
            if (! in_array($actorId, $incomingIds, true)) {
                throw ValidationException::withMessages(['pegawai' => 'Akun administrator yang sedang digunakan tidak dapat dihapus.']);
            }

            $users->each(function (User $user, string $id) use ($incomingIds, $actorId): void {
                if ($user->role === 'service' && $id !== $actorId && ! in_array($id, $incomingIds, true)) {
                    $user->delete();
                }
            });
        });

        return response()->json([
            'ok' => true,
            'pegawai' => User::query()->orderBy('name')->get()
                ->map(fn (mixed $user) => $this->publicUser($user))->values(),
        ]);
    }

    private function getFrontendValue(string $key): mixed
    {
        $raw = DB::table('frontend_data')->where('key', $key)->value('value');

        return $raw === null ? null : json_decode($raw, true);
    }

    private function actor(Request $request): User
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 401);

        return $actor;
    }

    private function publicUser(mixed $user): array
    {
        if (! $user instanceof User) {
            throw new \UnexpectedValueException('Data pengguna tidak valid.');
        }

        return [
            'id' => (string) $user->id,
            'nip' => $user->nip,
            'nama' => $user->name,
            'email' => $user->email,
            'role' => $user->role === 'administrator' ? 'Administrator' : 'Pelayanan',
            'status' => $user->status === 'active' ? 'Aktif' : 'Nonaktif',
            'passwordSet' => (bool) ($user->password_set ?? true),
            'authenticator' => $user->two_factor_confirmed_at !== null,
        ];
    }

    private function publicRecord(mixed $record): array
    {
        if (! $record instanceof MarriageDispensation) {
            throw new \UnexpectedValueException('Data riwayat tidak valid.');
        }

        $letterNumber = (string) ($record->letter_number ?? '');
        $parts = explode('/', $letterNumber);
        $nomorUrut = count($parts) > 2 ? $parts[1] : $letterNumber;

        return [
            'id' => (string) $record->id,
            'nomorUrut' => $nomorUrut,
            'nomorSurat' => $letterNumber,
            'desaPengantar' => $record->village ?? '',
            'nomorSuratPengantar' => $record->reference_letter_number ?? '',
            'tanggalSurat' => substr((string) $record->getRawOriginal('letter_date'), 0, 10),
            'namaPemohon' => $record->applicant_name ?? '',
            'ttlPemohon' => $record->applicant_birth_place_date ?? '',
            'dukuh' => $record->subvillage ?? '',
            'rt' => $record->rt ?? '',
            'rw' => $record->rw ?? '',
            'tanggalNikah' => substr((string) $record->getRawOriginal('marriage_date'), 0, 10),
            'namaPasangan' => $record->partner_name ?? '',
            'ttlPasangan' => $record->partner_birth_place_date ?? '',
            'agama' => $record->religion ?? '',
            'alamatPasangan' => $record->partner_address ?? '',
            'savedAt' => $record->created_at?->toISOString() ?? '',
        ];
    }
}