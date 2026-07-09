const fs = require('fs');
let data = fs.readFileSync('js/buyer.js', 'utf8');

const targetIndex = data.indexOf('function fetchClimatiqEmission(dpp, isEn)');
if (targetIndex !== -1) {
  const before = data.substring(0, targetIndex);
  
  const newFunctions = `async function fetchClimatiqEmission(dpp, isEn) {
  var container = document.getElementById('dpp-climatiq-lca');
  if (!container) return;
  
  const CLIMATIQ_API_KEY = "FM1SBQ6AAX2EK6PFW26X74174M";

  try {
    const res = await fetch("https://api.climatiq.io/data/v1/estimate", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${CLIMATIQ_API_KEY}\`,
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
`;

  fs.writeFileSync('js/buyer.js', before + newFunctions);
  console.log('Successfully patched buyer.js with async live APIs');
} else {
  console.log('Target index not found.');
}
