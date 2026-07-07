/* ==================== REAL BACKGROUND DEEP LEARNING RECOMMENDATION SYSTEM ==================== */

var AI_REC_SYSTEM = {
  profile: {
    genders: {},
    styles: {},
    categories: {},
    stores: {},
    keywords: {}
  },
  initialized: false,
  ready: false, // set to true once similarities are loaded from cache or computed
  similarities: {}, // productId -> score (0 to 100)
  model: null,
  tokenizer: null,
  hfToken: null,

  init: function() {
    this.initialized = true;
    var self = this;
    
    // Load HF_TOKEN dynamically from .env if present
    self.loadToken();

    // Auto-activate and load the deep learning model on startup silently
    if (typeof SHOP_PRODUCTS !== 'undefined' && SHOP_PRODUCTS.length > 0) {
      self.activateAI();
    } else {
      document.addEventListener('zalandoCatalogReady', function() {
        self.activateAI();
      });
    }
  },

  loadProfile: function() {
    try {
      var saved = localStorage.getItem('refashion_user_profile');
      if (saved) {
        this.profile = JSON.parse(saved);
      }
      
      // Load similarity cache to prevent layout shift and keep sorted products on navigation back
      var cachedSim = localStorage.getItem('refashion_ai_similarities');
      if (cachedSim) {
        this.similarities = JSON.parse(cachedSim);
        this.ready = true;
        console.log('[AI Rec] Similarity cache loaded successfully:', Object.keys(this.similarities).length, 'items');
      }
    } catch (e) {
      console.warn('[AI Rec] Failed to load user profile or similarity cache:', e);
    }
  },

  saveProfile: function() {
    try {
      localStorage.setItem('refashion_user_profile', JSON.stringify(this.profile));
    } catch(e) {
      console.error('[AI Rec] Failed to save user profile:', e);
    }
  },

  activateAI: async function() {
    var self = this;
    console.log('[AI Rec] Silently initiating deep learning models in the background...');

    // Dynamic import of transformers library
    var script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = 
      'import { env, SiglipTextModel, AutoTokenizer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.19/+esm";\n' +
      'env.allowLocalModels = false;\n' +
      'env.remoteHost = "https://hf-mirror.com/";\n' +
      'window.SiglipTextModel = SiglipTextModel;\n' +
      'window.AutoTokenizer = AutoTokenizer;\n' +
      'window.dispatchEvent(new CustomEvent("transformersLoaded"));';
    
    document.head.appendChild(script);

    window.addEventListener('transformersLoaded', async function() {
      try {
        const model_id = 'Marqo/marqo-fashionSigLIP';

        // Load Tokenizer
        self.tokenizer = await window.AutoTokenizer.from_pretrained(model_id);

        // Load Model (explicitly specify q8 for smaller download size and faster WASM inference)
        self.model = await window.SiglipTextModel.from_pretrained(model_id, { dtype: 'q8' });

        console.log('[AI Rec] Model weights loaded successfully. Computing recommendations...');
        await self.computeRecommendations();

      } catch (err) {
        console.error('[AI Rec] Failed to load Hugging Face model, using local fallback:', err);
        self.computeLocalSimilarity();
      }
    });

    // Timeout fallback (8 seconds) if CDN hangs
    setTimeout(function() {
      if (!self.model && !self.tokenizer) {
        console.warn('[AI Rec] Loading timeout. Reverting to local NLP similarity engine.');
        self.computeLocalSimilarity();
      }
    }, 8500);
  },

  getProductRealAttributes: function(product) {
    var gender = 'unisex';
    var imgLower = (product.image || '').toLowerCase();
    var nameLower = (product.name || '').toLowerCase();
    if (imgLower.indexOf('men-') !== -1 || nameLower.indexOf('men') !== -1) {
      gender = 'men';
    } else if (imgLower.indexOf('women-') !== -1 || nameLower.indexOf('women') !== -1) {
      gender = 'women';
    }

    var category = product.category || 'upper';
    
    // Map fabric
    var fabricName = 'cotton'; // default
    if (product.fabric) {
      var fVal = category === 'lower' ? product.fabric.lower : product.fabric.upper;
      if ((fVal === undefined || fVal === 7) && product.fabric.outer !== undefined && product.fabric.outer !== 7) {
        fVal = product.fabric.outer;
      }
      var fabricsList = ['denim', 'cotton', 'leather', 'furry', 'knitted', 'chiffon', 'other'];
      if (fVal >= 0 && fVal < fabricsList.length) {
        fabricName = fabricsList[fVal];
      }
    }

    // Map color/pattern
    var patternName = 'pure color'; // default
    if (product.colorPattern) {
      var pVal = category === 'lower' ? product.colorPattern.lower : product.colorPattern.upper;
      if ((pVal === undefined || pVal === 7) && product.colorPattern.outer !== undefined && product.colorPattern.outer !== 7) {
        pVal = product.colorPattern.outer;
      }
      var patternsList = ['floral', 'graphic', 'striped', 'pure color', 'lattice', 'other', 'color block'];
      if (pVal >= 0 && pVal < patternsList.length) {
        patternName = patternsList[pVal];
      }
    }

    // Map shape (sleeve)
    var sleeveName = '';
    if (product.shape && product.shape[0] !== undefined) {
      var sVal = product.shape[0];
      var sleevesList = ['sleeveless', 'short-sleeve', 'medium-sleeve', 'long-sleeve', 'not long-sleeve'];
      if (sVal >= 0 && sVal < sleevesList.length) {
        sleeveName = sleevesList[sVal];
      }
    }

    // Map shape (neckline)
    var necklineName = '';
    if (product.shape && product.shape[9] !== undefined) {
      var nVal = product.shape[9];
      var necklinesList = ['V-shape neckline', 'square neckline', 'round neckline', 'standing neckline', 'lapel neckline', 'suspender neckline'];
      if (nVal >= 0 && nVal < necklinesList.length) {
        necklineName = necklinesList[nVal];
      }
    }

    return {
      gender: gender,
      fabric: fabricName,
      pattern: patternName,
      sleeve: sleeveName,
      neckline: necklineName,
      category: category,
      store: product.store || 'Eco Wear'
    };
  },

  // Extract attributes from VTON dataset filenames and catalog details
  extractAttributes: function(product) {
    var realAttrs = this.getProductRealAttributes(product);
    return {
      gender: realAttrs.gender,
      style: realAttrs.fabric, // map fabric as primary style keyword
      pattern: realAttrs.pattern,
      sleeve: realAttrs.sleeve,
      neckline: realAttrs.neckline
    };
  },

  // Record an interaction weight
  trackInteraction: function(product, weight) {
    if (!product) return;
    var attrs = this.extractAttributes(product);

    this.profile.genders[attrs.gender] = (this.profile.genders[attrs.gender] || 0) + weight;
    this.profile.styles[attrs.style] = (this.profile.styles[attrs.style] || 0) + weight;

    // Save detailed attributes as styles so they get picked up as preferred query strings
    if (attrs.pattern && attrs.pattern !== 'other' && attrs.pattern !== 'NA') {
      this.profile.styles[attrs.pattern] = (this.profile.styles[attrs.pattern] || 0) + weight;
    }
    if (attrs.sleeve && attrs.sleeve !== 'NA') {
      this.profile.styles[attrs.sleeve] = (this.profile.styles[attrs.sleeve] || 0) + weight;
    }
    if (attrs.neckline && attrs.neckline !== 'NA') {
      this.profile.styles[attrs.neckline] = (this.profile.styles[attrs.neckline] || 0) + weight;
    }

    var tokens = (product.name || '').toLowerCase().split(/\s+/).filter(function(t) {
      return t.length > 2 && ['cho', 'choo', 'của', 'nam', 'nữ', 'thời', 'trang', 'màu', 'hiệu'].indexOf(t) === -1;
    });
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      this.profile.keywords[t] = (this.profile.keywords[t] || 0) + weight;
    }

    this.saveProfile();
    this.computeRecommendations();
  },

  trackView: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 1);
  },

  trackCart: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 3);
  },

  trackPurchase: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 5);
  },

  findProduct: function(productId) {
    if (!productId) return null;
    productId = String(productId);
    for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
      if (String(SHOP_PRODUCTS[i].id) === productId) {
        return SHOP_PRODUCTS[i];
      }
    }
    return null;
  },

  // Calculate matching scores using deep learning model embeddings
  computeRecommendations: async function() {
    var self = this;
    
    var refTexts = [];
    var totalInt = 0;
    for (var k in this.profile.categories) totalInt += this.profile.categories[k];
    for (var k in this.profile.genders) totalInt += this.profile.genders[k];
    for (var k in this.profile.styles) totalInt += this.profile.styles[k];
    for (var k in this.profile.keywords) totalInt += this.profile.keywords[k];
    
    if (totalInt > 0) {
      for (var gender in this.profile.genders) {
        if (this.profile.genders[gender] > 0) refTexts.push(gender);
      }
      for (var style in this.profile.styles) {
        if (this.profile.styles[style] > 0) refTexts.push(style);
      }
      for (var cat in this.profile.categories) {
        if (this.profile.categories[cat] > 0) refTexts.push(cat);
      }
      for (var kw in this.profile.keywords) {
        if (this.profile.keywords[kw] > 0) refTexts.push(kw);
      }
    }

    if (refTexts.length === 0) {
      refTexts.push('sustainable circular clothing fashion');
    }

    var combinedQuery = refTexts.join(' ').toLowerCase();

    if (self.model && self.tokenizer) {
      try {
        console.log('[AI Rec] Computing similarities using Marqo-FashionSigLIP embeddings...');
        
        // 1. Get query embedding
        const queryInputs = self.tokenizer([combinedQuery], { padding: 'max_length', truncation: true });
        const queryOutputs = await self.model(queryInputs);
        const queryEmbeds = queryOutputs.text_embeds || queryOutputs.pooler_output || queryOutputs[0];
        const normQueryEmbed = queryEmbeds.normalize().tolist()[0];

        // 2. Score all catalog products
        var len = SHOP_PRODUCTS.length;
        for (var idx = 0; idx < len; idx++) {
          var p = SHOP_PRODUCTS[idx];
          
          var cacheKey = 'rf_embed_' + p.id;
          var normProdEmbed = null;
          try {
            var cached = localStorage.getItem(cacheKey);
            if (cached) {
              normProdEmbed = JSON.parse(cached);
            }
          } catch(e) {}

          if (!normProdEmbed) {
            var text = p.name + ' ' + (p.description || p.category);
            const prodInputs = self.tokenizer([text], { padding: 'max_length', truncation: true });
            const prodOutputs = await self.model(prodInputs);
            const prodEmbeds = prodOutputs.text_embeds || prodOutputs.pooler_output || prodOutputs[0];
            normProdEmbed = prodEmbeds.normalize().tolist()[0];
            try {
              localStorage.setItem(cacheKey, JSON.stringify(normProdEmbed));
            } catch(e) {}
          }

          var dotProd = 0;
          for (var d = 0; d < normQueryEmbed.length; d++) {
            dotProd += normQueryEmbed[d] * normProdEmbed[d];
          }
          var score = Math.max(0, Math.min(99, Math.round((dotProd + 1) * 50)));
          self.similarities[p.id] = score;
        }

        // Cache computed similarities in localStorage
        try {
          localStorage.setItem('refashion_ai_similarities', JSON.stringify(self.similarities));
        } catch(e) {}

        self.ready = true;

      } catch (err) {
        console.error('[AI Rec] Neural network error, falling back to local NLP:', err);
        self.computeLocalSimilarity();
      }
    } else {
      self.computeLocalSimilarity();
    }

    // Refresh dynamic layouts
    if (typeof renderShopProducts === 'function') {
      renderShopProducts();
    }
    if (typeof renderFeaturedProducts === 'function') {
      renderFeaturedProducts();
    }
  },

  // Fallback smart similarity scoring
  computeLocalSimilarity: function() {
    var refTexts = [];
    var totalInt = 0;
    for (var k in this.profile.categories) totalInt += this.profile.categories[k];
    for (var k in this.profile.genders) totalInt += this.profile.genders[k];
    for (var k in this.profile.styles) totalInt += this.profile.styles[k];
    for (var k in this.profile.keywords) totalInt += this.profile.keywords[k];
    
    if (totalInt > 0) {
      for (var gender in this.profile.genders) {
        if (this.profile.genders[gender] > 0) refTexts.push(gender);
      }
      for (var style in this.profile.styles) {
        if (this.profile.styles[style] > 0) refTexts.push(style);
      }
      for (var kw in this.profile.keywords) {
        if (this.profile.keywords[kw] > 0) refTexts.push(kw);
      }
    }
    var combinedQuery = refTexts.join(' ').toLowerCase();
    var queryTokens = combinedQuery.split(/\s+/).filter(Boolean);

    for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
      var p = SHOP_PRODUCTS[i];
      var text = (p.name + ' ' + p.category + ' ' + (p.description || '')).toLowerCase();
      var score = 30;

      var matches = 0;
      for (var t = 0; t < queryTokens.length; t++) {
        if (text.indexOf(queryTokens[t]) !== -1) {
          matches++;
        }
      }
      
      if (queryTokens.length > 0) {
        score += Math.round((matches / queryTokens.length) * 55);
      }
      
      var attrs = this.extractAttributes(p);
      if (this.profile.categories[attrs.category]) {
        score += 10;
      }
      if (this.profile.genders[attrs.gender]) {
        score += 5;
      }
      
      this.similarities[p.id] = Math.min(99, score);
    }

    // Cache computed similarities in localStorage
    try {
      localStorage.setItem('refashion_ai_similarities', JSON.stringify(this.similarities));
    } catch(e) {}

    this.ready = true;

    if (typeof renderShopProducts === 'function') {
      renderShopProducts();
    }
    if (typeof renderFeaturedProducts === 'function') {
      renderFeaturedProducts();
    }
  },

  // Asynchronously explains the recommendation using Shapley values and NLG
  explainProduct: async function(product) {
    var self = this;
    try {
      var shapleyResult = await self.computeShapleyValues(product);
      if (!shapleyResult || !shapleyResult.shapley) {
        if (typeof getXaiExplanation === 'function') return getXaiExplanation(product);
        return "Sản phẩm được gợi ý nhờ tính tương thích cao với các tương tác trước đó của bạn.";
      }

      var shapley = shapleyResult.shapley;
      var totalPositive = 0;
      var shapleyPct = {};
      for (var k in shapley) {
        if (shapley[k] > 0) totalPositive += shapley[k];
      }
      for (var k in shapley) {
        shapleyPct[k] = totalPositive > 0 ? Math.round((shapley[k] / totalPositive) * 100) : 0;
      }

      // Generate visual Shapley contributions chart
      var isLocalFallback = (!self.model || !self.tokenizer);
      var chartHtml = '<div class="xai-shapley-chart" style="margin: 8px 0 12px 0; background:rgba(0,0,0,0.02); padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.05);">';
      chartHtml += '<div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; margin-bottom:8px; color:var(--text-muted); display:flex; justify-content:space-between;"><span>Yếu tố đóng góp (Shapley Value)</span><span>' + (isLocalFallback ? 'Trọng số (Cục bộ)' : 'Trọng số (AI Model)') + '</span></div>';
      
      var chartFeatures = [];
      for (var k in shapley) {
        if (shapley[k] > 0) {
          var pct = shapleyPct[k];
          var label = "";
          var icon = "";
          if (k === 'gender') { label = "Giới tính"; icon = "fa-venus-mars"; }
          else if (k === 'fabric') { label = "Chất liệu"; icon = "fa-scissors"; }
          else if (k === 'pattern') { label = "Họa tiết"; icon = "fa-palette"; }
          else if (k === 'shape') { label = "Kiểu dáng"; icon = "fa-shirt"; }
          if (label) {
            chartFeatures.push({ label: label, icon: icon, pct: pct });
          }
        }
      }
      chartFeatures.sort(function(a,b) { return b.pct - a.pct; });

      chartFeatures.forEach(function(f) {
        chartHtml += '<div style="margin-bottom: 6px;">' +
          '<div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:2px;">' +
            '<span><i class="fa-solid ' + f.icon + '" style="margin-right:5px; color:var(--primary);"></i>' + f.label + '</span>' +
            '<span style="font-weight:600;">+' + f.pct + '%</span>' +
          '</div>' +
          '<div style="height:6px; background:rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">' +
            '<div style="height:100%; width:' + f.pct + '%; background:linear-gradient(90deg, var(--primary), #85e3b2); border-radius:3px;"></div>' +
          '</div>' +
        '</div>';
      });
      chartHtml += '</div>';

      var nlgText = self.generateNlgExplanation(shapleyResult, product);
      return chartHtml + '<div style="font-size:0.8rem; line-height:1.45; color:var(--text-dark); text-align:justify;">' + nlgText + '</div>';

    } catch(e) {
      console.error('[XAI] Failed to compute Shapley values:', e);
      if (typeof getXaiExplanation === 'function') {
        return getXaiExplanation(product);
      }
      return "Sản phẩm được gợi ý nhờ tính tương thích cao với các tương tác trước đó của bạn.";
    }
  },

  // Compute exact Shapley values for a product's recommendation score based strictly on deep learning model or local profile weights fallback
  computeShapleyValues: async function(product) {
    var self = this;

    // 1. Extract product's own actual attributes
    var attrs = self.extractAttributes(product);
    var features = [];
    
    if (attrs.gender) {
      features.push({ name: 'Gender', value: attrs.gender, type: 'gender' });
    }
    if (attrs.style) { // style maps to fabric
      features.push({ name: 'Fabric', value: attrs.style, type: 'fabric' });
    }
    if (attrs.pattern) {
      features.push({ name: 'Pattern', value: attrs.pattern, type: 'pattern' });
    }
    var shapeVal = attrs.sleeve || attrs.neckline;
    if (shapeVal) {
      features.push({ name: 'Shape', value: shapeVal, type: 'shape' });
    }

    var n = features.length;
    var shapley = {};
    for (var i = 0; i < n; i++) {
      shapley[features[i].type] = 0;
    }

    if (n === 0) {
      return { features: features, shapley: shapley };
    }

    var getScoreFn;

    if (self.model && self.tokenizer) {
      // Model-based embedding similarity score function
      var normQueryEmbed = null;
      var userQueryParts = [];
      for (var gender in self.profile.genders) {
        if (self.profile.genders[gender] > 0) userQueryParts.push(gender);
      }
      for (var style in self.profile.styles) {
        if (self.profile.styles[style] > 0) userQueryParts.push(style);
      }
      for (var kw in self.profile.keywords) {
        if (self.profile.keywords[kw] > 0) userQueryParts.push(kw);
      }
      if (userQueryParts.length === 0) {
        userQueryParts.push('sustainable circular clothing fashion');
      }
      var userQueryStr = userQueryParts.join(' ').toLowerCase();

      var userCacheKey = 'rf_user_pref_embed_' + userQueryStr;
      try {
        var cachedUser = sessionStorage.getItem(userCacheKey);
        if (cachedUser) {
          normQueryEmbed = JSON.parse(cachedUser);
        }
      } catch(e) {}

      if (!normQueryEmbed) {
        const userInputs = self.tokenizer([userQueryStr], { padding: 'max_length', truncation: true });
        const userOutputs = await self.model(userInputs);
        const userEmbeds = userOutputs.text_embeds || userOutputs.pooler_output || userOutputs[0];
        normQueryEmbed = userEmbeds.normalize().tolist()[0];
        try {
          sessionStorage.setItem(userCacheKey, JSON.stringify(normQueryEmbed));
        } catch(e) {}
      }

      getScoreFn = async function(subset) {
        var queryStr = subset.map(function(f) { return f.value; }).join(' ');
        if (!queryStr.trim()) queryStr = 'sustainable circular clothing fashion';

        var qCacheKey = 'rf_q_embed_' + queryStr;
        var qEmbed = null;
        try {
          var cachedQ = sessionStorage.getItem(qCacheKey);
          if (cachedQ) qEmbed = JSON.parse(cachedQ);
        } catch(e) {}

        if (!qEmbed) {
          const qInputs = self.tokenizer([queryStr], { padding: 'max_length', truncation: true });
          const qOutputs = await self.model(qInputs);
          const qEmbeds = qOutputs.text_embeds || qOutputs.pooler_output || qOutputs[0];
          qEmbed = qEmbeds.normalize().tolist()[0];
          try {
            sessionStorage.setItem(qCacheKey, JSON.stringify(qEmbed));
          } catch(e) {}
        }

        var dot = 0;
        for (var d = 0; d < normQueryEmbed.length; d++) {
          dot += normQueryEmbed[d] * qEmbed[d];
        }
        return Math.max(0, Math.min(99, Math.round((dot + 1) * 50)));
      };
    } else {
      // Local similarity score function fallback using profile weights
      getScoreFn = async function(subset) {
        var score = 30; // base score
        var subsetTypes = subset.map(function(f) { return f.type; });

        if (subsetTypes.indexOf('gender') !== -1 && attrs.gender && self.profile.genders[attrs.gender]) {
          score += 25;
        }
        if (subsetTypes.indexOf('fabric') !== -1 && attrs.style && self.profile.styles[attrs.style]) {
          score += 20;
        }
        if (subsetTypes.indexOf('pattern') !== -1 && attrs.pattern && self.profile.styles[attrs.pattern]) {
          score += 15;
        }
        if (subsetTypes.indexOf('shape') !== -1 && shapeVal && self.profile.styles[shapeVal]) {
          score += 10;
        }
        return score;
      };
    }

    function fact(num) {
      if (num <= 1) return 1;
      return num * fact(num - 1);
    }

    for (var i = 0; i < n; i++) {
      var targetFeature = features[i];
      var sumContribution = 0;
      var restFeatures = features.filter(function(f, idx) { return idx !== i; });
      var m = restFeatures.length;
      var numSubsets = Math.pow(2, m);

      for (var s = 0; s < numSubsets; s++) {
        var subsetS = [];
        for (var k = 0; k < m; k++) {
          if ((s & (1 << k)) !== 0) {
            subsetS.push(restFeatures[k]);
          }
        }
        var subsetSUi = subsetS.concat([targetFeature]);

        var scoreS = await getScoreFn(subsetS);
        var scoreSUi = await getScoreFn(subsetSUi);

        var sizeS = subsetS.length;
        var weight = (fact(sizeS) * fact(n - sizeS - 1)) / fact(n);
        sumContribution += weight * (scoreSUi - scoreS);
      }
      shapley[targetFeature.type] = Math.max(0, sumContribution);
    }

    return {
      features: features,
      shapley: shapley
    };
  },

  // Generates highly persuasive, natural Vietnamese NLG explanations using Shapley weights
  generateNlgExplanation: function(shapleyResult, product) {
    if (!shapleyResult) {
      return "Thiết kế được gợi ý nhờ sở hữu kiểu dáng hiện đại và được hoàn thiện tinh xảo từ chất liệu dệt bền vững.";
    }

    var self = this;
    var shapley = shapleyResult.shapley;
    var features = shapleyResult.features;

    var contributions = [];
    var totalPositive = 0;
    for (var k in shapley) {
      if (shapley[k] > 0) {
        contributions.push({ type: k, val: shapley[k] });
        totalPositive += shapley[k];
      }
    }
    contributions.sort(function(a, b) { return b.val - a.val; });

    if (contributions.length === 0) {
      return "Sản phẩm này phù hợp hoàn hảo với phong cách tối giản và xu hướng thời trang tuần hoàn của bạn.";
    }

    var parts = [];
    for (var i = 0; i < contributions.length; i++) {
      var c = contributions[i];
      var pct = Math.round((c.val / totalPositive) * 100);
      if (pct < 5) continue;

      var label = "";
      if (c.type === 'gender') {
        var gVal = features.find(function(f) { return f.type === 'gender'; }).value;
        label = "gu chọn đồ " + (gVal === 'men' ? 'Nam cá tính' : gVal === 'women' ? 'Nữ thanh lịch' : 'Unisex hiện đại');
      } else if (c.type === 'fabric') {
        var fVal = features.find(function(f) { return f.type === 'fabric'; }).value;
        var fabVn = {
          'cotton': 'chất vải Cotton thoáng mát',
          'denim': 'chất liệu Denim bụi bặm',
          'leather': 'chất liệu Da (leather) sang trọng',
          'furry': 'chất vải Lông (furry) ấm áp',
          'knitted': 'chất len Dệt kim (knitted) mềm mại',
          'chiffon': 'vải voan Chiffon nhẹ nhàng',
          'other': 'chất vải dệt sinh học bền vững'
        }[fVal] || 'chất liệu dệt thân thiện môi trường';
        label = fabVn;
      } else if (c.type === 'pattern') {
        var pVal = features.find(function(f) { return f.type === 'pattern'; }).value;
        var patVn = {
          'pure color': 'họa tiết trơn tối giản (pure color)',
          'striped': 'họa tiết kẻ sọc (striped) năng động',
          'floral': 'họa tiết hoa nhã nhặn (floral)',
          'graphic': 'họa tiết in hình (graphic) thời thượng',
          'lattice': 'họa tiết kẻ caro (lattice)',
          'color block': 'họa tiết phối màu (color block) độc đáo',
          'other': 'họa tiết dệt tinh tế'
        }[pVal] || 'phong cách họa tiết trẻ trung';
        label = patVn;
      } else if (c.type === 'shape') {
        var sVal = features.find(function(f) { return f.type === 'shape'; }).value;
        var shapeVn = {
          'sleeveless': 'kiểu dáng sát nách phóng khoáng',
          'short-sleeve': 'kiểu tay ngắn năng động',
          'medium-sleeve': 'kiểu lỡ tay thanh lịch',
          'long-sleeve': 'kiểu tay dài ấm áp',
          'not long-sleeve': 'thiết kế phom tay năng động',
          'V-shape neckline': 'thiết kế cổ chữ V tôn dáng',
          'square neckline': 'cổ vuông thanh lịch',
          'round neckline': 'cổ tròn cơ bản',
          'standing neckline': 'cổ đứng cổ điển',
          'lapel neckline': 'cổ bẻ (lapel) chỉn chu',
          'suspender neckline': 'cổ hai dây quyến rũ'
        }[sVal] || 'phom dáng thiết kế tinh gọn';
        label = shapeVn;
      }
      if (label) parts.push(label);
    }

    var text = "Stylist AI gợi ý sản phẩm này dựa trên các chỉ số tương thích với hành vi mua sắm của bạn. ";
    if (parts.length === 1) {
      text += "Thiết kế này đặc biệt đồng điệu nhờ tối ưu cho " + parts[0] + " của bạn.";
    } else if (parts.length === 2) {
      text += "Sản phẩm là gợi ý hoàn hảo dành cho bạn nhờ sự kết hợp giữa " + parts[0] + " và " + parts[1] + ".";
    } else if (parts.length >= 3) {
      text += "Thiết kế đáp ứng tối đa sở thích cá nhân nhờ hội tụ các yếu tố: " + parts[0] + ", " + parts[1] + " cùng với " + parts[2] + ".";
    } else {
      text += "Sản phẩm có độ tương thích cao với phom dáng và phong cách thiết kế gần đây của bạn.";
    }

    // Material spec context from real product properties
    var realAttrs = self.getProductRealAttributes(product);
    text += " Về đặc tính sản phẩm, ";
    if (realAttrs.fabric === 'cotton') {
      text += "sản phẩm được làm từ sợi Cotton hữu cơ dệt tự nhiên, giúp thấm hút mồ hôi tối đa và cực kỳ êm dịu cho làn da.";
    } else if (realAttrs.fabric === 'denim') {
      text += "chất liệu Denim dệt chắc chắn từ bông tái chế mang lại độ bền vượt trội, hạn chế phai màu và giữ phom quần áo cực chuẩn.";
    } else if (realAttrs.fabric === 'leather') {
      text += "sự kết hợp của lớp Da cao cấp mang lại vẻ ngoài thời thượng, giữ ấm tốt và có tuổi thọ vòng đời dài lâu.";
    } else if (realAttrs.fabric === 'knitted') {
      text += "vải Dệt kim với độ co giãn tốt mang lại sự ấm áp và vô cùng dễ chịu khi vận động hàng ngày.";
    } else {
      text += "chất vải dệt sinh học thân thiện giúp dễ dàng phân hủy sinh học tự nhiên khi hết vòng đời sử dụng.";
    }

    return text;
  },

  // Load HF_TOKEN from local dev .env if possible
  loadToken: async function() {
    try {
      var res = await fetch('/.env');
      var text = await res.text();
      var match = text.match(/HF_TOKEN\s*=\s*([^\s]+)/);
      if (match && match[1]) {
        this.hfToken = match[1].trim();
        console.log('[AI Rec] HF Token loaded dynamically from .env');
      }
    } catch(e) {
      // Fallback
    }
  },

  // Call serverless LLM API (Llama-3) to write custom stylist explanations using Shapley context
  generateLlmExplanation: async function(product, shapleyPct) {
    var self = this;
    var token = self.hfToken || '';
    
    var prompt = `You are a professional fashion stylist. Write a very brief explanation (in Vietnamese, max 2-3 sentences, around 50-60 words) on why this product "${product.name}" is recommended.
Use the following Shapley XAI feature contribution percentages to write a personalized stylist message:
- Style preference: ${shapleyPct.style || 0}%
- Category preference: ${shapleyPct.category || 0}%
- Gender preference: ${shapleyPct.gender || 0}%
- Brand preference: ${shapleyPct.store || 0}%

Important guidelines:
- Speak directly to the customer in a warm, helpful Vietnamese tone.
- Do NOT mention any technical terms like "Shapley", "XAI", "algorithm", "cosine", "vector", "percentage", or "score".
- Transform these numbers into human-like descriptions (e.g. "Because you love casual unisex outfits...").
- Output ONLY the explanation paragraph. No introductory greeting or chat headers.`;

    try {
      var response = await fetch(
        'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a professional Vietnamese fashion stylist chatbot.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              return_full_text: false
            }
          }),
          signal: AbortSignal.timeout(5000) // 5 seconds timeout limit
        }
      );

      var data = await response.json();
      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        var text = data[0].generated_text.trim();
        text = text.replace(/<\|assistant\|>/g, '').replace(/assistant\n/g, '').trim();
        return text;
      }
      throw new Error('API returned invalid format');
    } catch(err) {
      console.warn('[XAI LLM] API call failed, using high-quality fallback NLG:', err);
      throw err;
    }
  },

  // Check if user has active preference profile
  hasPreferences: function() {
    for (var k in this.profile.categories) {
      if (this.profile.categories[k] > 0) return true;
    }
    return false;
  }
};

// Load preferences and cached similarity scores immediately upon script evaluation
AI_REC_SYSTEM.loadProfile();

// Initialize silently
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    AI_REC_SYSTEM.init();
  }, 500);
});

// Hook goToDetail dynamically
var originalGoToDetail = window.goToDetail;
window.goToDetail = function(productId) {
  if (typeof AI_REC_SYSTEM !== 'undefined') {
    AI_REC_SYSTEM.trackView(productId);
  }
  if (typeof originalGoToDetail === 'function') {
    originalGoToDetail(productId);
  } else {
    try {
      sessionStorage.setItem('rf_detail_id', productId);
      for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
        if (String(SHOP_PRODUCTS[i].id) === String(productId)) {
          sessionStorage.setItem('rf_detail_product', JSON.stringify(SHOP_PRODUCTS[i]));
          break;
        }
      }
      window.location.href = '/buyer/shop-detail.html';
    } catch(e) {}
  }
};
