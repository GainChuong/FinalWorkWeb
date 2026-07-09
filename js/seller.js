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
    renderFooter('footer-container');

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
      var local = localStorage.getItem('refashion_shared_orders');
      if (local) {
        ordersData = JSON.parse(local);
        updateOrderTabCounts();
        renderOrders();
      } else {
        ajaxGetJSON(
          '../datasets/order.json',
          function (data) {
            ordersData = data.orders || [];
            localStorage.setItem('refashion_shared_orders', JSON.stringify(ordersData));
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

      var returnsCount = ordersData.filter(function (o) { return o.status === 'return_pending' || o.status === 'disputed' || o.status === 'refunded'; }).length;
      var returnsEl = document.getElementById('count-returns');
      if (returnsEl) returnsEl.textContent = returnsCount;
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
      return num.toLocaleString('en-US') + ' VND';
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
        case 'return_pending':
          actions = `
            <button class="btn-editorial order-action-dispute" style="height:38px;padding:0 18px;font-size:12px;border-color:var(--danger);color:var(--danger);">Khiếu Nại</button>
            <button class="btn-editorial btn-primary-editorial order-action-accept-refund" style="height:38px;padding:0 18px;font-size:12px;">Đồng Ý Hoàn Tiền</button>
          `;
          break;
        case 'disputed':
          actions = `<span style="font-size:12px;color:var(--text-secondary);font-style:italic;"><i class="fa-solid fa-gavel"></i> Chờ Admin xử lý khiếu nại...</span>`;
          break;
        case 'refunded':
          actions = `<span style="font-size:12px;color:#557A46;font-weight:700;"><i class="fa-solid fa-arrow-rotate-left"></i> Đã hoàn tiền cho người mua</span>`;
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
        } else if (currentOrderStatus === 'returns') {
          if (o.status !== 'return_pending' && o.status !== 'disputed' && o.status !== 'refunded') return false;
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
          var imageHtml = item.image ? '<img src="' + item.image + '" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">' : getProductIcon(item.name);
          return '<div class="order-product-item">' +
            '<div class="order-product-img">' + imageHtml + '</div>' +
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
            '<span><i data-lucide="user" style="width:12px;height:12px;"></i> ' + (order.customer ? order.customer.name : 'Khách Hàng Ảo') + '</span>' +
            '<span><i data-lucide="phone" style="width:12px;height:12px;"></i> ' + (order.customer ? order.customer.phone : '09xxxx') + '</span>' +
            '<span><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ' + (order.customer ? order.customer.address : 'Auto-generated') + '</span>' +
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
      container.querySelectorAll('.order-action-accept-refund').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          if (confirm('Bạn đồng ý hoàn tiền? Khách hàng sẽ nhận lại tiền và đơn hàng chuyển sang trạng thái Đã Hoàn Tiền.')) {
            updateOrderStatus(card, 'refunded');
          }
        });
      });
      container.querySelectorAll('.order-action-dispute').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var card = e.target.closest('.order-card');
          var modal = document.getElementById('disputeModal');
          var submitBtn = document.getElementById('submitDisputeBtn');
          var cancelBtn = document.getElementById('cancelDisputeBtn');
          var closeBtn = document.getElementById('closeDisputeModal');
          var reasonInput = document.getElementById('disputeReasonInput');

          if (modal) {
            modal.style.display = 'flex';
            reasonInput.value = ''; 
            
            var newSubmitBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

            newSubmitBtn.addEventListener('click', function() {
              if (reasonInput.value.trim() === '') {
                alert('Vui lòng nhập lý do khiếu nại.');
                return;
              }
              modal.style.display = 'none';
              updateOrderStatus(card, 'disputed');
            });

            var closeModal = function() { modal.style.display = 'none'; };
            cancelBtn.onclick = closeModal;
            closeBtn.onclick = closeModal;
          } else {
            if (confirm('Bạn muốn khiếu nại yêu cầu trả hàng này lên Admin?')) {
              updateOrderStatus(card, 'disputed');
            }
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
    // AUTO SIMULATION FOR SELLER
    // ==========================================
    function simulateNewOrder() {
      var allOrders = [];
      try { allOrders = JSON.parse(localStorage.getItem('refashion_shared_orders')) || ordersData; } catch(e) { allOrders = ordersData; }
      if (!allOrders || allOrders.length === 0) return;
      var randIndex = Math.floor(Math.random() * allOrders.length);
      var newOrder = JSON.parse(JSON.stringify(allOrders[randIndex]));
      newOrder.id = 'ORD-SIM-' + Math.floor(Math.random() * 9999);
      newOrder.status = 'pending';
      newOrder.createdAt = new Date().toISOString();
      newOrder.customer = { name: "Khách Ảo " + Math.floor(Math.random()*100), phone: "090" + Math.floor(Math.random()*10000000), address: "Auto-generated Address" };
      
      // Randomize items quantity to vary total
      if (newOrder.items && newOrder.items.length > 0) {
        var newTotal = 0;
        newOrder.items.forEach(function(it) {
          it.qty = Math.floor(Math.random() * 3) + 1; // 1 to 3
          newTotal += it.price * it.qty;
        });
        newOrder.total = newTotal;
      }
      
      allOrders.unshift(newOrder);
      localStorage.setItem('refashion_shared_orders', JSON.stringify(allOrders));
      
      if (dashboardData && dashboardData.dashboard && dashboardData.dashboard.months) {
        var m = dashboardData.dashboard.months.find(function(mo) { return mo.key === currentMonthKey; });
        if (m) {
          m.stats.orders += 1;
          m.stats.revenue += (newOrder.total || 0);
          applyMonth(currentMonthKey, false);
        }
      }

      // Update UI
      loadOrders();
      
      var toastContainer = document.getElementById('toast-container');
      if (toastContainer) {
        var toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = '<div class="toast-icon" style="background:#557A46;color:white;"><i data-lucide="bell"></i></div>' +
          '<div class="toast-body">' +
            '<div class="toast-title">New Order Simulated</div>' +
            '<div class="toast-msg">Order <strong>#' + newOrder.id + '</strong> just arrived!</div>' +
          '</div>';
        toastContainer.appendChild(toast);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(function () {
          toast.classList.add('closing');
          toast.addEventListener('animationend', function () { toast.remove(); });
        }, 5000);
      }
    }

    // Trigger simulation every 5 seconds automatically
    setInterval(simulateNewOrder, 5000);

    // Also poll for changes from other tabs/admin
    setInterval(function() {
      var local = localStorage.getItem('refashion_shared_orders');
      if (local) {
        var parsed = JSON.parse(local);
        if (parsed.length !== ordersData.length) {
          loadOrders();
        }
      }
    }, 3000);

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
        var currentText = el.textContent.replace(/[^\d.-]/g, '');
        if (currentText && !isNaN(currentText)) {
            start = parseFloat(currentText);
        }
        if (start === targetValue) {
            if (isCurrency) {
                el.innerHTML = Math.round(targetValue).toLocaleString('en-US') + ' VND';
            } else {
                el.innerHTML = Math.round(targetValue).toLocaleString('en-US') + suffix;
            }
            return;
        }
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress * (2 - progress); // Ease out quad
            
            const currentValue = start + easeProgress * (targetValue - start);
            
            if (isCurrency) {
                el.innerHTML = Math.round(currentValue).toLocaleString('en-US') + ' VND';
            } else {
                el.innerHTML = Math.round(currentValue).toLocaleString('en-US') + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (isCurrency) {
                    el.innerHTML = targetValue.toLocaleString('en-US') + ' VND';
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
            dashboardData = data['Eco Wear'] || data['ecowear@refashion.vn'] || Object.values(data)[0];
            if (dashboardData && dashboardData.dashboard && dashboardData.dashboard.months) {
                applyMonth(currentMonthKey, true);
                populateMonthDropdown();
            } else {
                initHardcodedDashboard();
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
    loadSubscriptionPlan();

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
    
    function loadSubscriptionPlan() {
        ajaxGetJSON('../datasets/shop_sub.json', function(data) {
            if (data && data.subscriptions) {
                var currentEmail = 'seller_eco@refashion.vn'; 
                var mySub = data.subscriptions.find(function(s) { return s.email === currentEmail || s.store === 'Eco Wear'; });
                if (mySub) {
                    var localPlan = localStorage.getItem('refashion_seller_plan');
                    var localFee = localStorage.getItem('refashion_seller_fee');
                    var planName = localPlan || mySub.plan;
                    var planFee = localFee ? parseInt(localFee) : mySub.monthlyFee;
                    
                    var planEl = document.getElementById('stat-sub-plan');
                    var feeEl = document.getElementById('stat-sub-fee');
                    if(planEl) planEl.textContent = planName;
                    if(feeEl) feeEl.textContent = planFee.toLocaleString('vi-VN') + 'đ / mo';
                }
            }
        });
    }

    window.openPlanModal = function() {
        var modal = document.getElementById('modal-change-plan');
        if(modal) modal.style.display = 'flex';
    };

    window.submitPlanChange = function(planName, fee) {
        localStorage.setItem('refashion_seller_plan', planName);
        localStorage.setItem('refashion_seller_fee', fee.toString());
        
        var planEl = document.getElementById('stat-sub-plan');
        var feeEl = document.getElementById('stat-sub-fee');
        if(planEl) planEl.textContent = planName;
        if(feeEl) feeEl.textContent = fee.toLocaleString('vi-VN') + 'đ / mo';
        
        var modal = document.getElementById('modal-change-plan');
        if(modal) modal.style.display = 'none';
        
        var toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            var toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerHTML = '<div class="toast-icon" style="background:var(--primary-green);color:white;"><i data-lucide="check-circle"></i></div>' +
              '<div class="toast-body">' +
                '<div class="toast-title">Plan Updated</div>' +
                '<div class="toast-msg">Successfully switched to <strong>' + planName + '</strong> plan.</div>' +
              '</div>';
            toastContainer.appendChild(toast);
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(function() { toast.classList.add('hide'); setTimeout(function(){ toast.remove(); }, 300); }, 3000);
        }
    };

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
            return num.toLocaleString('en-US') + ' VND';
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
                    productsData.forEach(function(p) { var numId = parseInt(String(p.id).replace(/\D/g, "")) || 0; if (numId >= maxId) maxId = numId + 1; });
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
                list.innerHTML = '<div class="variant-row"><input type="text" class="input-editorial variant-size" placeholder="Size" style="width:80px;"><input type="text" class="input-editorial variant-color" placeholder="Color" style="flex:1;"><input type="number" class="input-editorial variant-price" placeholder="Price" min="0" style="width:120px;"><input type="number" class="input-editorial variant-stock" placeholder="Stock" min="0" style="width:90px;"><button type="button" class="btn-remove-variant" style="display:none;">&times;</button></div>';
                return;
            }
            list.innerHTML = variants.map(function(v, i) {
                return '<div class="variant-row"><input type="text" class="input-editorial variant-size" placeholder="Size" value="' + v.size + '" style="width:80px;"><input type="text" class="input-editorial variant-color" placeholder="Color" value="' + v.color + '" style="flex:1;"><input type="number" class="input-editorial variant-price" placeholder="Price" value="' + v.price + '" min="0" style="width:120px;"><input type="number" class="input-editorial variant-stock" placeholder="Stock" value="' + v.stock + '" min="0" style="width:90px;"><button type="button" class="btn-remove-variant" data-idx="' + i + '">&times;</button></div>';
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
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-secondary);">No products found</td></tr>';
                return;
            }

            tableBody.innerHTML = productsData.map(function(p) {
                const firstImg = p.images && p.images.length > 0 ? p.images[0] : '';
                const imgStyle = firstImg
                    ? 'background-image: url(\'' + firstImg + '\');'
                    : 'background-color: ' + (p.imgColor || '#557A46') + ';';
                const totalStock = p.variants ? p.variants.reduce(function(sum, v) { return sum + (v.stock || 0); }, 0) : (p.stock || 0);
                const varCount = p.variants ? p.variants.length : 0;
                const varText = varCount > 0 ? varCount + ' variants' : (p.variant || 'Standard');
                const minPrice = p.variants && p.variants.length > 0
                    ? Math.min.apply(null, p.variants.map(function(v) { return v.price || 0; }))
                    : (p.price || 0);
                const maxPrice = p.variants && p.variants.length > 0
                    ? Math.max.apply(null, p.variants.map(function(v) { return v.price || 0; }))
                    : (p.price || 0);
                const priceText = minPrice === maxPrice
                    ? minPrice.toLocaleString('en-US') + ' VND'
                    : minPrice.toLocaleString('vi-VN') + 'đ - ' + maxPrice.toLocaleString('en-US') + ' VND';

                return '<tr>' +
                    '<td><div class="product-info-cell"><div class="product-img" style="' + imgStyle + '"></div><div><strong>' + p.name + '</strong><br><span class="text-sans">' + varText + '</span></div></div></td>' +
                    '<td class="text-mono">' + priceText + '</td>' +
                    '<td>' + totalStock + '</td>' +
                    '<td><span class="badge-editorial badge-accent">Active</span></td>' +
                    '<td><button class="icon-btn edit-product" data-id="' + p.id + '"><i class="fas fa-edit"></i></button><button class="icon-btn delete delete-product" data-id="' + p.id + '"><i class="fas fa-trash"></i></button></td>' +
                '</tr>';
            }).join('');

            tableBody.querySelectorAll('.edit-product').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    openEditModal(this.dataset.id);
                });
            });

            tableBody.querySelectorAll('.delete-product').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const id = this.dataset.id;
                    productsData = productsData.filter(function(p) { return String(p.id) !== String(id); });
                    saveProductsToStorage();
                    renderProductsTable();
                    showToast('Product Deleted', 'The product has been removed from the list.', 'fa-trash');
                });
            });
        }

        function openEditModal(id) {
            const product = productsData.find(function(p) { return String(p.id) === String(id); });
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
            if (modalTitle) modalTitle.textContent = 'Edit Product';
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Update';

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
            if (modalTitle) modalTitle.textContent = 'Add New Product';
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Publish Product';
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
                        var idx = productsData.findIndex(function(p) { return String(p.id) === String(editingProductId); });
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
                            showToast('Update Successful', 'Product <strong>' + prodName + '</strong> has been updated.', 'fa-check-circle');
                        }
                    } else {
                        var newProduct = {
                            id: 'P' + nextProductId++,
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
                        showToast('Product Added Successfully', 'Product <strong>' + prodName + '</strong> has been published.', 'fa-check-circle');
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
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            description: p.description || '',
                            variants: p.variants || [{ size: '', color: p.variant || 'Standard', price: p.price, stock: p.stock }],
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
                    <button class="btn-call" onclick="openChatWith('${item.sellerName || 'Người bán'}')">
                        <i data-lucide="message-circle" style="width:13px;height:13px;"></i> Contact
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

window.openChatWith = function(sellerName) {
    // Navigate to chat view
    const chatNavBtn = document.querySelector('.nav-btn[data-target="chat"]');
    if (chatNavBtn) {
        chatNavBtn.click();
    }
    
    // Update chat interface
    const chatHeader = document.querySelector('.chat-header strong');
    const chatHeaderBadge = document.querySelector('.chat-header .badge-editorial');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInputArea = document.querySelector('.chat-input-area');
    
    if (chatHeader) chatHeader.textContent = sellerName;
    if (chatHeaderBadge) {
        chatHeaderBadge.textContent = "Online";
        chatHeaderBadge.className = "badge-editorial badge-accent";
    }
    
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; color: var(--text-secondary); font-size: 12px;">
                You are now chatting with ${sellerName}
            </div>
            <div style="display:flex; justify-content:flex-start; margin-bottom:12px;">
                <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:10px 14px; max-width:70%;">
                    <p style="margin:0; font-size:13px; font-family:var(--font-sans);">Hi there! Are you interested in my secondhand item?</p>
                    <span style="font-size:10px; color:var(--text-secondary); display:block; text-align:right; margin-top:4px;">Just now</span>
                </div>
            </div>
        `;
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    if (chatInputArea) {
        chatInputArea.style.display = 'flex';
        // Basic enter to send mock
        const input = chatInputArea.querySelector('input');
        const sendBtn = chatInputArea.querySelector('button');
        if (input && sendBtn && !sendBtn.hasAttribute('data-bound')) {
            const sendMessage = () => {
                const val = input.value.trim();
                if (!val) return;
                chatMessages.innerHTML += `
                    <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
                        <div style="background:var(--primary-green); color:white; border-radius:12px; padding:10px 14px; max-width:70%;">
                            <p style="margin:0; font-size:13px; font-family:var(--font-sans);">${val}</p>
                            <span style="font-size:10px; color:rgba(255,255,255,0.7); display:block; text-align:right; margin-top:4px;">Just now</span>
                        </div>
                    </div>
                `;
                input.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            };
            sendBtn.setAttribute('data-bound', 'true');
            sendBtn.addEventListener('click', sendMessage);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }
    }
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
                const id = this.dataset.id;
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

/* ==================== VTON STUDIO ==================== */

var sellerVtonState = {
  selectedModelId: null,
  userUploadedImage: null,
  selectedGarmentId: null,
  currentProductClothFile: null,
  currentProductGarmentType: 'upper',
  currentProductName: '',
  currentProductPrice: 0,
  currentProductPriceStr: '',
  currentProductImage: '',
  resultImageUrl: null,
  simulateMode: true
};

var SELLER_VTON_PRESET_MODELS = [
  { id: 'model_m1', file: 'MEN-Denim-id_00000080-01_7_additional.jpg', name: 'Male Fair Skin', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000080-01_7_additional.jpg' },
  { id: 'model_m2', file: 'MEN-Denim-id_00000089-02_7_additional.jpg', name: 'Male 2', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000089-02_7_additional.jpg' },
  { id: 'model_m3', file: 'MEN-Denim-id_00000089-26_7_additional.jpg', name: 'Male 3', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000089-26_7_additional.jpg' },
  { id: 'model_m4', file: 'MEN-Denim-id_00000182-01_7_additional.jpg', name: 'Male 4', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000182-01_7_additional.jpg' },
  { id: 'model_f1', file: 'WOMEN-Blouses_Shirts-id_00000183-01_1_front.jpg', name: 'Female 1', gender: 'female',
    url: '/images/products/WOMEN-Blouses_Shirts-id_00000183-01_1_front.jpg' },
  { id: 'model_f2', file: 'WOMEN-Blouses_Shirts-id_00000001-02_1_front.jpg', name: 'Female 2', gender: 'female',
    url: '/images/products/WOMEN-Blouses_Shirts-id_00000001-02_1_front.jpg' },
  { id: 'model_f3', file: 'WOMEN-Sweaters-id_00005890-05_1_front.jpg', name: 'Female 3', gender: 'female',
    url: '/images/products/WOMEN-Sweaters-id_00005890-05_1_front.jpg' }
];

function sellerGetActiveModelImageUrl() {
  if (sellerVtonState.userUploadedImage) return sellerVtonState.userUploadedImage;
  var m = SELLER_VTON_PRESET_MODELS.find(function(x) { return x.id === sellerVtonState.selectedModelId; });
  return m ? m.url : SELLER_VTON_PRESET_MODELS[0].url;
}

function sellerGetGarmentImageUrl() {
  return sellerVtonState.currentProductClothFile || '';
}

function sellerGetGarmentType() {
  var t = (sellerVtonState.currentProductGarmentType || 'upper').toLowerCase();
  if (t === 'lower') return 'lower';
  if (t === 'overall') return 'overall';
  return 'upper';
}

function sellerOpenVtonStudio() {
  var product = {};
  // Try to find the first image in the gallery as the product image
  var gallery = document.getElementById("product-image-gallery");
  if (gallery) {
    var firstImg = gallery.querySelector("img");
    if (firstImg) product.clothFile = firstImg.src;
  }
  if (!product.clothFile) {
    product.clothFile = "../images/products/MEN-Denim-id_00000080-01_7_additional.jpg";
  }

  
  sellerVtonState.currentProductClothFile = product.clothFile;
  sellerVtonState.currentProductGarmentType = product.garmentType || product.category || 'upper';
  sellerVtonState.currentProductName = product.name || '';
  sellerVtonState.currentProductPrice = product.price || 0;
  sellerVtonState.currentProductPriceStr = product.priceStr || product.price || '';
  sellerVtonState.currentProductImage = product.image || '';
  sellerVtonState.resultImageUrl = null;

  var modal = document.getElementById('seller-vton-modal');
  if (modal) modal.classList.add('show');

  sellerRenderVtonModels();
  sellerRenderVtonGarment();
  sellerResetVtonResult();

  // Auto-select first model
  if (!sellerVtonState.selectedModelId) {
    sellerSelectVtonModel(SELLER_VTON_PRESET_MODELS[0].id);
  } else {
    sellerSelectVtonModel(sellerVtonState.selectedModelId);
  }

  // Load Hugging Face token from local .env if available
  sellerLoadHfTokenFromEnv();
}

function sellerCloseVtonStudio() {
  var modal = document.getElementById('seller-vton-modal');
  if (modal) modal.classList.remove('show');
}

async function sellerLoadHfTokenFromEnv() {
  try {
    var response = await fetch('/.env');
    if (!response.ok) return;
    var text = await response.text();
    var match = text.match(/HF_TOKEN\s*=\s*([^\r\n]+)/);
    if (match && match[1]) {
      var token = match[1].trim();
      var input = document.getElementById('seller-vton-api-token');
      if (input) {
        input.value = token;
      }
      // If we got a valid token, automatically disable simulation mode
      var simCheck = document.getElementById('seller-vton-simulate-check');
      if (simCheck) {
        simCheck.checked = false;
        sellerVtonState.simulateMode = false;
      }
    }
  } catch (e) {
    console.warn('Failed to load token from .env:', e);
  }
}

function sellerRenderVtonModels() {
  var list = document.getElementById('seller-vton-models-list');
  if (!list) return;
  var html = '';
  SELLER_VTON_PRESET_MODELS.forEach(function(m) {
    var active = m.id === sellerVtonState.selectedModelId ? ' active' : '';
    html += '<div class="vton-model-card' + active + '" onclick="sellerSelectVtonModel(\'' + m.id + '\')" title="' + m.name + '">' +
              '<img class="vton-model-thumb" src="' + m.url + '" alt="' + m.name + '" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
            '</div>';
  });
  list.innerHTML = html;
}

function sellerRenderVtonGarment() {
  var src = sellerVtonState.currentProductClothFile || '';
  // Update workspace garment panel
  var wsGarment = document.getElementById('seller-vton-ws-garment-img');
  if (wsGarment) wsGarment.src = src;

  var list = document.getElementById('seller-vton-garments-list');
  if (list) {
    list.innerHTML = '<div class="vton-garment-thumb active">' +
      '<img src="' + src + '" alt="' + sellerVtonState.currentProductName + '" onerror="this.src=\'../images/store_logo.png\'" />' +
      '<span>' + sellerVtonState.currentProductName + '</span>' +
      '</div>';
  }
}

function sellerSelectVtonModel(modelId) {
  sellerVtonState.selectedModelId = modelId;
  sellerVtonState.userUploadedImage = null;
  sellerRenderVtonModels();
  var wsModel = document.getElementById('seller-vton-ws-model-img');
  if (wsModel) wsModel.src = sellerGetActiveModelImageUrl();
}

function sellerHandleVtonUserUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    sellerVtonState.userUploadedImage = e.target.result;
    sellerVtonState.selectedModelId = null;
    sellerRenderVtonModels();
    var wsModel = document.getElementById('seller-vton-ws-model-img');
    if (wsModel) wsModel.src = e.target.result;
    showToast('✅ Your photo uploaded!');
  };
  reader.readAsDataURL(file);
}

function sellerToggleSimulateMode(checkbox) {
  sellerVtonState.simulateMode = checkbox ? checkbox.checked : true;
}

function sellerResetVtonResult() {
  sellerSetVtonState('empty');
  sellerVtonState.resultImageUrl = null;
}

function sellerSetVtonState(state) {
  var empty = document.getElementById('seller-vton-state-empty');
  var loading = document.getElementById('seller-vton-state-loading');
  var success = document.getElementById('seller-vton-state-success');
  if (empty) empty.style.display = state === 'empty' ? '' : 'none';
  if (loading) loading.style.display = state === 'loading' ? '' : 'none';
  if (success) success.style.display = state === 'success' ? '' : 'none';
}

function sellerLogVton(msg) {
  // console logging removed for end-user clarity
}


function sellerSetVtonProgress(pct, text) {
  var fill = document.getElementById('seller-vton-progress-fill');
  var label = document.getElementById('seller-vton-progress-text');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = text || pct + '%';
}

function sellerStartVtonInference() {
  var modelUrl = sellerGetActiveModelImageUrl();
  var garmentUrl = sellerGetGarmentImageUrl();
  if (!modelUrl) { showToast('Please select a model!'); return; }
  if (!garmentUrl) { showToast('Garment image not found.'); return; }

  sellerSetVtonState('loading');
  sellerSetVtonProgress(0, '0%');
  sellerRunRealVtonAPI(modelUrl, garmentUrl);
}

function sellerRunSimulationMode(modelUrl, garmentUrl) {
  sellerLogVton('Starting Simulation Engine...');
  sellerSetVtonProgress(10, '10%');
  setTimeout(function() { sellerLogVton('Analyzing model body shape...'); sellerSetVtonProgress(30, '30%'); }, 400);
  setTimeout(function() { sellerLogVton('Mapping garment points to body...'); sellerSetVtonProgress(55, '55%'); }, 900);
  setTimeout(function() { sellerLogVton('Generating final image...'); sellerSetVtonProgress(80, '80%'); }, 1500);
  setTimeout(function() {
    sellerLogVton('Complete! Displaying result...');
    sellerSetVtonProgress(100, '100%');
    // Simulate overlay: show garment on model using CSS blending/actual product image
    sellerShowVtonSuccess(modelUrl, sellerVtonState.currentProductImage || garmentUrl);
  }, 2200);
}

async function sellerRunRealVtonAPI(modelUrl, garmentUrl) {
  sellerLogVton('Connecting to Hugging Face Space (IDM-VTON)...');
  sellerSetVtonProgress(5, '5%');
  try {
    var hfToken = '';
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.hfToken) {
      hfToken = AI_REC_SYSTEM.hfToken;
    } else {
      try {
        var res = await fetch('/.env');
        var text = await res.text();
        var match = text.match(/HF_TOKEN\s*=\s*([^\s]+)/);
        if (match && match[1]) {
          hfToken = match[1].trim();
        }
      } catch(e) {}
    }
    var hfSpace = 'Gain1109/IDM-VTON';

    sellerLogVton('Loading Gradio Client module...');
    var { client, upload_files } = await import('https://cdn.jsdelivr.net/npm/@gradio/client@0.15.1/+esm');

    sellerLogVton('Connecting to Space: ' + hfSpace);
    sellerSetVtonProgress(15, '15%');
    var connectOpts = hfToken ? { hf_token: hfToken } : {};
    var clientInstance = await client(hfSpace, connectOpts);

    sellerLogVton('Loading and preparing images...');
    sellerSetVtonProgress(30, '30%');
    var modelBlob = await sellerGetBlobFromUrl(modelUrl);
    var garmentBlob = await sellerGetBlobFromUrl(garmentUrl);

    // Convert Blobs to Files so they have filenames and extensions for the Python backend
    var modelFile = new File([modelBlob], 'model.jpg', { type: modelBlob.type || 'image/jpeg' });
    var garmentFile = new File([garmentBlob], 'garment.jpg', { type: garmentBlob.type || 'image/jpeg' });

    sellerLogVton('Uploading model and garment images to Gradio server...');
    sellerSetVtonProgress(40, '40%');
    var uploadResult = await upload_files(clientInstance.config.root, [modelFile, garmentFile], hfToken);
    if (!uploadResult || !uploadResult.files || uploadResult.files.length < 2) {
      throw new Error('Failed to upload images to Gradio server');
    }
    var modelUploadedPath = uploadResult.files[0];
    var garmentUploadedPath = uploadResult.files[1];

    sellerLogVton('Sending inference request...');
    sellerSetVtonProgress(60, '60%');

    var result = await clientInstance.predict('/tryon', [
      { background: { path: modelUploadedPath, orig_name: 'model.jpg' }, layers: [], composite: null },
      { path: garmentUploadedPath, orig_name: 'garment.jpg' },
      sellerVtonState.currentProductName || 'sustainable fashion item',
      true,
      false,
      30,
      42
    ]);

    sellerLogVton('Receiving results from API...');
    sellerSetVtonProgress(90, '90%');

    var resultData = result && result.data;
    var resultImg = null;
    if (resultData && resultData[0]) {
      if (typeof resultData[0] === 'string') {
        resultImg = resultData[0];
      } else if (resultData[0] && resultData[0].url) {
        resultImg = resultData[0].url;
      }
    }

    if (!resultImg) throw new Error('API did not return a result image');

    sellerSetVtonProgress(100, '100%');
    sellerLogVton('AI Try-On complete!');
    sellerShowVtonSuccess(modelUrl, resultImg);

  } catch (err) {
    sellerLogVton('Error: ' + (err.message || String(err)));
    sellerSetVtonProgress(0, '0%');
    showToast('❌ API Error: ' + (err.message || 'Connection failed').substring(0, 80));
    sellerSetVtonState('empty');
  }
}

async function sellerGetBlobFromUrl(url) {
  if (url.startsWith('data:')) {
    var parts = url.split(',');
    var mime = parts[0].split(':')[1].split(';')[0];
    var bytes = Uint8Array.from(atob(parts[1]), function(c) { return c.charCodeAt(0); });
    return new Blob([bytes], { type: mime });
  }
  var response = await fetch(url);
  return response.blob();
}

function sellerShowVtonSuccess(beforeUrl, afterUrl) {
  sellerVtonState.resultImageUrl = afterUrl;
  var beforeImg = document.getElementById('seller-vton-result-before-img');
  var afterImg = document.getElementById('seller-vton-result-after-img');
  if (beforeImg) beforeImg.src = beforeUrl;
  if (afterImg) afterImg.src = afterUrl;
  sellerSetVtonState('success');
  initCompareSlider();
}

function initCompareSlider() {
  var container = document.querySelector('.compare-slider-container');
  var slider = document.getElementById('seller-vton-compare-slider-bar');
  var afterDiv = document.querySelector('.compare-image-after');
  if (!container || !slider || !afterDiv) return;

  // Make sure the after container takes full width so clip-path works across the entire width
  afterDiv.style.width = '100%';
  slider.style.left = '50%';
  afterDiv.style.clipPath = 'inset(0 50% 0 0)';

  var dragging = false;

  function startDrag(e) {
    dragging = true;
    if (e.cancelable) e.preventDefault();
  }

  function stopDrag() {
    dragging = false;
  }

  function drag(e) {
    if (!dragging) return;
    var rect = container.getBoundingClientRect();
    var clientX = e.clientX;
    
    // Support touch events
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
    }
    
    var x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    var pct = (x / rect.width) * 100;
    slider.style.left = pct + '%';
    afterDiv.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
  }

  // Mouse events
  slider.addEventListener('mousedown', startDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('mousemove', drag);

  // Touch events
  slider.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
  document.addEventListener('touchmove', drag, { passive: false });
}

function downloadVtonResult() {
  if (!sellerVtonState.resultImageUrl) { showToast('No result image to save.'); return; }
  var a = document.createElement('a');
  a.href = sellerVtonState.resultImageUrl;
  a.download = 'refashion-tryon-result.jpg';
  a.click();
}

function addVtonProductToCart() {
  var user = RefashionAuth._getUser();
  if (!user) { showToast('Please login to add to cart!'); return; }
  RefashionAuth.addToCart({
    productId: 'z_' + Date.now(),
    name: sellerVtonState.currentProductName,
    price: sellerVtonState.currentProductPrice,
    priceStr: sellerVtonState.currentProductPriceStr,
    image: sellerVtonState.currentProductImage,
    variant: 'M - Default'
  });
  showToast('🛍️ Added "' + sellerVtonState.currentProductName + '" to cart!');
  sellerCloseVtonStudio();
}

// Expose VTON functions globally
window.sellerOpenVtonStudio = sellerOpenVtonStudio;
window.sellerCloseVtonStudio = sellerCloseVtonStudio;
window.sellerSelectVtonModel = sellerSelectVtonModel;
window.sellerHandleVtonUserUpload = sellerHandleVtonUserUpload;
window.sellerToggleSimulateMode = sellerToggleSimulateMode;
window.sellerStartVtonInference = sellerStartVtonInference;
window.downloadVtonResult = downloadVtonResult;
window.addVtonProductToCart = addVtonProductToCart;

// Map Picker Functionality
var mapPickerObj = null;
var mapPickerMarker = null;

function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function() {
    callback();
  };
  document.head.appendChild(script);
}

function openMapPicker() {
  var overlay = document.getElementById('map-picker-overlay');
  if (overlay) overlay.classList.add('show');
  
  loadLeaflet(function() {
    // Default Vietnam coordinates (Da Nang center)
    var defaultLat = 16.047079;
    var defaultLng = 108.206230;
    var defaultZoom = 5;
    
    // Check current address input value
    var currentAddress = document.getElementById('edit-address').value.trim();
    document.getElementById('map-selected-address-text').textContent = currentAddress || 'Not selected';
    document.getElementById('map-search-input').value = currentAddress;

    if (!mapPickerObj) {
      mapPickerObj = L.map('map-picker-canvas').setView([defaultLat, defaultLng], defaultZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapPickerObj);
      
      mapPickerMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapPickerObj);
      
      // Handle map click
      mapPickerObj.on('click', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        updateMapMarker(lat, lng);
      });
      
      // Handle marker drag
      mapPickerMarker.on('dragend', function() {
        var pos = mapPickerMarker.getLatLng();
        updateMapMarker(pos.lat, pos.lng);
      });
    } else {
      mapPickerObj.invalidateSize();
    }

    // Try to geocode current address if it exists, otherwise default to VN center
    if (currentAddress) {
      searchAddressOnMap(currentAddress);
    } else {
      mapPickerObj.setView([defaultLat, defaultLng], defaultZoom);
      mapPickerMarker.setLatLng([defaultLat, defaultLng]);
    }
  });
}

function closeMapPicker() {
  var overlay = document.getElementById('map-picker-overlay');
  if (overlay) overlay.classList.remove('show');
}

function updateMapMarker(lat, lng) {
  if (mapPickerMarker) {
    mapPickerMarker.setLatLng([lat, lng]);
  }
  
  document.getElementById('map-selected-address-text').textContent = 'Determining address...';
  
  var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=vi';
  
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.display_name) {
        document.getElementById('map-selected-address-text').textContent = data.display_name;
      } else {
        document.getElementById('map-selected-address-text').textContent = lat.toFixed(5) + ', ' + lng.toFixed(5);
      }
    })
    .catch(function() {
      document.getElementById('map-selected-address-text').textContent = lat.toFixed(5) + ', ' + lng.toFixed(5);
    });
}

function searchAddressOnMap(queryOverride) {
  var query = queryOverride || document.getElementById('map-search-input').value.trim();
  if (!query) return;
  
  var searchUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&countrycodes=vn&limit=1&accept-language=vi';
  
  document.getElementById('map-selected-address-text').textContent = 'Searching...';
  
  fetch(searchUrl)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.length > 0) {
        var first = data[0];
        var lat = parseFloat(first.lat);
        var lng = parseFloat(first.lon);
        
        if (mapPickerObj && mapPickerMarker) {
          mapPickerObj.setView([lat, lng], 16);
          mapPickerMarker.setLatLng([lat, lng]);
        }
        document.getElementById('map-selected-address-text').textContent = first.display_name;
      } else {
        if (queryOverride) {
          var defaultLat = 16.047079;
          var defaultLng = 108.206230;
          if (mapPickerObj && mapPickerMarker) {
            mapPickerObj.setView([defaultLat, defaultLng], 5);
            mapPickerMarker.setLatLng([defaultLat, defaultLng]);
          }
          document.getElementById('map-selected-address-text').textContent = queryOverride;
        } else {
          document.getElementById('map-selected-address-text').textContent = 'No address found in Vietnam.';
        }
      }
    })
    .catch(function() {
      document.getElementById('map-selected-address-text').textContent = 'Connection error during search.';
    });
}

function confirmMapSelection() {
  var address = document.getElementById('map-selected-address-text').textContent;
  if (address && address !== 'Not selected' && address !== 'Searching...' && address !== 'Determining address...' && address !== 'No address found in Vietnam.' && address !== 'Connection error during search.') {
    document.getElementById('edit-address').value = address;
  }
  closeMapPicker();
}

// Expose map functions globally
window.openMapPicker = openMapPicker;
window.closeMapPicker = closeMapPicker;
window.searchAddressOnMap = searchAddressOnMap;
window.confirmMapSelection = confirmMapSelection;

/* ==================== ADVANCED SEARCH & VOICE SEARCH LOGIC ==================== */
function initAdvancedSearch() {
  var searchInput = document.getElementById('filter-search');
  var voiceBtn = document.getElementById('voice-search-btn');
  var dropdown = document.getElementById('search-suggestions-dropdown');
  if (!searchInput) return;

  if (voiceBtn) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.style.display = 'none';
    } else {
      var recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      var isListening = false;

      recognition.onstart = function() {
        isListening = true;
        voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-bounce" style="color:var(--primary)"></i>';
        searchInput.placeholder = 'Listening... Speak now';
        showToast('🎙️ Microphone active. Speak to search...');
      };

      recognition.onend = function() {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        searchInput.placeholder = 'Search eco-products...';
      };

      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('❌ Microphone permission denied');
        } else {
          showToast('❌ Voice recognition error: ' + event.error);
        }
      };

      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        shopState.searchQuery = transcript;
        shopState.currentPage = 1;
        saveShopState();
        renderShopProducts();

        if (typeof AI_REC_SYSTEM !== 'undefined') {
          AI_REC_SYSTEM.trackSearch(transcript);
        }
        showToast('🎙️ Found: "' + transcript + '"');
      };

      voiceBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isListening) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    }
  }

  function showSuggestions() {
    if (!dropdown) return;

    var history = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.history) {
      history = AI_REC_SYSTEM.profile.history;
    }

    var html = '';

    var keywords = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.keywords) {
      for (var kw in AI_REC_SYSTEM.profile.keywords) {
        if (AI_REC_SYSTEM.profile.keywords[kw] > 0) {
          keywords.push({ kw: kw, weight: AI_REC_SYSTEM.profile.keywords[kw] });
        }
      }
      keywords.sort(function(a, b) { return b.weight - a.weight; });
    }

    if (history.length > 0) {
      html += '<div class="suggestion-group-title">Based on your recent clicks</div>';

      var seenProds = {};
      var count = 0;
      for (var i = 0; i < history.length && count < 4; i++) {
        var hItem = history[i];
        if (seenProds[hItem.productId]) continue;
        seenProds[hItem.productId] = true;
        count++;

        var pImg = 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200';
        if (typeof SHOP_PRODUCTS !== 'undefined') {
          for (var j = 0; j < SHOP_PRODUCTS.length; j++) {
            if (String(SHOP_PRODUCTS[j].id) === String(hItem.productId)) {
              pImg = SHOP_PRODUCTS[j].image;
              break;
            }
          }
        }

        html += '<div class="suggestion-item product-suggestion" data-id="' + hItem.productId + '">' +
                  '<img src="' + pImg + '" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />' +
                  '<div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
                    '<div style="font-weight:600;font-size:0.85rem;color:var(--foreground)">' + hItem.name + '</div>' +
                    '<div style="font-size:0.75rem;color:var(--text-muted)">Recently ' + hItem.action + 'ed</div>' +
                  '</div>' +
                '</div>';
      }
    }

    if (keywords.length > 0) {
      html += '<div class="suggestion-group-title">Suggested Searches</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;padding:0.4rem 1rem 0.6rem 1rem">';
      var maxKeywords = Math.min(6, keywords.length);
      for (var i = 0; i < maxKeywords; i++) {
        html += '<span class="suggestion-tag" data-val="' + keywords[i].kw + '">' + keywords[i].kw + '</span>';
      }
      html += '</div>';
    }

    if (!html) {
      html += '<div style="padding:1rem;text-align:center;font-size:0.85rem;color:var(--text-muted)">Type to search or browse categories below</div>';
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    var prodItems = dropdown.querySelectorAll('.product-suggestion');
    prodItems.forEach(function(el) {
      el.addEventListener('click', function() {
        var pId = this.getAttribute('data-id');
        window.location.href = '/buyer/shop-detail.html?id=' + pId;
      });
    });

    var tags = dropdown.querySelectorAll('.suggestion-tag');
    tags.forEach(function(el) {
      el.addEventListener('click', function() {
        var val = this.getAttribute('data-val');
        searchInput.value = val;
        shopState.searchQuery = val;
        shopState.currentPage = 1;
        saveShopState();
        renderShopProducts();
        if (typeof AI_REC_SYSTEM !== 'undefined') {
          AI_REC_SYSTEM.trackSearch(val);
        }
        dropdown.style.display = 'none';
      });
    });
  }

  searchInput.addEventListener('focus', function() {
    showSuggestions();
  });

  document.addEventListener('click', function(e) {
    if (dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}


/* ==================== ORDER HISTORY PAGE ==================== */
function initOrdersPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/orders.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderOrders('all');
}

function renderOrders(activeTab) {
  activeTab = activeTab || 'all';
  window.buyerActiveTab = activeTab;
  var user = RefashionAuth._getUser();
  var container = document.getElementById('orders-content');
  if (!user || !container) return;

  var orders = RefashionAuth._getOrders();
  
  // Calculate counts for badges
  var allCount = orders.length;
  var pendingCount = orders.filter(function(o) { return o.status === 'pending'; }).length;
  var packedCount = orders.filter(function(o) { return o.status === 'confirmed' || o.status === 'packed'; }).length;
  var shippingCount = orders.filter(function(o) { return o.status === 'shipping'; }).length;
  var completedCount = orders.filter(function(o) { return o.status === 'completed' || o.status === 'delivered'; }).length;
  var cancelledCount = orders.filter(function(o) { return o.status === 'cancelled'; }).length;

  // Filter orders based on activeTab
  var filteredOrders = [];
  if (activeTab === 'all') {
    filteredOrders = orders;
  } else if (activeTab === 'pending') {
    filteredOrders = orders.filter(function(o) { return o.status === 'pending'; });
  } else if (activeTab === 'packed') {
    filteredOrders = orders.filter(function(o) { return o.status === 'confirmed' || o.status === 'packed'; });
  } else if (activeTab === 'shipping') {
    filteredOrders = orders.filter(function(o) { return o.status === 'shipping'; });
  } else if (activeTab === 'completed') {
    filteredOrders = orders.filter(function(o) { return o.status === 'completed' || o.status === 'delivered'; });
  } else if (activeTab === 'cancelled') {
    filteredOrders = orders.filter(function(o) { return o.status === 'cancelled'; });
  }

  var tabsHtml = 
    '<div class="orders-tabs">' +
      '<div class="order-tab ' + (activeTab === 'all' ? 'active' : '') + '" onclick="changeOrderTab(\'all\')">' +
        'All <span class="tab-badge">' + allCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'pending' ? 'active' : '') + '" onclick="changeOrderTab(\'pending\')">' +
        'Pending <span class="tab-badge">' + pendingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'packed' ? 'active' : '') + '" onclick="changeOrderTab(\'packed\')">' +
        'Awaiting Pickup <span class="tab-badge">' + packedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'shipping' ? 'active' : '') + '" onclick="changeOrderTab(\'shipping\')">' +
        'Shipping <span class="tab-badge">' + shippingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'completed' ? 'active' : '') + '" onclick="changeOrderTab(\'completed\')">' +
        'Delivered <span class="tab-badge">' + completedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'cancelled' ? 'active' : '') + '" onclick="changeOrderTab(\'cancelled\')">' +
        'Cancelled <span class="tab-badge">' + cancelledCount + '</span>' +
      '</div>' +
    '</div>';

  var ordersHtml = '';
  if (filteredOrders.length > 0) {
    for (var i = 0; i < filteredOrders.length; i++) {
      var o = filteredOrders[i];
      var profStatusMap = {
        pending: { badge: 'var(--sentiment-neu-light)', color: 'var(--sentiment-neu)', text: 'Pending', icon: 'fa-clock' },
        confirmed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: 'Confirmed', icon: 'fa-circle-check' },
        packed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: 'Awaiting Pickup', icon: 'fa-box' },
        shipping: { badge: 'var(--accent-light)', color: 'var(--accent)', text: 'Shipping', icon: 'fa-truck-fast' },
        completed: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: 'Completed', icon: 'fa-circle-check' },
        delivered: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: 'Delivered', icon: 'fa-circle-check' },
        cancelled: { badge: 'var(--danger-light)', color: 'var(--danger)', text: 'Cancelled', icon: 'fa-circle-xmark' },
        return_pending: { badge: 'rgba(217, 119, 6, 0.1)', color: '#d97706', text: 'Return Requested', icon: 'fa-triangle-exclamation' },
        disputed: { badge: 'rgba(198, 40, 40, 0.1)', color: '#c62828', text: 'Disputed (Admin Review)', icon: 'fa-circle-exclamation' },
        refunded: { badge: 'rgba(85, 122, 70, 0.1)', color: '#557A46', text: 'Refunded', icon: 'fa-arrow-rotate-left' }
      };
      var ps = profStatusMap[o.status] || profStatusMap.pending;
      var statusBadge = ps.badge;
      var statusColor = ps.color;
      var statusText = ps.text;
      var statusIcon = ps.icon;
      var firstItemId = (o.items && o.items.length > 0) ? o.items[0].id : '1';
      var itemsHtml = '';
      if (o.items) {
        for (var j = 0; j < o.items.length; j++) {
          var item = o.items[j];
          var iImage = item.image || '../images/placeholder.png';
          var iName = item.name || ('Sản phẩm ' + (item.productId || item.id || 'N/A'));
          var iQty = item.quantity || 1;
          var iPriceStr = item.priceStr || (item.price ? item.price.toLocaleString('vi-VN') + ' đ' : '0 đ');
          itemsHtml +=
            '<div onclick="goToDetail(\'' + (item.productId || item.id) + '\')" style="cursor:pointer;display:flex;align-items:center;gap:0.75rem;background-color:var(--card);padding:0.6rem 1rem;border-radius:12px;border:1px solid var(--border);transition:all 0.25s ease;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\';">' +
              '<img src="' + iImage + '" style="width:40px;height:40px;border-radius:8px;object-fit:cover" />' +
              '<div><p style="font-size:0.8rem;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + iName + '</p><p style="font-size:0.72rem;color:var(--text-muted)">x' + iQty + ' \u2022 ' + iPriceStr + '</p></div>' +
            '</div>';
        }
      }

      var returnInfoHtml = '';
      if (o.status === 'return_pending' || o.status === 'disputed' || o.status === 'refunded') {
        returnInfoHtml = 
          '<div style="margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(217,119,6,0.05);border-radius:12px;border:1px solid rgba(217,119,6,0.15);font-size:0.8rem;color:var(--text-muted);">' +
            '<div style="font-weight:700;color:#d97706;margin-bottom:0.25rem;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:0.35rem"></i>Return Request Details</div>' +
            '<div><strong>Reason:</strong> ' + (o.returnReason || 'N/A') + '</div>' +
            (o.returnDescription ? '<div><strong>Details:</strong> ' + o.returnDescription + '</div>' : '') +
          '</div>';
      }

      var actionButtonsHtml = '<button class="btn btn-outline" onclick="window.location.href=\'/buyer/order-tracking.html?order=' + o.id + '\'" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:var(--primary);color:var(--primary);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\';"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Track</button>';
      
      if (o.status === 'completed' || o.status === 'delivered') {
        actionButtonsHtml += '<button class="btn btn-outline" onclick="openReturnModal(\'' + o.id + '\')" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:#b91c1c;color:#b91c1c;margin-left:0.5rem;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background=\'#fef2f2\'" onmouseout="this.style.background=\'none\'"><i class="fa-solid fa-arrow-rotate-left" style="margin-right:0.3rem"></i>Return/Refund</button>';
      }
      
      actionButtonsHtml += '<button class="btn btn-primary" onclick="goToDetail(\'' + firstItemId + '\')" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;background-color:var(--accent);border-color:var(--accent);color:var(--foreground);margin-left:0.5rem;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\';">Buy Again</button>';

      var safeDate = o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('en-US');
      var safeTotalStr = o.totalStr || (o.total ? o.total.toLocaleString('vi-VN') + ' đ' : '0 đ');
      var safeGC = o.greenCoinEarned || 0;

      ordersHtml +=
        '<div style="background-color:var(--card); border-radius:20px; border:1px solid var(--border); padding:1.5rem; margin-bottom:1.25rem; box-shadow:0 4px 15px var(--shadow);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">' +
            '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><span style="font-weight:800;font-size:0.95rem;color:var(--primary)">#' + o.id + '</span><span style="font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-calendar" style="margin-right:0.3rem"></i>' + safeDate + '</span></div>' +
            '<div style="display:flex;gap:0.75rem;align-items:center"><span class="badge" style="background-color:' + statusBadge + ';color:' + statusColor + ';text-transform:none;font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;"><i class="fa-solid ' + statusIcon + '"></i>' + statusText + '</span><span style="font-weight:800;font-size:1.05rem;color:var(--accent)">' + safeTotalStr + '</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;flex-wrap:wrap">' + itemsHtml + '</div>' +
          returnInfoHtml +
          '<div style="margin-top:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;border-top:1px dashed var(--border);padding-top:1rem">' +
            '<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i><span>+' + safeGC + ' GreenCoin earned from this order</span></div>' +
            '<div style="display:flex;gap:0.5rem">' +
              actionButtonsHtml +
            '</div>' +
          '</div>' +
        '</div>';
    }
  } else {
    ordersHtml =
      '<div style="text-align:center;padding:4rem 2rem;color:var(--text-muted);background:var(--card);border-radius:20px;border:1px solid var(--border);">' +
        '<i class="fa-solid fa-receipt" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">No orders yet</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">You have no orders in this status.</p>' +
        '<a href="shop.html" class="btn btn-primary" style="border-radius:12px">Explore Shop</a>' +
      '</div>';
  }

  container.innerHTML =
    '<div class="orders-section-container" style="margin-top:2rem;">' +
      '<div class="section-header" style="margin-bottom:1.5rem;">' +
        '<div>' +
          '<span class="badge badge-primary" style="margin-bottom:0.5rem">Order History</span>' +
          '<h2 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary)">My Orders</h2>' +
        '</div>' +
      '</div>' +
      tabsHtml +
      '<div style="display:flex;flex-direction:column;gap:0.75rem">' + ordersHtml + '</div>' +
    '</div>';
}

window.changeOrderTab = function(tabName) {
  renderOrders(tabName);
};

window.openReturnModal = function(orderId) {
  var modalId = 'return-refund-modal';
  var modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.3s ease;';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = 
    '<div class="eco-card" style="width:100%;max-width:500px;background:var(--card);border-radius:28px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow);transform:scale(0.9);transition:transform 0.3s ease;position:relative;">' +
      '<button onclick="closeReturnModal()" style="position:absolute;top:1.25rem;right:1.25rem;background:none;border:none;color:var(--text-muted);font-size:1.25rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>' +
      '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Yêu cầu Trả hàng / Hoàn tiền</h3>' +
      '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1.5rem">Đơn hàng: <strong>#' + orderId + '</strong>. Vui lòng điền thông tin khiếu nại của bạn.</p>' +
      
      '<div style="margin-bottom:1rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Lý do trả hàng <span style="color:var(--danger)">*</span></label>' +
        '<select id="return-reason" class="input-editorial" style="width:100%;height:40px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--foreground);padding:0 0.75rem;font-size:0.85rem;">' +
          '<option value="Hàng lỗi/Hỏng do vận chuyển">Hàng lỗi / Hỏng do vận chuyển</option>' +
          '<option value="Sản phẩm sai kích thước/màu sắc">Sản phẩm sai kích thước / màu sắc</option>' +
          '<option value="Sản phẩm không đúng mô tả">Sản phẩm không đúng mô tả</option>' +
          '<option value="Hàng giả/nhái hoặc thiếu hàng">Hàng giả/nhái hoặc thiếu hàng</option>' +
          '<option value="Khác">Lý do khác</option>' +
        '</select>' +
      '</div>' +
      
      '<div style="margin-bottom:1rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Mô tả chi tiết <span style="color:var(--danger)">*</span></label>' +
        '<textarea id="return-description" class="input-editorial" style="width:100%;height:100px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--foreground);padding:0.5rem 0.75rem;font-size:0.85rem;resize:none;" placeholder="Vui lòng mô tả rõ tình trạng sản phẩm..."></textarea>' +
      '</div>' +
      
      '<div style="margin-bottom:1.5rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Hình ảnh minh chứng (Mockup)</label>' +
        '<div style="border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;cursor:pointer;background:rgba(85,122,70,0.02);transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--primary)\';" onmouseout="this.style.borderColor=\'var(--border)\';" onclick="document.getElementById(\'return-file\').click()">' +
          '<i class="fa-regular fa-image" style="font-size:1.75rem;color:var(--primary);margin-bottom:0.5rem"></i>' +
          '<p style="font-size:0.75rem;color:var(--text-muted);margin:0">Nhấp để tải ảnh hoặc video minh chứng</p>' +
          '<input type="file" id="return-file" style="display:none" onchange="handleReturnFileSelect(event)" />' +
          '<div id="return-file-preview" style="margin-top:0.75rem;font-size:0.75rem;color:var(--primary);font-weight:700;display:none"></div>' +
        '</div>' +
      '</div>' +
      
      '<div style="display:flex;justify-content:flex-end;gap:0.75rem">' +
        '<button onclick="closeReturnModal()" class="btn btn-outline" style="border-radius:8px;font-size:0.75rem;padding:8px 16px;height:auto;">Hủy bỏ</button>' +
        '<button onclick="submitReturnRequest(\'' + orderId + '\')" class="btn btn-primary" style="border-radius:8px;font-size:0.75rem;padding:8px 16px;height:auto;background:var(--primary);border-color:var(--primary);color:#fff;">Gửi yêu cầu</button>' +
      '</div>' +
    '</div>';
    
  setTimeout(function() {
    modal.style.opacity = '1';
    modal.children[0].style.transform = 'scale(1)';
  }, 50);
};

window.closeReturnModal = function() {
  var modal = document.getElementById('return-refund-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.children[0].style.transform = 'scale(0.9)';
    setTimeout(function() {
      modal.remove();
    }, 300);
  }
};

window.handleReturnFileSelect = function(e) {
  var file = e.target.files[0];
  var preview = document.getElementById('return-file-preview');
  if (file && preview) {
    preview.innerText = '✓ Đã chọn file: ' + file.name;
    preview.style.display = 'block';
  }
};

window.submitReturnRequest = function(orderId) {
  var reason = document.getElementById('return-reason').value;
  var description = document.getElementById('return-description').value.trim();
  if (!description) {
    alert('Vui lòng nhập mô tả chi tiết lý do trả hàng.');
    return;
  }
  
  var allOrders = JSON.parse(localStorage.getItem('refashion_shared_orders') || '[]');
  var orderFound = false;
  for (var i = 0; i < allOrders.length; i++) {
    if (allOrders[i].id === orderId) {
      allOrders[i].status = 'return_pending';
      allOrders[i].returnReason = reason;
      allOrders[i].returnDescription = description;
      allOrders[i].returnEvidence = '/images/sh_denim_shirt.png';
      orderFound = true;
      break;
    }
  }
  
  if (orderFound) {
    localStorage.setItem('refashion_shared_orders', JSON.stringify(allOrders));
    alert('Yêu cầu Trả hàng / Hoàn tiền đã được gửi đi thành công!');
    closeReturnModal();
    renderOrders('all');
  } else {
    alert('Không tìm thấy đơn hàng #' + orderId);
  }
};

// Start polling for shared orders updates
(function() {
  var lastOrdersState = localStorage.getItem('refashion_shared_orders');
  setInterval(function() {
    var currentOrdersState = localStorage.getItem('refashion_shared_orders');
    if (currentOrdersState !== lastOrdersState) {
      lastOrdersState = currentOrdersState;
      if (typeof renderOrders === 'function') {
        renderOrders(window.buyerActiveTab || 'all');
      }
    }
  }, 3000);
})();


/* ==================== BUYER FLOATING CHAT WIDGET ==================== */
function initBuyerChatWidget() {
  // 1. Add Styles
  var style = document.createElement('style');
  style.innerHTML = `
    .buyer-chat-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      cursor: pointer;
      z-index: 99999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .buyer-chat-trigger:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
    }
    .buyer-chat-trigger:active {
      transform: scale(0.95);
    }
    .buyer-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 500px;
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .buyer-chat-header {
      padding: 14px 16px;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .buyer-chat-header .header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .buyer-chat-header img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }
    .buyer-chat-header .title-wrap {
      display: flex;
      flex-direction: column;
    }
    .buyer-chat-header .store-name {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .buyer-chat-header .store-status {
      font-size: 0.75rem;
      opacity: 0.85;
    }
    .buyer-chat-header .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .buyer-chat-header .close-btn:hover {
      opacity: 1;
    }
    .buyer-chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #f8fafc;
    }
    .buyer-chat-store-list {
      padding: 8px 0;
    }
    .buyer-chat-store-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .buyer-chat-store-item:hover {
      background: #f1f5f9;
    }
    .buyer-chat-store-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .buyer-chat-store-item .store-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .buyer-chat-store-item .store-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .buyer-chat-store-item .store-item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .buyer-chat-store-item .store-item-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .buyer-chat-store-item .store-item-msg {
      font-size: 0.8rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .buyer-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .buyer-chat-msg {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .buyer-chat-msg.incoming {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .buyer-chat-msg.outgoing {
      align-self: flex-end;
      background: #16a34a;
      color: white;
      border-bottom-right-radius: 2px;
    }
    .buyer-chat-msg-time {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 4px;
      text-align: right;
    }
    .buyer-chat-msg.outgoing .buyer-chat-msg-time {
      color: rgba(255,255,255,0.7);
    }
    .buyer-chat-footer {
      padding: 12px 16px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .buyer-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .buyer-chat-input:focus {
      border-color: #16a34a;
    }
    .buyer-chat-send-btn {
      background: #16a34a;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .buyer-chat-send-btn:hover {
      transform: scale(1.05);
      background: #15803d;
    }
    .buyer-chat-send-btn:active {
      transform: scale(0.95);
    }
    .buyer-chat-login-notice {
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }
    .buyer-chat-login-notice p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .buyer-chat-login-notice a {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .buyer-chat-login-notice a:hover {
      background: #15803d;
    }
  `;
  document.body.appendChild(style);

  // 2. Add DOM elements
  var trigger = document.createElement('div');
  trigger.className = 'buyer-chat-trigger';
  trigger.innerHTML = '<i class="fa-solid fa-comments"></i>';
  document.body.appendChild(trigger);

  var panel = document.createElement('div');
  panel.className = 'buyer-chat-panel';
  panel.id = 'buyer-chat-panel';
  document.body.appendChild(panel);

  var activeStoreName = null;

  function renderPanelContent() {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">ReFashion Chat</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-login-notice">
            <p>Vui lòng đăng nhập tài khoản Buyer để bắt đầu trò chuyện với các Cửa hàng trên ReFashion.</p>
            <a href="/auth/login.html">Đăng nhập ngay</a>
          </div>
        </div>
      `;
      return;
    }

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var buyerName = user.name || "Nguyễn Văn A";

    if (activeStoreName) {
      var conv = conversations.find(function(c) {
        return c.store === activeStoreName && c.buyer.name === buyerName;
      });

      if (!conv) {
        var storeLogo = '../images/store_eco_wear.png';
        if (activeStoreName === 'Denim Craft') storeLogo = '../images/store_denim_craft.png';
        else if (activeStoreName === 'Hemp & Bamboo') storeLogo = '../images/store_hemp_bamboo.png';
        else if (activeStoreName === 'Retro Chic') storeLogo = '../images/store_retro_chic.png';
        else if (activeStoreName === 'Green Thread') storeLogo = '../images/store_green_thread.png';
        else if (activeStoreName === 'Zero Waste') storeLogo = '../images/store_zero_waste.png';

        conv = {
          id: 'conv_' + Date.now(),
          buyer: { name: buyerName, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buyerName) + '&background=0F172A&color=fff' },
          store: activeStoreName,
          storeLogo: storeLogo,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unread: 0,
          status: 'active',
          messages: []
        };
        conversations.push(conv);
        localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      }

      conv.unread = 0;

      var messagesHtml = conv.messages.map(function(m) {
        var cls = m.sender === 'buyer' ? 'outgoing' : 'incoming';
        var timeStr = '';
        try {
          var d = new Date(m.time);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-msg ${cls}">
            <div>${escHtml(m.text)}</div>
            <div class="buyer-chat-msg-time">${timeStr}</div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info" onclick="window.backToStoreList()">
            <i class="fa-solid fa-chevron-left" style="margin-right: 4px; font-size: 0.85rem;"></i>
            <img src="${conv.storeLogo}" alt="Logo">
            <div class="title-wrap">
              <span class="store-name">${conv.store}</span>
              <span class="store-status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body" id="buyer-chat-messages-container">
          <div class="buyer-chat-messages">
            ${messagesHtml || '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:0.8rem;">Bắt đầu cuộc trò chuyện của bạn!</div>'}
          </div>
        </div>
        <div class="buyer-chat-footer">
          <input type="text" class="buyer-chat-input" id="buyer-chat-input-field" placeholder="Nhập tin nhắn..." onkeydown="handleBuyerChatKeyDown(event)">
          <button class="buyer-chat-send-btn" onclick="submitBuyerChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      `;

      var msgBody = document.getElementById('buyer-chat-messages-container');
      if (msgBody) {
        msgBody.scrollTop = msgBody.scrollHeight;
      }

      var inputField = document.getElementById('buyer-chat-input-field');
      if (inputField) inputField.focus();

    } else {
      var myConvs = conversations.filter(function(c) {
        return c.buyer.name === buyerName;
      });

      var storesHtml = myConvs.map(function(c) {
        var timeStr = '';
        try {
          var d = new Date(c.lastTime);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-store-item" onclick="window.openBuyerChatWithStore('${c.store}')">
            <img src="${c.storeLogo}" alt="Logo">
            <div class="store-item-info">
              <div class="store-item-header">
                <span class="store-item-name">${c.store}</span>
                <span class="store-item-time">${timeStr}</span>
              </div>
              <div class="store-item-msg">${escHtml(c.lastMessage || 'Chưa có tin nhắn')}</div>
            </div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">Tin nhắn Cửa hàng</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-store-list">
            ${storesHtml || '<div style="text-align:center;padding:48px 24px;color:#94a3b8;font-size:0.85rem;">Bạn chưa có cuộc hội thoại nào. Hãy ghé thăm các Cửa hàng để bắt đầu chat nhé!</div>'}
          </div>
        </div>
      `;
    }
  }

  window.toggleBuyerChatPanel = function() {
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      renderPanelContent();
    }
  };

  window.openBuyerChatWithStore = function(storeName) {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.style.display = 'flex';
      renderPanelContent();
      return;
    }
    activeStoreName = storeName;
    panel.style.display = 'flex';
    renderPanelContent();
  };

  window.backToStoreList = function() {
    activeStoreName = null;
    renderPanelContent();
  };

  window.submitBuyerChatMessage = function() {
    var input = document.getElementById('buyer-chat-input-field');
    if (!input || !input.value.trim() || !activeStoreName) return;
    var text = input.value.trim();
    input.value = '';

    var user = RefashionAuth._getUser();
    var buyerName = user ? user.name : "Nguyễn Văn A";

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var conv = conversations.find(function(c) {
      return c.store === activeStoreName && c.buyer.name === buyerName;
    });

    if (conv) {
      var nowStr = new Date().toISOString();
      conv.messages.push({ sender: 'buyer', text: text, time: nowStr });
      conv.lastMessage = text;
      conv.lastTime = nowStr;
      
      localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      renderPanelContent();
    }
  };

  window.handleBuyerChatKeyDown = function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitBuyerChatMessage();
    }
  };

  trigger.addEventListener('click', toggleBuyerChatPanel);

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var lastChatState = localStorage.getItem('refashion_shared_chats');
  setInterval(function() {
    var currentChatState = localStorage.getItem('refashion_shared_chats');
    if (currentChatState !== lastChatState) {
      lastChatState = currentChatState;
      if (panel.style.display === 'flex') {
        var activeInput = document.activeElement;
        var hadFocus = activeInput && activeInput.id === 'buyer-chat-input-field';
        var textVal = hadFocus ? activeInput.value : '';

        renderPanelContent();

        if (hadFocus) {
          var newInput = document.getElementById('buyer-chat-input-field');
          if (newInput) {
            newInput.value = textVal;
            newInput.focus();
          }
        }
      }
    }
  }, 3000);
}


/* ==================== BUYER FLOATING CHAT WIDGET ==================== */
function initBuyerChatWidget() {
  // 1. Add Styles
  var style = document.createElement('style');
  style.innerHTML = `
    .buyer-chat-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      cursor: pointer;
      z-index: 99999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .buyer-chat-trigger:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
    }
    .buyer-chat-trigger:active {
      transform: scale(0.95);
    }
    .buyer-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 500px;
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .buyer-chat-header {
      padding: 14px 16px;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .buyer-chat-header .header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .buyer-chat-header img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }
    .buyer-chat-header .title-wrap {
      display: flex;
      flex-direction: column;
    }
    .buyer-chat-header .store-name {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .buyer-chat-header .store-status {
      font-size: 0.75rem;
      opacity: 0.85;
    }
    .buyer-chat-header .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .buyer-chat-header .close-btn:hover {
      opacity: 1;
    }
    .buyer-chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #f8fafc;
    }
    .buyer-chat-store-list {
      padding: 8px 0;
    }
    .buyer-chat-store-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .buyer-chat-store-item:hover {
      background: #f1f5f9;
    }
    .buyer-chat-store-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .buyer-chat-store-item .store-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .buyer-chat-store-item .store-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .buyer-chat-store-item .store-item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .buyer-chat-store-item .store-item-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .buyer-chat-store-item .store-item-msg {
      font-size: 0.8rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .buyer-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .buyer-chat-msg {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .buyer-chat-msg.incoming {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .buyer-chat-msg.outgoing {
      align-self: flex-end;
      background: #16a34a;
      color: white;
      border-bottom-right-radius: 2px;
    }
    .buyer-chat-msg-time {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 4px;
      text-align: right;
    }
    .buyer-chat-msg.outgoing .buyer-chat-msg-time {
      color: rgba(255,255,255,0.7);
    }
    .buyer-chat-footer {
      padding: 12px 16px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .buyer-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .buyer-chat-input:focus {
      border-color: #16a34a;
    }
    .buyer-chat-send-btn {
      background: #16a34a;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .buyer-chat-send-btn:hover {
      transform: scale(1.05);
      background: #15803d;
    }
    .buyer-chat-send-btn:active {
      transform: scale(0.95);
    }
    .buyer-chat-login-notice {
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }
    .buyer-chat-login-notice p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .buyer-chat-login-notice a {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .buyer-chat-login-notice a:hover {
      background: #15803d;
    }
  `;
  document.body.appendChild(style);

  // 2. Add DOM elements
  var trigger = document.createElement('div');
  trigger.className = 'buyer-chat-trigger';
  trigger.innerHTML = '<i class="fa-solid fa-comments"></i>';
  document.body.appendChild(trigger);

  var panel = document.createElement('div');
  panel.className = 'buyer-chat-panel';
  panel.id = 'buyer-chat-panel';
  document.body.appendChild(panel);

  var activeStoreName = null;

  function renderPanelContent() {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">ReFashion Chat</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-login-notice">
            <p>Vui lòng đăng nhập tài khoản Buyer để bắt đầu trò chuyện với các Cửa hàng trên ReFashion.</p>
            <a href="/auth/login.html">Đăng nhập ngay</a>
          </div>
        </div>
      `;
      return;
    }

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var buyerName = user.name || "Nguyễn Văn A";

    if (activeStoreName) {
      var conv = conversations.find(function(c) {
        return c.store === activeStoreName && c.buyer.name === buyerName;
      });

      if (!conv) {
        var storeLogo = '../images/store_eco_wear.png';
        if (activeStoreName === 'Denim Craft') storeLogo = '../images/store_denim_craft.png';
        else if (activeStoreName === 'Hemp & Bamboo') storeLogo = '../images/store_hemp_bamboo.png';
        else if (activeStoreName === 'Retro Chic') storeLogo = '../images/store_retro_chic.png';
        else if (activeStoreName === 'Green Thread') storeLogo = '../images/store_green_thread.png';
        else if (activeStoreName === 'Zero Waste') storeLogo = '../images/store_zero_waste.png';

        conv = {
          id: 'conv_' + Date.now(),
          buyer: { name: buyerName, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buyerName) + '&background=0F172A&color=fff' },
          store: activeStoreName,
          storeLogo: storeLogo,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unread: 0,
          status: 'active',
          messages: []
        };
        conversations.push(conv);
        localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      }

      conv.unread = 0;

      var messagesHtml = conv.messages.map(function(m) {
        var cls = m.sender === 'buyer' ? 'outgoing' : 'incoming';
        var timeStr = '';
        try {
          var d = new Date(m.time);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-msg ${cls}">
            <div>${escHtml(m.text)}</div>
            <div class="buyer-chat-msg-time">${timeStr}</div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info" onclick="window.backToStoreList()">
            <i class="fa-solid fa-chevron-left" style="margin-right: 4px; font-size: 0.85rem;"></i>
            <img src="${conv.storeLogo}" alt="Logo">
            <div class="title-wrap">
              <span class="store-name">${conv.store}</span>
              <span class="store-status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body" id="buyer-chat-messages-container">
          <div class="buyer-chat-messages">
            ${messagesHtml || '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:0.8rem;">Bắt đầu cuộc trò chuyện của bạn!</div>'}
          </div>
        </div>
        <div class="buyer-chat-footer">
          <input type="text" class="buyer-chat-input" id="buyer-chat-input-field" placeholder="Nhập tin nhắn..." onkeydown="handleBuyerChatKeyDown(event)">
          <button class="buyer-chat-send-btn" onclick="submitBuyerChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      `;

      var msgBody = document.getElementById('buyer-chat-messages-container');
      if (msgBody) {
        msgBody.scrollTop = msgBody.scrollHeight;
      }

      var inputField = document.getElementById('buyer-chat-input-field');
      if (inputField) inputField.focus();

    } else {
      var myConvs = conversations.filter(function(c) {
        return c.buyer.name === buyerName;
      });

      var storesHtml = myConvs.map(function(c) {
        var timeStr = '';
        try {
          var d = new Date(c.lastTime);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-store-item" onclick="window.openBuyerChatWithStore('${c.store}')">
            <img src="${c.storeLogo}" alt="Logo">
            <div class="store-item-info">
              <div class="store-item-header">
                <span class="store-item-name">${c.store}</span>
                <span class="store-item-time">${timeStr}</span>
              </div>
              <div class="store-item-msg">${escHtml(c.lastMessage || 'Chưa có tin nhắn')}</div>
            </div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">Tin nhắn Cửa hàng</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-store-list">
            ${storesHtml || '<div style="text-align:center;padding:48px 24px;color:#94a3b8;font-size:0.85rem;">Bạn chưa có cuộc hội thoại nào. Hãy ghé thăm các Cửa hàng để bắt đầu chat nhé!</div>'}
          </div>
        </div>
      `;
    }
  }

  window.toggleBuyerChatPanel = function() {
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      renderPanelContent();
    }
  };

  window.openBuyerChatWithStore = function(storeName) {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.style.display = 'flex';
      renderPanelContent();
      return;
    }
    activeStoreName = storeName;
    panel.style.display = 'flex';
    renderPanelContent();
  };

  window.backToStoreList = function() {
    activeStoreName = null;
    renderPanelContent();
  };

  window.submitBuyerChatMessage = function() {
    var input = document.getElementById('buyer-chat-input-field');
    if (!input || !input.value.trim() || !activeStoreName) return;
    var text = input.value.trim();
    input.value = '';

    var user = RefashionAuth._getUser();
    var buyerName = user ? user.name : "Nguyễn Văn A";

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var conv = conversations.find(function(c) {
      return c.store === activeStoreName && c.buyer.name === buyerName;
    });

    if (conv) {
      var nowStr = new Date().toISOString();
      conv.messages.push({ sender: 'buyer', text: text, time: nowStr });
      conv.lastMessage = text;
      conv.lastTime = nowStr;
      
      localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      renderPanelContent();
    }
  };

  window.handleBuyerChatKeyDown = function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitBuyerChatMessage();
    }
  };

  trigger.addEventListener('click', toggleBuyerChatPanel);

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var lastChatState = localStorage.getItem('refashion_shared_chats');
  setInterval(function() {
    var currentChatState = localStorage.getItem('refashion_shared_chats');
    if (currentChatState !== lastChatState) {
      lastChatState = currentChatState;
      if (panel.style.display === 'flex') {
        var activeInput = document.activeElement;
        var hadFocus = activeInput && activeInput.id === 'buyer-chat-input-field';
        var textVal = hadFocus ? activeInput.value : '';

        renderPanelContent();

        if (hadFocus) {
          var newInput = document.getElementById('buyer-chat-input-field');
          if (newInput) {
            newInput.value = textVal;
            newInput.focus();
          }
        }
      }
    }
  }, 3000);
}


/* ==================== DPP External API Integrations ==================== */

async function fetchClimatiqEmission(dpp, isEn) {
  var container = document.getElementById('dpp-climatiq-lca');
  if (!container) return;
  
  const CLIMATIQ_API_KEY = "FM1SBQ6AAX2EK6PFW26X74174M";

  try {
    const res = await fetch("https://api.climatiq.io/data/v1/estimate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: "textiles-type_curtain_and_linen_mills",
          data_version: "^34",
          region: "DE",
          year: 2023,
          year_fallback: true,
        },
        parameters: {
          money: 50,
          money_unit: "usd",
        },
      }),
    });
    
    if (!res.ok) throw new Error("Climatiq API Error");
    
    const apiData = await res.json();
    const emitted = apiData.co2e || dpp.co2Emitted;
    const saved = emitted * 0.65; // Estimated 65% reduction for upcycling
    
    container.innerHTML = '<div style="text-align:center; padding:6px; color:var(--primary); font-size: 0.7rem; margin-bottom: 8px;"><i class="fa-solid fa-cloud"></i> Calculated live via Climatiq API</div>' + 
      '<i class="fa-solid fa-circle-info"></i> ' + (isEn 
          ? 'ReFashion process emits <strong>' + emitted.toFixed(2) + ' kg CO₂e</strong>, saving <strong>' + saved.toFixed(2) + ' kg CO₂e</strong> (<strong>65%</strong> reduction) compared to producing a new product.'
          : 'Quy trình Refashion phát sinh <strong>' + emitted.toFixed(2) + ' kg CO₂e</strong>, tiết kiệm <strong>' + saved.toFixed(2) + ' kg CO₂e</strong> (giảm <strong>65%</strong>) so với sản xuất sản phẩm mới cùng loại.') +
      '<p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 10px; line-height: 1.3; text-align: left;">' +
        (isEn ? '* Based on Climatiq Emission Factor: textiles-type_curtain_and_linen_mills (DE, 2023).' : '* Dựa trên Hệ số phát thải Climatiq: dệt may và vải lanh (Đức, 2023).') +
      '</p>';
  } catch (error) {
    console.error('Climatiq Fallback:', error);
    // Fallback logic
    container.innerHTML = '<div style="text-align:center; padding:12px; color:var(--text-muted);"><i class="fa-solid fa-circle-info"></i> ' + (isEn ? 'Fallback Mode: Mock Data' : 'Chế độ Fallback: Dữ liệu mô phỏng') + '</div>' + 
      '<i class="fa-solid fa-circle-info"></i> ' + (isEn 
          ? 'ReFashion process emits <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> during transport & refurbishment, saving <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (<strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong> reduction) compared to producing a new product of the same type.'
          : 'Quy trình Refashion phát sinh <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> trong quá trình vận chuyển & làm mới, tiết kiệm <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (giảm <strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong>) so với sản xuất sản phẩm mới cùng loại.') +
      '<p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 10px; line-height: 1.3; text-align: left;">' +
        (isEn ? '* Calculations apply a 65% displacement rate based on standard LCA studies (Fallback Mode).' : '* Tính toán áp dụng hệ số thay thế 65% theo nghiên cứu LCA tiêu chuẩn (Chế độ Fallback).') +
      '</p>';
  }
}

async function fetchSupplyHubFacilities(dpp, isEn) {
  var timelineContainer = document.getElementById('dpp-os-timeline');
  var originContainer = document.getElementById('dpp-os-origin');
  
  try {
    const url = "https://opensupplyhub.org/api/facilities/?q=textile&countries=VN&sector=Apparel&pageSize=4";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Open Supply Hub API Error");
    const apiData = await res.json();
    
    if (!apiData.features || apiData.features.length < 4) throw new Error("Not enough facilities");

    const facilities = apiData.features.map(item => ({
      osId: item.id,
      name: item.properties.name,
      country: item.properties.country_name,
      address: item.properties.address || 'Vietnam',
    }));
    
    if (originContainer) {
      originContainer.innerHTML = '<i class="fa-solid fa-leaf" style="color:var(--primary); margin-top: 3px; font-size: 0.95rem;"></i>' +
        '<div><strong>' + (isEn ? 'Collection details:' : 'Chi tiết nguồn thu gom:') + '</strong><br><strong>' + facilities[3].name + '</strong><br>' + facilities[3].address + '<br><a href="https://opensupplyhub.org/facilities/' + facilities[3].osId + '" target="_blank" style="color:var(--primary); font-size:0.75rem; text-decoration: underline;"><i class="fa-solid fa-link"></i> OS_ID: ' + facilities[3].osId + '</a></div>';
    }
    
    if (timelineContainer) {
        var html = 
          '<div style="text-align:center; padding:6px; color:var(--primary); font-size: 0.7rem; margin-bottom: 8px;"><i class="fa-solid fa-globe"></i> Live data via Open Supply Hub API</div>' +
          '<!-- Tier 1 -->' +
          '<div class="dpp-timeline-node active expanded" id="dpp-node-1">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(1)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 1: Assembly & Distribution' : 'Tier 1: Hoàn thiện & Phân Phối') + '</span>' +
                '<div class="dpp-node-title">' + facilities[0].name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + facilities[0].address + '</p>' +
              '<p style="margin-bottom:3px;"><strong>OS_ID:</strong> <a href="https://opensupplyhub.org/facilities/' + facilities[0].osId + '" target="_blank" style="color:var(--primary); text-decoration:underline;">' + facilities[0].osId + '</a></p>' +
              '<p>' + (isEn ? 'Verified Open Supply Hub Facility.' : 'Cơ sở được xác minh trên Open Supply Hub.') + '</p>' +
            '</div>' +
          '</div>' +
          
          '<!-- Tier 2 -->' +
          '<div class="dpp-timeline-node" id="dpp-node-2">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(2)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 2: Upcycling Creative Studio' : 'Tier 2: Xưởng Tái Tạo Thiết Kế') + '</span>' +
                '<div class="dpp-node-title">' + facilities[1].name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + facilities[1].address + '</p>' +
              '<p style="margin-bottom:3px;"><strong>OS_ID:</strong> <a href="https://opensupplyhub.org/facilities/' + facilities[1].osId + '" target="_blank" style="color:var(--primary); text-decoration:underline;">' + facilities[1].osId + '</a></p>' +
              '<p>' + (isEn ? 'Verified Open Supply Hub Facility.' : 'Cơ sở được xác minh trên Open Supply Hub.') + '</p>' +
            '</div>' +
          '</div>' +
          
          '<!-- Tier 3 -->' +
          '<div class="dpp-timeline-node" id="dpp-node-3">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(3)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 3: Fiber Processing & Spin-Opening' : 'Tier 3: Trạm Xử Lý Vải Mộc') + '</span>' +
                '<div class="dpp-node-title">' + facilities[2].name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + facilities[2].address + '</p>' +
              '<p style="margin-bottom:3px;"><strong>OS_ID:</strong> <a href="https://opensupplyhub.org/facilities/' + facilities[2].osId + '" target="_blank" style="color:var(--primary); text-decoration:underline;">' + facilities[2].osId + '</a></p>' +
              '<p>' + (isEn ? 'Verified Open Supply Hub Facility.' : 'Cơ sở được xác minh trên Open Supply Hub.') + '</p>' +
            '</div>' +
          '</div>';
          
        timelineContainer.innerHTML = html;
    }
  } catch(error) {
     console.error('OS Hub Fallback:', error);
     // Fallback logic for Open Supply Hub
      if (originContainer) {
        originContainer.innerHTML = '<i class="fa-solid fa-leaf" style="color:var(--primary); margin-top: 3px; font-size: 0.95rem;"></i>' +
          '<div><strong>' + (isEn ? 'Collection details:' : 'Chi tiết nguồn thu gom:') + '</strong><br>' + dpp.materialOrigin + '</div>';
      }
      
      if (timelineContainer) {
        var htmlFallback = 
          '<!-- Tier 1 -->' +
          '<div class="dpp-timeline-node active expanded" id="dpp-node-1">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(1)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 1: Assembly & Distribution' : 'Tier 1: Hoàn thiện & Phân Phối') + '</span>' +
                '<div class="dpp-node-title">' + dpp.tier1Name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier1Loc + '</p>' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier1Cert + '</span></p>' +
              '<p>' + dpp.tier1Desc + '</p>' +
            '</div>' +
          '</div>' +
          
          '<!-- Tier 2 -->' +
          '<div class="dpp-timeline-node" id="dpp-node-2">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(2)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 2: Upcycling Creative Studio' : 'Tier 2: Xưởng Tái Tạo Thiết Kế') + '</span>' +
                '<div class="dpp-node-title">' + dpp.tier2Name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier2Loc + '</p>' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier2Cert + '</span></p>' +
              '<p>' + dpp.tier2Desc + '</p>' +
            '</div>' +
          '</div>' +
          
          '<!-- Tier 3 -->' +
          '<div class="dpp-timeline-node" id="dpp-node-3">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(3)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 3: Fiber Processing & Spin-Opening' : 'Tier 3: Trạm Xử Lý Vải Mộc') + '</span>' +
                '<div class="dpp-node-title">' + dpp.tier3Name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier3Loc + '</p>' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier3Cert + '</span></p>' +
              '<p>' + dpp.tier3Desc + '</p>' +
            '</div>' +
          '</div>' +
          
          '<!-- Tier 4 -->' +
          '<div class="dpp-timeline-node" id="dpp-node-4">' +
            '<div class="dpp-node-indicator"></div>' +
            '<div class="dpp-node-summary" onclick="toggleDppNode(4)">' +
              '<div>' +
                '<span class="dpp-node-tier">' + (isEn ? 'Tier 4: Material Sourcing & Collection' : 'Tier 4: Nguồn Vật Liệu Thu Gom') + '</span>' +
                '<div class="dpp-node-title">' + dpp.tier4Name + '</div>' +
              '</div>' +
              '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
            '</div>' +
            '<div class="dpp-node-details">' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier4Loc + '</p>' +
              '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier4Cert + '</span></p>' +
              '<p>' + dpp.tier4Desc + '</p>' +
            '</div>' +
          '</div>';
          
        timelineContainer.innerHTML = htmlFallback;
      }
  }
}


function sellerUseVtonResult() {
  if (sellerVtonState.resultImageUrl) {
    var gallery = document.getElementById("product-image-gallery");
    var placeholder = document.getElementById("product-upload-placeholder");
    if (placeholder) placeholder.style.display = "none";
    if (gallery) {
      var item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = "<img src=\"" + sellerVtonState.resultImageUrl + "\" alt=\"AI Result\">" +
                       "<button type=\"button\" class=\"btn-remove-img\" onclick=\"this.parentElement.remove()\">&times;</button>";
      gallery.appendChild(item);
    }
    sellerCloseVtonStudio();
  }
}


function sellerDownloadVtonResult() {
  if (sellerVtonState.resultImageUrl) {
    var a = document.createElement("a");
    a.href = sellerVtonState.resultImageUrl;
    a.download = "AI_Model_Image_" + Date.now() + ".jpg";
    a.click();
  }
}
