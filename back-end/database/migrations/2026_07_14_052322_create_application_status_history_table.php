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
        Schema::create('application_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->enum('old_status', [
                'applied',
                'screening',
                'shortlisted',
                'interview',
                'selected',
                'rejected',
                'hired',
            ])->nullable();
            $table->enum('new_status', [
                'applied',
                'screening',
                'shortlisted',
                'interview',
                'selected',
                'rejected',
                'hired',
            ]);
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->string('reason')->nullable();
            $table->timestamp('created_at')->nullable(); // immutable log, no updated_at

            $table->index('application_id', 'idx_app_history_main');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_status_history');
    }
};
