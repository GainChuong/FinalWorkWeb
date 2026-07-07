/* ==================== REAL BACKGROUND DEEP LEARNING RECOMMENDATION SYSTEM ==================== */

var AI_REC_SYSTEM = {
  profile: {
    genders: {},
    styles: {},
    categories: {},
    stores: {},
    keywords: {},
    history: []
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
      if (!this.profile.history) {
        this.profile.history = [];
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
    console.log('[AI Rec] Loading Marqo/marqo-fashionSigLIP...');

    // Run local similarity engine immediately to bootstrap sorting and prevent 15-second empty state
    self.computeLocalSimilarity();

    var script = document.createElement('script');
    script.type = 'module';
    script.innerHTML =
      'import { SiglipTextModel, AutoTokenizer, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/+esm";\n' +
      'env.allowLocalModels = false;\n' +
      'env.allowRemoteModels = true;\n' +
      'window._rfTokenizer = AutoTokenizer;\n' +
      'window._rfTextModel = SiglipTextModel;\n' +
      'window.dispatchEvent(new CustomEvent("transformersLoaded"));';
    document.head.appendChild(script);

    window.addEventListener('transformersLoaded', async function() {
      try {
        console.log('[AI Rec] Initializing tokenizer & text model from Marqo/marqo-fashionSigLIP...');
        self.tokenizer = await window._rfTokenizer.from_pretrained('Marqo/marqo-fashionSigLIP');
        self.textModel = await window._rfTextModel.from_pretrained('Marqo/marqo-fashionSigLIP', { dtype: 'q8' });
        console.log('[AI Rec] Marqo/marqo-fashionSigLIP loaded successfully! 🚀');
        await self.computeRecommendations();
      } catch (err) {
        console.error('[AI Rec] Marqo/marqo-fashionSigLIP failed, using local fallback:', err);
        self.computeLocalSimilarity();
      }
    });

    // Timeout fallback (25s) if CDN hangs
    setTimeout(function() {
      if (!self.textModel) {
        console.warn('[AI Rec] Loading timeout. Reverting to local NLP similarity engine.');
        self.computeLocalSimilarity();
      }
    }, 25000);
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
      style: realAttrs.fabric, // map fabric as primary style keyword
      pattern: realAttrs.pattern,
      sleeve: realAttrs.sleeve,
      neckline: realAttrs.neckline,
      category: realAttrs.category,
      gender: realAttrs.gender
    };
  },

  // Record an interaction weight
  trackInteraction: function(product, weight) {
    if (!product) return;
    var attrs = this.extractAttributes(product);

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
    if (attrs.category) {
      this.profile.categories[attrs.category] = (this.profile.categories[attrs.category] || 0) + weight;
    }
    if (attrs.gender) {
      this.profile.genders[attrs.gender] = (this.profile.genders[attrs.gender] || 0) + weight;
    }

    var tokens = (product.name || '').toLowerCase().split(/\s+/).filter(function(t) {
      return t.length > 2 && ['cho', 'choo', 'của', 'nam', 'nữ', 'thời', 'trang', 'màu', 'hiệu'].indexOf(t) === -1;
    });
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      this.profile.keywords[t] = (this.profile.keywords[t] || 0) + weight;
    }

    // Save to interaction history for interactive XAI explanation
    if (!this.profile.history) {
      this.profile.history = [];
    }
    var actionName = 'xem';
    if (weight === 3) actionName = 'thêm vào giỏ';
    if (weight === 5) actionName = 'mua';

    var history = this.profile.history;
    if (history.length === 0 || history[0].productId !== String(product.id) || history[0].action !== actionName) {
      history.unshift({
        productId: String(product.id),
        name: product.name,
        action: actionName,
        attrs: attrs,
        timestamp: Date.now()
      });
      if (history.length > 10) history.pop();
    }

    this.saveProfile();
    // SYNC: always update similarities immediately so they're saved before page navigation
    this.computeLocalSimilarity();
    // ASYNC: upgrade with neural model only if already loaded (avoids unfinished async before navigate)
    if (this.textModel) {
      this.computeRecommendations();
    }
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
    for (var k in this.profile.styles) totalInt += this.profile.styles[k];
    for (var k in this.profile.keywords) totalInt += this.profile.keywords[k];
    
    if (totalInt > 0) {
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

    if (self.textModel && self.tokenizer) {
      try {
        console.log('[AI Rec] Computing similarities using Marqo/marqo-fashionSigLIP...');

        // 1. Get query embedding
        var queryInputs = self.tokenizer([combinedQuery], { padding: 'max_length', truncation: true });
        var { text_embeds: queryEmbeds } = await self.textModel(queryInputs);
        var normQueryEmbed = queryEmbeds.normalize().tolist()[0];

        // 2. Score all catalog products
        var len = SHOP_PRODUCTS.length;
        for (var idx = 0; idx < len; idx++) {
          var p = SHOP_PRODUCTS[idx];

          var cacheKey = 'rf_siglip_' + p.id;
          var normProdEmbed = null;
          try {
            var cached = localStorage.getItem(cacheKey);
            if (cached) normProdEmbed = JSON.parse(cached);
          } catch(e) {}

          if (!normProdEmbed) {
            var attrs = self.extractAttributes(p);
            var text = p.name + ' ' + (p.description || p.category) + ' ' +
                       (attrs.fabric || '') + ' ' + (attrs.pattern || '') + ' ' +
                       (attrs.sleeve || '') + ' ' + (attrs.neckline || '');
            var prodInputs = self.tokenizer([text], { padding: 'max_length', truncation: true });
            var { text_embeds: prodEmbeds } = await self.textModel(prodInputs);
            normProdEmbed = prodEmbeds.normalize().tolist()[0];
            try {
              localStorage.setItem(cacheKey, JSON.stringify(normProdEmbed));
            } catch(e) {}
          }

          var dotProd = 0;
          for (var d = 0; d < normQueryEmbed.length; d++) {
            dotProd += normQueryEmbed[d] * normProdEmbed[d];
          }
          // Siglip cosine similarity range [-1,1] → map to [30,99]
          var score = Math.max(30, Math.min(99, Math.round(30 + (dotProd + 1) * 34.5)));
          self.similarities[p.id] = score;
        }

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
    for (var k in this.profile.styles) totalInt += this.profile.styles[k];
    for (var k in this.profile.keywords) totalInt += this.profile.keywords[k];
    
    if (totalInt > 0) {
      for (var style in this.profile.styles) {
        if (this.profile.styles[style] > 0) refTexts.push(style);
      }
      for (var kw in this.profile.keywords) {
        if (this.profile.keywords[kw] > 0) refTexts.push(kw);
      }
    } else {
      // Default sustainable/circular keywords to rank green products first if no user profile exists
      refTexts.push('tái chế', 'organic', 'hữu cơ', 'bền vững', 'tuần hoàn');
    }
    var combinedQuery = refTexts.join(' ').toLowerCase();
    var queryTokens = combinedQuery.split(/\s+/).filter(Boolean);

    for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
      var p = SHOP_PRODUCTS[i];
      var text = (p.name + ' ' + p.category + ' ' + (p.description || '')).toLowerCase();
      var score = 30;

      // 1. Text token matching
      var matches = 0;
      for (var t = 0; t < queryTokens.length; t++) {
        if (text.indexOf(queryTokens[t]) !== -1) {
          matches++;
        }
      }
      
      if (queryTokens.length > 0) {
        score += Math.round((matches / queryTokens.length) * 20); // up to 20 points
      }
      
      // 2. Granular attributes & category weights
      var attrs = this.extractAttributes(p);
      
      // Category weight
      if (attrs.category && this.profile.categories[attrs.category]) {
        score += Math.min(10, this.profile.categories[attrs.category] * 2);
      }
      
      // Fabric / style weight
      if (attrs.style && this.profile.styles[attrs.style]) {
        score += Math.min(15, this.profile.styles[attrs.style] * 3);
      }
      
      // Pattern weight
      if (attrs.pattern && this.profile.styles[attrs.pattern]) {
        score += Math.min(15, this.profile.styles[attrs.pattern] * 3);
      }
      
      // Sleeve weight
      if (attrs.sleeve && this.profile.styles[attrs.sleeve]) {
        score += Math.min(10, this.profile.styles[attrs.sleeve] * 2);
      }
      
      // Neckline weight
      if (attrs.neckline && this.profile.styles[attrs.neckline]) {
        score += Math.min(10, this.profile.styles[attrs.neckline] * 2);
      }

      // Keyword weights
      var keywordBoost = 0;
      var nameDescText = (p.name + ' ' + (p.description || '')).toLowerCase();
      for (var kw in this.profile.keywords) {
        if (this.profile.keywords[kw] > 0 && nameDescText.indexOf(kw) !== -1) {
          keywordBoost += this.profile.keywords[kw] * 1.5;
        }
      }
      score += Math.min(20, Math.round(keywordBoost));
      
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

  // Synchronously explain a product recommendation using rule-based Shapley + NLG (async wrapper for compatibility)
  explainProduct: async function(product) {
    try {
      var shapleyResult = this.computeShapleyValues(product);
      if (!shapleyResult || !shapleyResult.shapley) {
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

      // Build Shapley bar chart HTML
      var chartFeatures = [];
      for (var k in shapley) {
        if (shapley[k] > 0) {
          var pct = shapleyPct[k];
          var label = '', icon = '';
          if (k === 'fabric')  { label = 'Chất liệu'; icon = 'fa-scissors'; }
          else if (k === 'pattern') { label = 'Họa tiết';  icon = 'fa-palette'; }
          else if (k === 'sleeve')  { label = 'Kiểu tay';  icon = 'fa-shirt'; }
          else if (k === 'neckline'){ label = 'Kiểu cổ';   icon = 'fa-circle-notch'; }
          else if (k === 'category'){ label = 'Danh mục';  icon = 'fa-tag'; }
          else if (k === 'keyword') { label = 'Từ khóa';   icon = 'fa-magnifying-glass'; }
          if (label) chartFeatures.push({ label: label, icon: icon, pct: pct });
        }
      }
      chartFeatures.sort(function(a, b) { return b.pct - a.pct; });

      var chartHtml = '<div class="xai-shapley-chart" style="margin:8px 0 12px 0;background:rgba(0,0,0,0.02);padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.05);">';
      chartHtml += '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;margin-bottom:8px;color:var(--text-muted);display:flex;justify-content:space-between;"><span>Yếu tố đóng góp (Shapley)</span><span>Trọng số</span></div>';
      chartFeatures.forEach(function(f) {
        chartHtml +=
          '<div style="margin-bottom:6px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:2px;">' +
              '<span><i class="fa-solid ' + f.icon + '" style="margin-right:5px;color:var(--primary);"></i>' + f.label + '</span>' +
              '<span style="font-weight:600;">+' + f.pct + '%</span>' +
            '</div>' +
            '<div style="height:6px;background:rgba(0,0,0,0.05);border-radius:3px;overflow:hidden;">' +
              '<div style="height:100%;width:' + f.pct + '%;background:linear-gradient(90deg,var(--primary),#85e3b2);border-radius:3px;"></div>' +
            '</div>' +
          '</div>';
      });
      chartHtml += '</div>';

      // Retrieve item-specific Circular Benchmarks from global getDppData
      var dppHtml = '';
      if (typeof getDppData === 'function') {
        try {
          var dpp = getDppData(product.id, product.name, product.category);
          if (dpp) {
            dppHtml += '<div class="xai-benchmarks" style="margin:12px 0;background:rgba(91,116,83,0.04);padding:10px;border-radius:8px;border:1px solid rgba(91,116,83,0.15);">';
            dppHtml += '<div style="font-size:0.75rem;font-weight:700;color:var(--primary);margin-bottom:8px;display:flex;align-items:center;"><i class="fa-solid fa-chart-simple" style="margin-right:6px;"></i>Chỉ số Tuần hoàn của Sản phẩm (Benchmarks)</div>';
            dppHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.75rem;color:var(--text-dark);">';
            
            if (dpp.co2Saved) {
              dppHtml += '<div><i class="fa-solid fa-cloud" style="color:#708C69;margin-right:5px;width:12px;"></i>Giảm phát thải: <strong>' + dpp.co2Saved.toFixed(1) + ' kg CO₂</strong></div>';
            }
            if (dpp.landfillSaved) {
              dppHtml += '<div><i class="fa-solid fa-trash-arrow-up" style="color:#a6855b;margin-right:5px;width:12px;"></i>Tránh chôn lấp: <strong>' + dpp.landfillSaved.toFixed(1) + ' kg</strong></div>';
            }
            if (dpp.materialRecoveryRate) {
              dppHtml += '<div><i class="fa-solid fa-recycle" style="color:#708C69;margin-right:5px;width:12px;"></i>Thu hồi vật liệu: <strong>' + dpp.materialRecoveryRate + '%</strong></div>';
            }
            if (dpp.transportDistance) {
              dppHtml += '<div><i class="fa-solid fa-truck" style="color:#a6855b;margin-right:5px;width:12px;"></i>Vận chuyển: <strong>' + dpp.transportDistance + ' km</strong></div>';
            }
            dppHtml += '</div>';
            
            if (dpp.materials && dpp.materials.length > 0) {
              var matTexts = dpp.materials.map(function(m) {
                var nameVn = m.name;
                if (nameVn === "Organic Cotton fibers") nameVn = "Sợi bông hữu cơ";
                else if (nameVn === "Recycled Spandex") nameVn = "Spandex tái chế";
                else if (nameVn === "Repurposed Denim scrap") nameVn = "Denim tái sinh";
                else if (nameVn === "Recycled Polyester lining") nameVn = "Lót Polyester tái chế";
                else if (nameVn === "Eco-Elastane stretch") nameVn = "Eco-Elastane co giãn";
                else if (nameVn === "Recycled Cotton Denim yarn") nameVn = "Sợi Denim tái chế";
                else if (nameVn === "Upcycled Chiffon fabric") nameVn = "Chiffon tái chế";
                else if (nameVn === "Recycled Nylon lining") nameVn = "Lót Nylon tái chế";
                else if (nameVn === "Bio-Synthetic weave") nameVn = "Sợi dệt sinh học";
                else if (nameVn === "Recycled Linen fibers") nameVn = "Sợi Linen tái chế";
                else if (nameVn === "Organic Cotton lining") nameVn = "Lót Cotton hữu cơ";
                return '<strong>' + m.pct + '%</strong> ' + nameVn;
              });
              dppHtml += '<div style="font-size:0.7rem;margin-top:6px;border-top:1px dashed rgba(91,116,83,0.15);padding-top:6px;color:var(--text-muted);">Thành phần: ' + matTexts.join(' | ') + '</div>';
            }
            dppHtml += '</div>';
          }
        } catch(e) {
          console.warn('[XAI] Failed to load DPP benchmarks in XAI:', e);
        }
      }
 
      var nlgText = this.generateNlgExplanation(shapleyResult, product);
      return chartHtml + dppHtml + '<div style="font-size:0.8rem;line-height:1.45;color:var(--text-dark);text-align:justify;">' + nlgText + '</div>';

    } catch(e) {
      console.error('[XAI] Error:', e);
      return "Sản phẩm được gợi ý nhờ tính tương thích cao với các tương tác trước đó của bạn.";
    }
  },


  // Compute Shapley values synchronously using rule-based profile weights (no model, no async)
  computeShapleyValues: function(product) {
    var self = this;
    var attrs = self.extractAttributes(product);

    // Define feature set: only features with a known profile weight
    var features = [];
    if (attrs.style && self.profile.styles[attrs.style] > 0)
      features.push({ name: 'Fabric',   value: attrs.style,    type: 'fabric',   weight: self.profile.styles[attrs.style] });
    if (attrs.pattern && self.profile.styles[attrs.pattern] > 0)
      features.push({ name: 'Pattern',  value: attrs.pattern,  type: 'pattern',  weight: self.profile.styles[attrs.pattern] });
    if (attrs.sleeve && self.profile.styles[attrs.sleeve] > 0)
      features.push({ name: 'Sleeve',   value: attrs.sleeve,   type: 'sleeve',   weight: self.profile.styles[attrs.sleeve] });
    if (attrs.neckline && self.profile.styles[attrs.neckline] > 0)
      features.push({ name: 'Neckline', value: attrs.neckline, type: 'neckline', weight: self.profile.styles[attrs.neckline] });
    if (attrs.category && self.profile.categories[attrs.category] > 0)
      features.push({ name: 'Category', value: attrs.category, type: 'category', weight: self.profile.categories[attrs.category] });

    // Keyword contribution: sum of matching keyword weights
    var kwWeight = 0;
    var nameDescText = ((product.name || '') + ' ' + (product.description || '')).toLowerCase();
    for (var kw in self.profile.keywords) {
      if (self.profile.keywords[kw] > 0 && nameDescText.indexOf(kw) !== -1) {
        kwWeight += self.profile.keywords[kw];
      }
    }
    if (kwWeight > 0)
      features.push({ name: 'Keyword', value: 'keyword', type: 'keyword', weight: kwWeight });

    var n = features.length;
    var shapley = {};
    for (var i = 0; i < n; i++) shapley[features[i].type] = 0;

    if (n === 0) return { features: features, shapley: shapley };

    // Score function: sum of weights for a given feature subset
    function scoreSubset(subset) {
      var s = 30;
      for (var j = 0; j < subset.length; j++) s += subset[j].weight * 3;
      return Math.min(99, s);
    }

    function fact(num) { return num <= 1 ? 1 : num * fact(num - 1); }

    for (var i = 0; i < n; i++) {
      var target = features[i];
      var rest = features.filter(function(f, idx) { return idx !== i; });
      var m = rest.length;
      var sum = 0;
      for (var s = 0; s < Math.pow(2, m); s++) {
        var sub = [];
        for (var b = 0; b < m; b++) {
          if (s & (1 << b)) sub.push(rest[b]);
        }
        var subPlusI = sub.concat([target]);
        var marginal = scoreSubset(subPlusI) - scoreSubset(sub);
        var weight = (fact(sub.length) * fact(n - sub.length - 1)) / fact(n);
        sum += weight * marginal;
      }
      shapley[target.type] = Math.max(0, sum);
    }

    return { features: features, shapley: shapley };
  },


  getFabricVn: function(fab) {
    return {
      'cotton': 'Cotton',
      'denim': 'Denim',
      'leather': 'Da',
      'furry': 'Lông',
      'knitted': 'Dệt kim',
      'chiffon': 'Voan Chiffon',
      'other': 'vải sinh học'
    }[fab] || 'chất liệu dệt';
  },
  getPatternVn: function(pat) {
    return {
      'pure color': 'trơn tối giản',
      'striped': 'kẻ sọc',
      'floral': 'hoa nhã nhặn',
      'graphic': 'in hình',
      'lattice': 'kẻ caro',
      'color block': 'phối màu'
    }[pat] || 'họa tiết';
  },
  getCategoryVn: function(cat) {
    return {
      'upper': 'áo thời trang',
      'lower': 'quần/váy thời trang',
      'outer': 'áo khoác'
    }[cat] || 'trang phục';
  },

  findRelatedInteraction: function(product) {
    if (!this.profile.history || this.profile.history.length === 0) return null;
    var attrs = this.extractAttributes(product);
    var matches = [];
    for (var i = 0; i < this.profile.history.length; i++) {
      var item = this.profile.history[i];
      if (item.productId === String(product.id)) continue;
      
      var matchDesc = [];
      if (item.attrs.style === attrs.style && attrs.style) {
        matchDesc.push('chất liệu ' + this.getFabricVn(attrs.style));
      }
      if (item.attrs.pattern === attrs.pattern && attrs.pattern && attrs.pattern !== 'other') {
        matchDesc.push('họa tiết ' + this.getPatternVn(attrs.pattern));
      }
      if (item.attrs.category === attrs.category && attrs.category) {
        matchDesc.push('danh mục ' + this.getCategoryVn(attrs.category));
      }
      
      if (matchDesc.length > 0) {
        matches.push({
          name: item.name,
          action: item.action,
          desc: matchDesc.join(' và ')
        });
        if (matches.length >= 2) break;
      }
    }
    return matches;
  },

  // Generates highly persuasive, natural Vietnamese NLG explanations using Shapley weights and history
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

    var parts = [];
    for (var i = 0; i < contributions.length; i++) {
      var c = contributions[i];
      var pct = Math.round((c.val / totalPositive) * 100);
      if (pct < 5) continue;

      var label = "";
      if (c.type === 'fabric') {
        var fVal = features.find(function(f) { return f.type === 'fabric'; }).value;
        label = 'chất vải ' + self.getFabricVn(fVal) + ' thoáng mát';
      } else if (c.type === 'pattern') {
        var pVal = features.find(function(f) { return f.type === 'pattern'; }).value;
        label = 'phong cách họa tiết ' + self.getPatternVn(pVal);
      } else if (c.type === 'sleeve') {
        var sVal = features.find(function(f) { return f.type === 'sleeve'; }).value;
        var sleeveVn = {
          'sleeveless': 'kiểu dáng sát nách phóng khoáng',
          'short-sleeve': 'kiểu tay ngắn năng động',
          'medium-sleeve': 'kiểu lỡ tay thanh lịch',
          'long-sleeve': 'kiểu tay dài ấm áp',
          'not long-sleeve': 'thiết kế phom tay năng động'
        }[sVal] || 'kiểu tay thời trang';
        label = sleeveVn;
      } else if (c.type === 'neckline') {
        var nVal = features.find(function(f) { return f.type === 'neckline'; }).value;
        var neckVn = {
          'V-shape neckline': 'thiết kế cổ chữ V tôn dáng',
          'square neckline': 'cổ vuông thanh lịch',
          'round neckline': 'cổ tròn cơ bản',
          'standing neckline': 'cổ đứng cổ điển',
          'lapel neckline': 'cổ bẻ thanh lịch',
          'suspender neckline': 'cổ hai dây quyến rũ'
        }[nVal] || 'dáng cổ áo tinh tế';
        label = neckVn;
      } else if (c.type === 'category') {
        var cVal = features.find(function(f) { return f.type === 'category'; }).value;
        label = 'nhóm sản phẩm ' + self.getCategoryVn(cVal);
      }
      if (label) parts.push(label);
    }

    var text = "";

    // 1. Interactive history connection
    var related = self.findRelatedInteraction(product);
    if (related && related.length > 0) {
      var r = related[0];
      text += "Stylist AI đề xuất sản phẩm này dựa trên hành vi mua sắm gần đây: Bạn đã <strong>" + r.action + "</strong> sản phẩm <em>\"" + r.name + "\"</em> (chung " + r.desc + "). ";
      if (related.length > 1) {
        var r2 = related[1];
        text += "Đồng thời, bạn cũng từng <strong>" + r2.action + "</strong> sản phẩm <em>\"" + r2.name + "\"</em> (cùng " + r2.desc + "). ";
      }
    } else {
      text += "Stylist AI gợi ý sản phẩm này dựa trên các tương tác gần đây của bạn với phong cách thời trang tuần hoàn. ";
    }

    // 2. Shapley feature matching
    if (parts.length === 1) {
      text += "Mẫu thiết kế này đặc biệt đồng điệu nhờ tối ưu tốt cho " + parts[0] + " của bạn.";
    } else if (parts.length === 2) {
      text += "Sản phẩm là lựa chọn tối ưu nhờ sự kết hợp lý tưởng giữa " + parts[0] + " và " + parts[1] + ".";
    } else if (parts.length >= 3) {
      text += "Thiết kế đáp ứng trọn vẹn sở thích cá nhân nhờ quy tụ các đặc tính: " + parts[0] + ", " + parts[1] + " cùng với " + parts[2] + ".";
    } else {
      text += "Sản phẩm có độ tương thích cao với phom dáng và chất liệu thiết kế ưa thích gần đây của bạn.";
    }

    // 3. Material spec context from real product properties
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


  // Check if user has active preference profile
  hasPreferences: function() {
    for (var k in this.profile.categories) {
      if (this.profile.categories[k] > 0) return true;
    }
    for (var k in this.profile.styles) {
      if (this.profile.styles[k] > 0) return true;
    }
    for (var k in this.profile.genders) {
      if (this.profile.genders[k] > 0) return true;
    }
    for (var k in this.profile.keywords) {
      if (this.profile.keywords[k] > 0) return true;
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


