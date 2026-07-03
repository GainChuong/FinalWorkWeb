/* ==========================================================================
   Seller Dashboard JS
   Data loaded via AJAX from: datasets/products.json
   ========================================================================== */

// AJAX helper
function ajaxGetJSON(url, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try { onSuccess(JSON.parse(xhr.responseText)); }
      catch (e) { onError(e); }
    } else {
      onError(new Error('AJAX Error ' + xhr.status + ': ' + url));
    }
  };
  xhr.onerror = function () { onError(new Error('Network error: ' + url)); };
  xhr.send();
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Tab Switching Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            navButtons.forEach(b => b.classList.remove('active'));
            viewSections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding section
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Load secondhand market when activated
            if (targetId === 'secondhand-market') {
                renderShMarket();
            }
        });
    });

    // Mock Interactions for Buttons
    const editorialButtons = document.querySelectorAll('.btn-editorial');
    editorialButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Prevent default form submission if it's in a form
            if (this.type !== 'submit') {
                e.preventDefault();
            }
            
            // Add a small click effect class temporarily
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // ==========================================
    // ORDER MANAGEMENT (powered by order.json)
    // ==========================================
    var ordersData = [];
    var currentOrderStatus = 'pending';
    var orderSearchQuery = '';

    function loadOrders() {
      ajaxGetJSON(
        '../datasets/order.json',
        function (data) {
          ordersData = data.orders || [];
          updateOrderTabCounts();
          renderOrders();
        },
        function (err) {
          console.warn('[seller.js] Failed to load orders:', err.message);
          document.getElementById('orders-list').innerHTML = '<div class="order-empty"><i data-lucide="alert-circle"></i><h3>Không thể tải dữ liệu</h3><p>Vui lòng thử lại sau.</p></div>';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      );
    }

    function updateOrderTabCounts() {
      var statuses = ['pending', 'confirmed', 'packed', 'shipping', 'completed', 'cancelled'];
      statuses.forEach(function (s) {
        var count = ordersData.filter(function (o) { return o.status === s; }).length;
        var el = document.getElementById('count-' + s);
        if (el) el.textContent = count;
      });
      var processingCount = ordersData.filter(function (o) { return o.status === 'confirmed' || o.status === 'packed'; }).length;
      var processingEl = document.getElementById('count-processing');
      if (processingEl) processingEl.textContent = processingCount;
    }

    function getStatusLabel(status) {
      var map = {
        pending: 'Chờ Xác Nhận',
        confirmed: 'Chờ Lấy Hàng',
        packed: 'Đã Đóng Gói',
        shipping: 'Đang Giao',
        completed: 'Đã Giao',
        cancelled: 'Đã Hủy'
      };
      return map[status] || status;
    }

    function getStatusBadgeClass(status) {
      return 'order-status-badge order-status-' + status;
    }

    function formatDateTime(isoStr) {
      var d = new Date(isoStr);
      var day = String(d.getDate()).padStart(2, '0');
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var year = d.getFullYear();
      var hour = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return day + '/' + month + '/' + year + ' ' + hour + ':' + min;
    }

    function formatVND(num) {
      return num.toLocaleString('vi-VN') + 'đ';
    }

    function getProductIcon(name) {
      name = name.toLowerCase();
      if (name.indexOf('jacket') !== -1) return '🧥';
      if (name.indexOf('bag') !== -1 || name.indexOf('túi') !== -1) return '👜';
      if (name.indexOf('cap') !== -1 || name.indexOf('mũ') !== -1) return '🧢';
      if (name.indexOf('shirt') !== -1 || name.indexOf('áo') !== -1) return '👕';
      if (name.indexOf('jeans') !== -1 || name.indexOf('quần') !== -1) return '👖';
      if (name.indexOf('dress') !== -1 || name.indexOf('đầm') !== -1) return '👗';
      return '📦';
    }

    function getOrderActions(order) {
      var actions = '';
      switch (order.status) {
        case 'pending':
          actions = `
            <button class="btn-editorial order-action-cancel" style="height:38px;padding:0 18px;font-size:12px;">Hủy Đơn</button>
            <button class="btn-editorial btn-primary-editorial order-action-confirm" style="height:38px;padding:0 18px;font-size:12px;">Xác Nhận</button>
          `;
          break;
        case 'confirmed':
          actions = `
            <button class="btn-editorial order-action-cancel" style="height:38px;padding:0 18px;font-size:12px;">Hủy Đơn</button>
            <button class="btn-editorial btn-primary-editorial order-action-pack" style="height:38px;padding:0 18px;font-size:12px;">Đã Đóng Gói</button>
          `;
          break;
        case 'packed':
          actions = `
            <button class="btn-editorial btn-primary-editorial order-action-ship" style="height:38px;padding:0 18px;font-size:12px;">Giao Cho Vận Chuyển</button>
          `;
          break;
        case 'shipping':
          actions = `
            <button class="btn-editorial btn-primary-editorial order-action-complete" style="height:38px;padding:0 18px;font-size:12px;">Đã Giao Thành Công</button>
          `;
          break;
      }
      return actions;
    }

    function renderOrders() {
      var container = document.getElementById('orders-list');
      if (!container) return;

      var filtered = ordersData.filter(function (o) {
        if (currentOrderStatus === 'pending') {
          if (o.status !== 'pending') return false;
        } else if (currentOrderStatus === 'processing') {
          if (o.status !== 'confirmed' && o.status !== 'packed') return false;
        } else {
          if (o.status !== currentOrderStatus) return false;
        }
        if (orderSearchQuery) {
          var q = orderSearchQuery.toLowerCase();
          var matchCode = o.id.toLowerCase().indexOf(q) !== -1;
          var matchName = o.customer.name.toLowerCase().indexOf(q) !== -1;
          var matchPhone = o.customer.phone.indexOf(q) !== -1;
          if (!matchCode && !matchName && !matchPhone) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="order-empty"><i data-lucide="inbox"></i><h3>Không có đơn hàng</h3><p>Không tìm thấy đơn hàng nào trong mục này.</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      container.innerHTML = filtered.map(function (order) {
        var productsHtml = order.items.map(function (item) {
          return '<div class="order-product-item">' +
            '<div class="order-product-img">' + getProductIcon(item.name) + '</div>' +
            '<div class="order-product-detail">' +
              '<div class="order-product-name">' + item.name + '</div>' +
              '<div class="order-product-variant">' + (item.variant || '') + '</div>' +
            '</div>' +
            '<div class="order-product-qty">x' + item.qty + '</div>' +
          '</div>';
        }).join('');

        var noteHtml = order.note ? '<div class="order-note"><i data-lucide="message-square" style="width:12px;height:12px;"></i> ' + order.note + '</div>' : '';
        var actionsHtml = getOrderActions(order);

        return '<div class="order-card" data-id="' + order.id + '">' +
          '<div class="order-card-header">' +
            '<div><span class="order-code">#' + order.id + '</span> <span class="' + getStatusBadgeClass(order.status) + '">' + getStatusLabel(order.status) + '</span></div>' +
            '<span class="order-date">' + formatDateTime(order.createdAt) + '</span>' +
          '</div>' +
          '<div class="order-card-body">' +
            '<div class="order-product-list">' + productsHtml + '</div>' +
            '<div class="order-total">' +
              '<div class="order-total-label">Tổng tiền</div>' +
              '<div class="order-total-value">' + formatVND(order.total) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="order-customer-info">' +
            '<span><i data-lucide="user" style="width:12px;height:12px;"></i> ' + order.customer.name + '</span>' +
            '<span><i data-lucide="phone" style="width:12px;height:12px;"></i> ' + order.customer.phone + '</span>' +
            '<span><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ' + order.customer.address + '</span>' +
          '</div>' +
          (noteHtml ? '<div class="order-customer-info">' + noteHtml + '</div>' : '') +
          (actionsHtml ? '<div class="order-card-footer">' + actionsHtml + '</div>' : '') +
        '</div>';
      }).join('');

      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Bind action buttons
      container.querySelectorAll('.order-action-confirm').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          updateOrderStatus(card, 'confirmed');
        });
      });
      container.querySelectorAll('.order-action-pack').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          updateOrderStatus(card, 'packed');
        });
      });
      container.querySelectorAll('.order-action-ship').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          updateOrderStatus(card, 'shipping');
        });
      });
      container.querySelectorAll('.order-action-complete').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          updateOrderStatus(card, 'completed');
        });
      });
      container.querySelectorAll('.order-action-cancel').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            updateOrderStatus(card, 'cancelled');
          }
        });
      });
    }

    function updateOrderStatus(card, newStatus) {
      var id = card.getAttribute('data-id');
      var order = null;
      for (var i = 0; i < ordersData.length; i++) {
        if (ordersData[i].id === id) {
          order = ordersData[i];
          break;
        }
      }
      if (!order) return;

      order.status = newStatus;

      // Flash animation
      card.style.transition = 'all 0.4s ease';
      card.style.opacity = '0.5';
      card.style.transform = 'translateX(20px)';

      setTimeout(function () {
        updateOrderTabCounts();
        renderOrders();

        var statusLabel = getStatusLabel(newStatus);
        var toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
          var toast = document.createElement('div');
          toast.className = 'toast-notification';
          var icon = newStatus === 'cancelled' ? 'x-circle' : 'check-circle-2';
          toast.innerHTML = '<div class="toast-icon"><i data-lucide="' + icon + '"></i></div>' +
            '<div class="toast-body">' +
              '<div class="toast-title">' + (newStatus === 'cancelled' ? 'Đã Hủy Đơn Hàng' : 'Cập Nhật Thành Công') + '</div>' +
              '<div class="toast-msg">Đơn hàng <strong>#' + id + '</strong> chuyển sang trạng thái <strong>' + statusLabel + '</strong></div>' +
            '</div>';
          toastContainer.appendChild(toast);
          if (typeof lucide !== 'undefined') lucide.createIcons();
          setTimeout(function () {
            toast.classList.add('closing');
            toast.addEventListener('animationend', function () { toast.remove(); });
          }, 5000);
        }
      }, 300);
    }

    // Order tab switching
    var orderTabBtns = document.querySelectorAll('#order-tabs .tab-item');
    orderTabBtns.forEach(function (tab) {
      tab.addEventListener('click', function () {
        orderTabBtns.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentOrderStatus = tab.getAttribute('data-status') || 'pending';
        renderOrders();
      });
    });

    // Order search
    var orderSearchInput = document.getElementById('order-search');
    if (orderSearchInput) {
      orderSearchInput.addEventListener('input', function () {
        orderSearchQuery = this.value.trim();
        renderOrders();
      });
    }

    // Order refresh
    var orderRefreshBtn = document.getElementById('order-refresh');
    if (orderRefreshBtn) {
      orderRefreshBtn.addEventListener('click', function () {
        loadOrders();
        // Flash button
        this.style.transform = 'rotate(360deg)';
        this.style.transition = 'transform 0.5s ease';
        var self = this;
        setTimeout(function () { self.style.transform = ''; }, 500);
      });
    }

    // Load orders on init
    loadOrders();

    // ==========================================
    // CHAT — LOAD FROM comment.json
    // ==========================================

    var chatData = null;
    var chatCurrentConv = null;
    var chatStoreName = 'Eco Wear';

    function loadChatData() {
      ajaxGetJSON('../datasets/comment.json', function (data) {
        chatData = data;
        renderChatContacts();
      }, function () {
        console.warn('Không thể tải comment.json — chat không khả dụng');
      });
    }

    function renderChatContacts() {
      var list = document.querySelector('.chat-contact-list');
      if (!list || !chatData) return;
      var convs = chatData.conversations.filter(function (c) { return c.store === chatStoreName; });
      if (convs.length === 0) {
        list.innerHTML = '<div class="chat-contact-empty">Chưa có hội thoại nào</div>';
        return;
      }
      list.innerHTML = convs.map(function (c) {
        var isRead = c.unread === 0;
        return '<div class="chat-contact' + (isRead ? '' : ' unread') + '" data-conv-id="' + c.id + '">' +
          '<img src="' + c.buyer.avatar + '" alt="Avatar">' +
          '<div class="contact-info">' +
            '<strong>' + c.buyer.name + '</strong>' +
            '<span class="last-msg">' + escHtml(c.lastMessage) + '</span>' +
          '</div>' +
          (c.unread > 0 ? '<span class="badge-unread">' + c.unread + '</span>' : '') +
        '</div>';
      }).join('');

      // Click handler
      list.querySelectorAll('.chat-contact').forEach(function (el) {
        el.addEventListener('click', function () {
          list.querySelectorAll('.chat-contact').forEach(function (c) { c.classList.remove('active'); });
          el.classList.add('active');
          var id = el.dataset.convId;
          var conv = chatData.conversations.find(function (c) { return c.id === id; });
          if (conv) openChatConversation(conv);
        });
      });

      // Auto-open first conversation
      if (convs.length > 0) {
        var first = list.querySelector('.chat-contact');
        if (first) {
          first.classList.add('active');
          openChatConversation(convs[0]);
        }
      }
    }

    function openChatConversation(conv) {
      chatCurrentConv = conv;
      var header = document.querySelector('.chat-header strong');
      var badge = document.querySelector('.chat-header .badge-editorial');
      var messagesEl = document.querySelector('.chat-messages');
      var inputArea = document.querySelector('.chat-input-area');
      if (header) header.innerText = conv.buyer.name;
      if (badge) badge.innerText = 'Đang Hoạt Động';
      if (inputArea) inputArea.style.display = 'flex';
      if (messagesEl) {
        messagesEl.innerHTML = conv.messages.map(function (m) {
          var cls = m.sender === 'store' ? 'outgoing' : 'incoming';
          return '<div class="message ' + cls + '">' +
            '<div class="msg-content">' + escHtml(m.text) + '</div>' +
            '<div class="msg-time">' + formatChatTime(m.time) + '</div>' +
          '</div>';
        }).join('');
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function sendChatMessage() {
      if (!chatCurrentConv) return;
      var input = document.querySelector('.chat-input-area .input-editorial');
      if (!input || !input.value.trim()) return;
      var text = input.value.trim();
      input.value = '';

      var now = new Date();
      var timeStr = formatTimeISO(now);

      chatCurrentConv.messages.push({ sender: 'store', text: text, time: timeStr });
      chatCurrentConv.lastMessage = text;
      chatCurrentConv.lastTime = timeStr;

      // Re-render messages
      var messagesEl = document.querySelector('.chat-messages');
      messagesEl.innerHTML += '<div class="message outgoing">' +
        '<div class="msg-content">' + escHtml(text) + '</div>' +
        '<div class="msg-time">' + formatChatTime(timeStr) + '</div>' +
      '</div>';
      messagesEl.scrollTop = messagesEl.scrollHeight;

      // Auto-reply after a delay (simulate buyer response)
      triggerAutoReply(chatCurrentConv);
    }

    function triggerAutoReply(conv) {
      var replies = [
        'Cảm ơn shop nhiều ạ!',
        'Dạ vâng, để em suy nghĩ thêm.',
        'Shop tư vấn giúp em với ạ!',
        'Vậy em đặt hàng luôn nhé.',
        'Cho em hỏi thêm chút ạ.',
        'Cảm ơn shop đã hỗ trợ!'
      ];
      var delay = 2000 + Math.random() * 3000;
      setTimeout(function () {
        var text = replies[Math.floor(Math.random() * replies.length)];
        var now = new Date();
        var timeStr = formatTimeISO(now);
        conv.messages.push({ sender: 'buyer', text: text, time: timeStr });
        conv.lastMessage = text;
        conv.lastTime = timeStr;
        conv.unread = (conv.unread || 0) + 1;

        var messagesEl = document.querySelector('.chat-messages');
        messagesEl.innerHTML += '<div class="message incoming">' +
          '<div class="msg-content">' + escHtml(text) + '</div>' +
          '<div class="msg-time">' + formatChatTime(timeStr) + '</div>' +
        '</div>';
        messagesEl.scrollTop = messagesEl.scrollHeight;

        // Update sidebar last message
        var contact = document.querySelector('.chat-contact[data-conv-id="' + conv.id + '"] .last-msg');
        if (contact) contact.innerText = text;
      }, delay);
    }

    function formatChatTime(isoStr) {
      var d = new Date(isoStr);
      var h = d.getHours().toString().padStart(2, '0');
      var m = d.getMinutes().toString().padStart(2, '0');
      return h + ':' + m;
    }

    function formatTimeISO(d) {
      return d.getFullYear() + '-' +
        (d.getMonth() + 1).toString().padStart(2, '0') + '-' +
        d.getDate().toString().padStart(2, '0') + 'T' +
        d.getHours().toString().padStart(2, '0') + ':' +
        d.getMinutes().toString().padStart(2, '0') + ':' +
        d.getSeconds().toString().padStart(2, '0');
    }

    function escHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    // Send button
    var sendBtn = document.querySelector('.chat-input-area .btn-primary-editorial');
    var chatInput = document.querySelector('.chat-input-area .input-editorial');
    if (sendBtn) {
      sendBtn.addEventListener('click', sendChatMessage);
    }
    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
      });
    }

    loadChatData();

    // ==========================================
    // PREMIUM DESIGN SYSTEM ANIMATIONS
    // ==========================================

    // Number Count Up helper
    function countUp(el, targetValue, duration = 1200, isCurrency = false, suffix = '') {
        if (!el) return;
        let start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress * (2 - progress); // Ease out quad
            
            const currentValue = start + easeProgress * (targetValue - start);
            
            if (isCurrency) {
                el.innerHTML = Math.round(currentValue).toLocaleString('vi-VN') + 'đ';
            } else {
                el.innerHTML = Math.round(currentValue).toLocaleString('en-US') + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (isCurrency) {
                    el.innerHTML = targetValue.toLocaleString('vi-VN') + 'đ';
                } else {
                    el.innerHTML = targetValue.toLocaleString('en-US') + suffix;
                }
            }
        }

        requestAnimationFrame(update);
    }

    // Circular ESG Score Progress Animation
    function animateEsgScore(targetValue) {
        const circle = document.getElementById('esg-progress-circle');
        const numEl = document.getElementById('esg-score-num');
        if (!circle || !numEl) return;

        // Reset
        circle.style.strokeDashoffset = '251.2';
        numEl.innerText = '0';

        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const targetOffset = circumference - (targetValue / 100) * circumference;

        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            circle.style.strokeDashoffset = targetOffset;
        }, 100);

        let currentValue = 0;
        const duration = 1500;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = targetValue / steps;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                numEl.innerText = Math.round(targetValue);
                clearInterval(timer);
            } else {
                numEl.innerText = Math.round(currentValue);
            }
        }, stepTime);
    }

    // Dashboard data store (loaded from seller.json)
    let dashboardData = null;
    let currentMonthKey = '2026-07';

    // Load seller.json and init dashboard
    function loadDashboardData() {
        ajaxGetJSON('../datasets/seller.json', function(data) {
            dashboardData = data;
            if (dashboardData && dashboardData.dashboard && dashboardData.dashboard.months) {
                applyMonth(currentMonthKey, true);
                populateMonthDropdown();
            }
        }, function() {
            // Fallback: keep original hardcoded values if JSON fails
            initHardcodedDashboard();
        });
    }

    function getMonthData(key) {
        if (!dashboardData || !dashboardData.dashboard || !dashboardData.dashboard.months) return null;
        return dashboardData.dashboard.months.find(function(m) { return m.key === key; }) || null;
    }

    function applyMonth(key, initial) {
        const monthData = getMonthData(key);
        if (!monthData) return;

        currentMonthKey = key;
        const s = monthData.stats;
        const c = monthData.charts;

        // Update date label
        const labelEl = document.getElementById('date-picker-label');
        if (labelEl) labelEl.textContent = monthData.label;

        // Update stats with animation
        const statRevenueEl = document.getElementById('stat-revenue');
        const statOrdersEl = document.getElementById('stat-orders');
        const statCo2MitigationEl = document.getElementById('stat-co2-mitigation');
        const statEnvEl = document.getElementById('stat-environment');
        const statRevenueTrend = document.getElementById('stat-revenue-trend');
        const statOrdersTrend = document.getElementById('stat-orders-trend');
        const statCo2Trend = document.getElementById('stat-co2-trend');
        const statEnvTrend = document.getElementById('stat-environment-trend');

        if (statRevenueEl) countUp(statRevenueEl, s.revenue, initial ? 1200 : 600, true);
        if (statOrdersEl) countUp(statOrdersEl, s.orders, initial ? 1200 : 600, false);
        if (statCo2MitigationEl) countUp(statCo2MitigationEl, -s.co2_saved, initial ? 1200 : 600, false, ' Kg CO<sub>2</sub>');
        if (statEnvEl) statEnvEl.innerHTML = '-' + s.co2_saved + ' Kg CO<sub>2</sub>';
        if (statRevenueTrend) statRevenueTrend.textContent = s.revenue_trend + ' vs tháng trước';
        if (statOrdersTrend) statOrdersTrend.textContent = s.orders_trend;
        if (statCo2Trend) statCo2Trend.textContent = s.co2_trend;
        if (statEnvTrend) statEnvTrend.textContent = 'Từ ' + s.environment_products + ' sản phẩm Upcycling';

        // Update ESG score
        if (window.animateEsgScore) window.animateEsgScore(s.esg_score);

        // Update state variables for simulation
        window.currentRevenue = s.revenue;
        window.currentOrders = s.orders;
        window.currentCO2 = s.co2_saved;

        // Update charts
        if (window.revenueChart && c) {
            const activeTab = document.querySelector('.chart-tab.active');
            const period = activeTab ? activeTab.getAttribute('data-period') : 'weekly';
            const revKey = 'revenue_' + period;
            const labels = period === 'weekly'
                ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
                : ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
            window.revenueChart.data.labels = labels;
            window.revenueChart.data.datasets[0].data = c[revKey] || [];
            window.revenueChart.update('active');
        }
        if (window.categoryChart && c) {
            window.categoryChart.data.datasets[0].data = c.category || [];
            window.categoryChart.update('active');
        }
        if (window.environmentalChart && c) {
            window.environmentalChart.data.datasets[0].data = c.environmental_products || [];
            window.environmentalChart.data.datasets[1].data = c.environmental_co2 || [];
            window.environmentalChart.update('active');
        }

        // Update active class in dropdown
        document.querySelectorAll('.month-option').forEach(function(el) {
            el.classList.toggle('active', el.dataset.key === key);
        });
    }

    function populateMonthDropdown() {
        const body = document.getElementById('month-dropdown-body');
        if (!body || !dashboardData || !dashboardData.dashboard || !dashboardData.dashboard.months) return;
        body.innerHTML = dashboardData.dashboard.months.map(function(m) {
            return '<div class="month-option' + (m.key === currentMonthKey ? ' active' : '') + '" data-key="' + m.key + '">' + m.label + '</div>';
        }).join('');
        body.querySelectorAll('.month-option').forEach(function(el) {
            el.addEventListener('click', function() {
                const key = this.dataset.key;
                if (key && key !== currentMonthKey) {
                    applyMonth(key, false);
                }
                document.getElementById('month-dropdown').classList.remove('open');
            });
        });
    }

    // Date picker toggle
    const datePickerBtn = document.getElementById('date-picker-btn');
    const monthDropdown = document.getElementById('month-dropdown');
    if (datePickerBtn && monthDropdown) {
        datePickerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            monthDropdown.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (!datePickerBtn.contains(e.target) && !monthDropdown.contains(e.target)) {
                monthDropdown.classList.remove('open');
            }
        });
    }

    // Initial load
    loadDashboardData();

    // Fallback if JSON fails
    function initHardcodedDashboard() {
        const statRevenueEl = document.getElementById('stat-revenue');
        const statOrdersEl = document.getElementById('stat-orders');
        const statCo2MitigationEl = document.getElementById('stat-co2-mitigation');
        if (statRevenueEl) countUp(statRevenueEl, 12500000, 1200, true);
        if (statOrdersEl) countUp(statOrdersEl, 24, 1200, false);
        if (statCo2MitigationEl) countUp(statCo2MitigationEl, -45, 1200, false, ' Kg CO<sub>2</sub>');
        if (window.animateEsgScore) animateEsgScore(85);
    }

    // Hero Visual Mouse Parallax Effect (Gentle)
    const heroVisual = document.querySelector('.hero-visual');
    const parallaxImg = document.getElementById('hero-parallax-img');
    if (heroVisual && parallaxImg) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = (x / (rect.width / 2)) * 12; // Max 12px
            const moveY = (y / (rect.height / 2)) * 12;
            
            parallaxImg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        heroVisual.addEventListener('mouseleave', () => {
            parallaxImg.style.transform = 'translate(0, 0)';
        });
    }

    // Expose animateEsgScore and countUp globally for simulation ticks
    window.animateEsgScore = animateEsgScore;
    window.countUp = countUp;

    // ==========================================
    // CHART.JS DASHBOARD CHARTS (MINIMALIST)
    // ==========================================
    
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.color = '#70685E'; // Text Secondary
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(46, 42, 37, 0.9)'; // Dark warm charcoal
        Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: '500' };
        Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 16;
        
        // Chart 1: Revenue Over Time
        const revenueCtx = document.getElementById('revenueChart');
        window.revenueChart = null;
        
        if (revenueCtx) {
            window.revenueChart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                    datasets: [{
                        label: 'Doanh Thu (đ)',
                        data: [2800000, 3200000, 3800000, 2700000],
                        borderColor: '#557A46',
                        backgroundColor: 'rgba(85, 122, 70, 0.04)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#557A46',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(0, 0, 0, 0.03)' },
                            border: { display: false },
                            ticks: {
                                callback: function(value) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                }
                            }
                        },
                        x: { 
                            grid: { display: false },
                            border: { display: false }
                        }
                    }
                }
            });
        }
        
        // Chart tabs interaction — now reads from current month data
        const chartTabs = document.querySelectorAll('.chart-tabs .chart-tab');
        chartTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                chartTabs.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                if (window.revenueChart && dashboardData) {
                    const monthData = getMonthData(currentMonthKey);
                    if (monthData && monthData.charts) {
                        const revKey = 'revenue_' + period;
                        const labels = period === 'weekly'
                            ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4']
                            : ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
                        window.revenueChart.data.labels = labels;
                        window.revenueChart.data.datasets[0].data = monthData.charts[revKey] || [];
                        window.revenueChart.update('active');
                    }
                }
            });
        });
        
        // Chart 2: Product Category Sales (Donut Chart)
        const categoryCtx = document.getElementById('categoryChart');
        window.categoryChart = null;
        if (categoryCtx) {
            window.categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Áo Khoác', 'Balo & Túi', 'Áo Thun', 'Quần', 'Giày', 'Phụ Kiện Khác'],
                    datasets: [{
                        data: [30, 25, 20, 10, 8, 7],
                        backgroundColor: ['#557A46', '#8EA66B', '#AFC28B', '#6B8E5A', '#4A7A56', '#EFE7DA'],
                        borderWidth: 3,
                        borderColor: '#FBF9F5',
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 10,
                                padding: 12,
                                font: { size: 11 }
                            }
                        }
                    },
                    cutout: '75%'
                }
            });
        }
        
        // Chart 3: Environmental Impact & Upcycling Collection Stats
        const environmentalCtx = document.getElementById('environmentalChart');
        window.environmentalChart = null;
        if (environmentalCtx) {
            window.environmentalChart = new Chart(environmentalCtx, {
                type: 'bar',
                data: {
                    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                    datasets: [
                        {
                            label: 'Số Lượng Đồ Cũ Thu Nhận (chiếc)',
                            data: [12, 18, 15, 22],
                            backgroundColor: '#8EA66B',
                            borderRadius: 8,
                            barPercentage: 0.4
                        },
                        {
                            label: 'Lượng CO₂ Tiết Kiệm (Kg CO₂)',
                            data: [25, 38, 30, 45],
                            backgroundColor: '#AFC28B',
                            borderRadius: 8,
                            barPercentage: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: { boxWidth: 10, font: { size: 11 } }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(0, 0, 0, 0.03)' },
                            border: { display: false },
                            beginAtZero: true
                        },
                        x: { 
                            grid: { display: false },
                            border: { display: false }
                        }
                    }
                }
            });
        }
        
        // ==========================================
        // REAL-TIME SIMULATOR LOGIC
        // ==========================================
        
        // State values (matching current mock data)
        window.currentRevenue = 12500000;
        window.currentOrders = 24;
        window.currentCO2 = 45;
        let simulationInterval = null;
        let isSimulating = false;
        
        // Target DOM Elements
        const statRevenueEl = document.getElementById('stat-revenue');
        const statOrdersEl = document.getElementById('stat-orders');
        const statEnvironmentEl = document.getElementById('stat-environment');
        const statCo2MitigationEl = document.getElementById('stat-co2-mitigation');
        const btnToggleSimulation = document.getElementById('btn-toggle-simulation');
        const indicatorEl = btnToggleSimulation ? btnToggleSimulation.querySelector('.realtime-indicator') : null;
        const textSimulationEl = document.getElementById('simulation-text');
        const toastContainer = document.getElementById('toast-container');
        
        // Load mock orders via AJAX from datasets/products.json
        var mockOrders = [];

        ajaxGetJSON(
            '../datasets/products.json',
            function (data) {
                mockOrders = data.mockOrders || [];
            },
            function (err) {
                console.warn('[seller.js] AJAX failed, using inline fallback:', err.message);
                mockOrders = [
                    { customer: 'Trần Thị Mai', product: 'Upcycled Denim Totebag', price: 350000, co2: 1.8, gc: 35 },
                    { customer: 'Lê Hoàng Long', product: 'Reworked Denim Jacket', price: 1200000, co2: 4.5, gc: 120 },
                    { customer: 'Phạm Minh Đức', product: 'Restyled Flannel Shirt', price: 450000, co2: 2.2, gc: 45 },
                    { customer: 'Vũ Thanh Hằng', product: 'Patchwork Denim Jeans', price: 850000, co2: 3.1, gc: 85 },
                    { customer: 'Nguyễn Duy Anh', product: 'Corduroy Upcycled Cap', price: 250000, co2: 1.2, gc: 25 },
                    { customer: 'Đặng Kim Ngân', product: 'Refashioned Summer Dress', price: 680000, co2: 2.8, gc: 68 }
                ];
            }
        );
        
        // Toast alert function
        function showToast(title, message, icon = 'shopping-bag') {
            if (!toastContainer) return;
            
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            
            let iconHtml = '';
            if (icon.startsWith('fa-') || icon === 'fa-shopping-bag' || icon === 'fa-plug' || icon === 'fa-pause') {
                let lucideName = 'shopping-bag';
                if (icon.includes('plug')) lucideName = 'zap';
                else if (icon.includes('pause')) lucideName = 'pause';
                iconHtml = `<i data-lucide="${lucideName}"></i>`;
            } else {
                iconHtml = `<i data-lucide="${icon}"></i>`;
            }
            
            toast.innerHTML = `
                <div class="toast-icon">${iconHtml}</div>
                <div class="toast-body">
                    <div class="toast-title">${title}</div>
                    <div class="toast-msg">${message}</div>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                toast.classList.add('closing');
                toast.addEventListener('animationend', () => {
                    toast.remove();
                });
            }, 5000);
        }
        
        // Number Formatter helper
        function formatVND(num) {
            return num.toLocaleString('vi-VN') + 'đ';
        }
        
        // Main simulation tick
        function runSimulationStep() {
            // 1. Pick a random order
            const randOrder = mockOrders[Math.floor(Math.random() * mockOrders.length)];
            
            // 2. Increment stats
            window.currentRevenue += randOrder.price;
            window.currentOrders += 1;
            window.currentCO2 += randOrder.co2;
            
            // 3. Update dashboard text with brief flash effect
            if (statRevenueEl) {
                statRevenueEl.innerText = formatVND(window.currentRevenue);
                flashElement(statRevenueEl);
            }
            if (statOrdersEl) {
                statOrdersEl.innerText = window.currentOrders.toString();
                flashElement(statOrdersEl);
            }
            if (statEnvironmentEl) {
                statEnvironmentEl.innerHTML = `-${window.currentCO2.toFixed(1)} Kg CO<sub>2</sub>`;
                flashElement(statEnvironmentEl);
            }
            if (statCo2MitigationEl) {
                statCo2MitigationEl.innerHTML = `-${window.currentCO2.toFixed(1)} Kg CO<sub>2</sub>`;
                flashElement(statCo2MitigationEl);
            }
            
            // 4. Update ESG circular progress
            let currentEsgVal = Math.min(99, 85 + Math.floor((window.currentCO2 - 45) / 2));
            if (window.animateEsgScore) {
                window.animateEsgScore(currentEsgVal);
            }
            
            // 5. Update Charts
            // For revenue chart: append the price to the last active period
            if (window.revenueChart) {
                const lastIndex = window.revenueChart.data.datasets[0].data.length - 1;
                if (lastIndex >= 0) {
                    window.revenueChart.data.datasets[0].data[lastIndex] += randOrder.price;
                    window.revenueChart.update('active');
                }
            }
            
            // For product chart: update category shares based on item type
            if (window.categoryChart) {
                let catIndex = 5; // default = Phụ Kiện Khác
                const p = randOrder.product;
                if (p.includes('Jacket')) catIndex = 0;
                else if (p.includes('Bag') || p.includes('Totebag')) catIndex = 1;
                else if (p.includes('Shirt') || p.includes('Tops')) catIndex = 2;
                else if (p.includes('Jeans') || p.includes('Pant')) catIndex = 3;
                else if (p.includes('Shoe') || p.includes('Cap') || p.includes('Scarf')) catIndex = 4;
                
                window.categoryChart.data.datasets[0].data[catIndex] += 1;
                window.categoryChart.update('active');
            }
            
            // For environmental chart: update the latest bar
            if (window.environmentalChart) {
                const lastIndex = window.environmentalChart.data.labels.length - 1;
                if (lastIndex >= 0) {
                    window.environmentalChart.data.datasets[0].data[lastIndex] += 1; // 1 more piece of clothing
                    window.environmentalChart.data.datasets[1].data[lastIndex] += randOrder.co2; // added CO2 savings
                    window.environmentalChart.update('active');
                }
            }
            
            // 6. Trigger Toast alert
            showToast(
                `Đơn Hàng Mới Từ ${randOrder.customer}`,
                `Mua <strong>${randOrder.product}</strong> - Trị giá: <strong>${formatVND(randOrder.price)}</strong> (Tiết kiệm ${randOrder.co2} Kg CO₂)`,
                'shopping-bag'
            );
        }
        
        // Quick flash animation for DOM elements
        function flashElement(el) {
            el.style.transition = 'none';
            el.style.color = 'var(--primary-green)';
            el.style.transform = 'scale(1.05)';
            setTimeout(() => {
                el.style.transition = 'all 0.4s ease';
                el.style.color = '';
                el.style.transform = '';
            }, 300);
        }
        
        // Toggle Simulator button click handler
        if (btnToggleSimulation) {
            btnToggleSimulation.addEventListener('click', () => {
                isSimulating = !isSimulating;
                
                if (isSimulating) {
                    // Turn on
                    btnToggleSimulation.classList.add('btn-primary-editorial');
                    if (indicatorEl) indicatorEl.classList.add('active');
                    if (textSimulationEl) textSimulationEl.innerText = 'Mô Phỏng Live: BẬT';
                    
                    showToast('Mô Phỏng Hoạt Động', 'Hệ thống đã kích hoạt luồng đơn hàng thời gian thực giả lập.', 'zap');
                    
                    // Immediately trigger one step, then loop every 12 seconds
                    runSimulationStep();
                    simulationInterval = setInterval(runSimulationStep, 12000);
                } else {
                    // Turn off
                    btnToggleSimulation.classList.remove('btn-primary-editorial');
                    if (indicatorEl) indicatorEl.classList.remove('active');
                    if (textSimulationEl) textSimulationEl.innerText = 'Mô Phỏng Live: Tắt';
                    
                    showToast('Mô Phỏng Đã Dừng', 'Đã tạm dừng mô phỏng đơn hàng tự động.', 'pause');
                    
                    if (simulationInterval) {
                        clearInterval(simulationInterval);
                        simulationInterval = null;
                    }
                }
            });
        }
        
        // Report download button logic - Export CSV
        const btnDownload = document.getElementById('btn-download-report');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const originalText = btnDownload.innerHTML;
                btnDownload.innerHTML = 'Đang xuất CSV <i class="fas fa-spinner fa-spin"></i>';
                btnDownload.disabled = true;
                
                setTimeout(() => {
                    btnDownload.innerHTML = originalText;
                    btnDownload.disabled = false;
                    
                    // Generate CSV content
                    let csvContent = "\ufeff"; // UTF-8 BOM
                    csvContent += "Chỉ Số,Giá Trị\n";
                    csvContent += `Tổng Doanh Thu (VND),${window.currentRevenue}\n`;
                    csvContent += `Đơn Hàng Mới,${window.currentOrders}\n`;
                    csvContent += `Giảm Phát CO2 (Kg CO2),${window.currentCO2.toFixed(1)}\n\n`;
                    
                    csvContent += "Lịch Sử Doanh Thu Theo Tuần\n";
                    csvContent += "Tuần,Doanh Thu (VND),Số Lượng Thu Nhận Đồ Cũ (Chiếc),CO2 Tiết Kiệm (Kg)\n";
                    
                    const monthData = getMonthData(currentMonthKey);
                    const weekRevenues = (monthData && monthData.charts) ? monthData.charts.revenue_weekly : [2800000, 3200000, 3800000, 2700000];
                    const weekItems = (monthData && monthData.charts) ? monthData.charts.environmental_products : [12, 18, 15, 22];
                    const weekCO2 = (monthData && monthData.charts) ? monthData.charts.environmental_co2 : [25, 38, 30, 45];
                    const weekLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
                    
                    for(let i = 0; i < 4; i++) {
                        let rev = weekRevenues[i] || 0;
                        const baseRevenue = monthData ? monthData.stats.revenue : 12500000;
                        if (i === 3) {
                            rev += Math.max(0, (window.currentRevenue - baseRevenue));
                        }
                        csvContent += `${weekLabels[i]},${rev},${weekItems[i] || 0},${weekCO2[i] || 0}\n`;
                    }
                    
                    // Trigger Download
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Bao_Cao_Doanh_Thu_ReFashion_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showToast(
                        'Tải Báo Cáo Thành Công',
                        `Bản báo cáo CSV đã được tải xuống máy của bạn!`,
                        'fa-file-csv'
                    );
                }, 1000);
            });
        }
        // Logo Drag and Drop & File Upload Logic
        const logoUploadArea = document.getElementById('logo-upload-area');
        const logoFileInput = document.getElementById('logo-file-input');
        const logoPlaceholder = document.getElementById('logo-upload-placeholder');
        const logoPreviewContainer = document.getElementById('logo-upload-preview-container');
        const logoPreviewImg = document.getElementById('logo-preview-img');
        const avatarImg = document.querySelector('.user-profile img.avatar');

        if (logoUploadArea && logoFileInput) {
            // Click to trigger file input
            logoUploadArea.addEventListener('click', () => {
                logoFileInput.click();
            });

            // Handle file selection
            logoFileInput.addEventListener('change', (e) => {
                handleLogoFile(e.target.files[0]);
            });

            // Drag and drop event listeners
            ['dragenter', 'dragover'].forEach(eventName => {
                logoUploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logoUploadArea.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                logoUploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logoUploadArea.classList.remove('drag-over');
                }, false);
            });

            logoUploadArea.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const file = dt.files[0];
                handleLogoFile(file);
            }, false);
        }

        // Initialize logo from localStorage or default asset
        const LOGO_STORAGE_KEY = 'refashion_store_logo_' + sellerStore;
        const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY) || sellerStoreLogo;
        if (storedLogo) {
            if (logoPreviewImg) logoPreviewImg.src = storedLogo;
            if (logoPlaceholder) logoPlaceholder.style.display = 'none';
            if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
            if (avatarImg) avatarImg.src = storedLogo;
        }

        // Dynamically set shop name & description based on logged in seller
        if (user) {
            const headerUserName = document.querySelector('.user-profile .user-name');
            if (headerUserName) headerUserName.textContent = user.store || 'Eco Wear';
            const profileShopName = document.querySelector('#profile form.profile-form input[type="text"]');
            if (profileShopName) profileShopName.value = user.store || 'Eco Wear';
            
            const profileShopDesc = document.querySelector('#profile form.profile-form textarea');
            if (profileShopDesc) {
                const storeDescriptions = {
                    'Eco Wear': 'Chuyên tái chế đồ Denim cũ thành các sản phẩm thời trang cao cấp độc bản.',
                    'Hemp & Bamboo': 'Gian hàng cung cấp các sản phẩm làm từ sợi gai dầu và tre tự nhiên bền vững.',
                    'Retro Chic': 'Thời trang tái sinh mang phong cách cổ điển, hoài niệm và thân thiện với Trái Đất.',
                    'Denim Craft': 'Xưởng may thủ công biến tấu denim cũ thành các tác phẩm thời trang thời thượng.',
                    'Green Thread': 'Thời trang hữu cơ kết hợp thêu tay thủ công tinh tế và nguyên bản.',
                    'Zero Waste': 'Cam kết không rác thải dệt may, tối ưu hóa nguyên liệu thừa thành các phụ kiện độc đáo.'
                };
                profileShopDesc.value = storeDescriptions[user.store] || 'Gian hàng thời trang tái sinh bền vững.';
            }
        }

        function handleLogoFile(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    localStorage.setItem(LOGO_STORAGE_KEY, base64data);
                    // Show preview
                    if (logoPreviewImg) logoPreviewImg.src = base64data;
                    if (logoPlaceholder) logoPlaceholder.style.display = 'none';
                    if (logoPreviewContainer) logoPreviewContainer.style.display = 'flex';
                    // Update user profile avatar image top-right
                    if (avatarImg) avatarImg.src = base64data;
                    
                    showToast('Đã Cập Nhật Logo', 'Logo cửa hàng đã được cập nhật thành công (nội bộ).', 'fa-image');
                };
            } else {
                showToast('Lỗi Tệp Tin', 'Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, v.v.)', 'fa-exclamation-circle');
            }
        }

        // Product Modal & Dynamic Publishing Logic
        const addProductModal = document.getElementById('add-product-modal');
        const btnAddProduct = document.getElementById('btn-add-product');
        const btnCloseProductModal = document.getElementById('btn-close-product-modal');
        const btnCancelProductModal = document.getElementById('btn-cancel-product-modal');
        const addProductForm = document.getElementById('add-product-form');
        
        // Modal Upload fields
        // Product data store (managed in memory + localStorage)
        var user = RefashionAuth._getUser();
        var sellerStore = (user && user.store) ? user.store : 'Eco Wear';
        var sellerStoreLogo = (user && user.storeLogo) ? user.storeLogo : '../images/store_eco_wear.png';
        const STORAGE_KEY = 'refashion_seller_products_' + sellerStore;
        let productsData = [];
        let editingProductId = null;
        let nextProductId = 200;
        let uploadedImages = [];
        let uploadedSizeChart = '';

        function loadProductsFromStorage() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    productsData = JSON.parse(stored);
                    var maxId = 200;
                    productsData.forEach(function(p) { if (p.id >= maxId) maxId = p.id + 1; });
                    nextProductId = maxId;
                    return true;
                }
            } catch(e) {}
            return false;
        }

        function saveProductsToStorage() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(productsData));
            } catch(e) {}
        }

        // Image gallery rendering
        function renderImageGallery() {
            const gallery = document.getElementById('product-image-gallery');
            if (!gallery) return;
            if (uploadedImages.length === 0) {
                gallery.innerHTML = '';
                return;
            }
            gallery.innerHTML = uploadedImages.map(function(img, i) {
                return '<div class="gallery-item"><img src="' + img + '" alt="Ảnh ' + (i+1) + '"><button type="button" class="btn-remove-img" data-index="' + i + '">&times;</button></div>';
            }).join('');
            gallery.querySelectorAll('.btn-remove-img').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.dataset.index);
                    uploadedImages.splice(idx, 1);
                    renderImageGallery();
                });
            });
        }

        // Size chart helpers
        function renderSizeChartPreview() {
            var preview = document.getElementById('sizechart-preview');
            var img = document.getElementById('sizechart-preview-img');
            var placeholder = document.getElementById('sizechart-upload-placeholder');
            if (!preview || !img || !placeholder) return;
            if (uploadedSizeChart) {
                img.src = uploadedSizeChart;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
            } else {
                preview.style.display = 'none';
                placeholder.style.display = 'block';
            }
        }

        // Size chart upload handler
        (function() {
            var area = document.getElementById('sizechart-upload-area');
            var fileInput = document.getElementById('sizechart-file-input');
            if (area && fileInput) {
                area.addEventListener('click', function(e) {
                    if (e.target.closest('.btn-remove-img')) return;
                    fileInput.click();
                });
                fileInput.addEventListener('change', function(e) {
                    var file = e.target.files[0];
                    if (file && file.type.startsWith('image/')) {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = function() {
                            uploadedSizeChart = reader.result;
                            renderSizeChartPreview();
                        };
                    }
                    fileInput.value = '';
                });
            }
            var removeBtn = document.getElementById('btn-remove-sizechart');
            if (removeBtn) {
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    uploadedSizeChart = '';
                    renderSizeChartPreview();
                });
            }
        })();

        // Variant helpers
        function getVariantRows() {
            return document.querySelectorAll('#variant-list .variant-row');
        }

        function collectVariants() {
            const rows = getVariantRows();
            const result = [];
            rows.forEach(function(row) {
                const size = row.querySelector('.variant-size').value.trim();
                const color = row.querySelector('.variant-color').value.trim();
                const price = parseInt(row.querySelector('.variant-price').value);
                const stock = parseInt(row.querySelector('.variant-stock').value);
                if (size || color) {
                    result.push({ size: size, color: color, price: isNaN(price) ? 0 : price, stock: isNaN(stock) ? 0 : stock });
                }
            });
            return result;
        }

        function renderVariants(variants) {
            const list = document.getElementById('variant-list');
            if (!list) return;
            if (!variants || variants.length === 0) {
                list.innerHTML = '<div class="variant-row"><input type="text" class="input-editorial variant-size" placeholder="Size" style="width:80px;"><input type="text" class="input-editorial variant-color" placeholder="Màu" style="flex:1;"><input type="number" class="input-editorial variant-price" placeholder="Giá (đ)" min="0" style="width:120px;"><input type="number" class="input-editorial variant-stock" placeholder="Kho" min="0" style="width:90px;"><button type="button" class="btn-remove-variant" style="display:none;">&times;</button></div>';
                return;
            }
            list.innerHTML = variants.map(function(v, i) {
                return '<div class="variant-row"><input type="text" class="input-editorial variant-size" placeholder="Size" value="' + v.size + '" style="width:80px;"><input type="text" class="input-editorial variant-color" placeholder="Màu" value="' + v.color + '" style="flex:1;"><input type="number" class="input-editorial variant-price" placeholder="Giá (đ)" value="' + v.price + '" min="0" style="width:120px;"><input type="number" class="input-editorial variant-stock" placeholder="Kho" value="' + v.stock + '" min="0" style="width:90px;"><button type="button" class="btn-remove-variant" data-idx="' + i + '">&times;</button></div>';
            }).join('');
            list.querySelectorAll('.btn-remove-variant').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const variants = collectVariants();
                    const idx = parseInt(this.dataset.idx);
                    variants.splice(idx, 1);
                    renderVariants(variants);
                });
            });
        }

        function renderProductsTable() {
            const tableBody = document.getElementById('products-table-body');
            if (!tableBody) return;

            if (productsData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-secondary);">Chưa có sản phẩm nào</td></tr>';
                return;
            }

            tableBody.innerHTML = productsData.map(function(p) {
                const firstImg = p.images && p.images.length > 0 ? p.images[0] : '';
                const imgStyle = firstImg
                    ? 'background-image: url(\'' + firstImg + '\');'
                    : 'background-color: ' + (p.imgColor || '#557A46') + ';';
                const totalStock = p.variants ? p.variants.reduce(function(sum, v) { return sum + (v.stock || 0); }, 0) : (p.stock || 0);
                const varCount = p.variants ? p.variants.length : 0;
                const varText = varCount > 0 ? varCount + ' phân loại' : (p.variant || 'Tiêu chuẩn');
                const minPrice = p.variants && p.variants.length > 0
                    ? Math.min.apply(null, p.variants.map(function(v) { return v.price || 0; }))
                    : (p.price || 0);
                const maxPrice = p.variants && p.variants.length > 0
                    ? Math.max.apply(null, p.variants.map(function(v) { return v.price || 0; }))
                    : (p.price || 0);
                const priceText = minPrice === maxPrice
                    ? minPrice.toLocaleString('vi-VN') + 'đ'
                    : minPrice.toLocaleString('vi-VN') + 'đ - ' + maxPrice.toLocaleString('vi-VN') + 'đ';

                return '<tr>' +
                    '<td><div class="product-info-cell"><div class="product-img" style="' + imgStyle + '"></div><div><strong>' + p.name + '</strong><br><span class="text-sans">' + varText + '</span></div></div></td>' +
                    '<td class="text-mono">' + priceText + '</td>' +
                    '<td>' + totalStock + '</td>' +
                    '<td><span class="badge-editorial badge-accent">Đang Bán</span></td>' +
                    '<td><button class="icon-btn edit-product" data-id="' + p.id + '"><i class="fas fa-edit"></i></button><button class="icon-btn delete delete-product" data-id="' + p.id + '"><i class="fas fa-trash"></i></button></td>' +
                '</tr>';
            }).join('');

            tableBody.querySelectorAll('.edit-product').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    openEditModal(parseInt(this.dataset.id));
                });
            });

            tableBody.querySelectorAll('.delete-product').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    productsData = productsData.filter(function(p) { return p.id !== id; });
                    saveProductsToStorage();
                    renderProductsTable();
                    showToast('Đã Xóa Sản Phẩm', 'Sản phẩm đã được xóa khỏi danh sách.', 'fa-trash');
                });
            });
        }

        function openEditModal(id) {
            const product = productsData.find(function(p) { return p.id === id; });
            if (!product) return;

            editingProductId = id;

            document.getElementById('new-product-name').value = product.name;
            document.getElementById('new-product-category').value = product.category;
            document.getElementById('new-product-desc').value = product.description || '';

            uploadedImages = product.images ? product.images.slice() : [];
            renderImageGallery();

            uploadedSizeChart = product.sizeChart || '';
            renderSizeChartPreview();

            renderVariants(product.variants || []);

            const modalTitle = addProductModal.querySelector('.modal-header h3');
            if (modalTitle) modalTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Cập Nhật';

            addProductModal.classList.add('show');
        }

        function resetModal() {
            editingProductId = null;
            if (addProductForm) addProductForm.reset();
            uploadedImages = [];
            uploadedSizeChart = '';
            renderImageGallery();
            renderSizeChartPreview();
            renderVariants([]);
            const modalTitle = addProductModal.querySelector('.modal-header h3');
            if (modalTitle) modalTitle.textContent = 'Đăng Sản Phẩm Mới';
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Đăng Bán Ngay';
        }

        // Multi-image upload handler
        const productUploadArea = document.getElementById('product-upload-area');
        const productFileInput = document.getElementById('product-file-input');

        function handleProductImages(files) {
            if (!files || files.length === 0) return;
            var remaining = files.length;
            for (var fi = 0; fi < files.length; fi++) {
                (function(file) {
                    if (file.type.startsWith('image/')) {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = function() {
                            uploadedImages.push(reader.result);
                            remaining--;
                            if (remaining === 0) {
                                renderImageGallery();
                            }
                        };
                    } else {
                        remaining--;
                    }
                })(files[fi]);
            }
        }

        if (productUploadArea && productFileInput) {
            productUploadArea.addEventListener('click', function() {
                productFileInput.click();
            });

            productFileInput.addEventListener('change', function(e) {
                handleProductImages(e.target.files);
                productFileInput.value = '';
            });

            ['dragenter', 'dragover'].forEach(function(eventName) {
                productUploadArea.addEventListener(eventName, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    productUploadArea.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(function(eventName) {
                productUploadArea.addEventListener(eventName, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    productUploadArea.classList.remove('drag-over');
                }, false);
            });

            productUploadArea.addEventListener('drop', function(e) {
                var dt = e.dataTransfer;
                handleProductImages(dt.files);
            }, false);
        }

        // Add variant row button
        var btnAddVariant = document.getElementById('btn-add-variant');
        if (btnAddVariant) {
            btnAddVariant.addEventListener('click', function() {
                var variants = collectVariants();
                variants.push({ size: '', color: '', price: 0, stock: 0 });
                renderVariants(variants);
            });
        }

        if (btnAddProduct && addProductModal) {
            btnAddProduct.addEventListener('click', function() {
                resetModal();
                addProductModal.classList.add('show');
            });

            var closeModal = function() {
                addProductModal.classList.remove('show');
                resetModal();
            };

            if (btnCloseProductModal) btnCloseProductModal.addEventListener('click', closeModal);
            if (btnCancelProductModal) btnCancelProductModal.addEventListener('click', closeModal);

            addProductModal.addEventListener('click', function(e) {
                if (e.target === addProductModal) {
                    closeModal();
                }
            });

            if (addProductForm) {
                addProductForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    var prodName = document.getElementById('new-product-name').value;
                    var prodCategory = document.getElementById('new-product-category').value;
                    var prodDesc = document.getElementById('new-product-desc').value;
                    var variants = collectVariants();

                    var colors = ['#1e3a8a', '#831843', '#065f46', '#701a75', '#557A46'];

                    if (editingProductId) {
                        var idx = productsData.findIndex(function(p) { return p.id === editingProductId; });
                        if (idx !== -1) {
                            productsData[idx].name = prodName;
                            productsData[idx].category = prodCategory;
                            productsData[idx].description = prodDesc;
                            productsData[idx].variants = variants;
                            if (uploadedImages.length > 0) {
                                productsData[idx].images = uploadedImages.slice();
                            }
                            if (uploadedSizeChart) {
                                productsData[idx].sizeChart = uploadedSizeChart;
                            }
                            saveProductsToStorage();
                            renderProductsTable();
                            closeModal();
                            showToast('Cập Nhật Thành Công', 'Sản phẩm <strong>' + prodName + '</strong> đã được cập nhật.', 'fa-check-circle');
                        }
                    } else {
                        var newProduct = {
                            id: nextProductId++,
                            name: prodName,
                            category: prodCategory,
                            description: prodDesc,
                            variants: variants,
                            images: uploadedImages.slice(),
                            sizeChart: uploadedSizeChart || '',
                            imgColor: colors[Math.floor(Math.random() * colors.length)],
                            store: sellerStore,
                            status: 'Active'
                        };
                        productsData.unshift(newProduct);
                        saveProductsToStorage();
                        renderProductsTable();

                        if (window.categoryChart) {
                            var catMap = { jacket: 0, backpack: 1, tshirt: 2, pants: 3, shoes: 4 };
                            var catIndex = catMap[prodCategory] !== undefined ? catMap[prodCategory] : 5;
                            window.categoryChart.data.datasets[0].data[catIndex] += 1;
                            window.categoryChart.update('active');
                        }

                        closeModal();
                        showToast('Đăng Sản Phẩm Thành Công', 'Sản phẩm <strong>' + prodName + '</strong> đã được đăng bán.', 'fa-check-circle');
                    }
                });
            }
        }

        // Initialize products
        if (!loadProductsFromStorage()) {
            var tableBody = document.getElementById('products-table-body');
            if (tableBody) {
                ajaxGetJSON('../datasets/products.json', function(data) {
                    var list = data.products || [];
                    productsData = list.filter(function(p) { return p.store === sellerStore; }).map(function(p) {
                        return {
                            id: parseInt(p.id.replace('P', '')),
                            name: p.name,
                            category: p.category,
                            description: p.description || '',
                            variants: p.variants || [{ size: '', color: p.variant || 'Tiêu chuẩn', price: p.price, stock: p.stock }],
                            images: p.image ? [p.image] : [],
                            imgColor: '#557A46',
                            store: p.store,
                            status: p.status
                        };
                    });
                    nextProductId = 200;
                    saveProductsToStorage();
                    renderProductsTable();
                }, function() {
                    productsData = [];
                    renderProductsTable();
                });
            }
        } else {
            renderProductsTable();
        }
    }
});

/* ==========================================================
   SECONDHAND MARKET — Seller Browse & Purchase
   ========================================================== */
function renderShMarket(filterOverride) {
    const grid = document.getElementById('sh-market-grid');
    if (!grid) return;

    // Get shared data (same localStorage key as buyer side)
    let items = [];
    try {
        items = JSON.parse(localStorage.getItem('refashion_secondhand_items')) || [];
    } catch(e) { items = []; }

    // If empty, try seeding from JSON
    if (items.length === 0) {
        ajaxGetJSON('../datasets/secondhand.json', function(data) {
            const seeded = data.items || [];
            localStorage.setItem('refashion_secondhand_items', JSON.stringify(seeded));
            _renderShMarketGrid(grid, seeded);
            _bindShMarketFilters();
        }, function() {
            grid.innerHTML = '<div class="sh-market-empty"><i data-lucide="package-open"></i><p>Chưa có đồ secondhand nào từ cộng đồng.</p></div>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
        return;
    }

    _renderShMarketGrid(grid, items);
    _bindShMarketFilters();
}

function _renderShMarketGrid(grid, allItems) {
    const searchEl = document.getElementById('sh-market-search');
    const categoryEl = document.getElementById('sh-market-category');
    const conditionEl = document.getElementById('sh-market-condition');

    const q = (searchEl ? searchEl.value : '').toLowerCase().trim();
    const cat = categoryEl ? categoryEl.value : 'all';
    const cond = conditionEl ? conditionEl.value : 'all';

    let filtered = allItems.filter(item => {
        if (cat !== 'all' && item.category !== cat) return false;
        if (cond !== 'all' && item.condition !== cond) return false;
        if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
        return item.status !== 'sold'; // hide sold items
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="sh-market-empty">
                <i data-lucide="search-x"></i>
                <h3 style="font-family:var(--font-serif);font-size:18px;margin-bottom:8px;">Không tìm thấy sản phẩm</h3>
                <p style="font-size:13px;color:var(--text-secondary);">Thử thay đổi bộ lọc hoặc tìm kiếm khác nhé.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    const conditionLabels = { new: 'Còn rất mới', good: 'Còn tốt', reusable: 'Hơi cũ' };

    grid.innerHTML = filtered.map(item => {
        const priceText = item.price === 0 ? 'Miễn Phí' : item.price.toLocaleString('vi-VN') + ' đ';
        const priceClass = item.price === 0 ? 'sh-market-price free' : 'sh-market-price';
        const condLabel = conditionLabels[item.condition] || 'Đã Qua Dùng';
        const condClass = 'sh-market-condition ' + (item.condition || 'reusable');
        const sellerInitial = (item.sellerName || 'A').charAt(0).toUpperCase();

        return `
        <div class="sh-market-card">
            <img src="${item.image}" alt="${item.name}" class="sh-market-img" onerror="this.src='../images/sh_denim_shirt.png'">
            <div class="sh-market-body">
                <div class="sh-market-top">
                    <h3 class="sh-market-name">${item.name}</h3>
                    <span class="${condClass}">${condLabel}</span>
                </div>
                <p class="sh-market-desc">${item.description}</p>
                <div class="sh-market-meta">
                    <span class="${priceClass}">${priceText}</span>
                    <span class="sh-market-location">
                        <i data-lucide="map-pin" style="width:11px;height:11px;"></i>
                        ${item.location}
                    </span>
                </div>
                <div class="sh-market-actions">
                    <button class="btn-call" onclick="window.open('tel:${item.phone}')">
                        <i data-lucide="phone" style="width:13px;height:13px;"></i> Gọi Điện
                    </button>
                    <button class="btn-buy" onclick="shMarketContact('${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.phone}', ${item.price})">
                        <i data-lucide="shopping-bag" style="width:13px;height:13px;"></i> Thu Mua
                    </button>
                </div>
                <div class="sh-market-seller">
                    <div class="sh-seller-avatar">${sellerInitial}</div>
                    <span>${item.sellerName || 'Người bán ẩn danh'} · ${item.date}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function _bindShMarketFilters() {
    const searchEl = document.getElementById('sh-market-search');
    const categoryEl = document.getElementById('sh-market-category');
    const conditionEl = document.getElementById('sh-market-condition');
    const grid = document.getElementById('sh-market-grid');
    if (!grid) return;

    function rerender() {
        let items = [];
        try { items = JSON.parse(localStorage.getItem('refashion_secondhand_items')) || []; } catch(e) {}
        _renderShMarketGrid(grid, items);
    }

    if (searchEl && !searchEl._shBound) {
        searchEl.addEventListener('input', rerender);
        searchEl._shBound = true;
    }
    if (categoryEl && !categoryEl._shBound) {
        categoryEl.addEventListener('change', rerender);
        categoryEl._shBound = true;
    }
    if (conditionEl && !conditionEl._shBound) {
        conditionEl.addEventListener('change', rerender);
        conditionEl._shBound = true;
    }
}

function shMarketContact(itemId, itemName, phone, price) {
    const priceText = price === 0 ? 'Miễn Phí' : price.toLocaleString('vi-VN') + ' đ';
    
    // Mark item as pending in localStorage
    try {
        const items = JSON.parse(localStorage.getItem('refashion_secondhand_items')) || [];
        const idx = items.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            items[idx].status = 'sold';
            localStorage.setItem('refashion_secondhand_items', JSON.stringify(items));
        }
    } catch(e) {}

    // Toast notification
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-icon"><i data-lucide="check-circle-2"></i></div>
            <div class="toast-body">
                <div class="toast-title">Đã Liên Hệ Thu Mua Thành Công!</div>
                <div class="toast-msg"><strong>${itemName}</strong> · Giá: <strong>${priceText}</strong> · SĐT: ${phone}</div>
            </div>
        `;
        toastContainer.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => { toast.classList.add('closing'); toast.addEventListener('animationend', () => toast.remove()); }, 5000);
    }

    // Re-render grid to remove the purchased item
    setTimeout(() => renderShMarket(), 300);
}

/* ==========================================================
   NOTIFICATION SYSTEM (Bell Icon)
   ========================================================== */
(function() {
    const notifList = [];
    let notifId = 0;
    let unreadCount = 0;

    const badge = document.getElementById('bell-badge');
    const dropdown = document.getElementById('notif-dropdown');
    const dropdownBody = document.getElementById('notif-dropdown-body');
    const bellBtn = document.getElementById('bell-btn');
    const markReadBtn = document.getElementById('notif-mark-read');

    function updateBadge() {
        if (!badge) return;
        badge.textContent = unreadCount;
        badge.classList.toggle('show', unreadCount > 0);
    }

    function renderDropdown() {
        if (!dropdownBody) return;
        if (notifList.length === 0) {
            dropdownBody.innerHTML = '<div class="notif-empty">Chưa có thông báo nào.</div>';
            return;
        }
        dropdownBody.innerHTML = notifList.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notif-item-icon"><i data-lucide="${n.icon}"></i></div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${n.title}</div>
                    <div class="notif-item-msg">${n.msg}</div>
                    <div class="notif-item-time">${n.time}</div>
                </div>
            </div>
        `).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Click to mark as read
        dropdownBody.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                const n = notifList.find(x => x.id === id);
                if (n && !n.read) {
                    n.read = true;
                    unreadCount = Math.max(0, unreadCount - 1);
                    updateBadge();
                    this.classList.remove('unread');
                }
            });
        });
    }

    window.addNotification = function(title, msg, icon) {
        icon = icon || 'bell';
        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        notifList.unshift({ id: ++notifId, title, msg, icon, time, read: false });
        unreadCount++;
        updateBadge();
        renderDropdown();
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const wrapper = document.querySelector('.bell-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    // Toggle dropdown on bell click
    if (bellBtn) {
        bellBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
    }

    // Mark all as read
    if (markReadBtn) {
        markReadBtn.addEventListener('click', function() {
            notifList.forEach(n => n.read = true);
            unreadCount = 0;
            updateBadge();
            renderDropdown();
        });
    }

    // Observe toast-container for new toasts to also push as bell notifications
    const toastObserver = new MutationObserver(function(mutations) {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1 && node.classList.contains('toast-notification')) {
                    const titleEl = node.querySelector('.toast-title');
                    const msgEl = node.querySelector('.toast-msg');
                    const iconEl = node.querySelector('.toast-icon i');
                    if (titleEl && msgEl) {
                        let icon = 'bell';
                        if (iconEl) {
                            const cls = iconEl.getAttribute('data-lucide') || '';
                            icon = cls || 'bell';
                        }
                        window.addNotification(titleEl.textContent, msgEl.innerHTML.replace(/<[^>]*>/g, ''), icon);
                    }
                }
            }
        }
    });

    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastObserver.observe(toastContainer, { childList: true });
    }
})();
