
import requests
import sys
import json

def send_message(user_id, message_content, token):
    url = f"https://sigo-com-fe-api.onrender.com/api/openclaw/users/{user_id}/send-message"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "message": message_content
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        print(f"Message sent to user {user_id} successfully: {response.status_code}")
        print(response.json())
    except requests.exceptions.HTTPError as errh:
        print(f"HTTP Error: {errh}")
        print(f"Response content: {errh.response.text}")
    except requests.exceptions.ConnectionError as errc:
        print(f"Error Connecting: {errc}")
    except requests.exceptions.Timeout as errt:
        print(f"Timeout Error: {errt}")
    except requests.exceptions.RequestException as err:
        print(f"Oops: Something Else: {err}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python send_welcome_message.py <user_id> <message_content> <token>")
        sys.exit(1)

    user_id = sys.argv[1]
    message_content = sys.argv[2]
    token = sys.argv[3]

    send_message(user_id, message_content, token)
