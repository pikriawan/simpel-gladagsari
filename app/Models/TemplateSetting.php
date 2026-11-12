<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];
}