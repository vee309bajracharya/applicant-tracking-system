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
    <h1>SmartHire ATS - Candidate Summary</h1>
    <p class="meta">Generated {{ $generatedAt }}</p>
    <table>
        <thead>
            <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Headline</th>
                <th>Experience (yrs)</th>
                <th>Expected Salary</th>
                <th>Profile %</th>
                <th>Resumes</th>
                <th>Skills</th>
                <th>Applications</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($candidates as $candidate)
                <tr>
                    <td>{{ $candidate->user?->fullname }}</td>
                    <td>{{ $candidate->user?->email }}</td>
                    <td>{{ $candidate->headline }}</td>
                    <td>{{ $candidate->experience_years }}</td>
                    <td>{{ $candidate->expected_salary }}</td>
                    <td>{{ $candidate->profile_completion_percentage }}</td>
                    <td>{{ $candidate->resumes_count }}</td>
                    <td>{{ $candidate->skills_count }}</td>
                    <td>{{ $candidate->applications_count }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9">No candidates found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>