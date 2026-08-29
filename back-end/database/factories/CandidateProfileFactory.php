<?php

namespace Database\Factories;

use App\Models\CandidateProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CandidateProfile>
 */
class CandidateProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'headline' => fake()->jobTitle(),
            'summary' => fake()->paragraph(),
            'experience_years' => fake()->randomFloat(1, 0, 15),
            'expected_salary' => fake()->numberBetween(30000, 150000),
            'linkedin_url' => 'https://linkedin.com/in/' . fake()->userName(),
            'github_url' => 'https://github.com/' . fake()->userName(),
            'portfolio_url' => fake()->url(),
            'profile_completion_percentage' => fake()->numberBetween(20, 100),
        ];
    }
}
