const fs = require('fs');
let data = fs.readFileSync('js/buyer.js', 'utf8');

let lines = data.split(/\r?\n/);
let start = lines.findIndex(l => l.includes('<div class="dpp-timeline">'));
let end = lines.findIndex((l, i) => i > start && l.trim() === '\'</div>\' +' && lines[i+1].trim() === '\'</div>\' +');

if (start !== -1 && end !== -1) {
  lines.splice(start, end - start, 
    '            \'<div class="dpp-timeline" id="dpp-os-timeline">\' +',
    '              \'<div style="text-align: center; color: var(--text-muted); padding: 1rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> \' + (isEn ? "Fetching Open Supply Hub Data..." : "Đang tải dữ liệu từ Open Supply Hub...") + \'</div>\' +'
  );
  fs.writeFileSync('js/buyer.js', lines.join('\r\n'));
  console.log('Replaced via lines array.');
} else {
  console.log('Could not find via lines array.');
}
