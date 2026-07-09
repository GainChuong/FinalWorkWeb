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
  let orders = [];
  let subscriptions = [];
  let shops = [];
  let products = [];
  let categories = [];
  let withdrawals = [];
  let campaigns = [];
  let transactions = [];

  let sellerStats = null;
  let allMonths = [];

  renderFooter('footer-container');

  Promise.all([
    fetch('../datasets/accounts.json').then(r => r.ok ? r.json() : {accounts: []}),
    fetch('../datasets/order.json').then(r => r.ok ? r.json() : {orders: []}),
    fetch('../datasets/products.json').then(r => r.ok ? r.json() : {products: []}),
    fetch('../datasets/shop_sub.json').then(r => r.ok ? r.json() : {requests: []}),
    fetch('../datasets/seller.json').then(r => r.ok ? r.json() : {}),
    fetch('../datasets/campaigns.json').then(r => r.ok ? r.json() : {campaigns: []}),
    fetch('../datasets/transaction.json').then(r => r.ok ? r.json() : {transactions: []})
  ]).then(function(results) {
    const accData = results[0];
    let ordData = results[1];
    var local = localStorage.getItem('refashion_shared_orders');
    if (local) {
        try {
            ordData = { orders: JSON.parse(local) };
        } catch(e) {}
    }
    const prodData = results[2];
    const shopReqData = results[3];
    sellerStats = results[4];
    const campData = results[5];
    const txnData = results[6];

    // Extract all unique months
    const monthMap = {};
    Object.values(sellerStats).forEach(store => {
      if (store.dashboard && store.dashboard.months) {
        store.dashboard.months.forEach(m => {
          monthMap[m.key] = m.label;
        });
      }
    });
    allMonths = Object.keys(monthMap).sort().map(k => ({key: k, label: monthMap[k]}));

    const filterDropdown = document.getElementById('admin-month-filter');
    if (filterDropdown && allMonths.length > 0) {
      filterDropdown.innerHTML = '';
      allMonths.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.key;
        opt.textContent = m.label;
        filterDropdown.appendChild(opt);
      });
      // Default to latest month
      filterDropdown.value = allMonths[allMonths.length - 1].key;
      filterDropdown.addEventListener('change', function() {
        updateAdminDashboard(this.value);
      });
    }

    
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

    const approvedShops = users.filter(u => u.role === 'Seller').map(s => ({
      id: s.email, store: s.store || s.name, owner: s.name, email: s.email,
      designer: s.name, requestedAt: '2025-01-01', plan: 'Pro',
      status: 'Approved', joined: '2025-01-01', revenue: 10000000,
      subscription: 'Pro', rating: 4.8
    }));
    const pendingShops = (shopReqData.requests || []).map(r => ({
      id: r.id, store: r.store, owner: r.designer, email: r.email,
      designer: r.designer, requestedAt: r.requestedAt, plan: r.plan,
      status: r.status, bio: r.bio, phone: r.phone
    }));
    shops = [...approvedShops, ...pendingShops];
    
    orders = (ordData.orders || []).map(o => {
      let bEmail = o.buyerEmail || 'unknown@example.com';
      let sEmail = o.sellerEmail || 'admin@refashion.vn';
      return {
        id: o.id,
        orderRef: o.id,
        customer: (o.customer && o.customer.name) ? o.customer.name : bEmail.split('@')[0],
        email: bEmail,
        store: sEmail === 'admin@refashion.vn' ? 'Eco Wear' : (sEmail.split('@')[0] + ' Store'),
        items: o.items || [],
        total: o.total || 0,
        platformFee: (o.total || 0) * 0.05,
        payment: o.paymentMethod || 'COD',
        status: o.status || 'pending',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : (o.date ? new Date(o.date).toLocaleDateString('vi-VN') : '')
      };
    });
    
    subscriptions = shopReqData.subscriptions || [];
    
    products = prodData.products || [];
    categories = (function() {
      const catMap = { upper: 'Upper Body', lower: 'Lower Body', overall: 'Full Body' };
      const counts = { upper: 0, lower: 0, overall: 0 };
      (products || []).forEach(function(p) {
        if (counts.hasOwnProperty(p.category)) counts[p.category]++;
      });
      return Object.keys(counts).map(function(key) {
        return { id: key.toUpperCase(), name: catMap[key] || key, itemsCount: counts[key] };
      });
    })();
    withdrawals = [];
    campaigns = campData.campaigns || [];
    initTransactions(txnData.transactions || [], ordData.orders || []);
    
    renderAll();
    if (allMonths.length > 0) {
      updateAdminDashboard(allMonths[allMonths.length - 1].key);
    }
  }).catch(function(err) {
    console.error('[admin.js] Fetch failed:', err);
    renderAll();
  });

  // --- RENDER FUNCTIONS ---

  // Transaction auto-simulation
  function initTransactions(baseTxns, allOrders) {
    var stored = localStorage.getItem('refashion_admin_txns');
    if (stored) {
      transactions = JSON.parse(stored);
    } else {
      transactions = baseTxns.slice();
      localStorage.setItem('refashion_admin_txns', JSON.stringify(transactions));
    }
    // Auto-sim: every 5s, check delivered/shipped orders and add as new transactions
    simulateTransactions(orders);
    setInterval(function () { 
      // Sync orders from seller simulation
      var localO = localStorage.getItem('refashion_shared_orders');
      if (localO) {
        var parsed = JSON.parse(localO);
        if (parsed.length !== orders.length) {
          orders = parsed;
          renderAdminOrders();
        }
      }
      simulateTransactions(orders); 
    }, 5000);
  }

  function simulateTransactions(allOrders) {
    var existingIds = {};
    transactions.forEach(function (t) { existingIds[t.orderId] = true; });
    var completedOrders = allOrders.filter(function (o) {
      return (o.status === 'delivered' || o.status === 'shipped') && !existingIds[o.id];
    });
    var newTxns = [];
    completedOrders.forEach(function (o) {
      var fee = Math.round((o.total || 0) * 0.05);
      var sEmail = o.sellerEmail || 'admin@refashion.vn';
      var bEmail = o.buyerEmail || 'unknown@example.com';
      var customerName = (o.customer && o.customer.name) ? o.customer.name : ((o.customer && typeof o.customer === 'string') ? o.customer : bEmail.split('@')[0]);
      
      newTxns.push({
        id: 'TXN-AUTO-' + String(transactions.length + newTxns.length + 1).padStart(5, '0'),
        orderId: o.id,
        store: o.store || sEmail.split('@')[0],
        sellerEmail: sEmail,
        buyerEmail: bEmail,
        buyerName: customerName,
        amount: o.total || 0,
        platformFee: fee,
        netAmount: (o.total || 0) - fee,
        paymentMethod: o.paymentMethod || 'COD',
        date: o.createdAt ? o.createdAt.split('T')[0] : (o.date ? o.date : new Date().toISOString().split('T')[0]),
        status: 'Settled'
      });
    });

    // Also forcefully simulate one brand new transaction every tick to keep dashboard lively
    var fakeAmount = 500000 + Math.floor(Math.random() * 2000000);
    var fakeFee = Math.round(fakeAmount * 0.05);
    newTxns.push({
      id: 'TXN-AUTO-' + String(transactions.length + newTxns.length + 1).padStart(5, '0'),
      orderId: 'ORD-SIM-' + Math.floor(Math.random() * 99999),
      store: 'Eco Wear',
      sellerEmail: 'ecowear@refashion.vn',
      buyerEmail: 'buyer' + Math.floor(Math.random()*100) + '@gmail.com',
      buyerName: 'Virtual Buyer',
      amount: fakeAmount,
      platformFee: fakeFee,
      netAmount: fakeAmount - fakeFee,
      paymentMethod: 'COD',
      date: new Date().toISOString().split('T')[0],
      status: 'Settled'
    });

    if (newTxns.length > 0) {
      transactions = transactions.concat(newTxns);
      localStorage.setItem('refashion_admin_txns', JSON.stringify(transactions));
      renderTransactions();
      
      // Update dashboard values visually (mock)
      var revEl = document.getElementById('stat-revenue');
      if (revEl) {
         var cur = parseFloat(revEl.textContent.replace('Mđ', '')) || 45.2;
         var addedM = fakeAmount / 1000000;
         revEl.textContent = (cur + addedM).toFixed(1) + 'Mđ';
         
         // flash it
         revEl.style.transition = 'color 0.3s';
         revEl.style.color = '#557A46';
         setTimeout(function() { revEl.style.color = ''; }, 500);
      }
    }
  }

  function renderAll() {
    renderUsers();
    renderAdminOrders();
    renderSubscriptions();
    renderShops();
    renderProducts();
    renderCategories();
    renderWithdrawals();
    renderCampaigns();
    renderTransactions();
    // renderAdminCharts() is now called by updateAdminDashboard
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
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

  // Admin Dashboard Updater
  function updateAdminDashboard(monthKey) {
    if (!sellerStats) return;

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalCo2 = 0;

    Object.values(sellerStats).forEach(store => {
      if (store.dashboard && store.dashboard.months) {
        const monthData = store.dashboard.months.find(m => m.key === monthKey);
        if (monthData && monthData.stats) {
          totalRevenue += monthData.stats.revenue || 0;
          totalOrders += monthData.stats.orders || 0;
          totalCo2 += monthData.stats.co2_saved || 0;
        }
      }
    });

    const activeUsers = users.length || 0;
    
    // Update metric cards
    document.getElementById('stat-active-users').textContent = activeUsers.toLocaleString('en-US');
    document.getElementById('stat-pending-shops').textContent = totalOrders.toLocaleString('en-US');
    document.getElementById('stat-revenue').textContent = (totalRevenue / 1000000).toFixed(1) + 'Mđ';
    document.getElementById('stat-green-impact').textContent = '-' + totalCo2.toLocaleString('en-US') + ' Kg CO₂';

    renderAdminCharts(monthKey);
  }

  // Admin Charts
  let adminRevenueChartInstance = null;
  let adminUsersChartInstance = null;

  function renderAdminCharts(currentMonthKey) {
    if (typeof Chart === 'undefined') return;

    // 1. Revenue Chart
    const revCtx = document.getElementById('adminRevenueChart');
    if (revCtx) {
      if (adminRevenueChartInstance) adminRevenueChartInstance.destroy();
      
      // Calculate last 6 months aggregated revenue
      let chartMonths = [];
      let chartRevenue = [];
      const currentIdx = allMonths.findIndex(m => m.key === currentMonthKey);
      if (currentIdx !== -1) {
        const startIdx = Math.max(0, currentIdx - 5);
        const last6 = allMonths.slice(startIdx, currentIdx + 1);
        
        chartMonths = last6.map(m => m.label.split(' ')[0]); // e.g. "January"
        chartRevenue = last6.map(m => {
          let mRev = 0;
          Object.values(sellerStats).forEach(store => {
            if (store.dashboard && store.dashboard.months) {
              const sData = store.dashboard.months.find(x => x.key === m.key);
              if (sData && sData.stats) mRev += sData.stats.revenue || 0;
            }
          });
          return mRev / 1000000; // In Millions
        });
      }

      adminRevenueChartInstance = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: chartMonths,
          datasets: [{
            label: 'Platform Revenue (Mđ)',
            data: chartRevenue,
            borderColor: '#4d7c0f',
            backgroundColor: 'rgba(77, 124, 15, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#4d7c0f'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Users Distribution Chart
    const usrCtx = document.getElementById('adminUsersChart');
    if (usrCtx) {
      if (adminUsersChartInstance) adminUsersChartInstance.destroy();
      
      const totalBuyers = users.filter(u => u.role === 'Buyer').length || 1200;
      const totalSellers = users.filter(u => u.role === 'Seller').length || 48;

      adminUsersChartInstance = new Chart(usrCtx, {
        type: 'doughnut',
        data: {
          labels: ['Buyers', 'Upcycle Designers'],
          datasets: [{
            data: [totalBuyers, totalSellers],
            backgroundColor: ['#4d7c0f', '#b45309'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  
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


  // 2. Orders
  function renderAdminOrders() {
    const tbody = document.getElementById('orders-tbody');
    const countEl = document.getElementById('admin-order-count');
    const searchInput = document.getElementById('admin-order-search');
    if (!tbody) return;

    function filterAndRender() {
      const q = (searchInput ? searchInput.value : '').toLowerCase();
      const filtered = orders.filter(function (o) {
        return !q || o.id.toLowerCase().includes(q) || o.orderRef.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.store.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      });

      if (countEl) countEl.textContent = filtered.length + ' orders';
      tbody.innerHTML = '';

      filtered.forEach(function (o) {
        var badgeClass = 'badge-accent';
        var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
        if (o.status === 'pending') { badgeClass = 'badge-highlight'; statusLabel = 'Pending'; }
        else if (o.status === 'confirmed') { badgeClass = 'badge-primary'; statusLabel = 'Confirmed'; }
        else if (o.status === 'packed') { badgeClass = 'badge-info'; statusLabel = 'Packed'; }
        else if (o.status === 'shipping') { badgeClass = 'badge-info'; statusLabel = 'Shipping'; }
        else if (o.status === 'completed') { badgeClass = 'badge-accent'; statusLabel = 'Completed'; }
        else if (o.status === 'cancelled') { badgeClass = 'badge-danger'; statusLabel = 'Cancelled'; }

        var itemsCount = (o.items || []).reduce(function(sum, it) { return sum + (it.qty || 1); }, 0);
        var itemsListHtml = (o.items || []).map(function (it) { 
          var imageHtml = it.image ? '<img src="' + it.image + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:12px;vertical-align:middle;flex-shrink:0;">' : '<div style="width:40px;height:40px;border-radius:4px;margin-right:12px;background:#f0f4f0;display:inline-block;vertical-align:middle;flex-shrink:0;"></div>';
          return '<div style="display:flex;align-items:center;margin-bottom:12px;">' + imageHtml + '<span style="flex:1;">' + it.name + ' <span style="color:var(--text-secondary);font-weight:600;">(x' + it.qty + ')</span></span></div>';
        }).join('');
        
        var encodedHtml = encodeURIComponent(itemsListHtml);
        var itemsList = '<div style="text-align:left;">' +
                          '<span style="font-weight:600;font-size:13px;">' + itemsCount + ' items</span><br/>' +
                          '<button class="btn btn-outline" style="padding:2px 8px; font-size:11px; margin-top:4px;" onclick="window.showOrderItemsPopup(\'' + encodedHtml + '\')">Details</button>' +
                        '</div>';
        var totalFmt = o.total ? o.total.toLocaleString('vi-VN') + 'đ' : '0đ';
        var feeFmt = o.platformFee ? o.platformFee.toLocaleString('vi-VN') + 'đ' : '0đ';

        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><span class="metric-text">' + o.orderRef + '</span></td>' +
          '<td>' + o.customer + '<br/><span style="font-size:11px;color:var(--text-secondary);">' + o.email + '</span></td>' +
          '<td>' + o.store + '</td>' +
          '<td style="font-size:12px;max-width:200px;">' + itemsList + '</td>' +
          '<td><strong>' + totalFmt + '</strong></td>' +
          '<td style="color:var(--text-secondary);font-size:12px;">' + feeFmt + '</td>' +
          '<td><span style="font-size:12px;">' + o.payment + '</span></td>' +
          '<td><span class="badge ' + badgeClass + '">' + statusLabel + '</span></td>' +
          '<td style="font-size:12px;color:var(--text-secondary);">' + o.date + '</td>';
        tbody.appendChild(tr);
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-secondary);">No orders found.</td></tr>';
      }
    }

    filterAndRender();
    if (searchInput) {
      searchInput.addEventListener('input', filterAndRender);
    }
  }

  // 3. Subscriptions
  function renderSubscriptions() {
    const tbody = document.getElementById('subscriptions-tbody');
    if (!tbody) return;
    
    // Update active plans badge
    const activePlansBadge = document.querySelector('#subscriptions-sec .badge-editorial.badge-accent');
    if (activePlansBadge) {
      activePlansBadge.innerHTML = '<i data-lucide="shield" style="width:12px;height:12px;margin-right:4px;"></i> ' + subscriptions.length + ' Active Plans';
    }

    tbody.innerHTML = '';
    subscriptions.forEach(function (sub) {
      var planBadgeClass = sub.plan === 'Enterprise' ? 'badge-accent' : (sub.plan === 'Pro' ? 'badge-primary' : 'badge-default');
      var statusBadgeClass = sub.status === 'Active' ? 'badge-accent' : (sub.status === 'Suspended' ? 'badge-danger' : 'badge-highlight');
      var feeFmt = sub.monthlyFee ? sub.monthlyFee.toLocaleString('vi-VN') + 'đ' : '0đ';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + sub.id + '</span></td>' +
        '<td>' + sub.store + '</td>' +
        '<td>' + sub.designer + '</td>' +
        '<td><span class="badge ' + planBadgeClass + '">' + sub.plan + '</span></td>' +
        '<td><strong>' + feeFmt + '</strong></td>' +
        '<td>' + sub.products + '</td>' +
        '<td style="font-size:12px;color:var(--text-secondary);">' + sub.renewalDate + '</td>' +
        '<td><span class="badge ' + statusBadgeClass + '">' + sub.status + '</span></td>';
      tbody.appendChild(tr);
    });
  }

  // 4. Shop Approvals
  function renderShops() {
    const tbody = document.getElementById('shops-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const activeFilter = document.querySelector('.shop-filter.active');
    const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

    const filtered = shops.filter(function (s) {
      if (filterValue === 'all') return true;
      if (filterValue === 'pending') return s.status === 'Pending';
      if (filterValue === 'approved') return s.status === 'Approved';
      return true;
    });

    filtered.forEach(function (shop, index) {
      const isPending = shop.status === 'Pending';
      const statusBadge = isPending
        ? '<span class="badge badge-highlight">Pending</span>'
        : '<span class="badge badge-accent">Approved</span>';
      const actionBtn = isPending
        ? '<button class="btn" style="padding:0 12px;height:26px;font-size:11px;background:var(--primary-green);color:white;border-radius:6px;cursor:pointer;border:none;font-weight:500;" onclick="openShopModal(' + shops.indexOf(shop) + ')">Action</button>'
        : '<span style="font-size:11px;color:var(--text-secondary);">-</span>';

      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + shop.id + '</span></td>' +
        '<td>' + (shop.store || '-') + '<br/><span style="font-size:10px;color:var(--text-secondary);">' + (shop.designer || '') + '</span></td>' +
        '<td style="font-size:11px;color:var(--text-secondary);white-space:nowrap;">' + shop.requestedAt + '</td>' +
        '<td>' + (shop.plan || '-') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + actionBtn + '</td>';
      tbody.appendChild(tr);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-secondary);">No shops found.</td></tr>';
    }

    var pendingCount = shops.filter(function (s) { return s.status === 'Pending'; }).length;
    var statEl = document.getElementById('stat-pending-shops');
    if (statEl) statEl.textContent = pendingCount;
  }

  // Shop filter tabs
  var filterBtns = document.querySelectorAll('.shop-filter');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.className = b.className.replace(' btn-primary', ' btn-outline').replace(' active', '');
      });
      btn.className = 'btn btn-primary shop-filter active';
      renderShops();
    });
  });

  window.openShopModal = function (index) {
    var modal = document.getElementById('shop-modal');
    var overlay = document.getElementById('shop-modal-overlay');
    if (!modal || !overlay) return;
    overlay.style.display = 'block';
    modal.style.display = 'block';
    modal.setAttribute('data-index', index);
  };

  window.closeShopModal = function () {
    var modal = document.getElementById('shop-modal');
    var overlay = document.getElementById('shop-modal-overlay');
    if (modal) modal.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  };

  window.confirmShopAction = function (action) {
    var modal = document.getElementById('shop-modal');
    if (!modal) return;
    var index = parseInt(modal.getAttribute('data-index'), 10);
    if (isNaN(index)) return;
    shops[index].status = action === 'approve' ? 'Approved' : 'Rejected';
    closeShopModal();
    renderShops();
  };

  // 5. Product Moderation
  function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    
    let hiddenProducts = JSON.parse(localStorage.getItem('refashion_hidden_products')) || {};

    tbody.innerHTML = '';
    products.forEach(function (prod, index) {
      const currentStatus = hiddenProducts[prod.id] ? 'Hidden' : 'Active';
      prod.status = currentStatus;

      const badgeClass = currentStatus === 'Active' ? 'badge-accent' : 'badge-danger';
      const hideBtn = currentStatus === 'Hidden'
        ? '<button class="btn btn-primary" onclick="toggleProduct(' + index + ')">Unhide</button>'
        : '<button class="btn btn-danger" onclick="toggleProduct(' + index + ')">Hide</button>';

      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + prod.id + '</span></td>' +
        '<td>' + prod.name + '</td>' +
        '<td>' + prod.store + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + currentStatus + '</span></td>' +
        '<td>' + hideBtn + '</td>';
      tbody.appendChild(tr);
    });
  }

  window.toggleProduct = function (index) {
    let hiddenProducts = JSON.parse(localStorage.getItem('refashion_hidden_products')) || {};
    const prodId = products[index].id;
    
    if (products[index].status === 'Hidden') {
      products[index].status = 'Active';
      delete hiddenProducts[prodId];
    } else {
      products[index].status = 'Hidden';
      hiddenProducts[prodId] = true;
    }
    
    localStorage.setItem('refashion_hidden_products', JSON.stringify(hiddenProducts));
    renderProducts();
  };

  // 6. Categories
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

  // 7. Withdrawals
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

  // 8. Campaigns
  function renderCampaigns() {
    const tbody = document.getElementById('campaigns-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    campaigns.forEach(function (camp) {
      var badgeClass = 'badge-default';
      if (camp.status === 'Active') badgeClass = 'badge-accent';
      else if (camp.status === 'Scheduled') badgeClass = 'badge-highlight';
      else if (camp.status === 'Ended') badgeClass = 'badge-danger';

      var discountText = camp.type === 'percentage' ? camp.value + '%' :
                         camp.type === 'fixed' ? camp.value.toLocaleString('vi-VN') + 'đ' :
                         camp.type === 'free_shipping' ? 'Free Ship' : camp.value + '';
      var minOrderText = camp.minOrder ? camp.minOrder.toLocaleString('vi-VN') + 'đ' : 'No minimum';
      var usageText = camp.usedCount + ' / ' + (camp.usageLimit || '&infin;');

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + camp.code + '</span></td>' +
        '<td>' + camp.name + '<br/><span style="font-size:10px;color:var(--text-secondary);">' + (camp.description || '') + '</span></td>' +
        '<td><strong>' + discountText + '</strong></td>' +
        '<td style="font-size:11px;color:var(--text-secondary);">' + minOrderText + '</td>' +
        '<td style="font-size:11px;color:var(--text-secondary);white-space:nowrap;">' + camp.startDate + ' → ' + camp.endDate + '</td>' +
        '<td style="font-size:11px;color:var(--text-secondary);">' + usageText + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + camp.status + '</span></td>';
      tbody.appendChild(tr);
    });
  }

  // 9. Transactions
  function renderTransactions() {
    const tbody = document.getElementById('transactions-tbody');
    const summary = document.getElementById('txn-summary');
    if (!tbody) return;
    tbody.innerHTML = '';
    var totalAmt = 0, totalFee = 0;
    transactions.forEach(function (tx) {
      var badgeClass = tx.status === 'Settled' ? 'badge-accent' :
                       tx.status === 'Pending' ? 'badge-highlight' : 'badge-danger';
      var amtFmt = (tx.amount || 0).toLocaleString('vi-VN') + 'đ';
      var feeFmt = (tx.platformFee || 0).toLocaleString('vi-VN') + 'đ';
      var netFmt = (tx.netAmount || 0).toLocaleString('vi-VN') + 'đ';
      totalAmt += tx.amount || 0;
      totalFee += tx.platformFee || 0;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + tx.id + '</span></td>' +
        '<td><span class="metric-text">' + tx.orderId + '</span></td>' +
        '<td>' + (tx.store || '-') + '</td>' +
        '<td>' + (tx.buyerName || tx.buyerEmail || '-') + '</td>' +
        '<td><strong>' + amtFmt + '</strong></td>' +
        '<td style="color:var(--text-secondary);">' + feeFmt + '</td>' +
        '<td><strong>' + netFmt + '</strong></td>' +
        '<td style="font-size:11px;color:var(--text-secondary);">' + (tx.paymentMethod || '-') + '</td>' +
        '<td style="font-size:11px;color:var(--text-secondary);white-space:nowrap;">' + (tx.date || '-') + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + tx.status + '</span></td>';
      tbody.appendChild(tr);
    });
    if (summary) {
      summary.textContent = transactions.length + ' transactions — ' + totalAmt.toLocaleString('vi-VN') + 'đ total';
    }
    if (transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-secondary);">No transactions yet.</td></tr>';
    }
  }

  // Settings Save Mock
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function () {
      const fee = document.getElementById('platform-fee').value;
      alert('Platform fee updated to ' + fee + '% successfully!');
    });
  }

  window.showOrderItemsPopup = function(htmlContent) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    var popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '24px';
    popup.style.borderRadius = '12px';
    popup.style.minWidth = '320px';
    popup.style.maxWidth = '500px';
    popup.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    popup.style.maxHeight = '80vh';
    popup.style.overflowY = 'auto';
    popup.style.fontFamily = 'var(--font-sans)';
    
    var header = document.createElement('div');
    header.innerHTML = '<h3 style="margin-bottom:20px; margin-top:0; font-family:var(--font-serif); font-size:20px;">Order Details</h3>';
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-outline';
    closeBtn.style.marginTop = '20px';
    closeBtn.style.width = '100%';
    closeBtn.onclick = function() { document.body.removeChild(overlay); };
    
    var content = document.createElement('div');
    content.innerHTML = decodeURIComponent(htmlContent);
    
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    
    overlay.onclick = function(e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    };
    
    document.body.appendChild(overlay);
  };

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
