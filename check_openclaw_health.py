
import urllib.request
import json
import datetime

api_base_url = 'https://sigo-com-fe-api.onrender.com'
auth_token = 'sigocomfe2026'

# Health check
url = f"{api_base_url}/api/openclaw/health"
# The health endpoint is public, so no auth header for this check
# headers = {"Authorization": f"Bearer {auth_token}"}

req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as response:
        response_data = json.loads(response.read().decode())
        print(json.dumps(response_data))
except urllib.error.URLError as e:
    print(json.dumps({"status": "error", "message": str(e)}))
