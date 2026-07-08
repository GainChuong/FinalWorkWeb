const fs = require('fs');
const path = require('path');

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace CSS links
  content = content.replace(
    /href=["'](\.\.\/)?css\/(maincss|buyer)\.css(?:\?[^"']*)?["']/g,
    'href="$1css/$2.css?v=2"'
  );

  // Replace JS script sources
  content = content.replace(
    /src=["'](\.\.\/)?js\/(mainjs|buyer|ai-recommend)\.js(?:\?[^"']*)?["']/g,
    'src="$1js/$2.js?v=2"'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated cache-busting in ${filePath}`);
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini' && file !== 'knowledge') {
        walk(fullPath);
      }
    } else if (file.endsWith('.html')) {
      processHtmlFile(fullPath);
    }
  }
}

walk('d:\\FinalWorkWeb');
