const fs = require('fs');
const path = require('path');

const BUYER_JS_PATH = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(BUYER_JS_PATH, 'utf8');

// Replace standard occurrences of ' đ' and 'đ' representing currency in buyer.js
content = content.split(" + ' đ'").join(" + ' VND'");
content = content.split(" + 'đ'").join(" + ' VND'");
content = content.split("' đ'").join("' VND'");
content = content.split("'đ'").join("' VND'");
content = content.split("đ</span>").join(" VND</span>");
content = content.split("đ</b>").join(" VND</b>");

fs.writeFileSync(BUYER_JS_PATH, content, 'utf8');
console.log('Price string suffixes translated in js/buyer.js!');
