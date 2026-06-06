import json
data = {
    "outputDirectory": "dist",
    "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
    "headers": [{"source": "/(.*)", "headers": [{"key": "Cache-Control", "value": "no-cache, no-store, must-revalidate"}]}]
}
with open("vercel.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("Feito!")
