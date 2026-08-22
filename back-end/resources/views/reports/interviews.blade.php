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
    <h1>SmartHire ATS - Interview Score Sheet</h1>
    <p class="meta">Generated {{ $generatedAt }}</p>
    <table>
        <thead>
            <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Interviewer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Avg Rating</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($interviews as $interview)
                <tr>
                    <td>{{ $interview->application?->candidateProfile?->user?->fullname }}</td>
                    <td>{{ $interview->application?->job?->title }}</td>
                    <td>{{ $interview->recruiter?->fullname }}</td>
                    <td>{{ optional($interview->interview_date)->format('Y-m-d') }}</td>
                    <td>{{ ucfirst($interview->interview_type) }}</td>
                    <td>{{ ucfirst($interview->status) }}</td>
                    <td>{{ $interview->average_rating ?? 'N/A' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No interviews found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>

</html>