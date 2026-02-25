
import urllib.request
import json
import datetime

api_base_url = 'https://sigo-com-fe-api.onrender.com/api'
auth_token = 'sigocomfe2026'

# Fetch new users without 'since' parameter
url = f"{api_base_url}/users/new"
headers = {"Authorization": f"Bearer {auth_token}"}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        response_data = json.loads(response.read().decode())
        print(json.dumps(response_data))
except urllib.error.URLError as e:
    print(json.dumps({"status": "error", "message": str(e)}))
