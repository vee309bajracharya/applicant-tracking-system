<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Invitation – {{ config('app.name') }}</title>
    <style>
        body {
            font-family: Inter, system-ui, sans-serif;
            background: #f4f5f6;
            margin: 0;
            padding: 40px 0;
        }

        .container {
            max-width: 480px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 40px;
        }

        .badge {
            display: inline-block;
            background: #f3f4f6;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }

        .btn {
            display: inline-block;
            background: #1f2937;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            margin: 24px 0;
        }

        .note {
            color: #9ca3af;
            font-size: 12px;
        }

        .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e2e4e6;
            padding-top: 16px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="badge">{{ ucfirst(str_replace('_', ' ', $role)) }}</div>

        <h2 style="color:#111827; margin-top:0;">Welcome to {{ config('app.name') }}, {{ $fullname }}</h2>

        <p style="color:#374151;">
            You've been invited to join the {{ config('app.name') }} platform as a
            <strong>{{ ucfirst(str_replace('_', ' ', $role)) }}</strong>.
            Set your password to activate your account.
        </p>

        <a href="{{ $setPasswordUrl }}" class="btn">Set Your Password</a>

        <p class="note">
            This invitation link expires in <strong>24 hours</strong>.
            If the button doesn't work, copy this URL into your browser:
        </p>
        <p style="word-break:break-all; font-size:12px; color:#6b7280;">{{ $setPasswordUrl }}</p>

        <div class="footer">
            Do not reply to this email.
        </div>
    </div>
</body>

</html>