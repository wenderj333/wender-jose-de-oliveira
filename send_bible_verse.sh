#!/bin/bash
set -e

# Step 1: Fetch a random bible verse
VERSE_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer sigocomfe2026" \
  https://sigo-com-fe-api.onrender.com/api/openclaw/bible-verse/random)
BIBLE_VERSE=$(echo "$VERSE_RESPONSE" | jq -r '.verse')

if [ -z "$BIBLE_VERSE" ] || [ "$BIBLE_VERSE" == "null" ]; then
  echo "Error: Could not fetch bible verse or verse is empty."
  echo "Response: $VERSE_RESPONSE"
  exit 1
fi

echo "Fetched Bible Verse: \"$BIBLE_VERSE\""

# Step 2: Fetch all user IDs
USERS_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer sigocomfe2026" \
  https://sigo-com-fe-api.onrender.com/api/openclaw/users/all-ids)
readarray -t USER_IDS_ARRAY < <(echo "$USERS_RESPONSE" | jq -r '.userIds[]')

if [ ${#USER_IDS_ARRAY[@]} -eq 0 ]; then
  echo "Error: Could not fetch user IDs or list is empty."
  echo "Response: $USERS_RESPONSE"
  exit 1
fi

echo "Fetched User IDs: ${USER_IDS_ARRAY[*]}"

# Step 3: For each user_id, send the bible verse
for USER_ID in "${USER_IDS_ARRAY[@]}"; do
  MESSAGE_CONTENT="Your bible verse: $BIBLE_VERSE"
  MESSAGE_JSON_BODY=$(jq -n --arg msg "$MESSAGE_CONTENT" '{message: $msg}')

  SEND_MESSAGE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer sigocomfe2026" \
    -H "Content-Type: application/json" \
    -d "$MESSAGE_JSON_BODY" \
    "https://sigo-com-fe-api.onrender.com/api/openclaw/users/$USER_ID/send-message")
  echo "Sent message to user $USER_ID. Response: $SEND_MESSAGE_RESPONSE"
done

echo "Script finished successfully."