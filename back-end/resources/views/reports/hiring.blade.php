<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #1f2937;
        }

        h1 {
            font-size: 16px;
            margin-bottom: 2px;
        }

        p.meta {
            color: #6b7280;
            margin-top: 0;
            margin-bottom: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #d1d5db;
            padding: 5px 6px;
            text-align: left;
        }

        th {
            background: #f3f4f6;
        }
    </style>
</head>

<body>
    <h1>SmartHire ATS - Hiring Report</h1>
    <p class="meta">Generated {{ $generatedAt }}</p>
    <table>
        <thead>
            <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Department</th>
                <th>Status</th>
                <th>Total</th>
                <th>Applied</th>
                <th>Screening</th>
                <th>Shortlisted</th>
                <th>Interview</th>
                <th>Selected</th>
                <th>Rejected</th>
                <th>Hired</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($jobs as $job)
                <tr>
                    <td>{{ $job->title }}</td>
                    <td>{{ $job->company?->company_name }}</td>
                    <td>{{ $job->department?->name }}</td>
                    <td>{{ ucfirst($job->status) }}</td>
                    <td>{{ $job->applications_count }}</td>
                    <td>{{ $job->applied_count }}</td>
                    <td>{{ $job->screening_count }}</td>
                    <td>{{ $job->shortlisted_count }}</td>
                    <td>{{ $job->interview_count }}</td>
                    <td>{{ $job->selected_count }}</td>
                    <td>{{ $job->rejected_count }}</td>
                    <td>{{ $job->hired_count }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="12">No jobs found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>