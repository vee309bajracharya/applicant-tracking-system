<?php

namespace Database\Factories;

use App\Models\Interview;
use App\Models\InterviewFeedback;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InterviewFeedback>
 */
class InterviewFeedbackFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'interview_id' => Interview::factory(),
            'reviewer_id' => User::factory(),
            'rating_score' => fake()->numberBetween(1, 5),
            'notes' => fake()->sentence(),
        ];
    }
}
