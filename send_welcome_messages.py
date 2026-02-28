
import requests
import json
import os
from datetime import datetime
import sys # Import sys for sys.stdout.flush()

# --- Configuration ---
api_base = "https://sigo-com-fe-api.onrender.com"
token = "sigocomfe2026"
welcome_message = "Bem-vindo(a) ao Sigo com Fé! Estamos felizes em tê-lo(a) conosco. Explore a plataforma em: https://sigo-com-fe.vercel.app"
state_file_path = "memory/new_users_check_state.json"

def print_and_flush(message):
    print(message)
    sys.stdout.flush()

print_and_flush("Script started.")

# --- Read last check state ---
last_check_timestamp = 0
last_check_date = "2000-01-01T00:00:00Z" # Default far past date
failure_count = 0
success_count = 0

if os.path.exists(state_file_path):
    print_and_flush(f"Reading state from {state_file_path}...")
    with open(state_file_path, 'r') as f:
        state = json.load(f)
        last_check_timestamp = state.get("lastCheckTimestamp", 0)
        last_check_date = state.get("lastCheckDate", "2000-01-01T00:00:00Z")
        failure_count = state.get("failureCount", 0)
        success_count = state.get("successCount", 0)
    print_and_flush(f"Initial state: last_check_date={last_check_date}, success_count={success_count}, failure_count={failure_count}")
else:
    print_and_flush(f"Warning: {state_file_path} not found. Starting with default timestamp.")

# --- Fetch new users ---
get_users_url = f"{api_base}/api/openclaw/users/new?since={last_check_date}"
headers = {"Authorization": f"Bearer {token}"}
users = []
new_check_timestamp = int(datetime.now().timestamp()) # Default new timestamp to current time
new_check_date = datetime.now().isoformat(timespec='seconds') + 'Z' # Default new date to current time

try:
    print_and_flush(f"Fetching new users since {last_check_date} from {get_users_url}...")
    response = requests.get(get_users_url, headers=headers, timeout=10) # Shorter timeout
    response.raise_for_status()
    data = response.json()
    users = data.get("users", [])
    # Use the timestamp from the API response if available, otherwise use current time
    new_check_timestamp = data.get("timestamp", int(datetime.now().timestamp()))
    new_check_date = datetime.fromtimestamp(new_check_timestamp).isoformat(timespec='seconds') + 'Z'
    print_and_flush(f"Found {len(users)} new users.")
except requests.exceptions.Timeout:
    print_and_flush("Error fetching users: The request timed out after 10 seconds.")
    failure_count += 1
    new_state = {
        "failureCount": failure_count,
        "lastCheckTimestamp": new_check_timestamp,
        "lastCheckDate": new_check_date,
        "successCount": success_count
    }
    with open(state_file_path, 'w') as f:
        json.dump(new_state, f, indent=4)
    exit(1)
except requests.exceptions.RequestException as e:
    print_and_flush(f"Error fetching users: {e}")
    failure_count += 1
    new_state = {
        "failureCount": failure_count,
        "lastCheckTimestamp": new_check_timestamp,
        "lastCheckDate": new_check_date,
        "successCount": success_count
    }
    with open(state_file_path, 'w') as f:
        json.dump(new_state, f, indent=4)
    exit(1)
except json.JSONDecodeError:
    print_and_flush(f"Error decoding JSON response from new users endpoint: {response.text}")
    failure_count += 1
    new_state = {
        "failureCount": failure_count,
        "lastCheckTimestamp": new_check_timestamp,
        "lastCheckDate": new_check_date,
        "successCount": success_count
    }
    with open(state_file_path, 'w') as f:
        json.dump(new_state, f, indent=4)
    exit(1)

# --- Send welcome messages ---
for user in users:
    user_id = user.get("id")
    if not user_id:
        print_and_flush(f"Skipping user with no ID: {user}")
        continue

    send_message_url = f"{api_base}/api/openclaw/users/{user_id}/send-message"
    message_payload = {"message": welcome_message}
    
    post_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        print_and_flush(f"Sending welcome message to user {user_id} ({user.get('email')})...")
        response = requests.post(send_message_url, headers=post_headers, json=message_payload, timeout=10)
        response.raise_for_status()
        print_and_flush(f"Successfully sent message to {user_id}.")
        success_count += 1
    except requests.exceptions.Timeout:
        print_and_flush(f"Error sending message to {user_id}: The request timed out after 10 seconds.")
        failure_count += 1
    except requests.exceptions.RequestException as e:
        print_and_flush(f"Error sending message to {user_id}: {e}")
        failure_count += 1
    except json.JSONDecodeError:
        print_and_flush(f"Error decoding JSON response from send message endpoint for {user_id}: {response.text}")
        failure_count += 1

# --- Update last check state ---
final_state = {
    "failureCount": failure_count,
    "lastCheckTimestamp": new_check_timestamp,
    "lastCheckDate": new_check_date,
    "successCount": success_count
}
print_and_flush(f"Updating {state_file_path} with new timestamp {new_check_date}...")
with open(state_file_path, 'w') as f:
    json.dump(final_state, f, indent=4)
print_and_flush(f"Task completed. Total messages sent (attempted): {len(users)}. Successful sends: {success_count}. Failed sends: {failure_count}.")
