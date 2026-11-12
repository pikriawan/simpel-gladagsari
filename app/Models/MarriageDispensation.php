<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $letter_number
 * @property string|null $village
 * @property string|null $reference_letter_number
 * @property Carbon|null $letter_date
 * @property string|null $applicant_name
 * @property string|null $applicant_birth_place_date
 * @property string|null $subvillage
 * @property string|null $rt
 * @property string|null $rw
 * @property Carbon|null $marriage_date
 * @property string|null $partner_name
 * @property string|null $partner_birth_place_date
 * @property string|null $religion
 * @property string|null $partner_address
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class MarriageDispensation extends Model
{
    protected $fillable = [
        'letter_number',
        'village',
        'reference_letter_number',
        'letter_date',
        'applicant_name',
        'applicant_birth_place_date',
        'subvillage',
        'rt',
        'rw',
        'marriage_date',
        'partner_name',
        'partner_birth_place_date',
        'religion',
        'partner_address',
    ];

    protected function casts(): array
    {
        return [
            'letter_date' => 'date',
            'marriage_date' => 'date',
        ];
    }

    /**
     * Backward compatibility accessor for village_name.
     */
    public function getVillageNameAttribute(): ?string
    {
        return $this->attributes['village'] ?? null;
    }
}
