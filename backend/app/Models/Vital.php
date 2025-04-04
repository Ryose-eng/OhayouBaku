<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vital extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'systolic', 'diastolic', 'pulse', 'temperature', 'oxygen', 'mood', 'note'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
