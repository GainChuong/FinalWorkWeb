var MOCK_ACCOUNTS = [];

var _basePath = (function() {
  var path = window.location.pathname;
  var depth = (path.match(/\//g) || []).length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
})();

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
  xhr.onerror = function () { onError(new Error('Network error loading: ' + url)); };
  xhr.send();
}

var WIN1252_REV = {
  0x20AC: 128, 0x201A: 130, 0x0192: 131, 0x201E: 132, 0x2026: 133,
  0x2020: 134, 0x2021: 135, 0x02C6: 136, 0x2030: 137, 0x0160: 138,
  0x2039: 139, 0x0152: 140, 0x017D: 142, 0x2018: 145, 0x2019: 146,
  0x201C: 147, 0x201D: 148, 0x2022: 149, 0x2013: 150, 0x2014: 151,
  0x02DC: 152, 0x2122: 153, 0x0161: 154, 0x203A: 155, 0x0153: 156,
  0x017E: 158, 0x0178: 159
};

function decodeMojibake(str) {
  if (!str) return str;
  try {
    var needsCheck = false;
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code > 127) {
        needsCheck = true;
        if (code > 255 && !WIN1252_REV[code]) {
          return str;
        }
      }
    }
    if (!needsCheck) return str;

    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code <= 255) {
        bytes[i] = code;
      } else if (WIN1252_REV[code]) {
        bytes[i] = WIN1252_REV[code];
      } else {
        bytes[i] = code % 256;
      }
    }
    var decoded = new TextDecoder('utf-8').decode(bytes);
    if (decoded.indexOf('\uFFFD') === -1 && decoded !== str) {
      return decoded;
    }
    return str;
  } catch(e) {
    return str;
  }
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('sessionUser')); }
  catch(e) { return null; }
}
function setSession(email, role) {
  localStorage.setItem('sessionUser', JSON.stringify({ email: email, role: role }));
}
function clearSession() {
  localStorage.removeItem('sessionUser');
}

