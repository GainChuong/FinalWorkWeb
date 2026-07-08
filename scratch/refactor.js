const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
let code = fs.readFileSync(filePath, 'utf8');

// Replacement 1: renderProfile()
console.log('Replacing renderProfile()...');
const renderProfileStartRegex = /function renderProfile\(\) \{[\s\S]*?var user = RefashionAuth\._getUser\(\);[\s\S]*?var container = document\.getElementById\('profile-content'\);[\s\S]*?if \(!user \|\| !container\) return;/;
const renderProfileEnd = 'function openEditProfileModal() {';
const renderProfileEndIndex = code.indexOf(renderProfileEnd);

if (renderProfileEndIndex === -1) {
  console.error('Could not find openEditProfileModal');
  process.exit(1);
}

const renderProfileStartIndex = code.search(/function renderProfile\(\)/);
if (renderProfileStartIndex === -1) {
  console.error('Could not find function renderProfile()');
  process.exit(1);
}

const renderProfileReplacement = `function renderProfile() {
  var user = RefashionAuth._getUser();
  var container = document.getElementById('profile-content');
  if (!user || !container) return;

  container.innerHTML =
    '<div class="profile-hero" style="margin-bottom: 2rem;">' +
      '<div class="profile-hero-bg"><i class="fa-solid fa-leaf"></i></div>' +
      '<div class="profile-hero-content">' +
        '<div class="profile-avatar">' + user.username.charAt(0).toUpperCase() + '</div>' +
        '<div class="profile-info">' +
          '<h1>' + user.username + '</h1>' +
          '<div class="profile-meta">' +
            '<span><i class="fa-solid fa-envelope" style="width:16px;margin-right:0.4rem;color:#EEE8DB"></i>Email: ' + user.email + '</span>' +
            '<span><i class="fa-solid fa-calendar" style="width:16px;margin-right:0.4rem;color:#EEE8DB"></i>Joined: ' + user.joinDate + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    
    '<div style="display:grid; grid-template-columns: 1fr; gap:2rem; margin-top:2rem;">' +
      '<div style="background:var(--card); border:1px solid var(--border); border-radius:24px; padding:2.5rem; box-shadow:0 8px 30px var(--shadow);">' +
        '<h3 style="font-family:var(--font-serif); font-size:1.75rem; color:var(--primary); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">' +
          '<i class="fa-solid fa-user-gear"></i> Personal Information' +
        '</h3>' +
        '<form id="profile-edit-form" class="profile-edit-form" onsubmit="submitEditProfile(event)" style="display:flex; flex-direction:column; gap:1.25rem;">' +
          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Username</label>' +
            '<input type="text" id="edit-username" value="' + user.username + '" required style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +
          
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Gender</label>' +
              '<select id="edit-gender" style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;">' +
                '<option value="men" ' + (user.gender === 'men' ? 'selected' : '') + '>Male</option>' +
                '<option value="women" ' + (user.gender === 'women' ? 'selected' : '') + '>Female</option>' +
                '<option value="unisex" ' + (user.gender === 'unisex' ? 'selected' : '') + '>Unisex / Other</option>' +
              '</select>' +
            '</div>' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Birth Year</label>' +
              '<input type="number" id="edit-birthYear" value="' + (user.birthYear || '') + '" min="1900" max="' + new Date().getFullYear() + '" placeholder="e.g. 1995" style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
          '</div>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Phone Number</label>' +
            '<input type="tel" id="edit-phone" value="' + (user.phone || '') + '" placeholder="Enter phone number..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Address</label>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<input type="text" id="edit-address" value="' + (user.address || '') + '" placeholder="Enter address..." style="flex:1; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
              '<button type="button" class="btn" onclick="openMapPicker()" style="padding:0.75rem 1rem; background:var(--accent); color:white; font-weight:700; border-radius:12px; border:none; cursor:pointer; display:flex; align-items:center; gap:0.35rem; transition:all 0.25s ease;" onmouseover="this.style.opacity=\\'0.85\\';" onmouseout="this.style.opacity=\\'1\\';">' +
                '<i class="fa-solid fa-map-location-dot"></i> Bản đồ' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<hr style="border:0; border-top:1px solid var(--border); margin:1rem 0;" />' +
          
          '<h3 style="font-family:var(--font-serif); font-size:1.5rem; color:var(--primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">' +
            '<i class="fa-solid fa-shield-halved"></i> Change Password (Optional)' +
          '</h3>' +
          '<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Leave password fields blank if you do not want to change it.</p>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Current Password</label>' +
            '<input type="password" id="edit-curr-password" placeholder="Enter current password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +

          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">New Password</label>' +
              '<input type="password" id="edit-new-password" placeholder="New password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Confirm New Password</label>' +
              '<input type="password" id="edit-confirm-password" placeholder="Confirm new password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
          '</div>' +

          '<div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">' +
            '<button type="submit" class="btn btn-primary" style="border-radius:12px; padding:0.85rem 2rem; font-weight:700;">Save Changes</button>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</div>';

  // Inject or prepare map picker overlay element directly to body if not already there
  var mapOverlay = document.getElementById(\'map-picker-overlay\');
  if (!mapOverlay) {
    mapOverlay = document.createElement(\'div\');
    mapOverlay.id = \'map-picker-overlay\';
    mapOverlay.className = \'map-picker-overlay\';
    mapOverlay.innerHTML =
      \'<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">\' +
        \'<h4 style="margin:0; font-size:1.1rem; color:white; font-family:var(--font-serif);"><i class="fa-solid fa-map-location-dot" style="color:var(--accent)"></i> Chọn vị trí trên Bản đồ</h4>\' +
        \'<button type="button" onclick="closeMapPicker()" style="background:none; border:none; color:white; font-size:1.25rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>\' +
      \'</div>\' +
      \'<div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">\' +
        \'<input type="text" id="map-search-input" placeholder="Nhập địa chỉ cần tìm (mặc định ở VN)..." onkeydown="if(event.key===\\\'Enter\\\'){event.preventDefault();searchAddressOnMap();}" />\' +
        \'<button type="button" onclick="searchAddressOnMap()" class="btn" style="padding:0.6rem 1rem; border-radius:10px; border:none; cursor:pointer; background:var(--accent); color:white; font-weight:700;">Tìm</button>\' +
      \'</div>\' +
      \'<div id="map-picker-canvas"></div>\' +
      \'<div style="margin-bottom:0.75rem; color:white; font-size:0.85rem; line-height:1.4;">\' +
        \'<span style="font-weight:700;">Vị trí đã chọn:</span> <span id="map-selected-address-text">Chưa chọn</span>\' +
      \'</div>\' +
      \'<div style="display:flex; justify-content:flex-end; gap:0.5rem;">\' +
        \'<button type="button" class="btn btn-outline" onclick="closeMapPicker()" style="border-radius:10px; padding:0.5rem 1rem; color:white; border-color:white; background:transparent;">Hủy</button>\' +
        \'<button type="button" class="btn btn-primary" onclick="confirmMapSelection()" style="border-radius:10px; padding:0.5rem 1rem; background:var(--accent); border-color:var(--accent); color:white; font-weight:700;">Xác nhận</button>\' +
      \'</div>\';
    document.body.appendChild(mapOverlay);
  }
}

`;

code = code.substring(0, renderProfileStartIndex) + renderProfileReplacement + code.substring(renderProfileEndIndex);

// Replacement 2: renderCommunity()
console.log('Replacing renderCommunity()...');
const renderCommunityStartIndex = code.search(/function renderCommunity\(\)/);
const renderCommunityEnd = 'function dailyCheckin() {';
const renderCommunityEndIndex = code.indexOf(renderCommunityEnd);

if (renderCommunityStartIndex === -1 || renderCommunityEndIndex === -1) {
  console.error('Could not find renderCommunity boundaries');
  process.exit(1);
}

const renderCommunityReplacement = `function renderCommunity() {
  var user = RefashionAuth._getUser();
  var isLoggedIn = !!user;
  var balance = user ? (user.greenCoin || 0) : 0;
  var container = document.getElementById('community-content');
  if (!container) return;

  // Initialize mock redemptions if empty
  if (isLoggedIn && !localStorage.getItem('refashion_redemptions')) {
    var mockRedemptions = [
      { id: 'R-mock1', itemName: '20% Discount Voucher', cost: 100, date: '02/07/2026', code: 'RF20-MOCK99' },
      { id: 'R-mock2', itemName: 'Plant 1 Green Tree', cost: 50, date: '25/06/2026', code: null }
    ];
    localStorage.setItem('refashion_redemptions', JSON.stringify(mockRedemptions));
  }

  var walletHtml = isLoggedIn
    ? '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">' + balance + ' <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2>'
    : '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">\\u2014 <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2><p style="font-size:0.85rem;opacity:0.85"><a href="../auth/login.html?redirect=community.html" style="color:var(--accent);font-weight:700;text-decoration:underline">Login</a> to view your GreenCoin balance</p>';
  
  var rewardsHtml = '';
  for (var i = 0; i < REWARDS_DB.length; i++) {
    var item = REWARDS_DB[i];
    var canRedeem = isLoggedIn && balance >= item.cost;
    rewardsHtml +=
      '<div class="reward-card">' +
        '<div class="reward-img"><img src="' + item.image + '" alt="' + item.name + '" /></div>' +
        '<div class="reward-body">' +
          '<h4 style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem">' + item.name + '</h4>' +
          '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.4;flex-grow:1">' + item.description + '</p>' +
          '<div class="reward-footer">' +
            '<span style="font-size:1.1rem;font-weight:800;color:var(--primary);display:flex;align-items:center;gap:0.25rem">' + item.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.9rem;color:var(--accent)"></i></span>' +
            '<button onclick="handleRedeem(' + item.id + ')" class="btn btn-outline" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:8px;background-color:' + (canRedeem ? 'var(--primary-light)' : 'transparent') + ';color:' + (canRedeem ? 'var(--primary)' : 'var(--foreground)') + ';border-color:' + (canRedeem ? 'var(--primary)' : 'var(--border)') + '">' + (isLoggedIn ? 'Redeem' : 'Login') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var redemptions = [];
  if (isLoggedIn) {
    try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  }
  
  var redemptionsHtml = '';
  if (isLoggedIn) {
    if (redemptions.length > 0) {
      redemptionsHtml += 
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem;">' +
          '<div style="text-align:center;margin-bottom:2.5rem">' +
            '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
            '<p style="color:var(--text-muted);font-size:1rem">Xem danh sách các phần quà và hoạt động bạn đã đổi bằng GreenCoin.</p>' +
          '</div>' +
          '<div style="background-color:var(--card); border-radius:24px; border:1px solid var(--border); padding:2rem; box-shadow:0 10px 30px var(--shadow); overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem; min-width:600px;">' +
              '<thead>' +
                '<tr style="border-bottom:2px solid var(--border); color:var(--primary); font-weight:700;">' +
                  '<th style="padding:1rem;">Mã giao dịch</th>' +
                  '<th style="padding:1rem;">Phần quà / Hoạt động</th>' +
                  '<th style="padding:1rem;">Mã Voucher (nếu có)</th>' +
                  '<th style="padding:1rem;">Ngày đổi</th>' +
                  '<th style="padding:1rem; text-align:right;">GreenCoin đã tiêu</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>';
      for (var k = 0; k < redemptions.length; k++) {
        var r = redemptions[k];
        var codeDisplay = r.code ? '<code style="background-color:var(--primary-light); color:var(--primary); padding:0.25rem 0.5rem; border-radius:6px; font-weight:700; font-family:var(--font-sans);">' + r.code + '</code>' : '<span style="color:var(--text-muted);">—</span>';
        redemptionsHtml +=
          '<tr style="border-bottom:1px solid var(--border); transition:all 0.2s;" onmouseover="this.style.backgroundColor=\\'var(--background)\\';" onmouseout="this.style.backgroundColor=\\'transparent\\';">' +
            '<td style="padding:1rem; font-weight:600; color:var(--primary);">' + r.id + '</td>' +
            '<td style="padding:1rem; display:flex; align-items:center; gap:0.5rem;"><i class="fa-solid ' + (r.code ? 'fa-ticket' : 'fa-seedling') + '" style="color:' + (r.code ? 'var(--accent)' : 'var(--primary)') + ';"></i>' + r.itemName + '</td>' +
            '<td style="padding:1rem;">' + codeDisplay + '</td>' +
            '<td style="padding:1rem; color:var(--text-muted);">' + r.date + '</td>' +
            '<td style="padding:1rem; text-align:right; font-weight:800; color:var(--sentiment-neg); font-size:1.05rem;">-' + r.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.8rem;color:var(--accent);"></i></td>' +
          '</tr>';
      }
      redemptionsHtml +=
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';
    } else {
      redemptionsHtml +=
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem; text-align:center; color:var(--text-muted);">' +
          '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
          '<p style="margin-bottom:1.5rem;">Bạn chưa thực hiện giao dịch đổi quà nào.</p>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="community-section"><div class="container">' +
      '<div class="community-header"><span class="badge badge-accent" style="margin-bottom:1rem">Green Planet Community</span><h1>A Greener Earth Every Day</h1><p style="color:var(--text-muted);font-size:1.1rem">Donate old clothes to earn GreenCoin rewards and join hands to sponsor ecological restoration projects.</p></div>' +
      '<div class="top-panel">' +
        '<div class="wallet-card animate-pulse-soft"><div class="wallet-card-bg"><i class="fa-solid fa-leaf"></i></div><div><span style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent)">Your GreenCoin Wallet</span>' + walletHtml + '</div><div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1.5rem"><p style="font-size:0.85rem;opacity:0.85;line-height:1.5">\\ud83c\\udf40 How to earn GreenCoin:<br />\\u2022 Shop at ReFashion (+5 coin/100k)\\u2022 Daily check-in (+10 coin)</p><button onclick="dailyCheckin()" class="btn btn-outline" style="margin-top:1rem;width:100%;border-radius:12px;padding:0.7rem;font-size:0.85rem;font-weight:700;background-color:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25);color:#fff" id="checkin-btn"><i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> Check In & Earn 10 Coin</button></div></div>' +
        '<div style="background-color:var(--card);border-radius:24px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow)"><h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:1.25rem">Ongoing Environmental Campaigns</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1.25rem">' +
            '<div style="display:flex;gap:1rem;border-bottom:1px solid var(--border);padding-bottom:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.25rem">June Campaign</span><h4 style="font-weight:700;font-size:0.95rem">Beach Cleanup & Waste Collection Festival — Vung Tau</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Join 200+ volunteers collecting plastic waste to protect our oceans.</p><a href="https://tnmtvungtau.vn" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
            '<div style="display:flex;gap:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:0.25rem">Forest Restoration</span><h4 style="font-weight:700;font-size:0.95rem">Reforest 10 Hectares of Mangrove Forest</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Partner to plant mangroves for flood protection. Redeem 50 GreenCoin to replace one sapling.</p><a href="https://www.thiennhien.net" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
          '</div></div>' +
      '</div>' +
      '<div class="rewards-section">' +
        '<div style="text-align:center;margin-bottom:2.5rem"><h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Green Rewards Store</h3><p style="color:var(--text-muted);font-size:1rem">Redeem your accumulated GreenCoin points for products or contribute to the Earth.</p></div>' +
        '<div class="rewards-grid">' + rewardsHtml + '</div>' +
      '</div>' +
      redemptionsHtml +
    '</div></div>';
}
`;

code = code.substring(0, renderCommunityStartIndex) + renderCommunityReplacement + code.substring(renderCommunityEndIndex);

// Replacement 3: handleRedeem()
console.log('Replacing handleRedeem()...');
const handleRedeemStartIndex = code.search(/function handleRedeem\(itemId\) \{/);
const handleRedeemEnd = '/* ==================== MOMO RETURN ==================== */';
const handleRedeemEndIndex = code.indexOf(handleRedeemEnd);

if (handleRedeemStartIndex === -1 || handleRedeemEndIndex === -1) {
  console.error('Could not find handleRedeem boundaries');
  process.exit(1);
}

const handleRedeemReplacement = `function handleRedeem(itemId) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/community.html'; return; }
  var item = null;
  for (var i = 0; i < REWARDS_DB.length; i++) {
    if (REWARDS_DB[i].id === itemId) { item = REWARDS_DB[i]; break; }
  }
  if (!item) return;
  var voucher = null;
  if (item.category === 'discount') {
    var match = item.name.match(/(\\d+)%/);
    var discount = match ? parseInt(match[1]) : 20;
    voucher = RefashionAuth.redeemVoucher(item.cost, discount, item.name);
    if (!voucher) { showToast('\\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\\ud83c\\udf9f\\ufe0f Voucher redeemed! Your code: ' + voucher.code + ' (' + discount + '% OFF, Exp: ' + voucher.expiresAt + ').');
  } else {
    var success = RefashionAuth.spendGreenCoin(item.cost);
    if (!success) { showToast('\\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\\ud83c\\udf89 Reward redeemed! You received: "' + item.name + '".');
  }
  
  // Save to redemption history
  var redemption = {
    id: 'R-' + Date.now().toString(36).toUpperCase(),
    itemName: item.name,
    cost: item.cost,
    date: new Date().toLocaleDateString('vi-VN'),
    code: voucher ? voucher.code : null
  };
  var redemptions = [];
  try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  redemptions.unshift(redemption);
  localStorage.setItem('refashion_redemptions', JSON.stringify(redemptions));

  renderCommunity();
}

`;

code = code.substring(0, handleRedeemStartIndex) + handleRedeemReplacement + code.substring(handleRedeemEndIndex);

// Replacement 4: showSuccessView()
console.log('Replacing showSuccessView()...');
const showSuccessStartIndex = code.search(/function showSuccessView\(orderId, total, gcEst\) \{/);
const showSuccessEnd = '/* ==================== PROFILE PAGE ==================== */';
const showSuccessEndIndex = code.indexOf(showSuccessEnd);

if (showSuccessStartIndex === -1 || showSuccessEndIndex === -1) {
  console.error('Could not find showSuccessView boundaries');
  process.exit(1);
}

const showSuccessReplacement = `function showSuccessView(orderId, total, gcEst) {
  var now = new Date();
  var from = new Date(now); from.setDate(from.getDate() + 3);
  var to = new Date(now); to.setDate(to.getDate() + 5);
  var deliveryRange = ('0' + from.getDate()).slice(-2) + '/' + ('0' + (from.getMonth()+1)).slice(-2) + '/' + from.getFullYear() + ' \\u2014 ' +
    ('0' + to.getDate()).slice(-2) + '/' + ('0' + (to.getMonth()+1)).slice(-2) + '/' + to.getFullYear();
  var container = document.getElementById('checkout-content');
  if (!container) return;
  container.innerHTML =
    '<div class="success-view">' +
      '<div class="success-card animate-fade-in-up">' +
        '<div class="success-icon animate-success" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
        '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Order Placed Successfully! \\ud83c\\udf89</h2>' +
        '<p style="color:var(--text-muted);margin-bottom:0.5rem">Order code: <strong style="color:var(--primary)">#' + orderId + '</strong></p>' +
        '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;text-align:left">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;font-weight:700;color:var(--primary)"><i class="fa-solid fa-truck-fast"></i> Estimated Delivery Time</div>' +
          '<p style="font-size:1.1rem;font-weight:800;color:var(--foreground)">\\ud83d\\udce6 ' + deliveryRange + '</p>' +
        '</div>' +
        '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:1rem;margin-bottom:2rem;display:inline-flex;align-items:center;gap:0.5rem;color:var(--sentiment-pos);font-weight:700;font-size:1rem"><i class="fa-solid fa-leaf"></i> You earned +' + (gcEst) + ' GreenCoin!</div>' +
        '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="/buyer/orders.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">View Order</a><a href="/buyer/order-tracking.html?order=' + orderId + '" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Track</a><a href="/buyer/shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Continue Shopping</a></div>' +
      '</div>' +
    '</div>';
}

`;

code = code.substring(0, showSuccessStartIndex) + showSuccessReplacement + code.substring(showSuccessEndIndex);

// Replacement 5: initMoMoReturnPage()
console.log('Replacing initMoMoReturnPage()...');
const initMoMoStartIndex = code.search(/function initMoMoReturnPage\(\) \{/);
// The function immediately following initMoMoReturnPage is defined differently. Let's find its end.
const initMoMoEnd = '/* ==================== COMMUNITY PAGE ==================== */';
// Wait, initMoMoReturnPage is around line 2444 in the original code. Let's check where it ends.
// Let's find: `if (resultCode === '0') { ... } else { ... }`
// The end of initMoMoReturnPage is right before `/* ==================== PROFILE PAGE ==================== */`? No, profile is before community in the new order.
// Let's search for community page comment
const communityPageComment = '/* ==================== COMMUNITY PAGE ==================== */';
const initMoMoEndIndex = code.indexOf(communityPageComment);

if (initMoMoStartIndex === -1 || initMoMoEndIndex === -1) {
  console.error('Could not find initMoMoReturnPage boundaries');
  process.exit(1);
}

const initMoMoReplacement = `function initMoMoReturnPage() {
  var params = new URLSearchParams(window.location.search);
  var resultCode = params.get('resultCode');
  var orderId = params.get('orderId');
  var amount = params.get('amount');
  var transId = params.get('transId');
  var message = params.get('message');
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  var container = document.getElementById('momo-return-content');
  if (!container) return;
  if (resultCode === '0') {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon animate-success" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Payment Successful! \\ud83c\\udf89</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:1rem">Order <strong style="color:var(--primary)">#' + (orderId || '') + '</strong> has been paid via MoMo.</p>' +
          '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;text-align:left">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem"><span style="color:var(--text-muted)">MoMo Transaction ID</span><span style="font-weight:700;color:var(--primary)">' + (transId || '') + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Amount</span><span style="font-weight:700;color:var(--accent)">' + (amount ? Number(amount).toLocaleString('vi-VN') : '') + ' \\u0111</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><a href="/buyer/orders.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">View Order</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Continue Shopping</a></div>' +
          '<div style="margin-top:2rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-wallet" style="color:#a50064"></i> Paid via MoMo Wallet (Sandbox Test)</div>' +
        '</div>' +
      '</div>';
  } else {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon animate-error" style="background-color:#fef2f2"><i class="fa-solid fa-xmark" style="font-size:2.5rem;color:#ef4444"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:#ef4444;margin-bottom:0.75rem">Payment Failed</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:2rem">' + (message || 'Transaction unsuccessful. Please try again.') + '</p>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="checkout.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Try Again</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Go Back</a></div>' +
        '</div>' +
      '</div>';
  }
}

`;

code = code.substring(0, initMoMoStartIndex) + initMoMoReplacement + code.substring(initMoMoEndIndex);

// Replacement 6: Append initOrdersPage and renderOrders
console.log('Appending initOrdersPage and renderOrders...');
const ordersFunctions = `
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
    '<div class="orders-tabs" style="display:flex; border-bottom:1px solid var(--border); margin-bottom:2rem; overflow-x:auto; gap:1.25rem; padding-bottom:2px; -ms-overflow-style:none; scrollbar-width:none;">' +
      '<div class="order-tab ' + (activeTab === 'all' ? 'active' : '') + '" onclick="changeOrderTab(\\'all\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'all' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Tất cả <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'all' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'all' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + allCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'pending' ? 'active' : '') + '" onclick="changeOrderTab(\\'pending\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'pending' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Chờ xác nhận <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'pending' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'pending' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + pendingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'packed' ? 'active' : '') + '" onclick="changeOrderTab(\\'packed\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'packed' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'packed' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Chờ lấy hàng <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'packed' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'packed' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + packedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'shipping' ? 'active' : '') + '" onclick="changeOrderTab(\\'shipping\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'shipping' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'shipping' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Đang giao <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'shipping' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'shipping' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + shippingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'completed' ? 'active' : '') + '" onclick="changeOrderTab(\\'completed\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'completed' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Đã giao <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'completed' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'completed' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + completedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'cancelled' ? 'active' : '') + '" onclick="changeOrderTab(\\'cancelled\\')" style="padding:1rem 0.5rem; font-weight:700; font-size:0.95rem; color:' + (activeTab === 'cancelled' ? 'var(--primary)' : 'var(--text-muted)') + '; cursor:pointer; position:relative; white-space:nowrap; border-bottom:3px solid ' + (activeTab === 'cancelled' ? 'var(--primary)' : 'transparent') + '; transition:all 0.2s;">' +
        'Đã hủy <span style="font-size:0.75rem; padding:2px 6px; border-radius:10px; background:' + (activeTab === 'cancelled' ? 'var(--primary-light)' : '#f3f4f6') + '; color:' + (activeTab === 'cancelled' ? 'var(--primary)' : '#4b5563') + '; margin-left:0.25rem;">' + cancelledCount + '</span>' +
      '</div>' +
    '</div>';

  var ordersHtml = '';
  if (filteredOrders.length > 0) {
    for (var i = 0; i < filteredOrders.length; i++) {
      var o = filteredOrders[i];
      var profStatusMap = {
        pending: { badge: 'var(--sentiment-neu-light)', color: 'var(--sentiment-neu)', text: '\\u23f3 Chờ xác nhận', icon: 'fa-clock' },
        confirmed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: '\\u2705 Đã xác nhận', icon: 'fa-circle-check' },
        packed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: '\\ud83d\\udce6 Chờ lấy hàng', icon: 'fa-box' },
        shipping: { badge: 'var(--accent-light)', color: 'var(--accent)', text: '\\ud83d\\ude9a Đang giao hàng', icon: 'fa-truck-fast' },
        completed: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: '\\u2705 Đã hoàn thành', icon: 'fa-circle-check' },
        delivered: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: '\\u2705 Đã giao hàng', icon: 'fa-circle-check' },
        cancelled: { badge: 'var(--danger-light)', color: 'var(--danger)', text: '\\u274c Đã hủy', icon: 'fa-circle-xmark' }
      };
      var ps = profStatusMap[o.status] || profStatusMap.pending;
      var statusBadge = ps.badge;
      var statusColor = ps.color;
      var statusText = ps.text;
      var statusIcon = ps.icon;
      var firstItemId = o.items.length > 0 ? o.items[0].id : '1';
      var itemsHtml = '';
      for (var j = 0; j < o.items.length; j++) {
        var item = o.items[j];
        itemsHtml +=
          '<div onclick="goToDetail(\\'' + item.id + '\\')" style="cursor:pointer;display:flex;align-items:center;gap:0.75rem;background-color:var(--card);padding:0.6rem 1rem;border-radius:12px;border:1px solid var(--border);transition:all 0.25s ease;" onmouseover="this.style.borderColor=\\'var(--primary)\\';this.style.transform=\\'translateY(-2px)\\';" onmouseout="this.style.borderColor=\\'var(--border)\\';this.style.transform=\\'none\\';">' +
            '<img src="' + item.image + '" style="width:40px;height:40px;border-radius:8px;object-fit:cover" />' +
            '<div><p style="font-size:0.8rem;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</p><p style="font-size:0.72rem;color:var(--text-muted)">x' + item.quantity + ' \\u2022 ' + item.priceStr + '</p></div>' +
          '</div>';
      }
      ordersHtml +=
        '<div style="background-color:var(--card); border-radius:20px; border:1px solid var(--border); padding:1.5rem; margin-bottom:1.25rem; box-shadow:0 4px 15px var(--shadow);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">' +
            '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><span style="font-weight:800;font-size:0.95rem;color:var(--primary)">#' + o.id + '</span><span style="font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-calendar" style="margin-right:0.3rem"></i>' + o.date + '</span></div>' +
            '<div style="display:flex;gap:0.75rem;align-items:center"><span class="badge" style="background-color:' + statusBadge + ';color:' + statusColor + ';text-transform:none;font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;"><i class="fa-solid ' + statusIcon + '"></i>' + statusText + '</span><span style="font-weight:800;font-size:1.05rem;color:var(--accent)">' + o.totalStr + '</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;flex-wrap:wrap">' + itemsHtml + '</div>' +
          '<div style="margin-top:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;border-top:1px dashed var(--border);padding-top:1rem">' +
            '<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i><span>+' + o.greenCoinEarned + ' GreenCoin nhận từ đơn hàng này</span></div>' +
            '<div style="display:flex;gap:0.5rem">' +
              '<button class="btn btn-outline" onclick="window.location.href=\\'/buyer/order-tracking.html?order=' + o.id + '\\'" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:var(--primary);color:var(--primary);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\\'0.85\\'" onmouseout="this.style.opacity=\\'1\\';"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Theo dõi</button>' +
              '<button class="btn btn-primary" onclick="goToDetail(\\'' + firstItemId + '\\')" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;background-color:var(--accent);border-color:var(--accent);color:var(--foreground);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\\'0.85\\'" onmouseout="this.style.opacity=\\'1\\';">Mua lại</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
  } else {
    ordersHtml =
      '<div style="text-align:center;padding:4rem 2rem;color:var(--text-muted);background:var(--card);border-radius:20px;border:1px solid var(--border);">' +
        '<i class="fa-solid fa-receipt" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Chưa có đơn hàng</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">Bạn chưa có đơn hàng nào ở trạng thái này.</p>' +
        '<a href="shop.html" class="btn btn-primary" style="border-radius:12px">Khám phá cửa hàng</a>' +
      '</div>';
  }

  container.innerHTML =
    '<div class="orders-section-container" style="margin-top:2rem;">' +
      '<div class="section-header" style="margin-bottom:1.5rem;">' +
        '<div>' +
          '<span class="badge badge-primary" style="margin-bottom:0.5rem">Lịch sử đơn hàng</span>' +
          '<h2 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary)">Quản lý đơn mua</h2>' +
        '</div>' +
        '<a href="shop.html" class="btn btn-outline" style="border-radius:12px;font-size:0.85rem"><i class="fa-solid fa-bag-shopping"></i> Tiếp tục mua sắm</a>' +
      '</div>' +
      tabsHtml +
      '<div style="display:flex;flex-direction:column;gap:0.75rem">' + ordersHtml + '</div>' +
    '</div>';
}

window.changeOrderTab = function(tabName) {
  renderOrders(tabName);
};
`;

code += ordersFunctions;

// Replacement 7: Add 'orders' case in DOMContentLoaded dispatcher
console.log('Adding orders case to dispatcher...');
const dispatcherRegex = /case 'momo-return':[\s\S]*?initMoMoReturnPage\(\);[\s\S]*?break;/;
const dispatcherMatch = code.match(dispatcherRegex);

if (!dispatcherMatch) {
  console.error('Could not find momo-return case in dispatcher');
  process.exit(1);
}

const dispatcherReplacement = `case 'momo-return':
      initMoMoReturnPage();
      break;
    case 'orders':
      initOrdersPage();
      break;`;

code = code.replace(dispatcherMatch[0], dispatcherReplacement);

// Save updated buyer.js
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully refactored js/buyer.js!');
