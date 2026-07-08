const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Target for store breadcrumb
const targetStoreBreadcrumb = `'<nav class="store-breadcrumb" style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;flex-wrap:wrap">' +
        '<a href="/buyer/index.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'"><i class="fa-solid fa-house"></i> Home</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<a href="/buyer/shop.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'">Shop</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<span style="color:var(--primary);font-weight:600">' + storeName + '</span>' +
      '</nav>'`;

const replacementStoreBreadcrumb = `/* Breadcrumb with premium white background bar */
      '<nav class="store-breadcrumb" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;flex-wrap:wrap;background:rgba(255,255,255,0.95);border:1px solid var(--border);padding:0.75rem 1.25rem;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.03);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">' +
        '<a href="/buyer/index.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'"><i class="fa-solid fa-house"></i> Home</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<a href="/buyer/shop.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'">Shop</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<span style="color:var(--primary);font-weight:600">' + storeName + '</span>' +
      '</nav>'`;

// 2. Target for product detail breadcrumb
const targetDetailBreadcrumb = `      '<div class="detail-breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span style="color:var(--primary);font-weight:600">' + product.name + '</span></div>' +`;

const replacementDetailBreadcrumb = `      '<div class="detail-breadcrumb" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;flex-wrap:wrap;background:rgba(255,255,255,0.95);border:1px solid var(--border);padding:0.75rem 1.25rem;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.03);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">' +
        '<a href="index.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'"><i class="fa-solid fa-house"></i> Home</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<a href="shop.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\\'var(--primary)\\'" onmouseout="this.style.color=\\'var(--text-muted)\\'">Shop</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<span style="color:var(--primary);font-weight:600">' + product.name + '</span>' +
      '</div>' +`;

const normalize = s => s.replace(/\r\n/g, '\n').trim();

let count = 0;

content = content.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(targetStoreBreadcrumb))) {
  content = content.replace(normalize(targetStoreBreadcrumb), normalize(replacementStoreBreadcrumb));
  count++;
} else {
  console.warn('Warning: Store breadcrumb target not found.');
}

if (normalize(content).includes(normalize(targetDetailBreadcrumb))) {
  content = content.replace(normalize(targetDetailBreadcrumb), normalize(replacementDetailBreadcrumb));
  count++;
} else {
  console.warn('Warning: Product detail breadcrumb target not found.');
}

content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully applied ${count} breadcrumb layout updates to buyer.js!`);
