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
        Schema::create('candidate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('headline')->nullable();
            $table->string('summary')->nullable();
            $table->decimal('experience_years', 4, 1)->default(0.0);
            $table->decimal('expected_salary', 12, 2)->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->unsignedTinyInteger('profile_completion_percentage')->default(0);
            $table->timestamps();

            $table->index('experience_years', 'idx_cand_exp_years');
            $table->index('user_id', 'idx_candidate_profiles_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_profiles');
    }
};
