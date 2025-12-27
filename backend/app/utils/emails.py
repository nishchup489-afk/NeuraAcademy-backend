from flask import current_app
from itsdangerous import URLSafeTimedSerializer

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail as SGMail
except ImportError:
    SendGridAPIClient = None
    SGMail = None


# ============================================================
# Serializer
# ============================================================

def get_serializer():
    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"]
    )


# ============================================================
# Internal SendGrid sender (DO NOT EXPORT)
# ============================================================

def _send_email(to_email: str, subject: str, html: str, text: str):
    api_key = current_app.config.get("SENDGRID_API_KEY")
    from_email = current_app.config.get("SENDGRID_FROM_EMAIL")

    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY is not configured")

    if not from_email:
        raise RuntimeError("SENDGRID_FROM_EMAIL is not configured")

    if not SendGridAPIClient or not SGMail:
        raise RuntimeError("SendGrid SDK not installed")

    message = SGMail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html,
        plain_text_content=text,
    )

    client = SendGridAPIClient(api_key)
    client.send(message)


# ============================================================
# ACCOUNT CONFIRMATION EMAIL
# ============================================================

def send_confirmation_url(user):
    serializer = get_serializer()

    token = serializer.dumps(
        user.email,
        salt=current_app.config["EMAIL_TOKEN_SALT"]
    )

    confirm_url = (
        f"{current_app.config['FRONTEND_URL']}"
        f"/auth/confirm/{token}"
    )

    subject = "NeuraAcademy — Confirm Your Account"

    text = f"""
Welcome to NeuraAcademy!

Confirm your account using the link below:
{confirm_url}

If you didn’t create this account, ignore this email.
"""

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirm Account</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" style="background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#2563eb;padding:30px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:28px;">NeuraAcademy</h1>
              <p style="margin-top:8px;">Confirm your account</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;color:#111827;">
              <p style="font-size:16px;">
                Welcome 👋 <br><br>
                You're almost in. Click the button below to confirm your account.
              </p>

              <div style="text-align:center;margin:36px 0;">
                <a href="{confirm_url}"
                   style="
                     display:inline-block;
                     padding:14px 32px;
                     background:#2563eb;
                     color:#ffffff;
                     text-decoration:none;
                     border-radius:10px;
                     font-weight:bold;
                     font-size:16px;
                   ">
                  Confirm Account
                </a>
              </div>

              <p style="font-size:14px;color:#6b7280;">
                If you didn’t sign up, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
              © NeuraAcademy — Learn smarter.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    _send_email(user.email, subject, html, text)
    return token


# ============================================================
# PASSWORD RESET EMAIL
# ============================================================

def send_password_reset_url(user):
    serializer = get_serializer()

    token = serializer.dumps(
        user.email,
        salt=current_app.config["PASSWORD_RESET_SALT"]
    )

    reset_url = (
        f"{current_app.config['FRONTEND_URL']}"
        f"/auth/reset_password/{token}"
    )

    subject = "NeuraAcademy — Reset Your Password"

    text = f"""
Password reset requested.

Reset your password using the link below:
{reset_url}

If you didn’t request this, ignore this email.
"""

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" style="background:#ffffff;border-radius:14px;">
          <tr>
            <td style="background:#dc2626;padding:30px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:26px;">Password Reset</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;color:#111827;">
              <p style="font-size:16px;">
                We received a request to reset your password.
              </p>

              <div style="text-align:center;margin:36px 0;">
                <a href="{reset_url}"
                   style="
                     display:inline-block;
                     padding:14px 32px;
                     background:#dc2626;
                     color:#ffffff;
                     text-decoration:none;
                     border-radius:10px;
                     font-weight:bold;
                     font-size:16px;
                   ">
                  Reset Password
                </a>
              </div>

              <p style="font-size:14px;color:#6b7280;">
                If this wasn’t you, just ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px;text-align:center;font-size:12px;color:#9ca3af;">
              © NeuraAcademy — Secure by design.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    _send_email(user.email, subject, html, text)
    return token
