
import json
import requests
import datetime
import os

API_BASE_URL = 'https://sigo-com-fe-api.onrender.com'
OPENCLAW_API_TOKEN = 'sigocomfe2026'
STATE_FILE = 'memory/new_users_check_state.json'
WELCOME_MESSAGE = 'Bem-vindo(a) ao Sigo com Fé! Estamos felizes em tê-lo(a) conosco. Explore a plataforma em: https://sigo-com-fe.vercel.app'

def get_last_checked_timestamp():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
                return state.get('last_checked_timestamp')
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {STATE_FILE}. Starting fresh.")
            return None
    return None

def update_last_checked_timestamp(timestamp):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, 'w') as f:
        json.dump({'last_checked_timestamp': timestamp}, f)

def run_task():
    current_time = datetime.datetime.now(datetime.timezone.utc)
    current_timestamp_iso = current_time.isoformat(timespec='seconds')

    last_checked_timestamp = get_last_checked_timestamp()

    if not last_checked_timestamp:
        one_hour_ago = current_time - datetime.timedelta(hours=1)
        last_checked_timestamp = one_hour_ago.isoformat(timespec='seconds')
        print(f"No previous timestamp found or error reading state file. Checking for new users since: {last_checked_timestamp}")
    else:
        print(f"Checking for new users since: {last_checked_timestamp}")

    get_users_url = f"{API_BASE_URL}/api/openclaw/users/new?since={last_checked_timestamp}"
    headers = {'Authorization': f'Bearer {OPENCLAW_API_TOKEN}'}

    try:
        response = requests.get(get_users_url, headers=headers)
        response.raise_for_status()
        api_response_data = response.json() # Store the full JSON response
        
        # Assuming the actual user IDs are in a 'users' key within the JSON response, and each is a dict
        new_users_data = api_response_data.get('users', [])
        print(f"Found {len(new_users_data)} new users.")
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching new users: {e}")
        return
    except AttributeError:
        print(f"API response for new users was not a dictionary. Raw response: {api_response_data}")
        return

    for user_data in new_users_data:
        if not isinstance(user_data, dict) or 'id' not in user_data:
            print(f"Skipping invalid user data (missing 'id' or not a dict): {user_data}")
            continue
        user_id = user_data['id'] # Extract the ID from the dictionary

        send_message_url = f"{API_BASE_URL}/api/openclaw/users/{user_id}/send-message"
        payload = {'message': WELCOME_MESSAGE}

        try:
            message_response = requests.post(send_message_url, headers=headers, json=payload)
            message_response.raise_for_status()
            print(f"Welcome message sent to user {user_id}.")
        except requests.exceptions.RequestException as e:
            print(f"Error sending message to user {user_id}: {e}")

    update_last_checked_timestamp(current_timestamp_iso)
    print(f"Updated last_checked_timestamp to: {current_timestamp_iso}")

if __name__ == "__main__":
    run_task()
