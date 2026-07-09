const fs = require('fs');
let adminCode = fs.readFileSync('js/admin.js', 'utf8');

const regexRenderProducts = /function renderProducts\(\) \{[\s\S]*?window\.toggleProduct = function \(index\) \{[\s\S]*?renderProducts\(\);\s*\};/m;

const replacement = `function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    
    let hiddenProducts = JSON.parse(localStorage.getItem('refashion_hidden_products')) || {};

    tbody.innerHTML = '';
    products.forEach(function (prod, index) {
      const currentStatus = hiddenProducts[prod.id] ? 'Hidden' : 'Active';
      prod.status = currentStatus;

      const badgeClass = currentStatus === 'Active' ? 'badge-accent' : 'badge-danger';
      const hideBtn = currentStatus === 'Hidden'
        ? '<button class="btn btn-primary" onclick="toggleProduct(' + index + ')">Unhide</button>'
        : '<button class="btn btn-danger" onclick="toggleProduct(' + index + ')">Hide</button>';

      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><span class="metric-text">' + prod.id + '</span></td>' +
        '<td>' + prod.name + '</td>' +
        '<td>' + prod.store + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + currentStatus + '</span></td>' +
        '<td>' + hideBtn + '</td>';
      tbody.appendChild(tr);
    });
  }

  window.toggleProduct = function (index) {
    let hiddenProducts = JSON.parse(localStorage.getItem('refashion_hidden_products')) || {};
    const prodId = products[index].id;
    
    if (products[index].status === 'Hidden') {
      products[index].status = 'Active';
      delete hiddenProducts[prodId];
    } else {
      products[index].status = 'Hidden';
      hiddenProducts[prodId] = true;
    }
    
    localStorage.setItem('refashion_hidden_products', JSON.stringify(hiddenProducts));
    renderProducts();
  };`;

adminCode = adminCode.replace(regexRenderProducts, replacement);

fs.writeFileSync('js/admin.js', adminCode);
console.log('Patched Product Moderation in admin.js');
