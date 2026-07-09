const fs = require('fs');
let code = fs.readFileSync('js/seller.js', 'utf8');

const replacements = {
  'placeholder="Màu"': 'placeholder="Color"',
  'placeholder="Giá (đ)"': 'placeholder="Price"',
  'placeholder="Kho"': 'placeholder="Stock"',
  'Chưa có sản phẩm nào': 'No products found',
  ' phân loại': ' variants',
  " || 'Tiêu chuẩn'": " || 'Standard'",
  "toLocaleString('vi-VN') + 'đ'": "toLocaleString('en-US') + ' VND'",
  'Đang Bán': 'Active',
  "'Đã Xóa Sản Phẩm', 'Sản phẩm đã được xóa khỏi danh sách.'": "'Product Deleted', 'The product has been removed from the list.'",
  "'Chỉnh Sửa Sản Phẩm'": "'Edit Product'",
  "'Cập Nhật'": "'Update'",
  "'Đăng Sản Phẩm Mới'": "'Add New Product'",
  "'Đăng Bán Ngay'": "'Publish Product'",
  "'Cập Nhật Thành Công', 'Sản phẩm <strong>' + prodName + '</strong> đã được cập nhật.'": "'Update Successful', 'Product <strong>' + prodName + '</strong> has been updated.'",
  "'Đăng Sản Phẩm Thành Công', 'Sản phẩm <strong>' + prodName + '</strong> đã được đăng bán.'": "'Product Added Successfully', 'Product <strong>' + prodName + '</strong> has been published.'"
};

for (const [vn, en] of Object.entries(replacements)) {
  code = code.split(vn).join(en);
}

fs.writeFileSync('js/seller.js', code);
console.log('Translated to English');
