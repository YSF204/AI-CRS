export const buildPasswordResetEmailHtml = ({ resetUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 10px;">
        <table width="100%" max-width="520px" style="background-color:#ffffff;border-radius:12px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
          <tr>
            <td align="center">
              <h1 style="margin:0;font-size:24px;color:#111827;">Reset your password</h1>
              <p style="margin:16px 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                You requested to reset your password for your <strong>AI-CRS App</strong> account.
                Click the button below to set a new password.
              </p>
              <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background-color:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Reset Password
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">This link will expire in <strong>10 minutes</strong>.</p>
              <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="font-size:13px;color:#9ca3af;line-height:1.5;">
                If you did not request a password reset, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default buildPasswordResetEmailHtml;