var RefashionAuth = {
  _getUser: function() {
    try {
      var user = JSON.parse(localStorage.getItem('refashion_current_user'));
      if (user && user.username) {
        user.username = decodeMojibake(user.username);
      }
      return user;
    }
    catch(e) { return null; }
  },
  _saveUser: function(user) {
    localStorage.setItem('refashion_current_user', JSON.stringify(user));
    if (window.firebaseDb && window.firebaseDoc && window.firebaseSetDoc && user && user.email) {
      try {
        var docRef = window.firebaseDoc(window.firebaseDb, "users", user.email.toLowerCase().trim());
        window.firebaseSetDoc(docRef, user).catch(function(err) {
          console.error('[ReFashion] Failed to sync profile to Firestore:', err);
        });
      } catch (e) {
        console.error('[ReFashion] Firestore sync exception:', e);
      }
    }
  },
  _removeUser: function() {
    localStorage.removeItem('refashion_current_user');
  },
  _getCart: function() {
    try { return JSON.parse(localStorage.getItem('refashion_cart')) || []; }
    catch(e) { return []; }
  },
  _saveCart: function(cart) {
    localStorage.setItem('refashion_cart', JSON.stringify(cart));
  },
  _getOrders: function() {
    var user = this._getUser();
    if (!user) return [];
    try {
      var allOrders = JSON.parse(localStorage.getItem('refashion_shared_orders')) || [];
      return allOrders.filter(function(o) {
        return o.buyerEmail === user.email;
      });
    } catch(e) { return []; }
  },
  _saveOrders: function(buyerOrders) {
    var user = this._getUser();
    var email = user ? user.email : '';
    if (email) {
      for (var i = 0; i < buyerOrders.length; i++) {
        buyerOrders[i].buyerEmail = email;
      }
    }
    var allOrders = [];
    try { allOrders = JSON.parse(localStorage.getItem('refashion_shared_orders')) || []; } catch(e) {}
    var buyerOrderIds = buyerOrders.map(function(o) { return o.id; });
    var otherOrders = allOrders.filter(function(o) {
      return o.buyerEmail !== email && buyerOrderIds.indexOf(o.id) === -1;
    });
    var combined = buyerOrders.concat(otherOrders);
    localStorage.setItem('refashion_shared_orders', JSON.stringify(combined));
  },
  _getDonations: function() {
    try { return JSON.parse(localStorage.getItem('refashion_donations')) || []; }
    catch(e) { return []; }
  },
  _saveDonations: function(d) {
    localStorage.setItem('refashion_donations', JSON.stringify(d));
  },
  _getVouchers: function() {
    try { return JSON.parse(localStorage.getItem('refashion_vouchers')) || []; }
    catch(e) { return []; }
  },
  _saveVouchers: function(v) {
    localStorage.setItem('refashion_vouchers', JSON.stringify(v));
  },
  _getUsers: function() {
    try {
      var users = JSON.parse(localStorage.getItem('refashion_users')) || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username) {
          users[i].username = decodeMojibake(users[i].username);
        }
      }
      return users;
    }
    catch(e) { return []; }
  },
  _saveUsers: function(u) {
    localStorage.setItem('refashion_users', JSON.stringify(u));
  },

  get user() { return this._getUser(); },
  get isLoggedIn() { return !!this._getUser(); },
  get cart() { return this._getCart(); },
  get orders() { return this._getOrders(); },
  get donations() { return this._getDonations(); },
  get vouchers() { return this._getVouchers(); },

  initializeUserProfile: function() {
    var user = this._getUser();
    if (!user || user.role !== 'Buyer') return;

    var cart = this._getCart();
    var orders = this._getOrders();
    var clickStream = [];
    try {
      var cs = localStorage.getItem('refashion_click_stream');
      if (cs) clickStream = JSON.parse(cs);
    } catch(e) {}

    // Structure profile
    var profile = {
      genders: {},
      styles: {},
      categories: {},
      stores: {},
      keywords: {}
    };

    // Helper to track item attributes into profile
    var trackItemInProfile = function(productId, weight) {
      var p = null;
      if (typeof SHOP_PRODUCTS !== 'undefined' && SHOP_PRODUCTS.length > 0) {
        for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
          if (String(SHOP_PRODUCTS[i].id) === String(productId)) {
            p = SHOP_PRODUCTS[i];
            break;
          }
        }
      }
      if (p && typeof AI_REC_SYSTEM !== 'undefined') {
        var attrs = AI_REC_SYSTEM.extractAttributes(p);
        if (attrs.gender) {
          profile.genders[attrs.gender] = (profile.genders[attrs.gender] || 0) + weight;
        }
        if (attrs.style) {
          profile.styles[attrs.style] = (profile.styles[attrs.style] || 0) + weight;
        }
        if (attrs.pattern && attrs.pattern !== 'other' && attrs.pattern !== 'NA') {
          profile.styles[attrs.pattern] = (profile.styles[attrs.pattern] || 0) + weight;
        }
        if (attrs.sleeve && attrs.sleeve !== 'NA') {
          profile.styles[attrs.sleeve] = (profile.styles[attrs.sleeve] || 0) + weight;
        }
        if (attrs.neckline && attrs.neckline !== 'NA') {
          profile.styles[attrs.neckline] = (profile.styles[attrs.neckline] || 0) + weight;
        }
        if (p.category) {
          profile.categories[p.category] = (profile.categories[p.category] || 0) + weight;
        }
        var tokens = (p.name || '').toLowerCase().split(/\s+/).filter(function(t) {
          return t.length > 2 && ['cho', 'choo', 'của', 'nam', 'nữ', 'thời', 'trang', 'màu', 'hiệu'].indexOf(t) === -1;
        });
        for (var k = 0; k < tokens.length; k++) {
          profile.keywords[tokens[k]] = (profile.keywords[tokens[k]] || 0) + weight;
        }
      }
    };

    // 2. Order History (weight 5 per item purchased)
    if (orders && orders.length > 0) {
      for (var oIdx = 0; oIdx < orders.length; oIdx++) {
        var oItems = orders[oIdx].items || [];
        for (var itemIdx = 0; itemIdx < oItems.length; itemIdx++) {
          trackItemInProfile(oItems[itemIdx].productId, 5);
        }
      }
    }

    // 3. Cart Items (weight 3 per item)
    if (cart && cart.length > 0) {
      for (var cIdx = 0; cIdx < cart.length; cIdx++) {
        trackItemInProfile(cart[cIdx].productId, 3);
      }
    }

    // 4. Click stream (weight 1 per item viewed)
    if (clickStream && clickStream.length > 0) {
      for (var csIdx = 0; csIdx < clickStream.length; csIdx++) {
        trackItemInProfile(clickStream[csIdx], 1);
      }
    }

    // Save profile to localStorage
    localStorage.setItem('refashion_user_profile', JSON.stringify(profile));

    // Reload recommendation engine similarities immediately
    if (typeof AI_REC_SYSTEM !== 'undefined') {
      AI_REC_SYSTEM.loadProfile();
      if (AI_REC_SYSTEM.model) {
        AI_REC_SYSTEM.computeRecommendations();
      } else {
        AI_REC_SYSTEM.computeLocalSimilarity();
      }
    }
  },

  login: function(email, password) {
    var account = null;
    var lockedUsers = JSON.parse(localStorage.getItem('refashion_locked_users')) || {};
    if (lockedUsers[email.toLowerCase().trim()]) {
      alert('Tài khoản của bạn đã bị khóa bởi Quản trị viên (Admin). Vui lòng liên hệ hỗ trợ để được giải quyết.');
      return null;
    }

    var overrides = {};
    try { overrides = JSON.parse(localStorage.getItem('refashion_user_overrides')) || {}; } catch(e) {}
    var userOver = overrides[email.toLowerCase().trim()] || {};

    for (var i = 0; i < MOCK_ACCOUNTS.length; i++) {
      var expectedPassword = userOver.password || MOCK_ACCOUNTS[i].password;
      if (MOCK_ACCOUNTS[i].email.toLowerCase() === email.toLowerCase().trim() && expectedPassword === password) {
        account = MOCK_ACCOUNTS[i];
        break;
      }
    }
    if (account) {
      var userData = {
        username: userOver.username || account.username || account.name || account.email.split('@')[0],
        email: account.email,
        phone: userOver.phone !== undefined ? userOver.phone : (account.phone || ''),
        gender: userOver.gender || account.gender || 'unisex',
        address: userOver.address !== undefined ? userOver.address : (account.address || ''),
        birthYear: userOver.birthYear !== undefined ? userOver.birthYear : (account.birthYear || ''),
        joinDate: account.joinDate || new Date().toLocaleDateString('en-US'),
        greenCoin: userOver.greenCoin || account.greenCoin || 500,
        role: account.role,
        redirect: account.redirect,
        store: account.store || '',
        storeLogo: account.storeLogo || '',
        lastPhoneChange: userOver.lastPhoneChange || null,
        lastPasswordChange: userOver.lastPasswordChange || null
      };
      this._saveUser(userData);
      setSession(account.email, account.role);

      // Load specific user's cart, orders, and clickStream to make it active in the session
      if (account.role === 'Buyer') {
        if (account.cart) this._saveCart(account.cart);
        if (account.orders) this._saveOrders(account.orders);
        if (account.clickStream) {
          localStorage.setItem('refashion_click_stream', JSON.stringify(account.clickStream));
        } else {
          localStorage.setItem('refashion_click_stream', JSON.stringify([]));
        }
        // Initialize their profile weights
        this.initializeUserProfile();
      }

      return userData;
    }
    if (email === 'refashion@gmail.com' && password === '1234567890@Abc') {
      var demoUser = {
        username: 'ReFashion Demo',
        email: 'refashion@gmail.com',
        phone: '0912 345 678',
        gender: 'men',
        address: '123 Duong Lang Road, Hanoi',
        birthYear: '1998',
        joinDate: '01/01/2026',
        greenCoin: 500,
        role: 'Buyer'
      };
      this._saveUser(demoUser);
      setSession(demoUser.email, demoUser.role);
      this.initializeUserProfile();
      return demoUser;
    }
    var users = this._getUsers();
    for (var j = 0; j < users.length; j++) {
      if (users[j].email === email && users[j].password === password) {
        var regUser = {
          username: users[j].username,
          email: users[j].email,
          phone: users[j].phone || '',
          gender: users[j].gender || 'unisex',
          address: users[j].address || '',
          birthYear: users[j].birthYear || '',
          joinDate: users[j].joinDate || new Date().toLocaleDateString('en-US'),
          greenCoin: users[j].greenCoin || 100,
          role: 'Buyer'
        };
        this._saveUser(regUser);
        setSession(regUser.email, regUser.role);
        this.initializeUserProfile();
        return regUser;
      }
    }
    return null;
  },

  logout: function() {
    localStorage.removeItem('refashion_current_user');
    clearSession();
    if (window.firebaseSignOut && window.firebaseAuth) {
      window.firebaseSignOut(window.firebaseAuth).catch(function(err) {
        console.error('[ReFashion] Firebase signOut error:', err);
      });
    }
    window.location.href = '/auth/login.html';
  },

  getCartCount: function() {
    var cart = this._getCart();
    return cart.reduce(function(sum, c) { return sum + c.quantity; }, 0);
  },

  getCartTotal: function() {
    var cart = this._getCart();
    return cart.reduce(function(sum, c) { return sum + c.price * c.quantity; }, 0);
  },

  addToCart: function(item) {
    var cart = this._getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === item.productId && cart[i].variant === item.variant) {
        existing = cart[i];
        break;
      }
    }
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: item.productId, name: item.name, price: item.price, priceStr: item.priceStr, image: item.image, variant: item.variant || 'Standard', quantity: 1 });
    }
    this._saveCart(cart);
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.trackCart) {
      AI_REC_SYSTEM.trackCart(item.productId);
    }
    return cart;
  },

  removeFromCart: function(productId, variant) {
    var cart = this._getCart();
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
      if (!(cart[i].productId === productId && cart[i].variant === (variant || 'Standard'))) {
        newCart.push(cart[i]);
      }
    }
    this._saveCart(newCart);
    return newCart;
  },

  updateCartQuantity: function(productId, variant, quantity) {
    var cart = this._getCart();
    if (quantity <= 0) {
      return this.removeFromCart(productId, variant);
    }
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === productId && cart[i].variant === (variant || 'Standard')) {
        cart[i].quantity = quantity;
        break;
      }
    }
    this._saveCart(cart);
    return cart;
  },

  clearCart: function() {
    this._saveCart([]);
  },

  placeOrderWithDetails: function(params) {
    var user = this._getUser();
    if (params.items.length === 0 || !user) return null;
    var subtotal = params.items.reduce(function(sum, c) { return sum + c.price * c.quantity; }, 0);
    var discountAmount = Math.floor(subtotal * (params.discountPercent || 0) / 100);
    var total = subtotal - discountAmount;
    var greenCoinEarned = Math.floor(total / 100000) * 5;
    var orderId = 'RF-' + Date.now().toString(36).toUpperCase();
    var order = {
      id: orderId,
      items: JSON.parse(JSON.stringify(params.items)),
      total: total,
      totalStr: total.toLocaleString('vi-VN') + ' \u0111',
      greenCoinEarned: greenCoinEarned,
      date: new Date().toLocaleDateString('en-US'),
      status: 'pending',
      phone: params.phone || '',
      address: params.address || '',
      note: params.note || ''
    };
    var orders = this._getOrders();
    orders.unshift(order);
    this._saveOrders(orders);
    user.greenCoin = (user.greenCoin || 0) + greenCoinEarned;
    this._saveUser(user);
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.trackPurchase) {
      for (var i = 0; i < params.items.length; i++) {
        AI_REC_SYSTEM.trackPurchase(params.items[i].productId);
      }
    }
    if (params.voucherCode) {
      var vouchers = this._getVouchers();
      for (var i = 0; i < vouchers.length; i++) {
        if (vouchers[i].code === params.voucherCode) {
          vouchers[i].isUsed = true;
          break;
        }
      }
      this._saveVouchers(vouchers);
    }
    var cart = this._getCart();
    var orderedIds = {};
    for (var i = 0; i < params.items.length; i++) orderedIds[params.items[i].productId] = true;
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
      if (!orderedIds[cart[i].productId]) newCart.push(cart[i]);
    }
    this._saveCart(newCart);
    return order;
  },

  addDonation: function(donation) {
    var coinEarned = donation.quantity * 15;
    var record = {
      id: 'DON-' + Date.now().toString(36).toUpperCase(),
      clothingType: donation.clothingType,
      quantity: donation.quantity,
      condition: donation.condition,
      address: donation.address,
      coinEarned: coinEarned,
      date: new Date().toLocaleDateString('en-US')
    };
    var donations = this._getDonations();
    donations.unshift(record);
    this._saveDonations(donations);
    var user = this._getUser();
    if (user) {
      user.greenCoin = (user.greenCoin || 0) + coinEarned;
      this._saveUser(user);
    }
    return coinEarned;
  },

  spendGreenCoin: function(amount) {
    var user = this._getUser();
    if (!user || (user.greenCoin || 0) < amount) return false;
    user.greenCoin -= amount;
    this._saveUser(user);
    return true;
  },

  redeemVoucher: function(cost, discount, description) {
    var user = this._getUser();
    if (!user || (user.greenCoin || 0) < cost) return null;
    var code = 'RF' + discount + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    var expires = new Date();
    expires.setDate(expires.getDate() + 30);
    var voucher = {
      id: 'V-' + Date.now().toString(36).toUpperCase(),
      code: code,
      discount: discount,
      description: description,
      expiresAt: expires.toLocaleDateString('en-US'),
      isUsed: false
    };
    var vouchers = this._getVouchers();
    vouchers.unshift(voucher);
    this._saveVouchers(vouchers);
    user.greenCoin -= cost;
    this._saveUser(user);
    return voucher;
  },

  applyVoucher: function(code) {
    var vouchers = this._getVouchers();
    for (var i = 0; i < vouchers.length; i++) {
      if (vouchers[i].code.toUpperCase() === code.toUpperCase() && !vouchers[i].isUsed) {
        return vouchers[i];
      }
    }
    return null;
  },

  markVoucherUsed: function(code) {
    var vouchers = this._getVouchers();
    for (var i = 0; i < vouchers.length; i++) {
      if (vouchers[i].code.toUpperCase() === code.toUpperCase()) {
        vouchers[i].isUsed = true;
        break;
      }
    }
    this._saveVouchers(vouchers);
  },

  getUserPassword: function(email) {
    var overrides = {};
    try { overrides = JSON.parse(localStorage.getItem('refashion_user_overrides')) || {}; } catch(e) {}
    var userOver = overrides[email.toLowerCase()] || {};
    if (userOver.password) {
      return userOver.password;
    }
    for (var i = 0; i < MOCK_ACCOUNTS.length; i++) {
      if (MOCK_ACCOUNTS[i].email.toLowerCase() === email.toLowerCase()) {
        return MOCK_ACCOUNTS[i].password;
      }
    }
    var users = this._getUsers();
    for (var j = 0; j < users.length; j++) {
      if (users[j].email.toLowerCase() === email.toLowerCase()) {
        return users[j].password;
      }
    }
    return '';
  },

  updateUserProfile: function(updatedData) {
    var user = this._getUser();
    if (!user) return { success: false, message: 'User not logged in.' };

    var phoneChanged = updatedData.phone !== user.phone;
    var passwordChanged = updatedData.password && updatedData.password.trim() !== '';

    // Check 7-day limit for phone change
    if (phoneChanged) {
      if (user.lastPhoneChange) {
        var diff = Date.now() - user.lastPhoneChange;
        var limit = 7 * 24 * 60 * 60 * 1000;
        if (diff < limit) {
          var remaining = limit - diff;
          var days = Math.floor(remaining / (24 * 60 * 60 * 1000));
          var hours = Math.ceil((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          return {
            success: false,
            message: 'Phone number can only be changed 7 days after the last change. Please wait ' + days + 'd ' + hours + 'h.'
          };
        }
      }
    }

    // Check 7-day limit for password change
    if (passwordChanged) {
      if (user.lastPasswordChange) {
        var diff = Date.now() - user.lastPasswordChange;
        var limit = 7 * 24 * 60 * 60 * 1000;
        if (diff < limit) {
          var remaining = limit - diff;
          var days = Math.floor(remaining / (24 * 60 * 60 * 1000));
          var hours = Math.ceil((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          return {
            success: false,
            message: 'Password can only be changed 7 days after the last change. Please wait ' + days + 'd ' + hours + 'h.'
          };
        }
      }
    }

    // Apply basic updates
    user.username = updatedData.username;
    user.gender = updatedData.gender;
    user.birthYear = updatedData.birthYear;
    user.address = updatedData.address;

    if (phoneChanged) {
      user.phone = updatedData.phone;
      user.lastPhoneChange = Date.now();
    }

    if (passwordChanged) {
      user.lastPasswordChange = Date.now();
    }

    // Persist changes
    // Check if the user is a registered user
    var isRegistered = false;
    var users = this._getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === user.email.toLowerCase()) {
        users[i].username = user.username;
        users[i].gender = user.gender;
        users[i].birthYear = user.birthYear;
        users[i].address = user.address;
        users[i].phone = user.phone;
        users[i].lastPhoneChange = user.lastPhoneChange || users[i].lastPhoneChange;
        users[i].lastPasswordChange = user.lastPasswordChange || users[i].lastPasswordChange;
        if (passwordChanged) {
          users[i].password = updatedData.password;
        }
        isRegistered = true;
        break;
      }
    }

    if (isRegistered) {
      this._saveUsers(users);
    } else {
      // Mock account overrides
      var overrides = {};
      try { overrides = JSON.parse(localStorage.getItem('refashion_user_overrides')) || {}; } catch(e) {}
      var emailKey = user.email.toLowerCase();
      var userOver = overrides[emailKey] || {};
      userOver.username = user.username;
      userOver.gender = user.gender;
      userOver.birthYear = user.birthYear;
      userOver.address = user.address;
      userOver.phone = user.phone;
      userOver.lastPhoneChange = user.lastPhoneChange || userOver.lastPhoneChange;
      userOver.lastPasswordChange = user.lastPasswordChange || userOver.lastPasswordChange;
      if (passwordChanged) {
        userOver.password = updatedData.password;
      }
      overrides[emailKey] = userOver;
      localStorage.setItem('refashion_user_overrides', JSON.stringify(overrides));
    }

    this._saveUser(user);
    return { success: true };
  }
};

var SHOP_PRODUCTS = [];

(function loadZalandoCatalog() {
  var url = '/datasets/products.json';

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var items = (data.products || []).map(function(p) {
        // Re-map image path to a root-relative path so it works from any page
        var img = p.image;
        if (img && img.indexOf('/datasets/') === 0) {
          img = img; // keep root-relative as-is
        }
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          garmentType: p.garmentType || 'upper',
          price: p.price,
          priceStr: p.priceStr,
          image: img,
          rating: p.rating || 4.5,
          ratingCount: p.ratingCount,
          store: p.store,
          storeLogo: p.storeLogo || '../images/store_eco_wear.png',
          clothFile: p.clothFile,
          description: p.description,
          fabric: p.fabric,
          colorPattern: p.colorPattern,
          shape: p.shape
        };
      });
      SHOP_PRODUCTS.length = 0;
      Array.prototype.push.apply(SHOP_PRODUCTS, items);
      syncSellerProducts();

      // Sync and initialize the user's AI profile from their history
      if (typeof RefashionAuth !== 'undefined' && typeof RefashionAuth.initializeUserProfile === 'function') {
        RefashionAuth.initializeUserProfile();
      }

      // Re-render components already on the page
      if (typeof renderShopFilters === 'function') renderShopFilters();
      if (typeof renderShopProducts === 'function') renderShopProducts();
      if (typeof renderFeaturedProducts === 'function') renderFeaturedProducts();
      // Notify detail page if waiting
      if (typeof window._onZalandoCatalogReady === 'function') {
        window._onZalandoCatalogReady();
        window._onZalandoCatalogReady = null;
      }
      document.dispatchEvent(new Event('zalandoCatalogReady'));
      console.log('[ReFashion] Zalando catalog loaded:', items.length, 'products');
    })
    .catch(function(e) {
      console.warn('[ReFashion] Zalando catalog fetch failed, using static fallback:', e.message);
      // Keep whatever is in SHOP_PRODUCTS (may already have synced items)
    });
})();



