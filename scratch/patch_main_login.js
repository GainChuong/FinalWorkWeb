const fs = require('fs');

let mainCode = fs.readFileSync('js/mainjs.js', 'utf8');

// The login function in mainjs.js starts with:
//   login: function(email, password) {
//     var account = null;

// I'll add the lock check right after this.
mainCode = mainCode.replace(/login: function\(email, password\) \{\s*var account = null;/, `login: function(email, password) {
    var account = null;
    var lockedUsers = JSON.parse(localStorage.getItem('refashion_locked_users')) || {};
    if (lockedUsers[email.toLowerCase().trim()]) {
      alert('Tài khoản của bạn đã bị khóa bởi Quản trị viên (Admin). Vui lòng liên hệ hỗ trợ để được giải quyết.');
      return null;
    }
`);

fs.writeFileSync('js/mainjs.js', mainCode);
console.log('Patched mainjs.js');
