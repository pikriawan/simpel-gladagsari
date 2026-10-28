<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarriageDispensation extends Model
{
    protected $fillable = [
        'letter_number',
        'village_name',
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
}
