#!/usr/bin/env python3
import json

try:
    with open('frontend/src/i18n/de.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("JSON is valid")
    
    # Check structure
    if 'mural' in data:
        print("mural section exists")
        print(f"Has {len(data['mural'])} keys in mural")
    else:
        print("NO mural section!")
        
except json.JSONDecodeError as e:
    print(f"JSON ERROR at line {e.lineno}: {e.msg}")
except Exception as e:
    print(f"Error: {e}")
