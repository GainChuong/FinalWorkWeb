const fs = require('fs');

let adminCode = fs.readFileSync('js/admin.js', 'utf8');

// The promise all callback where `campaigns` is assigned
//       campaigns = campData.campaigns || [];
adminCode = adminCode.replace(/campaigns = campData\.campaigns \|\| \[\];/g, `
      // Merge with localStorage campaigns
      let localCamps = JSON.parse(localStorage.getItem('refashion_campaigns')) || [];
      campaigns = [...localCamps];
      let existingCodes = localCamps.map(c => c.code);
      
      let baseCamps = campData.campaigns || [];
      baseCamps.forEach(bc => {
        if (!existingCodes.includes(bc.code)) {
          campaigns.push(bc);
        }
      });
`);

// Add modal logic and update renderCampaigns
const regexRenderCampaigns = /function renderCampaigns\(\) \{[\s\S]*?tbody\.appendChild\(tr\);\s*\}\);\s*\}/m;

const replacement = `function renderCampaigns() {
    const tbody = document.getElementById('campaigns-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    campaigns.forEach(function (camp, index) {
      var badgeClass = 'badge-default';
      if (camp.status === 'Active') badgeClass = 'badge-accent';
      else if (camp.status === 'Inactive') badgeClass = 'badge-danger';
      else if (camp.status === 'Scheduled') badgeClass = 'badge-highlight';
      else if (camp.status === 'Ended') badgeClass = 'badge-danger';

      var discountText = camp.type === 'percentage' ? camp.value + '%' :
                         camp.type === 'fixed' ? Number(camp.value).toLocaleString('vi-VN') + 'đ' :
                         camp.type === 'free_shipping' ? 'Free Ship' : camp.value + '';
      var minOrderText = camp.minOrder ? Number(camp.minOrder).toLocaleString('vi-VN') + 'đ' : 'No minimum';
      var usageText = (camp.usedCount || 0) + ' / ' + (camp.usageLimit || '&infin;');
      
      var bannerInfo = camp.bannerImage ? '<br/><span style="color:var(--primary-green);font-size:10px;"><i data-lucide="image" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i>Has Banner</span>' : '';

      var actionBtns = '<button class="btn btn-outline" style="padding: 2px 6px; font-size: 10px;" onclick="editCampaign(' + index + ')">Edit</button>';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + camp.code + '</span></td>' +
        '<td>' + camp.name + '<br/><span style="font-size:10px;color:var(--text-secondary);">' + (camp.description || '') + '</span>' + bannerInfo + '</td>' +
        '<td><strong>' + discountText + '</strong></td>' +
        '<td style="font-size:11px;color:var(--text-secondary);">' + minOrderText + '</td>' +
        '<td style="font-size:11px;color:var(--text-secondary);white-space:nowrap;">' + camp.startDate + ' &rarr; ' + camp.endDate + '</td>' +
        '<td style="font-size:11px;color:var(--text-secondary);">' + usageText + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + camp.status + '</span></td>' + 
        '<td>' + actionBtns + '</td>';
      tbody.appendChild(tr);
    });
    
    // Re-initialize lucide icons for new content
    if(window.lucide) { lucide.createIcons(); }
  }

  // Edit / Create Campaign Logic
  let editingCampIndex = -1;

  window.editCampaign = function(index) {
    editingCampIndex = index;
    const camp = campaigns[index];
    document.getElementById('campaign-modal-title').innerText = 'Edit Campaign';
    document.getElementById('camp-code').value = camp.code || '';
    document.getElementById('camp-name').value = camp.name || '';
    document.getElementById('camp-desc').value = camp.description || '';
    document.getElementById('camp-type').value = camp.type || 'percentage';
    document.getElementById('camp-value').value = camp.value || '';
    document.getElementById('camp-min-order').value = camp.minOrder || '';
    document.getElementById('camp-status').value = camp.status || 'Active';
    document.getElementById('camp-start').value = camp.startDate || '';
    document.getElementById('camp-end').value = camp.endDate || '';
    
    if (camp.bannerImage) {
      document.getElementById('camp-banner-preview').style.display = 'block';
      document.getElementById('camp-banner-img').src = camp.bannerImage;
    } else {
      document.getElementById('camp-banner-preview').style.display = 'none';
      document.getElementById('camp-banner-img').src = '';
    }
    
    document.getElementById('campaign-modal').style.display = 'flex';
  };

  const createCampBtn = document.getElementById('create-campaign-btn');
  if (createCampBtn) {
    createCampBtn.addEventListener('click', function() {
      editingCampIndex = -1;
      document.getElementById('campaign-modal-title').innerText = 'Create Campaign';
      document.getElementById('camp-code').value = '';
      document.getElementById('camp-name').value = '';
      document.getElementById('camp-desc').value = '';
      document.getElementById('camp-type').value = 'percentage';
      document.getElementById('camp-value').value = '';
      document.getElementById('camp-min-order').value = '';
      document.getElementById('camp-status').value = 'Active';
      document.getElementById('camp-start').value = '';
      document.getElementById('camp-end').value = '';
      document.getElementById('camp-banner').value = '';
      document.getElementById('camp-banner-preview').style.display = 'none';
      document.getElementById('camp-banner-img').src = '';
      document.getElementById('campaign-modal').style.display = 'flex';
    });
  }

  const cancelCampBtn = document.getElementById('camp-cancel-btn');
  if (cancelCampBtn) {
    cancelCampBtn.addEventListener('click', function() {
      document.getElementById('campaign-modal').style.display = 'none';
    });
  }
  
  const campBannerInput = document.getElementById('camp-banner');
  if (campBannerInput) {
    campBannerInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          document.getElementById('camp-banner-preview').style.display = 'block';
          document.getElementById('camp-banner-img').src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const saveCampBtn = document.getElementById('camp-save-btn');
  if (saveCampBtn) {
    saveCampBtn.addEventListener('click', function() {
      const camp = {
        code: document.getElementById('camp-code').value,
        name: document.getElementById('camp-name').value,
        description: document.getElementById('camp-desc').value,
        type: document.getElementById('camp-type').value,
        value: document.getElementById('camp-value').value,
        minOrder: document.getElementById('camp-min-order').value,
        status: document.getElementById('camp-status').value,
        startDate: document.getElementById('camp-start').value,
        endDate: document.getElementById('camp-end').value,
        bannerImage: document.getElementById('camp-banner-img').src,
        usageLimit: 500,
        usedCount: 0
      };
      
      if (!camp.code || !camp.name) {
        alert('Please fill out Campaign Code and Name.');
        return;
      }
      
      if (editingCampIndex === -1) {
        campaigns.unshift(camp);
      } else {
        const existing = campaigns[editingCampIndex];
        camp.usageLimit = existing.usageLimit || 500;
        camp.usedCount = existing.usedCount || 0;
        campaigns[editingCampIndex] = camp;
      }
      
      localStorage.setItem('refashion_campaigns', JSON.stringify(campaigns));
      renderCampaigns();
      document.getElementById('campaign-modal').style.display = 'none';
    });
  }`;

adminCode = adminCode.replace(regexRenderCampaigns, replacement);

fs.writeFileSync('js/admin.js', adminCode);
console.log('Patched admin.js campaigns logic');
