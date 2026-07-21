<?php

namespace App\Traits;

trait LoadsApplicationRelations
{
    protected function applicationRelations(): array
    {
        return [
            'job.company',
            'job.department',
            'job.creator',
            'job.skills',
            'candidateProfile.user',
            'resume',
            'statusHistory.changedBy',
            'matchScore',
        ];
    }
}
