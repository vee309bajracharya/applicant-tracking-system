<?php

namespace App\Services;

use App\Models\Application;
use App\Models\ApplicationStatusHistory;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ApplicationPipelineService
{
    // Forward sequential path
    protected const SEQUENCE = ['applied', 'screening', 'shortlisted', 'interview', 'selected', 'hired'];

    // Rejected reachable from these — a soft terminal branch, not part of main sequence
    protected const REJECTABLE_FROM = ['screening', 'shortlisted', 'interview', 'selected'];

    public function transition(Application $application, string $newStatus, int $changedBy, ?string $reason = null): Application
    {
        $current = $application->status;

        if (!$this->isValidTransition($current, $newStatus)) {
            throw new InvalidArgumentException("Cannot transition application from '{$current}' to '{$newStatus}'.");
        }

        return DB::transaction(function () use ($application, $current, $newStatus, $changedBy, $reason) {
            $application->update(['status' => $newStatus]);

            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'old_status' => $current,
                'new_status' => $newStatus,
                'changed_by' => $changedBy,
                'reason' => $reason,
                'created_at' => now(),
            ]);

            // TODO Phase 8: fire notification event here (Application::StatusChanged)

            return $application->fresh('statusHistory');
        });
    }

    protected function isValidTransition(string $from, string $to): bool
    {
        if ($from === 'rejected' || $from === 'hired') {
            return false; // terminal states, locked
        }

        if ($to === 'rejected') {
            return in_array($from, self::REJECTABLE_FROM, true);
        }

        $fromIndex = array_search($from, self::SEQUENCE, true);
        $toIndex = array_search($to, self::SEQUENCE, true);

        if ($fromIndex === false || $toIndex === false) {
            return false;
        }

        // strictly sequential, one step forward only — no skipping stages
        return $toIndex === $fromIndex + 1;
    }
}
