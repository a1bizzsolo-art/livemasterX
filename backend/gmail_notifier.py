"""Gmail SMTP notifier — gracefully no-op when credentials aren't configured.

Set GMAIL_USER (sender), GMAIL_APP_PASSWORD (16-char app password) and
GMAIL_NOTIFY_TO (destination) in backend/.env to activate notifications.
"""
import os
import ssl
import smtplib
import logging
from email.message import EmailMessage
from typing import Optional

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465


def is_configured() -> bool:
    return bool(
        os.environ.get("GMAIL_USER")
        and os.environ.get("GMAIL_APP_PASSWORD")
        and os.environ.get("GMAIL_NOTIFY_TO")
    )


def send_notification(subject: str, body: str, html: Optional[str] = None) -> bool:
    """Send an email via Gmail SMTP. Returns True on success, False otherwise.

    Designed to never raise — failures are logged so the calling business flow
    (closed-deal commit, waitlist signup) is never blocked by email errors.
    """
    user = os.environ.get("GMAIL_USER")
    pw = os.environ.get("GMAIL_APP_PASSWORD")
    to = os.environ.get("GMAIL_NOTIFY_TO")

    if not (user and pw and to):
        logger.info("Gmail notifier skipped — credentials not configured.")
        return False

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"A1A1 (AQAS) <{user}>"
        msg["To"] = to
        msg.set_content(body)
        if html:
            msg.add_alternative(html, subtype="html")

        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx, timeout=10) as server:
            server.login(user, pw)
            server.send_message(msg)
        logger.info("Gmail notification sent to %s — %s", to, subject)
        return True
    except Exception as e:  # pragma: no cover - network / auth issues
        logger.warning("Gmail notification failed: %s", e)
        return False
