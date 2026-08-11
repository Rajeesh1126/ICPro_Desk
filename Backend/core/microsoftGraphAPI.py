from msal import ConfidentialClientApplication
import time
import requests

TENANT_ID = "ff4b7160-90a1-402e-8572-ddd3d6fad573"
CLIENT_ID = "06df26e6-3024-4c87-a577-3707fa8f44be"
CLIENT_SECRET = "LRk8Q~RSmqiSjQo5vIhp5LXdMGR~B0APH2XBldux"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"

_app = ConfidentialClientApplication(
    CLIENT_ID,
    authority=AUTHORITY,
    client_credential=CLIENT_SECRET
)

_access_token = None
_token_expiry = 0


def get_access_token():
    global _access_token, _token_expiry

    if _access_token and time.time() < _token_expiry - 300:
        return _access_token

    last_error = None

    for attempt in range(3):
        try:
            result = _app.acquire_token_for_client(
                scopes=["https://graph.microsoft.com/.default"]
            )

            if "access_token" not in result:
                raise Exception(result)

            _access_token = result["access_token"]
            _token_expiry = time.time() + result.get("expires_in", 3600)

            return _access_token

        except requests.exceptions.RequestException as e:
            last_error = e
            time.sleep(2)

    raise last_error


def send_mail(subject, html, recipients):
    token = get_access_token()

    url = "https://graph.microsoft.com/v1.0/users/wwp@icpro.in/sendMail"

    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": html
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": email
                    }
                }
                for email in recipients
            ]
        }
    }

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json=payload
    )

    return response.status_code