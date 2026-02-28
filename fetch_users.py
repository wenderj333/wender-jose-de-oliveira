
import requests
import json
import os

api_base = "https://sigo-com-fe-api.onrender.com"
token = "sigocomfe2026"
last_check_date = "2026-02-27T16:38:18Z" # From memory/new_users_check_state.json

url = f"{api_base}/api/openclaw/users/new?since={last_check_date}"
headers = {"Authorization": f"Bearer {token}"}

try:
    response = requests.get(url, headers=headers, timeout=15) # Increased timeout to 15 seconds
    response.raise_for_status() # Raise an exception for HTTP errors
    users = response.json()
    print(json.dumps(users))
except requests.exceptions.Timeout:
    print("Error: The request timed out after 15 seconds.")
except requests.exceptions.RequestException as e:
    print(f"Error making API request: {e}")
except json.JSONDecodeError:
    print(f"Error decoding JSON response: {response.text}")
