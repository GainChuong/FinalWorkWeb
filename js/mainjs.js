/* ==========================================================================
   GreenCommerce Global Main JS
   Shared authentication session logic and Role Guard Routing
   Data loaded via AJAX from: datasets/accounts.json
   ========================================================================== */

// Resolve base path for datasets (works from any depth subfolder)
const _basePath = (() => {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length - 1;
  return depth <= 1 ? './' : '../'.repeat(depth - 1);
})();

// Cache for loaded accounts
let MOCK_ACCOUNTS = [];

// -----------------------------------------------------------------------
// AJAX helper: wraps XMLHttpRequest into a simple callback-based loader
// Usage: ajaxGetJSON(url, function(data) { ... }, function(err) { ... })
// -----------------------------------------------------------------------
function ajaxGetJSON(url, onSuccess, onError) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true); // true = asynchronous
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        onSuccess(data);
      } catch (parseErr) {
        onError(parseErr);
      }
    } else {
      onError(new Error('AJAX Error ' + xhr.status + ': ' + url));
    }
  };
  xhr.onerror = function () {
    onError(new Error('Network error loading: ' + url));
  };
  xhr.send();
}

// Load accounts via AJAX, then initialize role guard
function initApp() {
  ajaxGetJSON(
    _basePath + 'datasets/accounts.json',
    function (data) {
      MOCK_ACCOUNTS = data.accounts || [];
      runRoleGuard();
      injectRoleHeader();
    },
    function (err) {
      console.warn('[mainjs] Falling back to inline accounts:', err.message);
      // Fallback if AJAX fails (e.g. file:// protocol)
      MOCK_ACCOUNTS = [
        { email: 'buyer@refashion.vn', password: 'buyer123', role: 'Buyer', redirect: '../buyer/index.html' },
        { email: 'seller@refashion.vn', password: 'seller123', role: 'Seller', redirect: '../seller/seller_dashboard.html' },
        { email: 'admin@refashion.vn', password: 'admin123', role: 'Admin', redirect: '../admin/index.html' }
      ];
      runRoleGuard();
      injectRoleHeader();
    }
  );
}

// Run routing guard
function runRoleGuard() {
  var session = getSession();
  var currentPath = window.location.pathname.toLowerCase();

  // Pages served from public/ — check via path
  if (currentPath.includes('/admin/')) {
    if (!session || session.role !== 'Admin') {
      alert('Access Denied: Requires Admin Role.');
      window.location.href = '/auth/login';
      return;
    }
  }

  if (currentPath.includes('/seller/')) {
    if (!session || session.role !== 'Seller') {
      alert('Access Denied: Requires Seller Role.');
      window.location.href = '/auth/login';
      return;
    }
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  initApp();
});

// Helper: Get user session
function getSession() {
  const userJson = localStorage.getItem('sessionUser');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

// Helper: Set user session
function setSession(email, role) {
  localStorage.setItem('sessionUser', JSON.stringify({ email, role }));
}

// Helper: Clear session
function clearSession() {
  localStorage.removeItem('sessionUser');
}

// Main Login Function
window.loginUser = function (email, password) {
  const account = MOCK_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );

  if (account) {
    setSession(account.email, account.role);
    window.location.href = account.redirect;
    return true;
  } else {
    alert('Sai email hoặc mật khẩu!\n\nDemo Accounts:\n- buyer@refashion.vn / buyer123\n- seller@refashion.vn / seller123\n- admin@refashion.vn / admin123');
    return false;
  }
};

// Global Role Switcher Banner Injection
function injectRoleHeader() {
  const session = getSession();
  if (!session) return;

  const header = document.createElement('div');
  header.className = 'global-role-header';

  header.innerHTML = `
    <div class="global-role-brand">
      ReFashion <span>${session.role.toUpperCase()} VIEW</span>
    </div>
    <div class="global-role-nav">
      <div class="global-role-info">
        <span class="global-role-label">User:</span>
        <span class="global-role-badge">${session.email}</span>
      </div>
      <div class="global-role-info">
        <span class="global-role-label">Switch Role:</span>
        <select class="global-role-select" id="global-role-select">
          <option value="Buyer" ${session.role === 'Buyer' ? 'selected' : ''}>Buyer</option>
          <option value="Seller" ${session.role === 'Seller' ? 'selected' : ''}>Seller</option>
          <option value="Admin" ${session.role === 'Admin' ? 'selected' : ''}>Admin</option>
        </select>
      </div>
      <button class="global-role-btn logout" id="global-logout-btn">Log out</button>
    </div>
  `;

  document.body.prepend(header);
  document.body.classList.add('with-global-role-header');

  // Handle Switch Role — redirect to absolute path for the selected role
  document.getElementById('global-role-select').addEventListener('change', function (e) {
    var selectedRole = e.target.value;
    var account = MOCK_ACCOUNTS.find(function(a) { return a.role === selectedRole; });
    if (account) {
      setSession(account.email, account.role);
      // Use absolute path (served from public/)
      var dest = account.redirect;
      if (!dest.startsWith('/') && !dest.startsWith('http')) {
        dest = '/' + dest.replace(/^\.\.\//, '');
      }
      window.location.href = dest;
    }
  });

  // Handle Logout — always redirect to Next.js login page
  document.getElementById('global-logout-btn').addEventListener('click', function () {
    clearSession();
    window.location.href = '/auth/login';
  });
}
