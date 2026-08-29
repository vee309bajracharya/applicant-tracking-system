<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Department;
use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'department_id' => Department::factory(),
            'created_by' => User::factory(),
            'title' => fake()->jobTitle(),
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'internship', 'contract']),
            'location' => fake()->city(),
            'experience_required' => fake()->randomFloat(1, 0, 8),
            'salary_min' => 40000,
            'salary_max' => 90000,
            'description' => fake()->paragraphs(3, true),
            'status' => 'open',
            'deadline' => now()->addMonth(),
        ];
    }
}