function loginUser(email, password) {
  var user = RefashionAuth.login(email, password);
  if (user) {
    var params = new URLSearchParams(window.location.search);
    var redirectTarget = params.get('redirect');
    if (redirectTarget) {
      window.location.href = redirectTarget;
    } else if (user.redirect) {
      window.location.href = user.redirect;
    } else {
      window.location.href = '/buyer/index.html';
    }
    return true;
  } else {
    alert('Sai email ho\u1eb7c m\u1eadt kh\u1ea9u!\n\nDemo Accounts:\n- buyer@refashion.vn / buyer123\n- seller@refashion.vn / seller123\n- admin@refashion.vn / admin123');
    return false;
  }
}

// Google Sign-In callback — called by Google Identity Services
function handleGoogleCredentialResponse(response) {
  try {
    var payload = response.credential.split('.')[1];
    var binaryString = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    var decoded = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    var email = decoded.email;
    var name = decoded.name || email.split('@')[0];
    var picture = decoded.picture || '';

    var userData = {
      username: name,
      email: email,
      phone: '',
      gender: 'unisex',
      address: '',
      birthYear: '',
      joinDate: new Date().toLocaleDateString('en-US'),
      greenCoin: 500,
      role: 'Buyer',
      avatar: picture,
      loginMethod: 'google'
    };

    var users = RefashionAuth._getUsers();
    var existingUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === email.toLowerCase()) {
        existingUser = users[i];
        break;
      }
    }
    if (existingUser) {
      userData.greenCoin = existingUser.greenCoin || 500;
      userData.phone = existingUser.phone || '';
      userData.address = existingUser.address || '';
      userData.username = name;
      existingUser.username = name; // Update in list
      RefashionAuth._saveUsers(users);
    } else {
      users.push({ username: name, email: email, password: '', phone: '', joinDate: userData.joinDate, greenCoin: 500, loginMethod: 'google' });
      RefashionAuth._saveUsers(users);
    }

    RefashionAuth._saveUser(userData);
    setSession(email, 'Buyer');
    RefashionAuth.initializeUserProfile();

    var params = new URLSearchParams(window.location.search);
    var redirectTarget = params.get('redirect');
    window.location.href = redirectTarget || '/buyer/index.html';
  } catch (err) {
    console.error('[ReFashion] Google Sign-In error:', err);
    alert('Google login failed. Please try again.');
  }
}

