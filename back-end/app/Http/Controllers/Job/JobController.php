<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Http\Requests\Job\CloseJobRequest;
use App\Http\Requests\Job\StoreJobRequest;
use App\Http\Requests\Job\UpdateJobRequest;
use App\Http\Resources\JobResource;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    protected function jobRelations(): array
    {
        return [
            'company',
            'department',
            'creator',
            'skills',
        ];
    }
    public function index(Request $request)
    {
        $query = Job::with($this->jobRelations())->withCount('applications');

        if ($request->user()->hasRole('candidate')) {
            $query->where('status', 'open');
        }

        if ($status = $request->query('status'))
            $query->where('status', $status);

        if ($search = $request->query('search'))
            $query->whereFullText(['title', 'description'], $search);

        return JobResource::collection($query->latest()->paginate(10));
    }

    public function show(Job $job)
    {
        return JobResource::make($job->load($this->jobRelations()));
    }

    public function store(StoreJobRequest $request)
    {
        $job = Job::create([
            ...$request->safe()->except('skills'),
            'created_by' => $request->user()->id,
        ]);

        $this->syncSkills($job, $request->input('skills', []));

        return JobResource::make($job->fresh()->load($this->jobRelations()))->response()->setStatusCode(201);
    }

    public function update(UpdateJobRequest $request, Job $job)
    {
        $job->update($request->safe()->except('skills'));

        if ($request->has('skills'))
            $this->syncSkills($job, $request->input('skills', []));

        return JobResource::make($job->fresh()->load($this->jobRelations()));
    }

    public function close(CloseJobRequest $request, Job $job)
    {
        $job->update(['status' => 'closed']);

        return JobResource::make($job->fresh()->load($this->jobRelations()));
    }

    public function destroy(Job $job)
    {
        $job->delete();

        return response()->json(['success' => true, 'message' => 'Job archived'], 200);
    }

    public function trashed(Request $request)
    {
        $query = Job::onlyTrashed()->with($this->jobRelations())->withCount('applications');

        if ($search = $request->query('search'))
            $query->whereFullText(['title', 'description'], $search);

        return JobResource::collection($query->latest('deleted_at')->paginate(10));
    }

    public function restore(int $job)
    {
        $model = Job::onlyTrashed()->findOrFail($job);
        $model->restore();
        $model->update(['status' => 'draft']);

        return JobResource::make($model->fresh()->load($this->jobRelations()));
    }

    protected function syncSkills(Job $job, array $skills): void
    {
        $sync = [];
        foreach ($skills as $entry) {
            $sync[$entry['skill_id']] = ['importance' => $entry['importance'] ?? 'required'];
        }
        $job->skills()->sync($sync);
    }
}
