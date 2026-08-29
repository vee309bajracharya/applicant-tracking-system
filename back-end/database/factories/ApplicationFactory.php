<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\Job;
use App\Models\Resume;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_id' => Job::factory(),
            'candidate_id' => CandidateProfile::factory(),
            'resume_id' => Resume::factory(),
            'status' => 'applied',
            'applied_at' => now(),
        ];
    }
}