// Firebase Google Sign-In callback
function handleFirebaseGoogleLogin(email, name, picture) {
  try {
    var userData = {
      username: name,
      email: email,
      phone: '',
      gender: 'unisex',
      address: '',
      birthYear: '',
      joinDate: new Date().toLocaleDateString('en-US'),
      greenCoin: 500,
      role: 'Buyer',
      avatar: picture,
      loginMethod: 'google'
    };

    var users = RefashionAuth._getUsers();
    var existingUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === email.toLowerCase()) {
        existingUser = users[i];
        break;
      }
    }
    if (existingUser) {
      userData.greenCoin = existingUser.greenCoin || 500;
      userData.phone = existingUser.phone || '';
      userData.address = existingUser.address || '';
      userData.username = name;
      existingUser.username = name; // Update in list
      RefashionAuth._saveUsers(users);
    } else {
      users.push({ username: name, email: email, password: '', phone: '', joinDate: userData.joinDate, greenCoin: 500, loginMethod: 'google' });
      RefashionAuth._saveUsers(users);
    }

    RefashionAuth._saveUser(userData);
    setSession(email, 'Buyer');
    RefashionAuth.initializeUserProfile();

    var params = new URLSearchParams(window.location.search);
    var redirectTarget = params.get('redirect');
    window.location.href = redirectTarget || '/buyer/index.html';
  } catch (err) {
    console.error('[ReFashion] Firebase Google Sign-In error:', err);
    alert('Google login failed. Please try again.');
  }
}
window.handleFirebaseGoogleLogin = handleFirebaseGoogleLogin;

