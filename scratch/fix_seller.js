const fs = require('fs');
let code = fs.readFileSync('js/seller.js', 'utf8');

const regex = /const timer = setInterval\(\(\) => \{\s*currentValue \+= increment;\s*currentMonthKey = key;/;

const replacement = `const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                numEl.innerText = isCurrency ? Math.round(targetValue).toLocaleString('vi-VN') + 'đ' : Math.round(targetValue) + (suffix || '');
                clearInterval(timer);
            } else {
                numEl.innerText = isCurrency ? Math.round(currentValue).toLocaleString('vi-VN') + 'đ' : Math.round(currentValue) + (suffix || '');
            }
        }, stepTime);
    }

    let dashboardData = null;
    let currentMonthKey = '2026-07';

    function loadDashboardData() {
        ajaxGetJSON('../datasets/shop_sub.json', function(subData) {
            const user = RefashionAuth._getUser();
            if (user && subData && subData.subscriptions) {
                const mySub = subData.subscriptions.find(s => s.email === user.email);
                const badgeEl = document.getElementById('seller-subscription-badge');
                if (mySub && badgeEl) {
                    badgeEl.innerHTML = '<i data-lucide="award" style="width:12px;height:12px;display:inline-block;margin-right:4px;"></i>' + mySub.plan.toUpperCase() + ' Plan';
                    if (mySub.plan === 'Enterprise') badgeEl.className = 'badge-editorial badge-accent';
                    else if (mySub.plan === 'Basic') badgeEl.className = 'badge-editorial badge-default';
                    badgeEl.style.display = 'inline-flex';
                    badgeEl.title = 'Renews on ' + mySub.renewalDate;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        }, function(){});
        ajaxGetJSON('../datasets/seller.json', function(data) {
            dashboardData = data;
            const user = RefashionAuth._getUser();
            const storeName = user && (user.store || user.name) ? (user.store || user.name) : 'Retro Chic';
            if (dashboardData && dashboardData[storeName] && dashboardData[storeName].dashboard && dashboardData[storeName].dashboard.months) {
                applyMonth(currentMonthKey, true);
                populateMonthDropdown();
            } else if (dashboardData && dashboardData.dashboard && dashboardData.dashboard.months) {
                applyMonth(currentMonthKey, true);
                populateMonthDropdown();
            }
        }, function() {});
    }

    function getMonthData(key) {
        const user = RefashionAuth._getUser();
        const storeName = user && (user.store || user.name) ? (user.store || user.name) : 'Retro Chic';
        if (dashboardData && dashboardData[storeName] && dashboardData[storeName].dashboard && dashboardData[storeName].dashboard.months) {
            return dashboardData[storeName].dashboard.months.find(m => m.key === key) || null;
        } else if (dashboardData && dashboardData.dashboard && dashboardData.dashboard.months) {
            return dashboardData.dashboard.months.find(m => m.key === key) || null;
        }
        return null;
    }

    function applyMonth(key, initial) {
        const monthData = getMonthData(key);
        if (!monthData) return;

        currentMonthKey = key;`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/seller.js', code);
console.log('Regex replace successful:', code.includes('loadDashboardData'));
