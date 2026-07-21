<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>{{ $notifTitle }} – {{ config('app.name') }}</title>
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
            background: #111827;
            border-radius: 8px;
            padding: 40px;
        }

        .message-box {
            background: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
            color: #111827;
            font-size: 15px;
            line-height: 1.5;
        }

        .label {
            color: #6b7280;
            font-size: 14px;
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
        <h1 style="color:#fff; margin-top:0;text-align:center">{{ config('app.name') }}</h1>
        <h2 style="color:#fff; margin-top:0;">{{ $notifTitle }}</h2>

        <div class="message-box">{{ $notifMessage }}</div>

        <p class="label">You can also view this in your Notifications inbox on the platform.</p>

        <div class="footer">
            Do not reply to this email.
        </div>
    </div>
</body>

</html>