function handleFirebaseLoginSuccess(userData) {
  try {
    // Save user object locally
    localStorage.setItem('refashion_current_user', JSON.stringify(userData));
    setSession(userData.email, userData.role);

    // Sync mock carts & orders if applicable
    var mockMatch = (window.MOCK_ACCOUNTS || []).find(function(a) {
      return a.email.toLowerCase() === userData.email.toLowerCase();
    });
    if (mockMatch && userData.role === 'Buyer') {
      if (mockMatch.cart) RefashionAuth._saveCart(mockMatch.cart);
      if (mockMatch.orders) RefashionAuth._saveOrders(mockMatch.orders);
    }

    RefashionAuth.initializeUserProfile();

    // Redirection
    var params = new URLSearchParams(window.location.search);
    var redirectTarget = params.get('redirect');
    if (redirectTarget) {
      window.location.href = redirectTarget;
    } else {
      if (userData.role === 'Seller') {
        window.location.href = '/seller/seller_dashboard.html';
      } else if (userData.role === 'Admin') {
        window.location.href = '/admin/index.html';
      } else {
        window.location.href = '/buyer/index.html';
      }
    }
  } catch (err) {
    console.error('[ReFashion] Firebase session sync error:', err);
    alert('Login successful but session setup failed: ' + err.message);
  }
}
window.handleFirebaseLoginSuccess = handleFirebaseLoginSuccess;


