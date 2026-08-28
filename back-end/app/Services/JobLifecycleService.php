<?php

namespace App\Services;

use App\Models\Job;
use Illuminate\Support\Carbon;

class JobLifecycleService
{
    public function closeExpiredJobs(): int
    {
        return Job::query()
            ->where('status', 'open')
            ->whereNotNull('deadline')
            ->whereDate('deadline', '<', Carbon::today())
            ->update(['status' => 'closed']);
    }
}
