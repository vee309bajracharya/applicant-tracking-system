<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('password_reset_otps', function (Blueprint $table) {
            $table->id();
            $table->string('email', 255);
            $table->string('otp', 6); // 6 digit numeric string
            $table->unsignedTinyInteger('attempts')->default(0); // max.5 attempts enforced in service
            $table->string('reset_token', 64)->nullable(); // crypto hash for pwd reset gate
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable(); // set on successful OTP verify
            $table->timestamps();

            // indexes
            $table->index('email', 'idx_reset_otps_email');
            $table->index('expires_at', 'idx_reset_otps_expiry');
            $table->index('reset_token', 'idx_reset_otps_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_otps');
    }
};
