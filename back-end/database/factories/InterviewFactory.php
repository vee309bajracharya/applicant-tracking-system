<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Interview>
 */
class InterviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'application_id' => Application::factory()->status('interview'),
            'recruiter_id' => User::factory(),
            'interview_date' => now()->addDays(3),
            'interview_type' => 'offline',
            'meeting_link' => fake()->url(),
            'status' => 'scheduled',
        ];
    }
}
