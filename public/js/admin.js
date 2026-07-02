/* ==========================================================================
   Admin Dashboard JS
   Data loaded via AJAX from: datasets/products.json
   ========================================================================== */

// -----------------------------------------------------------------------
// AJAX helper: wraps XMLHttpRequest into a callback-based loader
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

document.addEventListener('DOMContentLoaded', function () {
  // Navigation Logic
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');

  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      navItems.forEach(function (nav) { nav.classList.remove('active'); });
      sections.forEach(function (sec) { sec.classList.remove('active'); });
      const targetId = item.getAttribute('data-target');
      item.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // --- LOAD DATA VIA AJAX ---
  let users = [];
  let shops = [];
  let products = [];
  let categories = [];
  let withdrawals = [];

  ajaxGetJSON(
    '../datasets/products.json',
    function (data) {
      users = data.users || [];
      shops = data.shops || [];
      products = data.products || [];
      categories = data.categories || [];
      withdrawals = data.withdrawals || [];
      // Render all tables after data is loaded
      renderAll();
    },
    function (err) {
      console.error('[admin.js] AJAX failed:', err.message);
      // Render with empty data (tables will be empty)
      renderAll();
    }
  );

  // --- RENDER FUNCTIONS ---

  function renderAll() {
    renderUsers();
    renderShops();
    renderProducts();
    renderCategories();
    renderWithdrawals();
  }

  // 1. Users
  function renderUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(function (user, index) {
      const tr = document.createElement('tr');
      const badgeClass = user.status === 'Active' ? 'badge-accent' : 'badge-danger';
      const actionBtn = user.status === 'Active'
        ? '<button class="btn btn-outline" onclick="toggleUserStatus(' + index + ')">Lock</button>'
        : '<button class="btn btn-primary" onclick="toggleUserStatus(' + index + ')">Unlock</button>';

      tr.innerHTML =
        '<td><span class="metric-text">' + user.id + '</span></td>' +
        '<td>' + user.name + '</td>' +
        '<td><span class="badge badge-default">' + user.role + '</span></td>' +
        '<td><span class="badge ' + badgeClass + '">' + user.status + '</span></td>' +
        '<td>' + actionBtn + '</td>';
      tbody.appendChild(tr);
    });
  }

  window.toggleUserStatus = function (index) {
    users[index].status = users[index].status === 'Active' ? 'Locked' : 'Active';
    renderUsers();
  };

  // 2. Shop Approvals
  function renderShops() {
    const tbody = document.getElementById('shops-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    shops.forEach(function (shop, index) {
      if (shop.status !== 'Pending') return;
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + shop.id + '</span></td>' +
        '<td>' + shop.designer + '</td>' +
        '<td>' + shop.requestedAt + '</td>' +
        '<td><span class="badge badge-highlight">' + shop.status + '</span></td>' +
        '<td>' +
          '<button class="btn btn-primary" onclick="handleShop(' + index + ', \'Approved\')">Approve</button>' +
          '<button class="btn btn-danger" style="margin-left:8px;" onclick="handleShop(' + index + ', \'Rejected\')">Reject</button>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  window.handleShop = function (index, newStatus) {
    shops[index].status = newStatus;
    renderShops();
  };

  // 3. Product Moderation
  function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    products.forEach(function (prod, index) {
      const badgeClass = prod.status === 'Active' ? 'badge-accent' : 'badge-danger';
      const hideBtn = prod.status === 'Hidden'
        ? '<button class="btn btn-primary" onclick="toggleProduct(' + index + ')">Unhide</button>'
        : '<button class="btn btn-danger" onclick="toggleProduct(' + index + ')">Hide</button>';

      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + prod.id + '</span></td>' +
        '<td>' + prod.name + '</td>' +
        '<td>' + prod.store + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + prod.status + '</span></td>' +
        '<td>' + hideBtn + '</td>';
      tbody.appendChild(tr);
    });
  }

  window.toggleProduct = function (index) {
    products[index].status = products[index].status === 'Hidden' ? 'Active' : 'Hidden';
    renderProducts();
  };

  // 4. Categories
  function renderCategories() {
    const tbody = document.getElementById('categories-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    categories.forEach(function (cat, index) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + cat.id + '</span></td>' +
        '<td><strong>' + cat.name + '</strong></td>' +
        '<td>' + cat.itemsCount + ' items</td>' +
        '<td><button class="btn btn-outline" onclick="deleteCategory(' + index + ')">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  window.deleteCategory = function (index) {
    categories.splice(index, 1);
    renderCategories();
  };

  const addCatBtn = document.getElementById('add-cat-btn');
  if (addCatBtn) {
    addCatBtn.addEventListener('click', function () {
      const name = prompt('Enter new category name:');
      if (name) {
        categories.push({ id: 'C' + (categories.length + 1), name: name, itemsCount: 0 });
        renderCategories();
      }
    });
  }

  // 5. Withdrawals
  function renderWithdrawals() {
    const tbody = document.getElementById('withdrawals-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    withdrawals.forEach(function (req, index) {
      if (req.status !== 'Pending') return;
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + req.id + '</span></td>' +
        '<td>' + req.designer + '</td>' +
        '<td><strong>' + req.amount + '</strong></td>' +
        '<td><span class="badge badge-highlight">' + req.status + '</span></td>' +
        '<td><button class="btn btn-primary" onclick="handleWithdrawal(' + index + ', \'Approved\')">Approve</button></td>';
      tbody.appendChild(tr);
    });
  }

  window.handleWithdrawal = function (index, newStatus) {
    withdrawals[index].status = newStatus;
    renderWithdrawals();
  };

  // Settings Save Mock
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function () {
      const fee = document.getElementById('platform-fee').value;
      alert('Platform fee updated to ' + fee + '% successfully!');
    });
  }
});
