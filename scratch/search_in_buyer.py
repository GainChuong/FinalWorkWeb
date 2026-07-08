import re

def search_file(filepath, pattern):
    print(f"Searching for '{pattern}' in {filepath}...")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f, 1):
            if re.search(pattern, line, re.IGNORECASE):
                print(f"L{idx}: {line.strip()[:150]}")

search_file('js/buyer.js', 'AI_REC_SYSTEM')
search_file('js/buyer.js', 'explain')
search_file('js/buyer.js', 'xai')
