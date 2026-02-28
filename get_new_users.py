
import requests
import json
import os

base_url = "https://sigo-com-fe-api.onrender.com"
token = "sigocomfe2026"
last_check_timestamp = 1772104298 # From memory/new_users_check_state.json

headers = {
    "Authorization": f"Bearer {token}"
}

try:
    response = requests.get(f"{base_url}/api/openclaw/users/new?since={last_check_timestamp}", headers=headers)
    response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
    users = response.json()
    print(json.dumps(users))
except requests.exceptions.RequestException as e:
    print(json.dumps({"error": str(e)}))
