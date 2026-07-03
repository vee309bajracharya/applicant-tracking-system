<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>OTP – ATS</title>
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

        .otp-box {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 10px;
            text-align: center;
            background: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 24px 0;
            color: #111827;
            font-family: monospace;
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
        <h1 style="color:#fff; margin-top:0;text-align:center">SmartHire ATS</h1>
        <h2 style="color:#fff; margin-top:0;">
            @if($purpose === 'Email Verification')
                Verify Your Email
            @else
                Password Reset Request
            @endif
        </h2>

        <p class="label">Use the OTP below to complete your {{ $purpose }}. It expires in <strong>10 minutes</strong>.
        </p>

        <div class="otp-box">{{ $otp }}</div>

        <p class="label">If you didn't request this, ignore this email. Your account remains secure.</p>

        <div class="footer">
            Do not reply to this email.
        </div>
    </div>
</body>

</html>