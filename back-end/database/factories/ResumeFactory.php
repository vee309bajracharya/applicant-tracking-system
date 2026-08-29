<?php

namespace Database\Factories;

use App\Models\CandidateProfile;
use App\Models\Resume;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Resume>
 */
class ResumeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'candidate_id' => CandidateProfile::factory(),
            'file_name' => Str::uuid() . '.pdf',
            'file_path' => 'resumes/' . Str::uuid() . '.pdf',
            'extracted_text' => fake()->paragraphs(3, true),
            'is_primary' => true,
            'uploaded_at' => now(),
        ];
    }
}