function runRoleGuard() {
  var session = getSession();
  var currentPath = window.location.pathname.toLowerCase();
  if (currentPath.indexOf('/admin/') !== -1) {
    if (!session || session.role !== 'Admin') {
      alert('Access Denied: Requires Admin Role.');
      window.location.href = '/auth/login.html';
      return;
    }
  }
  if (currentPath.indexOf('/seller/') !== -1) {
    if (!session || session.role !== 'Seller') {
      alert('Access Denied: Requires Seller Role.');
      window.location.href = '/auth/login.html';
      return;
    }
  }
  if (currentPath.indexOf('/buyer/') !== -1 && session) {
    if (session.role === 'Seller') {
      window.location.href = '/seller/seller_dashboard.html';
      return;
    }
    if (session.role === 'Admin') {
      window.location.href = '/admin/index.html';
      return;
    }
  }
}

function initSharedOrders() {
  if (localStorage.getItem('refashion_shared_orders')) return;
  ajaxGetJSON(
    '/datasets/order.json',
    function(data) {
      var orders = data.orders || [];
      for (var i = 0; i < orders.length; i++) {
        var ord = orders[i];
        if (ord.customer && ord.customer.name === 'Nguyen Van A') {
          ord.buyerEmail = 'buyer@refashion.vn';
        } else if (ord.customer && ord.customer.name === 'Tran Thi B') {
          ord.buyerEmail = 'buyer_women@refashion.vn';
        } else {
          ord.buyerEmail = 'buyer@refashion.vn';
        }
      }
      localStorage.setItem('refashion_shared_orders', JSON.stringify(orders));
    },
    function(err) {
      console.warn('Failed to load order.json for shared orders initialization:', err.message);
      localStorage.setItem('refashion_shared_orders', JSON.stringify([]));
    }
  );
}

function initSharedChats() {
  if (localStorage.getItem('refashion_shared_chats')) return;
  ajaxGetJSON(
    '/datasets/comment.json',
    function(data) {
      localStorage.setItem('refashion_shared_chats', JSON.stringify(data.conversations || []));
    },
    function(err) {
      console.warn('Failed to load comment.json for shared chats:', err.message);
      localStorage.setItem('refashion_shared_chats', JSON.stringify([]));
    }
  );
}

