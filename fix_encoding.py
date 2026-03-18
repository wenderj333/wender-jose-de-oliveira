#!/usr/bin/env python3
import json
import os

os.chdir('frontend/src/i18n')

langs = ['pt.json', 'es.json']
fixes = {
    # Eyes, ears, faces
    'ðŸ\'ï¸': '👁️',
    'ðŸ\'‚': '👂',
    'ðŸ˜"': '😔',
    'ðŸ˜°': '😰',
    'ðŸ˜¢': '😢',
    'ðŸ˜': '😔',
    # Hand gestures
    'ðŸ™': '🙏',
    '🙏': '🙏',  # Already fixed
    # Check mark
    'âœ…': '✅',
    # Emoji variations
    'ðŸO': '🌐',
    'ðŸ"': '📍',
    'ðŸ"´': '📴',
}

for lang in langs:
    with open(lang, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for broken, fixed in fixes.items():
        content = content.replace(broken, fixed)
    
    with open(lang, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed {lang}')

print("Done!")
