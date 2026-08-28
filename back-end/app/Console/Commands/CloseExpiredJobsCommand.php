<?php

namespace App\Console\Commands;

use App\Services\JobLifecycleService;
use Illuminate\Console\Command;


class CloseExpiredJobsCommand extends Command
{
    protected $signature = 'jobs:close-expired';

    protected $description = 'Close jobs whose deadline has passed';

    public function handle(JobLifecycleService $lifecycle): int
    {
        $count = $lifecycle->closeExpiredJobs();

        $this->info("Closed {$count} expired job(s)");

        return self::SUCCESS;
    }
}