function initApp() {
  initSharedOrders();
  initSharedChats();
  ajaxGetJSON(
    '/datasets/accounts.json',
    function(data) { MOCK_ACCOUNTS = data.accounts || []; runRoleGuard(); },
    function(err) {
      console.warn('[mainjs] Falling back to inline accounts:', err.message);
      MOCK_ACCOUNTS = [
        { email: 'buyer@refashion.vn', password: 'buyer123', role: 'Buyer', name: 'Demo Buyer', redirect: '/buyer/index.html' },
        { email: 'seller@refashion.vn', password: 'seller123', role: 'Seller', name: 'Eco Wear Store', redirect: '/seller/seller_dashboard.html', store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
        { email: 'seller_hemp@refashion.vn', password: 'seller123', role: 'Seller', name: 'Hemp & Bamboo Store', redirect: '/seller/seller_dashboard.html', store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
        { email: 'seller_retro@refashion.vn', password: 'seller123', role: 'Seller', name: 'Retro Chic Store', redirect: '/seller/seller_dashboard.html', store: 'Retro Chic', storeLogo: '../images/store_retro_chic.png' },
        { email: 'seller_denim@refashion.vn', password: 'seller123', role: 'Seller', name: 'Denim Craft Store', redirect: '/seller/seller_dashboard.html', store: 'Denim Craft', storeLogo: '../images/store_denim_craft.png' },
        { email: 'seller_greenthread@refashion.vn', password: 'seller123', role: 'Seller', name: 'Green Thread Store', redirect: '/seller/seller_dashboard.html', store: 'Green Thread', storeLogo: '../images/store_green_thread.png' },
        { email: 'seller_zerowaste@refashion.vn', password: 'seller123', role: 'Seller', name: 'Zero Waste Store', redirect: '/seller/seller_dashboard.html', store: 'Zero Waste', storeLogo: '../images/store_zero_waste.png' },
        { email: 'admin@refashion.vn', password: 'admin123', role: 'Admin', name: 'Admin ReFashion', redirect: '/admin/index.html' },
        { email: 'giangnntk24411@st.uel.edu.vn', password: 'giang123', role: 'Buyer', name: 'Giang Buyer', redirect: '/buyer/index.html' },
        { email: 'nhidqk24411@st.uel.edu.vn', password: 'nhi123', role: 'Seller', name: 'Nhi Eco Store', redirect: '/seller/seller_dashboard.html', store: 'Nhi Eco Wear', storeLogo: '../images/store_eco_wear.png' },
        { email: 'huyndk24411@st.uel.edu.vn', password: 'huy123', role: 'Admin', name: 'Huy Admin', redirect: '/admin/index.html' }
      ];
      runRoleGuard();
    }
  );
}

function renderNavbar(containerId, prefix) {
  prefix = prefix || '';
  var container = document.getElementById(containerId);
  if (!container) return;
  var user = RefashionAuth._getUser();
  var isLoggedIn = !!user;
  var cartCount = RefashionAuth.getCartCount();
  var loginLink = '/auth/login.html';
  var registerLink = '/auth/register.html';

  container.innerHTML =
    '<header class="navbar-header glass">' +
      '<div class="container" style="display:flex;justify-content:space-between;align-items:center;height:70px">' +
        '<a href="/buyer/index.html" class="logo-brand">ReFashion<span>Eco</span></a>' +
        '<nav><ul class="nav-links-list">' +
          '<li><a href="/buyer/index.html" class="nav-link-item" id="nav-home">Home</a></li>' +
          '<li><a href="/buyer/shop.html" class="nav-link-item" id="nav-shop">Shop</a></li>' +
          '<li><a href="/buyer/community.html" class="nav-link-item" id="nav-community">GreenCoin & Rewards</a></li>' +
          '<li><a href="/buyer/secondhand.html" class="nav-link-item" id="nav-secondhand">Secondhand Market</a></li>' +
          '<li><a href="/buyer/about.html" class="nav-link-item" id="nav-about">About Us</a></li>' +
        '</ul></nav>' +
        '<div class="nav-actions-div">' +
          '<a href="/buyer/cart.html" style="position:relative;padding:0.5rem;cursor:pointer" id="nav-cart-link">' +
            '<i class="fa-solid fa-bag-shopping" style="font-size:1.2rem;color:var(--foreground)"></i>' +
            (cartCount > 0 ? '<span style="position:absolute;top:0;right:0;background-color:var(--accent);color:white;font-size:0.65rem;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center">' + cartCount + '</span>' : '') +
          '</a>' +
          (isLoggedIn && user ? (
            '<div style="position:relative" id="profile-dropdown-wrap">' +
              '<button id="profile-avatar-btn" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;padding:0;overflow:hidden">' +
                user.username.charAt(0).toUpperCase() +
              '</button>' +
            '</div>'
          ) : (
            '<div style="display:flex;gap:0.5rem">' +
              '<a href="' + loginLink + '" class="btn btn-outline" style="padding:0.5rem 1.2rem;font-size:0.85rem">Login</a>' +
              '<a href="' + registerLink + '" class="btn btn-primary" style="padding:0.5rem 1.2rem;font-size:0.85rem">Register</a>' +
            '</div>'
          )) +
        '</div>' +
      '</div>' +
    '</header>';

  if (isLoggedIn && user) {
    var avatarBtn = document.getElementById('profile-avatar-btn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', function() {
        var existing = document.getElementById('profile-dropdown');
        if (existing) { existing.remove(); return; }
        var dd = document.createElement('div');
        dd.id = 'profile-dropdown';
        dd.className = 'profile-dropdown animate-fade-in-up';
        dd.style.cssText = 'position:absolute;top:calc(100% + 12px);right:0;width:320px;background-color:var(--card);border:1px solid var(--border);border-radius:20px;box-shadow:0 20px 50px var(--shadow-lg);z-index:1000;overflow:hidden';
        dd.innerHTML =
          '<div style="padding:1.5rem;background:linear-gradient(135deg,var(--primary),hsl(142,55%,30%));color:white">' +
            '<div style="display:flex;align-items:center;gap:1rem">' +
              '<div style="width:48px;height:48px;border-radius:50%;background-color:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.25rem;flex-shrink:0">' + user.username.charAt(0).toUpperCase() + '</div>' +
              '<div><h4 style="font-weight:700;font-size:1rem;margin-bottom:0.15rem">' + user.username + '</h4><p style="font-size:0.8rem;opacity:0.85">' + user.email + '</p></div>' +
            '</div>' +
            '<div style="margin-top:1rem;background-color:rgba(255,255,255,0.15);border-radius:12px;padding:0.6rem 1rem;display:flex;align-items:center;justify-content:space-between">' +
              '<span style="font-size:0.8rem;font-weight:600"><i class="fa-solid fa-leaf" style="margin-right:0.35rem"></i>GreenCoin</span>' +
              '<span style="font-size:1.15rem;font-weight:900">' + (user.greenCoin || 0) + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="padding:0.5rem">' +
            '<a href="/buyer/profile.html" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-user" style="width:20px;text-align:center;color:var(--primary)"></i>My Profile</a>' +
            '<a href="/buyer/orders.html" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-clock-rotate-left" style="width:20px;text-align:center;color:var(--accent)"></i>Order History</a>' +
            '<a href="/buyer/community.html" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-leaf" style="width:20px;text-align:center;color:var(--sentiment-pos)"></i>GreenCoin & Rewards</a>' +
            '<hr style="border:0;border-top:1px solid var(--border);margin:0.35rem 0.5rem" />' +
            '<button onclick="RefashionAuth.logout()" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--sentiment-neg);width:100%;background:transparent;border:none;cursor:pointer;text-align:left;font-family:var(--font-sans)"><i class="fa-solid fa-right-from-bracket" style="width:20px;text-align:center"></i>Logout</button>' +
          '</div>';
        avatarBtn.parentElement.appendChild(dd);
        document.addEventListener('mousedown', function closeDD(e) {
          if (dd && !dd.parentElement.contains(e.target)) { dd.remove(); document.removeEventListener('mousedown', closeDD); }
        });
      });
    }
  }

  setActiveNav();
}

function renderFooter(containerId, prefix) {
  prefix = prefix || '';
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML =
    '<header class="footer-main">' +
      '<div class="container">' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:3rem;margin-bottom:3rem">' +
          '<div><h3 style="font-family:var(--font-serif);font-size:1.5rem;margin-bottom:1rem;color:white">ReFashion <span style="font-family:var(--font-sans);font-size:0.8rem;color:var(--accent)">ECO</span></h3>' +
            '<p style="font-size:0.9rem;line-height:1.6;color:hsl(30,10%,75%);margin-bottom:1.5rem">We don\'t just sell green clothing. We walk with you on the path to reducing fashion waste, promoting recycling, and protecting our green Earth.</p>' +
            '<div style="display:flex;gap:1rem;font-size:1.2rem"><a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="Youtube"><i class="fa-brands fa-youtube"></i></a></div>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">Shop & Recycle</h4>' +
            '<ul style="list-style:none;display:flex;flex-direction:column;gap:0.75rem;font-size:0.9rem">' +
              '<li><a href="/buyer/shop.html">All Eco Products</a></li>' +
              '<li><a href="/buyer/shop.html?eco=organic">Organic Fabrics</a></li>' +
              '<li><a href="/buyer/shop.html?eco=recycled">Recycled Materials</a></li>' +
              '<li><a href="/buyer/community.html">Donate Old Clothes</a></li>' +
              '<li><a href="/buyer/community.html">Waste Processing Loop</a></li>' +
            '</ul>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">Planet Campaigns</h4>' +
            '<ul style="list-style:none;display:flex;flex-direction:column;gap:0.75rem;font-size:0.9rem">' +
              '<li><a href="#">1% for the Planet Statement</a></li>' +
              '<li><a href="#">Beach Cleanup Activism</a></li>' +
              '<li><a href="#">Non-Profit Organization Hub</a></li>' +
              '<li><a href="#">Track Your Carbon Footprint</a></li>' +
            '</ul>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">Subscribe to Eco News</h4>' +
            '<p style="font-size:0.85rem;color:hsl(30,10%,75%);margin-bottom:1rem;line-height:1.5">Get the latest updates on eco-friendly products and our environmental protection campaigns.</p>' +
            '<form onsubmit="event.preventDefault();alert(\'Thank you for subscribing!\')" style="display:flex;gap:0.5rem">' +
              '<input type="email" placeholder="Your email..." required style="padding:0.6rem 1rem;border-radius:30px;border:1px solid hsl(210,15%,25%);background-color:hsl(210,15%,16%);color:white;font-size:0.85rem;flex-grow:1" />' +
              '<button class="btn btn-accent" type="submit" style="padding:0.6rem 1.2rem;font-size:0.85rem">Subscribe</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
        '<hr style="border:0;border-top:1px solid hsl(210,15%,20%);margin-bottom:2rem" />' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:0.8rem;color:hsl(30,10%,60%)">' +
          '<p>&copy; ' + new Date().getFullYear() + ' ReFashion Eco Inc. Design inspired by Patagonia\'s Earth conservation mission.</p>' +
          '<div style="display:flex;gap:1.5rem"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Cookies Settings</a></div>' +
        '</div>' +
      '</div>' +
    '</footer>';
}

function setActiveNav() {
  var pathParts = window.location.pathname.split('/').filter(function(s) { return s !== ''; });
  var page = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'index.html';
  var pageName = page.replace('.html', '');
  var map = {
    'index': 'nav-home',
    'buyer': 'nav-home',
    'shop': 'nav-shop',
    'shop-detail': 'nav-shop',
    'cart': 'nav-cart',
    'checkout': 'nav-cart',
    'community': 'nav-community',
    'secondhand': 'nav-secondhand',
    'about': 'nav-about',
    'profile': 'nav-home'
  };
  var id = map[pageName];
  if (id) {
    var el = document.getElementById(id);
    if (el) { el.style.color = 'var(--primary)'; el.style.fontWeight = '600'; }
  }
}

function showToast(msg) {
  var existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentElement) toast.remove(); }, 3000);
}

