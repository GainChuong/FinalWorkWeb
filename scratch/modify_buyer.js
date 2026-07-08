const fs = require('fs');
const path = require('path');

const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(buyerJsPath, 'utf8');

// 1. Replace the DOMContentLoaded end
const target1 = `    default:
      initBuyerPage();
      break;
  }
});`;

const replacement1 = `    default:
      initBuyerPage();
      break;
  }
  initBuyerChatWidget();
});`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log("Replaced DOMContentLoaded hook");
} else {
  const target1_crlf = target1.replace(/\n/g, '\r\n');
  const replacement1_crlf = replacement1.replace(/\n/g, '\r\n');
  if (content.includes(target1_crlf)) {
    content = content.replace(target1_crlf, replacement1_crlf);
    console.log("Replaced DOMContentLoaded hook (CRLF)");
  } else {
    console.error("Error: target1 not found!");
  }
}

// 2. Replace the shop banner click listener
const target2 = `    var chatBtn = e.target.closest('.btn-chat-store');
    if (chatBtn) {
      showToast('Direct chat with store coming soon!');
    }`;

const replacement2 = `    var chatBtn = e.target.closest('.btn-chat-store');
    if (chatBtn) {
      var storeName = shopState.selectedStore || 'Eco Wear';
      if (typeof openBuyerChatWithStore === 'function') {
        openBuyerChatWithStore(storeName);
      } else {
        showToast('Direct chat with ' + storeName + ' coming soon!');
      }
    }`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log("Replaced shop banner click listener");
} else {
  const target2_crlf = target2.replace(/\n/g, '\r\n');
  const replacement2_crlf = replacement2.replace(/\n/g, '\r\n');
  if (content.includes(target2_crlf)) {
    content = content.replace(target2_crlf, replacement2_crlf);
    console.log("Replaced shop banner click listener (CRLF)");
  } else {
    console.error("Error: target2 not found!");
  }
}

// 3. Replace the store detail chat button handler
const target3 = `  var chatBtn = container.querySelector('.btn-chat-store');
  if (chatBtn) {
    chatBtn.addEventListener('click', function() {
      showToast('Direct chat with ' + storeName + ' coming soon!');
    });
  }`;

const replacement3 = `  var chatBtn = container.querySelector('.btn-chat-store');
  if (chatBtn) {
    chatBtn.addEventListener('click', function() {
      if (typeof openBuyerChatWithStore === 'function') {
        openBuyerChatWithStore(storeName);
      } else {
        showToast('Direct chat with ' + storeName + ' coming soon!');
      }
    });
  }`;

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log("Replaced store detail chat button");
} else {
  const target3_crlf = target3.replace(/\n/g, '\r\n');
  const replacement3_crlf = replacement3.replace(/\n/g, '\r\n');
  if (content.includes(target3_crlf)) {
    content = content.replace(target3_crlf, replacement3_crlf);
    console.log("Replaced store detail chat button (CRLF)");
  } else {
    console.error("Error: target3 not found!");
  }
}

// 4. Append the initBuyerChatWidget function to the end
const widgetDef = `

/* ==================== BUYER FLOATING CHAT WIDGET ==================== */
function initBuyerChatWidget() {
  // 1. Add Styles
  var style = document.createElement('style');
  style.innerHTML = \`
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
  \`;
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
      panel.innerHTML = \`
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
      \`;
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
        return \`
          <div class="buyer-chat-msg \${cls}">
            <div>\${escHtml(m.text)}</div>
            <div class="buyer-chat-msg-time">\${timeStr}</div>
          </div>
        \`;
      }).join('');

      panel.innerHTML = \`
        <div class="buyer-chat-header">
          <div class="header-info" onclick="window.backToStoreList()">
            <i class="fa-solid fa-chevron-left" style="margin-right: 4px; font-size: 0.85rem;"></i>
            <img src="\${conv.storeLogo}" alt="Logo">
            <div class="title-wrap">
              <span class="store-name">\${conv.store}</span>
              <span class="store-status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body" id="buyer-chat-messages-container">
          <div class="buyer-chat-messages">
            \${messagesHtml || '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:0.8rem;">Bắt đầu cuộc trò chuyện của bạn!</div>'}
          </div>
        </div>
        <div class="buyer-chat-footer">
          <input type="text" class="buyer-chat-input" id="buyer-chat-input-field" placeholder="Nhập tin nhắn..." onkeydown="handleBuyerChatKeyDown(event)">
          <button class="buyer-chat-send-btn" onclick="submitBuyerChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      \`;

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
        return \`
          <div class="buyer-chat-store-item" onclick="window.openBuyerChatWithStore('\${c.store}')">
            <img src="\${c.storeLogo}" alt="Logo">
            <div class="store-item-info">
              <div class="store-item-header">
                <span class="store-item-name">\${c.store}</span>
                <span class="store-item-time">\${timeStr}</span>
              </div>
              <div class="store-item-msg">\${escHtml(c.lastMessage || 'Chưa có tin nhắn')}</div>
            </div>
          </div>
        \`;
      }).join('');

      panel.innerHTML = \`
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">Tin nhắn Cửa hàng</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-store-list">
            \${storesHtml || '<div style="text-align:center;padding:48px 24px;color:#94a3b8;font-size:0.85rem;">Bạn chưa có cuộc hội thoại nào. Hãy ghé thăm các Cửa hàng để bắt đầu chat nhé!</div>'}
          </div>
        </div>
      \`;
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
`;

if (content.endsWith('\n')) {
  content += widgetDef;
} else {
  content += '\n' + widgetDef;
}

fs.writeFileSync(buyerJsPath, content, 'utf8');
console.log("Modification complete!");
