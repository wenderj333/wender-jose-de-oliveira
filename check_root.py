
import urllib.request
import json
import datetime

api_base_url = 'https://sigo-com-fe-api.onrender.com'
auth_token = 'sigocomfe2026'

# Fetch new users
url = f"{api_base_url}/"
headers = {"Authorization": f"Bearer {auth_token}"}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode()
        print(response_data)
except urllib.error.URLError as e:
    print(json.dumps({"status": "error", "message": str(e)}))
