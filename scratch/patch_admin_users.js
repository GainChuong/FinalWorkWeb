const fs = require('fs');

// Patch admin.js
let adminCode = fs.readFileSync('js/admin.js', 'utf8');

adminCode = adminCode.replace(/users = accData\.accounts \|\| \[\];/g, `
    let lockedUsers = JSON.parse(localStorage.getItem('refashion_locked_users')) || {};
    users = (accData.accounts || []).map(function(acc, i) {
      let uId = (i + 1).toString().padStart(3, '0');
      return {
        id: 'U' + uId,
        name: acc.name || acc.email,
        role: acc.role ? acc.role.toUpperCase() : 'USER',
        email: acc.email,
        status: lockedUsers[acc.email.toLowerCase()] ? 'Locked' : 'Active'
      };
    });
`);

adminCode = adminCode.replace(/window\.toggleUserStatus = function\s*\(index\)\s*\{[\s\S]*?renderUsers\(\);\s*\};/m, `
  window.toggleUserStatus = function (index) {
    let lockedUsers = JSON.parse(localStorage.getItem('refashion_locked_users')) || {};
    const email = users[index].email.toLowerCase();
    
    if (users[index].status === 'Active') {
      users[index].status = 'Locked';
      lockedUsers[email] = true;
    } else {
      users[index].status = 'Active';
      delete lockedUsers[email];
    }
    
    localStorage.setItem('refashion_locked_users', JSON.stringify(lockedUsers));
    renderUsers();
  };
`);

fs.writeFileSync('js/admin.js', adminCode);
console.log('Patched admin.js');
