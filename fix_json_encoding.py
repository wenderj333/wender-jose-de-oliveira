#!/usr/bin/env python3
import json
import os

base_path = "frontend/src/i18n/"
lang_files = [f for f in os.listdir(base_path) if f.endswith(".json")]

print("Ensuring UTF-8 encoding and valid JSON for all language files...")

for filename in lang_files:
    file_path = os.path.join(base_path, filename)
    print(f"Processing {file_path}...")
    try:
        # Read with utf-8-sig to handle BOM if present
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
        
        # Write back with standard utf-8 and no extra whitespace
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"[OK] {filename} re-encoded and formatted successfully")
    
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parsing error in {filename}: {e}")
    except Exception as e:
        print(f"[ERROR] Unknown error with {filename}: {e}")

print("\nAll language files processed!")
