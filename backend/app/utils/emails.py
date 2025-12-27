from flask import current_app
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from app.extensions import mail

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail as SGMail
except ImportError:
    SendGridAPIClient = None
    SGMail = None


serializer = URLSafeTimedSerializer(ProductionConfig.SECRET_KEY)


def _send_via_sendgrid(to_email, subject, html_content, plain_text=None):
    api_key = ProductionConfig.SENDGRID_API_KEY
    from_email = ProductionConfig.SENDGRID_FROM_EMAIL
    if not api_key or not SendGridAPIClient or not SendGridMail:
        return False

    message = SendGridMail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        plain_text_content=plain_text or '',
        html_content=html_content,
    )

    try:
        client = SendGridAPIClient(api_key)
        client.send(message)
        return True
    except Exception:
        return False


def _send_fallback_flask_mail(to_email, subject, html_content, plain_text=None):
    try:
        msg = Message(subject=subject, sender=ProductionConfig.SENDGRID_FROM_EMAIL, recipients=[to_email])
        msg.body = plain_text or ''
        msg.html = html_content
        mail.send(msg)
        return True
    except Exception:
        return False


def send_email(to_email, subject, html_content, plain_text=None):
    # Try SendGrid first if configured, else fall back to Flask-Mail
    if ProductionConfig.SENDGRID_API_KEY:
        ok = _send_via_sendgrid(to_email, subject, html_content, plain_text)
        if ok:
            return True

    # Fallback to Flask-Mail or dev print
    ok = _send_fallback_flask_mail(to_email, subject, html_content, plain_text)
    if ok:
        return True

    # Last resort: print link in dev and return False
    print("\n" + "=" * 60)
    print("📧 EMAIL NOT SENT — NO SENDER CONFIGURED")
    print(f"To: {to_email}")
    print(subject)
    print("=" * 60 + "\n")
    return False


def send_confirmation_token(user):
    token = serializer.dumps(user.email, salt=ProductionConfig.EMAIL_TOKEN_SALT)
    confirm_url = f"{ProductionConfig.FRONTEND_URL}/auth/confirm/{token}"

    plain = f"Please confirm your account by visiting {confirm_url}"
    html = f"<p>Please confirm your account by clicking <a href=\"{confirm_url}\">this link</a>.</p>"

    # Always print link for developer convenience
    print("\n" + "=" * 60)
    print("📧 EMAIL CONFIRMATION LINK (DEV MODE)")
    print(confirm_url)
    print("=" * 60 + "\n")

    # Attempt to send
    send_email(user.email, "NEURA-ACADEMY: CONFIRM YOUR ACCOUNT", html, plain)
    return token


def send_password_reset_token(user):
    token = serializer.dumps(user.email, salt=ProductionConfig.PASSWORD_RESET_SALT)
    confirm_url = f"{ProductionConfig.FRONTEND_URL}/auth/reset_password/{token}"

    plain = f"RESET YOUR EMAIL BY CLICKING THIS LINK: {confirm_url}"
    html = f"<p>Reset your password by clicking <a href=\"{confirm_url}\">this link</a>.</p>"

    send_email(user.email, "NEURA-ACADEMY: RESET YOUR PASSWORD", html, plain)
    return token
