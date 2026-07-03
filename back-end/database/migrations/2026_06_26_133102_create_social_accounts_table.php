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
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('provider', ['google', 'linkedin']);
            $table->string('provider_id', 255);
            $table->string('provider_email', 255)->nullable();
            $table->timestamps();

            $table->unique(['provider', 'provider_id'], 'uq_provider_account');
            // index
            $table->index('user_id', 'idx_social_accounts_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