function showAlert(msg) {
  var existing = document.querySelector('.custom-alert-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';

  var box = document.createElement('div');
  box.className = 'custom-alert-box';

  var icon = document.createElement('div');
  icon.className = 'custom-alert-icon';
  icon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

  var text = document.createElement('p');
  text.className = 'custom-alert-text';
  text.textContent = msg;

  var btn = document.createElement('button');
  btn.className = 'custom-alert-btn';
  btn.textContent = 'OK';
  btn.onclick = function() { overlay.remove(); };

  box.appendChild(icon);
  box.appendChild(text);
  box.appendChild(btn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

// Sync seller products from localStorage into SHOP_PRODUCTS
function syncSellerProducts() {
  try {
    for (var k = 0; k < localStorage.length; k++) {
      var key = localStorage.key(k);
      if (key && key.indexOf('refashion_seller_products_') === 0) {
        var storeName = key.replace('refashion_seller_products_', '');
        var stored = localStorage.getItem(key);
        if (!stored) continue;
        var sellerProds = JSON.parse(stored);
        
        var existingIds = {};
        for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
          existingIds[String(SHOP_PRODUCTS[i].id)] = true;
        }
        
        var storeLogo = '../images/store_' + storeName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') + '.png';
        
        for (var j = 0; j < sellerProds.length; j++) {
          var p = sellerProds[j];
          var idStr = String(p.id);
          if (existingIds[idStr]) continue;
          
          var minPrice = p.price || 0;
          if (p.variants && p.variants.length > 0) {
            var prices = p.variants.map(function(v) { return v.price || 0; });
            minPrice = Math.min.apply(null, prices);
          }
          
          var shopProd = {
            id: idStr,
            name: p.name,
            category: p.category || 'others',
            price: minPrice,
            priceStr: minPrice.toLocaleString('vi-VN') + ' VND',
            image: p.images && p.images.length > 0 ? p.images[0] : (p.image || '../images/store_logo.png'),
            rating: 4.9,
            ratingCount: 0,
            store: storeName,
            storeLogo: storeLogo
          };
          SHOP_PRODUCTS.push(shopProd);
        }
      }
    }
  } catch(e) {
    console.error('Error syncing seller products into SHOP_PRODUCTS:', e);
  }
}
syncSellerProducts();

document.addEventListener('DOMContentLoaded', function() {
  initApp();
});
