<?php

namespace Database\Factories;

use App\Models\FaqQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FaqQuestion>
 */
class FaqQuestionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'question' => 'How do I reset my password?',
            'answer' => 'Use the forgot password link on the login page and follow the OTP flow.',
            'category' => 'account',
            'is_active' => true,
        ];
    }
}
