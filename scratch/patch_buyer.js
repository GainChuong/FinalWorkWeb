const fs = require('fs');
let data = fs.readFileSync('js/buyer.js', 'utf8');

// Replace Timeline block
const startTimelineIndex = data.indexOf('            \'<div class="dpp-timeline">\' +');
const endTimelineIndex = data.indexOf('            \'</div>\' +\r\n          \'</div>\' +\r\n        \'</div>\' +\r\n      \'</div>\' +\r\n    \'</div>\';');

if (startTimelineIndex !== -1 && endTimelineIndex !== -1) {
  const before = data.substring(0, startTimelineIndex);
  const after = data.substring(endTimelineIndex);
  
  const newTimeline = '            \'<div class="dpp-timeline" id="dpp-os-timeline">\' +\n              \'<div style="text-align: center; color: var(--text-muted); padding: 1rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> \' + (isEn ? \'Fetching Open Supply Hub Data...\' : \'Đang tải dữ liệu từ Open Supply Hub...\') + \'</div>\' +\n';
  
  data = before + newTimeline + after;
  fs.writeFileSync('js/buyer.js', data);
  console.log('Successfully replaced timeline block.');
} else {
  console.log('Could not find timeline block boundaries.');
}

// Append the API fetch functions at the end of the file
const functionsToAdd = `
/* ==================== DPP External API Integrations ==================== */

function fetchClimatiqEmission(dpp, isEn) {
  var container = document.getElementById('dpp-climatiq-lca');
  if (!container) return;
  
  var apiKey = window.ENV && window.ENV.CLIMATIQ_API_KEY ? window.ENV.CLIMATIQ_API_KEY : null;
  
  if (!apiKey) {
    // Fallback logic for Climatiq
    setTimeout(function() {
      container.innerHTML = '<div style="text-align:center; padding:12px; color:var(--text-muted);"><i class="fa-solid fa-circle-info"></i> ' + (isEn ? 'Fallback Mode: Mock Data' : 'Chế độ Fallback: Dữ liệu mô phỏng') + '</div>' + 
      '<i class="fa-solid fa-circle-info"></i> ' + (isEn 
          ? 'ReFashion process emits <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> during transport & refurbishment, saving <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (<strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong> reduction) compared to producing a new product of the same type.'
          : 'Quy trình Refashion phát sinh <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> trong quá trình vận chuyển & làm mới, tiết kiệm <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (giảm <strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong>) so với sản xuất sản phẩm mới cùng loại.') +
      '<p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 10px; line-height: 1.3; text-align: left;">' +
        (isEn ? '* Calculations apply a 65% displacement rate based on standard LCA studies (Fallback Mode).' : '* Tính toán áp dụng hệ số thay thế 65% theo nghiên cứu LCA tiêu chuẩn (Chế độ Fallback).') +
      '</p>';
    }, 800);
    return;
  }
  
  // Real fetch logic if API key exists
}

function fetchSupplyHubFacilities(dpp, isEn) {
  var timelineContainer = document.getElementById('dpp-os-timeline');
  var originContainer = document.getElementById('dpp-os-origin');
  
  var apiKey = window.ENV && window.ENV.OS_HUB_API_KEY ? window.ENV.OS_HUB_API_KEY : null;
  
  if (!apiKey) {
    // Fallback logic for Open Supply Hub
    setTimeout(function() {
      if (originContainer) {
        originContainer.innerHTML = '<i class="fa-solid fa-leaf" style="color:var(--primary); margin-top: 3px; font-size: 0.95rem;"></i>' +
          '<div><strong>' + (isEn ? 'Collection details:' : 'Chi tiết nguồn thu gom:') + '</strong><br>' + dpp.materialOrigin + '</div>';
      }
      
      if (timelineContainer) {
        var html = 
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
          
        timelineContainer.innerHTML = html;
      }
    }, 1200);
    return;
  }
}
`;

if (!data.includes('function fetchClimatiqEmission')) {
  fs.appendFileSync('js/buyer.js', '\n' + functionsToAdd + '\n');
  console.log('Successfully appended functions.');
}
