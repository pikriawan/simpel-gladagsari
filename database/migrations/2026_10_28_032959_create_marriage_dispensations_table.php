<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marriage_dispensations', function (Blueprint $table) {
            $table->id();
            $table->string('letter_number')->nullable();
            $table->string('village_name')->nullable();
            $table->string('reference_letter_number')->nullable();
            $table->date('letter_date')->nullable();
            $table->string('applicant_name')->nullable();
            $table->string('applicant_birth_place_date')->nullable();
            $table->string('subvillage')->nullable();
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->date('marriage_date')->nullable();
            $table->string('partner_name')->nullable();
            $table->string('partner_birth_place_date')->nullable();
            $table->string('religion')->nullable();
            $table->text('partner_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marriage_dispensations');
    }
};
