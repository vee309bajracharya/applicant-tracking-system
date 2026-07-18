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
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->enum('employment_type', ['full_time', 'part_time', 'internship', 'contract']);
            $table->string('location');
            $table->decimal('experience_required', 4, 1)->default(0.0);
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->longText('description');
            $table->enum('status', ['open', 'closed', 'draft'])->default('draft');
            $table->date('deadline')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'status'], 'idx_jobs_company_status');
            $table->index('deadline', 'idx_jobs_deadline');
            $table->fullText(['title', 'description'], 'ft_jobs_title_desc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
