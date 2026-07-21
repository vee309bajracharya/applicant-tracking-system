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
        Schema::create('match_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->decimal('skill_score', 5, 2)->default(0.00);
            $table->decimal('experience_score', 5, 2)->default(0.00);
            $table->decimal('keyword_score', 5, 2)->default(0.00);
            $table->decimal('tfidf_score', 5, 2)->default(0.00);
            $table->decimal('final_score', 5, 2)->default(0.00);
            $table->text('matching_reason')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->index('final_score', 'idx_match_scores_final');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_scores');
    }
};
