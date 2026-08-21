<?php

namespace App\Traits;

use App\Models\Application;
use Illuminate\Http\Request;

trait EnforcesCompanyScope
{
    // HR Manager and Recruiter are staff of exactly one company
    //   — this guard blocks them from acting on another company's application via any endpoint that resolves a specific Application, no matter which controller it lives in.
    protected function assertApplicationCompanyAccess(Request $request, Application $application): void
    {
        if(! $request->user()->isScopedToCompany())
            return;

        if($application->job->company_id !== $request->user()->assignedCompanyId())
            abort(403, 'You do not have permission to access this application.');
    }
}
