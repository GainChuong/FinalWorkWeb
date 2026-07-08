const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'buyer', 'shop.html');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `          <aside class="shop-sidebar">
            <div class="filter-section">
              <h3>Category</h3>
              <div class="filter-radio-group">
                <label><input type="radio" name="category" value="all" checked /><span>All</span></label>
                <label><input type="radio" name="category" value="upper" /><span>Tops</span></label>
                <label><input type="radio" name="category" value="lower" /><span>Bottoms</span></label>
                <label><input type="radio" name="category" value="overall" /><span>Outfits</span></label>
              </div>
            </div>

            <div class="filter-section" id="filter-shop-section">
              <h3>Shop</h3>
              <div class="filter-radio-group" id="filter-shop-group">
              </div>
            </div>

          </aside>`;

const replacementStr = `          <aside class="shop-sidebar">
            <div class="filter-card">
              <div class="filter-section">
                <h3>Category</h3>
                <div class="filter-radio-group">
                  <label><input type="radio" name="category" value="all" checked /><span>All</span></label>
                  <label><input type="radio" name="category" value="upper" /><span>Tops</span></label>
                  <label><input type="radio" name="category" value="lower" /><span>Bottoms</span></label>
                  <label><input type="radio" name="category" value="overall" /><span>Outfits</span></label>
                </div>
              </div>
            </div>

            <div class="filter-card">
              <div class="filter-section" id="filter-shop-section">
                <h3>Shop</h3>
                <div class="filter-radio-group" id="filter-shop-group">
                </div>
              </div>
            </div>
          </aside>`;

const normalize = s => s.replace(/\r\n/g, '\n').trim();
if (normalize(content).includes(normalize(targetStr))) {
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(normalize(targetStr), normalize(replacementStr));
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated shop.html sidebar cards!');
} else {
  console.error('Error: target HTML not found in shop.html');
}
