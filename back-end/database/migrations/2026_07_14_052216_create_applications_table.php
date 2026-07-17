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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('job_postings')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('candidate_profiles')->cascadeOnDelete();
            $table->foreignId('resume_id')->constrained('resumes')->restrictOnDelete();
            $table->enum('status', [
                'applied',
                'screening',
                'shortlisted',
                'interview',
                'selected',
                'rejected',
                'hired',
            ])->default('applied');
            $table->timestamp('applied_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['job_id', 'status'], 'idx_apps_job_status');
            $table->index('candidate_id', 'idx_apps_candidate');
            $table->unique(['job_id', 'candidate_id'], 'uq_apps_job_candidate'); // block duplicate applications

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
