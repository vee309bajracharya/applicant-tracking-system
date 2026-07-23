<?php

namespace App\Services;

use App\Models\FaqQuestion;

class ChatbotService
{
    protected const FALLBACK = "I don't have an answer for that yet. Try rephrasing, or reach out to your recruiter/HR contact directly.";

    // overlap ratio,"no real match" rather than guessing
    protected const MIN_SCORE = 0.2;

    /**
     * Local FAQ Dynamic Database Chatbot Component
     *  - plain keyword overlap against faq_questions
     */
    public function respond(string $userMessage): array
    {
        $userTokens = $this->tokenize($userMessage);

        if (empty($userTokens)) {
            return ['answer' => self::FALLBACK, 'matched_faq_id' => null];
        }

        $best = null;
        $bestScore = 0.0;

        FaqQuestion::where('is_active', true)->get()->each(function (FaqQuestion $faq) use ($userTokens, &$best, &$bestScore) {
            $faqTokens = $this->tokenize($faq->question);

            if (empty($faqTokens)) {
                return;
            }

            $overlap = count(array_intersect($userTokens, $faqTokens));
            $score = $overlap / count($faqTokens);

            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faq;
            }
        });

        if ($best && $bestScore >= self::MIN_SCORE) {
            return ['answer' => $best->answer, 'matched_faq_id' => $best->id];
        }

        return ['answer' => self::FALLBACK, 'matched_faq_id' => null];
    }

    protected function tokenize(string $text): array
    {
        $normalized = strtolower(preg_replace('/[^a-z0-9\s]/i', ' ', $text));

        return array_values(array_unique(array_filter(
            preg_split('/\s+/', $normalized) ?: [],
            fn ($t) => strlen($t) > 2
        )));
    }
}
