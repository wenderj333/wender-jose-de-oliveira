import json
data = {
    "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
    "headers": [{"source": "/(.*)", "headers": [{"key": "Cache-Control", "value": "no-cache, no-store, must-revalidate"}, {"key": "Pragma", "value": "no-cache"}, {"key": "Expires", "value": "0"}]}]
}
with open("vercel.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("Feito!")
