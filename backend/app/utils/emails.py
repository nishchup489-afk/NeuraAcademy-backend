from flask_mail import Message
from app.extensions import mail
from flask import url_for 
from itsdangerous import URLSafeTimedSerializer
from app.config import DevelopmentConfig

serializer = URLSafeTimedSerializer(DevelopmentConfig.SECRET_KEY)

def send_confirmation_token(user) :
    token = serializer.dumps(user.email , salt=DevelopmentConfig.EMAIL_TOKEN_SALT)
    confirm_url = f"{DevelopmentConfig.FRONTEND_URL}/auth/confirm/{token}"

    msg = Message(
        subject="NEURA-ACADEMY: CONFIRM YOUR ACCOUNT" ,
        sender= "neura-academy@na.com",
        recipients= [user.email]
    )

    msg.body = f"Please confirm your account by clicking the link: {confirm_url}"
    msg.html = f"""
        <body style="margin:0; padding:0; background-color:#0b0f19; font-family: Arial, Helvetica, sans-serif; color:#e5e7eb;">

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                    <td align="center" style="padding:40px 12px;">

                        <!-- Container -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#111827; border-radius:12px; padding:32px; box-shadow:0 10px 40px rgba(0,0,0,0.6);">

                            <!-- Header -->
                            <tr>
                                <td align="center" style="padding-bottom:20px;">
                                    <h1 style="margin:0; font-size:24px; letter-spacing:1px; color:#a5b4fc;">
                                        NEURA-ACADEMY
                                    </h1>
                                    <p style="margin:8px 0 0; font-size:14px; color:#9ca3af;">
                                        Email Verification Required
                                    </p>
                                </td>
                            </tr>

                            <!-- Message -->
                            <tr>
                                <td style="padding:24px 0; font-size:15px; line-height:1.6; color:#e5e7eb;">
                                    <p style="margin:0 0 16px;">
                                        Welcome to <strong>Neura-Academy</strong>.
                                    </p>
                                    <p style="margin:0 0 16px;">
                                        Please confirm your email address to activate your account and unlock full access.
                                    </p>
                                </td>
                            </tr>

                            <!-- Button -->
                            <tr>
                                <td align="center" style="padding:24px 0;">
                                    <a href="{confirm_url}"
                                    style="
                                    display:inline-block;
                                    padding:14px 28px;
                                    background:linear-gradient(135deg, #6366f1, #22d3ee);
                                    color:#020617;
                                    text-decoration:none;
                                    font-weight:600;
                                    border-radius:8px;
                                    font-size:15px;
                                    box-shadow:0 6px 20px rgba(99,102,241,0.45);
                                    ">
                                        ACTIVATE ACCOUNT
                                    </a>
                                </td>
                            </tr>

                            <!-- Warning -->
                            <tr>
                                <td style="padding-top:20px; font-size:13px; line-height:1.6; color:#9ca3af;">
                                    <p style="margin:0 0 8px;">
                                        If you did not create this account, do not click the button above.
                                    </p>
                                    <p style="margin:0;">
                                        Contact us immediately at
                                        <a href="mailto:cap34267@gmail.com" style="color:#93c5fd; text-decoration:none;">
                                            cap34267@gmail.com
                                        </a>
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding-top:32px; font-size:11px; color:#6b7280;" align="center">
                                    © 2025 Neura-Academy. All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

         </body>
    """

    mail.send(msg)
    return token


def send_password_reset_token(user):
    token = serializer.dumps(user.email , salt=DevelopmentConfig.PASSWORD_RESET_SALT)
    confirm_url = f"{DevelopmentConfig.FRONTEND_URL}/auth/reset_password/{token}"

    msg = Message(
        subject="NEURA-ACADEMY: RESET YOUR PASSWORD" ,
        sender= "neura-academy@na.com",
        recipients= [user.email]
    )

    msg.body = f"RESET YOUR EMAIL BY CLICKING THIS LINK: {confirm_url}"
    msg.html = f"""
        <body style="margin:0; padding:0; background-color:#0b0f19; font-family: Arial, Helvetica, sans-serif; color:#e5e7eb;">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center" style="padding:40px 12px;">

                    <!-- Container -->
                    <table width="100%" cellpadding="0" cellspacing="0"
                        style="max-width:520px; background-color:#111827; border-radius:12px; padding:32px; box-shadow:0 10px 40px rgba(0,0,0,0.6);">

                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h1 style="margin:0; font-size:24px; letter-spacing:1px; color:#fca5a5;">
                                    NEURA-ACADEMY
                                </h1>
                                <p style="margin:8px 0 0; font-size:14px; color:#9ca3af;">
                                    Password Reset Request
                                </p>
                            </td>
                        </tr>

                        <!-- Message -->
                        <tr>
                            <td style="padding:24px 0; font-size:15px; line-height:1.6; color:#e5e7eb;">
                                <p style="margin:0 0 16px;">
                                    We received a request to reset the password for your <strong>Neura-Academy</strong> account.
                                </p>
                                <p style="margin:0 0 16px;">
                                    Click the button below to choose a new password. This link is valid for a limited time.
                                </p>
                            </td>
                        </tr>

                        <!-- Button -->
                        <tr>
                            <td align="center" style="padding:24px 0;">
                                <a href="{confirm_url}"
                                style="
                                display:inline-block;
                                padding:14px 28px;
                                background:linear-gradient(135deg, #ef4444, #fb7185);
                                color:#020617;
                                text-decoration:none;
                                font-weight:600;
                                border-radius:8px;
                                font-size:15px;
                                box-shadow:0 6px 20px rgba(239,68,68,0.45);
                                ">
                                    RESET PASSWORD
                                </a>
                            </td>
                        </tr>

                        <!-- Security Notice -->
                        <tr>
                            <td style="padding-top:20px; font-size:13px; line-height:1.6; color:#9ca3af;">
                                <p style="margin:0 0 8px;">
                                    If you did not request a password reset, you can safely ignore this email.
                                </p>
                                <p style="margin:0 0 8px;">
                                    This reset link will expire automatically for security reasons.
                                </p>
                                <p style="margin:0;">
                                    Need help? Contact us at
                                    <a href="mailto:cap34267@gmail.com" style="color:#93c5fd; text-decoration:none;">
                                        cap34267@gmail.com
                                    </a>
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding-top:32px; font-size:11px; color:#6b7280;" align="center">
                                © 2025 Neura-Academy. All rights reserved.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>


    """

    mail.send(msg)
