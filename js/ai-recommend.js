/* ==================== REAL BACKGROUND RULE-BASED RECOMMENDATION SYSTEM ==================== */

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
  ready: false, // set to true once similarities are computed
  similarities: {}, // productId -> score (30 to 99)
  topIds: [],       // top-5 recommended product ids (populated after threshold met)

  // Minimum total interaction weight before re-sorting activates.
  // View=1, Search=2, Cart=3, Purchase=5  →  1 view is enough to start sorting!
  INTERACTION_THRESHOLD: 0,

  init: function() {
    this.initialized = true;
    var self = this;
    
    // Load profile and run similarity matching immediately on startup
    self.loadProfile();
    
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
      
      // Load similarity cache to prevent layout shift
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

  activateAI: function() {
    console.log('[AI Rec] Rule-based recommendation engine active! 🚀');
    this.computeLocalSimilarity();
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
    
    // Map fabric from VTON indices (fabric_ann.txt mapping)
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

    // Map color/pattern from VTON indices (pattern_ann.txt mapping)
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

    // Map shape (sleeve) from VTON indices (shape_anno_all.txt index 0)
    var sleeveName = '';
    if (product.shape && product.shape[0] !== undefined) {
      var sVal = product.shape[0];
      var sleevesList = ['sleeveless', 'short-sleeve', 'medium-sleeve', 'long-sleeve', 'not long-sleeve'];
      if (sVal >= 0 && sVal < sleevesList.length) {
        sleeveName = sleevesList[sVal];
      }
    }

    // Map shape (neckline) from VTON indices (shape_anno_all.txt index 9)
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

  trackInteraction: function(product, weight) {
    if (!product) return;
    var attrs = this.extractAttributes(product);

    this.profile.styles[attrs.style] = (this.profile.styles[attrs.style] || 0) + weight;

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
    var actionName = 'view';
    if (weight === 3) actionName = 'add_to_cart';
    if (weight === 5) actionName = 'buy';

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
    // Update scores silently in background — UI re-sorts only on next page load
    this.computeLocalSimilarity(true);
  },

  trackView: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 10);
  },

  trackCart: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 20);
  },

  trackPurchase: function(productId) {
    var p = this.findProduct(productId);
    if (p) this.trackInteraction(p, 40);
  },

  trackSearch: function(query) {
    if (!query) return;
    var q = query.toLowerCase().trim();
    if (!q) return;

    var tokens = q.split(/\s+/).filter(function(t) {
      return t.length > 2 && ['cho', 'choo', 'của', 'nam', 'nữ', 'thời', 'trang', 'màu', 'hiệu'].indexOf(t) === -1;
    });

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      this.profile.keywords[t] = (this.profile.keywords[t] || 0) + 15; // Assign higher weight for searches
    }
    this.saveProfile();
    // Search = explicit user intent → re-render immediately
    this.computeLocalSimilarity(false);
  },

  // Sum of all interaction weights accumulated so far
  totalInteractionWeight: function() {
    var total = 0;
    for (var k in this.profile.styles)    total += (this.profile.styles[k]    || 0);
    for (var k in this.profile.categories) total += (this.profile.categories[k]|| 0);
    for (var k in this.profile.keywords)  total += (this.profile.keywords[k]  || 0);
    return total;
  },

  // Detect dominant gender from interaction history (returns 'men'|'women'|null)
  dominantGender: function() {
    var men   = this.profile.genders['men']   || 0;
    var women = this.profile.genders['women'] || 0;
    if (men === 0 && women === 0) return null;
    if (men > women) return 'men';
    if (women > men) return 'women';
    return null;
  },

  // Return sorted array of top n product ids (only when threshold met)
  getTopRecommendedIds: function(n) {
    n = n || 5;
    if (!this.hasPreferences()) return [];
    var entries = [];
    for (var id in this.similarities) {
      entries.push({ id: id, score: this.similarities[id] });
    }
    entries.sort(function(a, b) { return b.score - a.score; });
    return entries.slice(0, n).map(function(e) { return e.id; });
  },

  // Short 1-line explanation for badge tooltip
  getShortExplanation: function(product) {
    var attrs   = this.extractAttributes(product);
    var reasons = [];

    // Keyword / search driven
    var nameDesc = ((product.name || '') + ' ' + (product.description || '')).toLowerCase();
    var kwHits   = [];
    for (var kw in this.profile.keywords) {
      if (this.profile.keywords[kw] > 0 && nameDesc.indexOf(kw) !== -1) kwHits.push(kw);
    }
    if (kwHits.length) reasons.push('search: ' + kwHits.slice(0, 2).join(', '));

    // Style / pattern driven
    var fabVn = { cotton:'Cotton', denim:'Denim', leather:'Leather', furry:'Furry', knitted:'Knitted', chiffon:'Chiffon' };
    if (attrs.style && this.profile.styles[attrs.style] > 0)
      reasons.push(fabVn[attrs.style] || attrs.style);
    var patVn = { 'pure color':'solid', striped:'striped', floral:'floral', graphic:'graphic printed', lattice:'checked', 'color block':'color block' };
    if (attrs.pattern && this.profile.styles[attrs.pattern] > 0)
      reasons.push(patVn[attrs.pattern] || attrs.pattern);

    // Interaction history
    var hist = this.profile.history || [];
    for (var h = 0; h < hist.length && h < 5; h++) {
      var item = hist[h];
      if (item.attrs && item.attrs.style === attrs.style && item.productId !== String(product.id)) {
        reasons.push('because you ' + item.action + ' "' + item.name.split(' - ')[0] + '"');
        break;
      }
    }

    if (!reasons.length) return 'Matches your preferences';
    return reasons.slice(0, 2).join(' · ');
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

  // Calculate matching scores using deterministic rule-based algorithms
  computeRecommendations: async function() {
    this.computeLocalSimilarity();
  },

  // Primary rule-based similarity scoring engine
  // silent=true → update scores & cache only, skip re-rendering (used during passive browsing)
  // silent=false (default) → also re-render the product lists
  computeLocalSimilarity: function(silent) {
    var self = this;
    var dominant = this.dominantGender();

    for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
      var p = SHOP_PRODUCTS[i];
      var attrs = this.extractAttributes(p);
      var score = 40; // Base score

      // 0. Gender isolation penalty (strong signal needed first)
      if (dominant) {
        var productGender = attrs.gender; // 'men' | 'women' | 'unisex'
        if (productGender !== 'unisex' && productGender !== dominant) {
          score -= 100; // massive penalty to force cross-gender items to the absolute bottom (score 30)
        }
      }

      // 1. Category weights match (up to 100 points)
      if (attrs.category && this.profile.categories[attrs.category]) {
        score += Math.min(100, this.profile.categories[attrs.category] * 40);
      }

      // 2. Fabric / Style match (up to 100 points)
      if (attrs.style && this.profile.styles[attrs.style]) {
        score += Math.min(100, this.profile.styles[attrs.style] * 40);
      }

      // 3. Pattern / Color match (up to 80 points)
      if (attrs.pattern && this.profile.styles[attrs.pattern]) {
        score += Math.min(80, this.profile.styles[attrs.pattern] * 24);
      }

      // 4. Sleeve length match (up to 80 points)
      if (attrs.sleeve && this.profile.styles[attrs.sleeve]) {
        score += Math.min(80, this.profile.styles[attrs.sleeve] * 24);
      }

      // 5. Neckline shape match (up to 80 points)
      if (attrs.neckline && this.profile.styles[attrs.neckline]) {
        score += Math.min(80, this.profile.styles[attrs.neckline] * 24);
      }

      // 6. Search / Purchase History keyword boost (up to 250 points)
      var nameDescText = (p.name + ' ' + (p.description || '')).toLowerCase();
      var keywordBoost = 0;

      for (var kw in this.profile.keywords) {
        var weight = this.profile.keywords[kw];
        if (!weight || weight <= 0) continue;

        // Direct token matching
        if (nameDescText.indexOf(kw) !== -1) {
          keywordBoost += weight * 50;
        }

        // Semantic mapping for 'hoodie' and 'fleece' (sweater/hooded clothing)
        if (kw === 'hoodie' || kw === 'fleece' || kw === 'hooded') {
          if (nameDescText.indexOf('jacket') !== -1 || nameDescText.indexOf('fleece') !== -1 || nameDescText.indexOf('sweater') !== -1 || attrs.sleeve === 'long-sleeve') {
            if (p.category === 'upper' || p.category === 'outer') {
              keywordBoost += weight * 50;
            }
          }
        }

        // Semantic mapping for 'skirt', 'dress'
        if (kw === 'skirt' || kw === 'dress') {
          if (p.category === 'overall' || p.category === 'lower' || nameDescText.indexOf('dress') !== -1 || nameDescText.indexOf('skirt') !== -1 || nameDescText.indexOf('chiffon') !== -1) {
            keywordBoost += weight * 50;
          }
        }

        // Semantic mapping for 'pants', 'trousers', 'jeans'
        if (kw === 'pants' || kw === 'trousers' || kw === 'jeans') {
          if (p.category === 'lower' || nameDescText.indexOf('pants') !== -1 || nameDescText.indexOf('jean') !== -1 || nameDescText.indexOf('short') !== -1) {
            keywordBoost += weight * 50;
          }
        }

        // Semantic mapping for 'jacket', 'coat', 'outer'
        if (kw === 'jacket' || kw === 'coat' || kw === 'outer') {
          if (p.category === 'outer' || nameDescText.indexOf('jacket') !== -1) {
            keywordBoost += weight * 100;
          }
        }
      }
      
      score += Math.min(250, Math.round(keywordBoost));

      // 7. Circular / Sustainability benchmarks boost (up to 20 points)
      if (typeof getDppData === 'function') {
        try {
          var dpp = getDppData(p.id, p.name, p.category);
          if (dpp) {
            if (dpp.materialRecoveryRate) {
              score += (dpp.materialRecoveryRate * 0.15); // up to 12 points
            }
            if (dpp.co2Saved) {
              score += Math.min(8, dpp.co2Saved * 0.3); // up to 8 points
            }
          }
        } catch(e) {}
      }

      this.similarities[p.id] = Math.max(30, Math.round(score));
    }

    // Persist similarity cache
    try {
      localStorage.setItem('refashion_ai_similarities', JSON.stringify(this.similarities));
    } catch(e) {}

    // Update top-12 list (only used when threshold is met)
    this.topIds = this.getTopRecommendedIds(12);

    this.ready = true;

    if (!silent) {
      if (typeof renderShopProducts === 'function') {
        renderShopProducts();
      }
      if (typeof renderFeaturedProducts === 'function') {
        renderFeaturedProducts();
      }
    }
  },

  explainProduct: async function(product) {
    try {
      var shapleyResult = this.computeShapleyValues(product);
      if (!shapleyResult || !shapleyResult.shapley) {
        return "Recommended based on high compatibility with your previous interactions.";
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
          if (k === 'fabric')  { label = 'Fabric'; icon = 'fa-scissors'; }
          else if (k === 'pattern') { label = 'Pattern';  icon = 'fa-palette'; }
          else if (k === 'sleeve')  { label = 'Sleeve';  icon = 'fa-shirt'; }
          else if (k === 'neckline'){ label = 'Neckline';   icon = 'fa-circle-notch'; }
          else if (k === 'category'){ label = 'Category';  icon = 'fa-tag'; }
          else if (k === 'keyword') { label = 'Search/History';   icon = 'fa-magnifying-glass'; }
          if (label) chartFeatures.push({ label: label, icon: icon, pct: pct });
        }
      }
      chartFeatures.sort(function(a, b) { return b.pct - a.pct; });

      var chartHtml = '<div class="xai-shapley-chart" style="margin:8px 0 12px 0;background:rgba(0,0,0,0.02);padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.05);">';
      chartHtml += '<div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;margin-bottom:8px;color:var(--text-muted);display:flex;justify-content:space-between;"><span>Contributing Factors (Shapley)</span><span>Weight</span></div>';
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

      // Circular Benchmarks from global getDppData
      var dppHtml = '';
      if (typeof getDppData === 'function') {
        try {
          var dpp = getDppData(product.id, product.name, product.category);
          if (dpp) {
            dppHtml += '<div class="xai-benchmarks" style="margin:12px 0;background:rgba(91,116,83,0.04);padding:10px;border-radius:8px;border:1px solid rgba(91,116,83,0.15);">';
            dppHtml += '<div style="font-size:0.75rem;font-weight:700;color:var(--primary);margin-bottom:8px;display:flex;align-items:center;"><i class="fa-solid fa-chart-simple" style="margin-right:6px;"></i>Product Circularity Benchmarks</div>';
            dppHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.75rem;color:var(--text-dark);">';
            
            if (dpp.co2Saved) {
              dppHtml += '<div><i class="fa-solid fa-cloud" style="color:#708C69;margin-right:5px;width:12px;"></i>Carbon Savings: <strong>' + dpp.co2Saved.toFixed(1) + ' kg CO₂</strong></div>';
            }
            if (dpp.landfillSaved) {
              dppHtml += '<div><i class="fa-solid fa-trash-arrow-up" style="color:#a6855b;margin-right:5px;width:12px;"></i>Landfill Avoided: <strong>' + dpp.landfillSaved.toFixed(1) + ' kg</strong></div>';
            }
            if (dpp.materialRecoveryRate) {
              dppHtml += '<div><i class="fa-solid fa-recycle" style="color:#708C69;margin-right:5px;width:12px;"></i>Material Recovery: <strong>' + dpp.materialRecoveryRate + '%</strong></div>';
            }
            if (dpp.transportDistance) {
              dppHtml += '<div><i class="fa-solid fa-truck" style="color:#a6855b;margin-right:5px;width:12px;"></i>Transport Distance: <strong>' + dpp.transportDistance + ' km</strong></div>';
            }
            dppHtml += '</div>';
            
            if (dpp.materials && dpp.materials.length > 0) {
              var matTexts = dpp.materials.map(function(m) {
                var nameVn = m.name;
                if (nameVn === "Organic Cotton fibers") nameVn = "Organic Cotton Fiber";
                else if (nameVn === "Recycled Spandex") nameVn = "Recycled Spandex";
                else if (nameVn === "Repurposed Denim scrap") nameVn = "Repurposed Denim Scrap";
                else if (nameVn === "Recycled Polyester lining") nameVn = "Recycled Polyester Lining";
                else if (nameVn === "Eco-Elastane stretch") nameVn = "Eco-Elastane Stretch";
                else if (nameVn === "Recycled Cotton Denim yarn") nameVn = "Recycled Cotton Denim Yarn";
                else if (nameVn === "Upcycled Chiffon fabric") nameVn = "Upcycled Chiffon Fabric";
                else if (nameVn === "Recycled Nylon lining") nameVn = "Recycled Nylon Lining";
                else if (nameVn === "Bio-Synthetic weave") nameVn = "Bio-Synthetic Weave";
                else if (nameVn === "Recycled Linen fibers") nameVn = "Recycled Linen Fiber";
                else if (nameVn === "Organic Cotton lining") nameVn = "Organic Cotton Lining";
                return '<strong>' + m.pct + '%</strong> ' + nameVn;
              });
              dppHtml += '<div style="font-size:0.7rem;margin-top:6px;border-top:1px dashed rgba(91,116,83,0.15);padding-top:6px;color:var(--text-muted);">Composition: ' + matTexts.join(' | ') + '</div>';
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
      return "Recommended based on high compatibility with your previous interactions.";
    }
  },

  computeShapleyValues: function(product) {
    var self = this;
    var attrs = self.extractAttributes(product);

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

    // Keyword contribution weight
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
      'leather': 'Leather',
      'furry': 'Furry',
      'knitted': 'Knitted',
      'chiffon': 'Chiffon',
      'other': 'Bio-synthetic fabric'
    }[fab] || 'textile';
  },

  getPatternVn: function(pat) {
    return {
      'pure color': 'solid minimal',
      'striped': 'striped',
      'floral': 'elegant floral',
      'graphic': 'graphic printed',
      'lattice': 'lattice checked',
      'color block': 'color block'
    }[pat] || 'patterned';
  },

  getCategoryVn: function(cat) {
    return {
      'upper': 'fashion tops',
      'lower': 'fashion bottoms/dresses',
      'outer': 'jacket/outerwear'
    }[cat] || 'apparel';
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
        matchDesc.push(this.getFabricVn(attrs.style) + ' material');
      }
      if (item.attrs.pattern === attrs.pattern && attrs.pattern && attrs.pattern !== 'other') {
        matchDesc.push(this.getPatternVn(attrs.pattern) + ' pattern');
      }
      if (item.attrs.category === attrs.category && attrs.category) {
        matchDesc.push(this.getCategoryVn(attrs.category) + ' category');
      }
      
      if (matchDesc.length > 0) {
        matches.push({
          name: item.name,
          action: item.action,
          desc: matchDesc.join(' and ')
        });
        if (matches.length >= 2) break;
      }
    }
    return matches;
  },

  generateNlgExplanation: function(shapleyResult, product) {
    if (!shapleyResult) {
      return "This design is recommended for its modern styling and fine craftsmanship using sustainable textiles.";
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
        label = 'breathable ' + self.getFabricVn(fVal) + ' fabric';
      } else if (c.type === 'pattern') {
        var pVal = features.find(function(f) { return f.type === 'pattern'; }).value;
        label = self.getPatternVn(pVal) + ' style';
      } else if (c.type === 'sleeve') {
        var sVal = features.find(function(f) { return f.type === 'sleeve'; }).value;
        var sleeveVn = {
          'sleeveless': 'breezy sleeveless style',
          'short-sleeve': 'active short-sleeve style',
          'medium-sleeve': 'elegant 3/4-sleeve style',
          'long-sleeve': 'warm long-sleeve style',
          'not long-sleeve': 'active sleeve fit'
        }[sVal] || 'stylish sleeves';
        label = sleeveVn;
      } else if (c.type === 'neckline') {
        var nVal = features.find(function(f) { return f.type === 'neckline'; }).value;
        var neckVn = {
          'V-shape neckline': 'flattering V-neck design',
          'square neckline': 'elegant square neck',
          'round neckline': 'basic crew neck',
          'standing neckline': 'classic stand-up collar',
          'lapel neckline': 'elegant lapel collar',
          'suspender neckline': 'charming strappy neckline'
        }[nVal] || 'refined neckline';
        label = neckVn;
      } else if (c.type === 'category') {
        var cVal = features.find(function(f) { return f.type === 'category'; }).value;
        label = self.getCategoryVn(cVal) + ' collection';
      }
      if (label) parts.push(label);
    }

    var text = "";

    // 1. Keyword search / purchase match connection
    var matchedKeywords = [];
    var nameDescText = (product.name + ' ' + (product.description || '')).toLowerCase();
    for (var kw in self.profile.keywords) {
      if (self.profile.keywords[kw] > 0) {
        if (nameDescText.indexOf(kw) !== -1 || 
            (kw === 'hoodie' && (p.category === 'upper' || p.category === 'outer') && nameDescText.indexOf('jacket') !== -1) ||
            (kw === 'skirt' && (p.category === 'overall' || p.category === 'lower'))) {
          matchedKeywords.push('"' + kw + '"');
        }
      }
    }

    // 2. Interactive history connection
    var related = self.findRelatedInteraction(product);
    if (matchedKeywords.length > 0) {
      text += "ReFashion recommends this product based on its strong similarity to your recent searches for <strong>" + matchedKeywords.slice(0, 2).join(' & ') + "</strong>. ";
    } else if (related && related.length > 0) {
      var r = related[0];
      text += "Recommended based on your recent shopping behavior: You recently <strong>" + r.action + "</strong> product <em>\"" + r.name + "\"</em> (sharing " + r.desc + "). ";
    } else {
      text += "Recommended for its high alignment with your sustainable fashion choices. ";
    }

    // 3. Shapley feature matching
    if (parts.length === 1) {
      text += "This design matches your preference for " + parts[0] + ".";
    } else if (parts.length === 2) {
      text += "This product is an optimal choice combining " + parts[0] + " and " + parts[1] + ".";
    } else if (parts.length >= 3) {
      text += "This design matches your personal preferences with " + parts[0] + ", " + parts[1] + ", along with " + parts[2] + ".";
    } else {
      text += "High compatibility product matching your preferred fit and fabric choices.";
    }

    // 4. Material spec context from real product properties
    var realAttrs = self.getProductRealAttributes(product);
    text += " Product highlights: ";
    if (realAttrs.fabric === 'cotton') {
      text += "Product made from organic cotton with natural weave, offering maximum moisture absorption and ultra-soft comfort for your skin.";
    } else if (realAttrs.fabric === 'denim') {
      text += "Durable Denim material woven from recycled cotton delivers outstanding durability, fade resistance, and perfect shape retention.";
    } else if (realAttrs.fabric === 'leather') {
      text += "Premium quality leather layer provides a fashionable look, excellent warmth, and long-lasting lifecycle.";
    } else if (realAttrs.fabric === 'knitted') {
      text += "Knitted fabric with excellent elasticity offers warmth and exceptional comfort for daily wear.";
    } else {
      text += "eco-friendly bio-synthetic weave designed for natural biodegradation at the end of its lifecycle.";
    }

    return text;
  },

  hasPreferences: function() {
    // Only expose preferences after the threshold is met to prevent premature sorting
    return this.totalInteractionWeight() >= this.INTERACTION_THRESHOLD;
  }
};

// Load preferences and cached similarity scores immediately
AI_REC_SYSTEM.loadProfile();

// Initialize silently
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    AI_REC_SYSTEM.init();
  }, 500);
});

// Re-render when navigating back (e.g. from shop-detail.html back to shop.html)
window.addEventListener('pageshow', function(event) {
  if (event.persisted || sessionStorage.getItem('rf_from_detail') === '1') {
    sessionStorage.removeItem('rf_from_detail');
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.initialized) {
      console.log('[AI Rec] User returned from detail view, re-computing recommendations dynamically.');
      AI_REC_SYSTEM.loadProfile();
      AI_REC_SYSTEM.computeLocalSimilarity(false);
    }
  }
});
