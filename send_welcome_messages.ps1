$lastCheckedTimestamp = "2026-02-28T17:12:29Z"
$apiBaseUrl = "https://sigo-com-fe-api.onrender.com"
$authToken = "sigocomfe2026"
$welcomeMessage = "Bem-vindo(a) ao Sigo com Fé! Estamos felizes em tê-lo(a) conosco. Explore a plataforma em: https://sigo-com-fe.vercel.app"

Write-Host "Fetching new users since $lastCheckedTimestamp..."
$headers = @{
    "Authorization" = "Bearer $authToken"
}

try {
    $response = Invoke-RestMethod -Uri "$apiBaseUrl/api/openclaw/users/new?since=$lastCheckedTimestamp" -Headers $headers -Method Get
    $newUsers = $response.users

    if ($newUsers -and $newUsers.Count > 0) {
        Write-Host "Found $($newUsers.Count) new users. Sending welcome messages..."
        foreach ($user in $newUsers) {
            Write-Host "Sending message to $($user.email) (ID: $($user.id))"
            $body = @{
                "message" = $welcomeMessage
            } | ConvertTo-Json -Compress

            try {
                Invoke-RestMethod -Uri "$apiBaseUrl/api/openclaw/users/$($user.id)/send-message" -Headers $headers -ContentType "application/json" -Body $body -Method Post
                Write-Host "Successfully sent welcome message to $($user.email)."
            } catch {
                Write-Error "Failed to send message to $($user.email): $($_.Exception.Message)"
            }
        }
    } else {
        Write-Host "No new users found since $lastCheckedTimestamp."
    }

    # Update the last checked timestamp
    $newLastCheckedTimestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    Write-Host "Updating last checked timestamp to: $newLastCheckedTimestamp"
    Set-Content -Path "memory/new_users_check_state.json" -Value "{`"last_checked_timestamp`": `"$newLastCheckedTimestamp`"}"

} catch {
    Write-Error "Error fetching new users: $($_.Exception.Message)"
}

Write-Host "Welcome message task completed."