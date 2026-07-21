<?php

namespace App\Services;

use App\Models\Application;
use App\Models\MatchScore;
use Illuminate\Support\Collection;

class MatchScoreService
{
    // weight distribution, sums to 100
    protected const WEIGHT_SKILL = 50;
    protected const WEIGHT_EXPERIENCE = 20;
    protected const WEIGHT_KEYWORD = 15;
    protected const WEIGHT_TFIDF = 15;

    /**
     * Runs full match pipeline for one application and persists (or refreshes) its MatchScore row.
     */
    public function generate(Application $application): MatchScore
    {
        $application->loadMissing(['job.skills', 'job.requiredSkills', 'candidateProfile.skills', 'resume']);

        $job = $application->job;
        $candidate = $application->candidateProfile;
        $resume = $application->resume;

        $requiredSkillIds = $job->requiredSkills->pluck('id');
        $candidateSkillIds = $candidate->skills->pluck('id');

        $skillScore = $this->skillScore($requiredSkillIds, $candidateSkillIds);
        $experienceScore = $this->experienceScore((float) $job->experience_required, (float) $candidate->experience_years);
        $keywordScore = $this->keywordScore($resume?->extracted_text, $job->skills->pluck('skill_name')->all());
        $tfidfScore = $this->tfidfScore($resume?->extracted_text, $job->description);

        $final = round(
            ($skillScore * self::WEIGHT_SKILL
                + $experienceScore * self::WEIGHT_EXPERIENCE
                + $keywordScore * self::WEIGHT_KEYWORD
                + $tfidfScore * self::WEIGHT_TFIDF) / 100,
            2
        );

        $matchedNames = $job->requiredSkills->whereIn('id', $candidateSkillIds->all())->pluck('skill_name');
        $missingNames = $job->requiredSkills->whereNotIn('id', $candidateSkillIds->all())->pluck('skill_name');

        $reason = sprintf(
            'Matched skills: %s. Missing skills: %s. Experience %.1f/%.1f yrs required.',
            $matchedNames->implode(', ') ?: 'none',
            $missingNames->implode(', ') ?: 'none',
            (float) $candidate->experience_years,
            (float) $job->experience_required
        );

        return MatchScore::updateOrCreate(
            ['application_id' => $application->id],
            [
                'skill_score' => $skillScore,
                'experience_score' => $experienceScore,
                'keyword_score' => $keywordScore,
                'tfidf_score' => $tfidfScore,
                'final_score' => $final,
                'matching_reason' => $reason,
                'generated_at' => now(),
            ]
        );
    }

    /**
     * Skill Gap Analysis — strict set difference: Required \ Candidate.
     * Returns missing skill names, independent of a full generate() call.
     */
    public function skillGap(Application $application): array
    {
        $application->loadMissing(['job.requiredSkills', 'candidateProfile.skills']);

        $candidateSkillIds = $application->candidateProfile->skills->pluck('id')->all();

        return $application->job->requiredSkills
            ->whereNotIn('id', $candidateSkillIds)
            ->pluck('skill_name')
            ->values()
            ->all();
    }

    /**
     * Candidate Ranking Algorithm — orders a collection of Applications (each with matchScore
     * loaded) descending by final_score. Backed by PHP's sort (hybrid O(n log n)), satisfying
     * the Merge/Quick Sort requirement without a hand-rolled implementation.
     */
    public function rankByFinalScore(iterable $applications): Collection
    {
        return collect($applications)
            ->sortByDesc(fn (Application $app) => (float) ($app->matchScore->final_score ?? 0))
            ->values();
    }

    protected function skillScore(Collection $required, Collection $candidate): float
    {
        if ($required->isEmpty()) {
            return 100.00;
        }

        $matched = $required->intersect($candidate)->count();

        return round(($matched / $required->count()) * 100, 2);
    }

    protected function experienceScore(float $required, float $candidate): float
    {
        if ($required <= 0) {
            return 100.00;
        }

        return round(min($candidate / $required, 1.0) * 100, 2);
    }

    /**
     * Resume Keyword Matching Algorithm — lowercases + strips special chars from resume text,
     * then checks each job skill term against it. Degrades to 0 when no extracted_text exists
     * yet
     */
    protected function keywordScore(?string $text, array $dictionary): float
    {
        if (!$text || empty($dictionary)) {
            return 0.00;
        }

        $normalized = $this->normalize($text);
        $hits = 0;

        foreach ($dictionary as $term) {
            if (str_contains($normalized, $this->normalize($term))) {
                $hits++;
            }
        }

        return round(($hits / count($dictionary)) * 100, 2);
    }

    /**
     * TF-IDF + Cosine Similarity between resume text and full job description.
     * Pure PHP, 2-document (resume vs job description).
     */
    protected function tfidfScore(?string $resumeText, ?string $jobText): float
    {
        if (!$resumeText || !$jobText) {
            return 0.00;
        }

        $docs = [$this->tokenize($resumeText), $this->tokenize($jobText)];
        $vocab = array_values(array_unique(array_merge(...$docs)));

        if (empty($vocab)) {
            return 0.00;
        }

        $vectors = [];
        foreach ($docs as $tokens) {
            $tf = array_count_values($tokens);
            $tokenCount = max(count($tokens), 1);

            $vector = [];
            foreach ($vocab as $term) {
                $termFreq = ($tf[$term] ?? 0) / $tokenCount;
                $docFreq = collect($docs)->filter(fn ($d) => in_array($term, $d, true))->count();
                $idf = log((count($docs) + 1) / ($docFreq + 1)) + 1;
                $vector[] = $termFreq * $idf;
            }
            $vectors[] = $vector;
        }

        return round($this->cosineSimilarity($vectors[0], $vectors[1]) * 100, 2);
    }

    protected function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $i => $val) {
            $dot += $val * $b[$i];
            $normA += $val ** 2;
            $normB += $b[$i] ** 2;
        }

        if ($normA == 0.0 || $normB == 0.0) {
            return 0.0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }

    protected function normalize(string $text): string
    {
        return strtolower(preg_replace('/[^a-z0-9\s]/i', ' ', $text));
    }

    protected function tokenize(string $text): array
    {
        $normalized = $this->normalize($text);

        return array_values(array_filter(
            preg_split('/\s+/', $normalized) ?: [],
            fn ($t) => strlen($t) > 2
        ));
    }
}
