import os
import re

def process_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for css files (maincss.css and buyer.css)
    # Match href="../css/maincss.css" or href="../css/buyer.css" possibly with existing version
    content = re.sub(
        r'href=["\'](\.\./)?css/(maincss|buyer)\.css(?:\?[^"\']*)?["\']',
        r'href="\1css/\2.css?v=2"',
        content
    )

    # Pattern for js files (mainjs.js, buyer.js, ai-recommend.js)
    content = re.sub(
        r'src=["\'](\.\./)?js/(mainjs|buyer|ai-recommend)\.js(?:\?[^"\']*)?["\']',
        r'src="\1js/\2.js?v=2"',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated cache-busting in {file_path}")

def main():
    root_dir = r"d:\FinalWorkWeb"
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules or .git
        if 'node_modules' in root or '.git' in root or '.gemini' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                process_html_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
