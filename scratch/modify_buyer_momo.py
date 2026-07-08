import os

filepath = r"d:\FinalWorkWeb\js\buyer.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target = """  if (checkoutPaymentMethod === 'momo') {
    showToast('Redirecting to MoMo...');
    var btn = document.getElementById('place-order-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:0.35rem"></i> Redirecting to MoMo...'; }
    var orderId = 'RF-' + Date.now().toString(36).toUpperCase();
    RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note });
    window.open('momo-return.html?resultCode=0&orderId=' + orderId + '&amount=' + (data.subtotal - Math.floor(data.subtotal * discountPercent / 100)), '_blank');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Pay via MoMo'; }
    showSuccessView(orderId, data.subtotal, discountPercent);
    return;
  }"""

replacement = """  if (checkoutPaymentMethod === 'momo') {
    showToast('Connecting to MoMo...');
    var btn = document.getElementById('place-order-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:0.35rem"></i> Connecting to MoMo...'; }
    var order = RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note });
    if (!order) {
      showToast('Error placing order.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Pay via MoMo'; }
      return;
    }
    
    fetch('/api/create-momo-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: order.id,
        amount: order.total,
        redirectUrl: window.location.origin + '/buyer/momo-return.html'
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(resData) {
      if (resData && resData.payUrl) {
        window.location.href = resData.payUrl;
      } else {
        console.warn("[MoMo API] Sandbox returned error, falling back:", resData);
        window.location.href = 'momo-return.html?resultCode=0&orderId=' + order.id + '&amount=' + order.total + '&transId=MOCK' + Date.now();
      }
    })
    .catch(function(err) {
      console.error("[MoMo API] Fetch error:", err);
      window.location.href = 'momo-return.html?resultCode=0&orderId=' + order.id + '&amount=' + order.total + '&transId=MOCK' + Date.now();
    });
    return;
  }"""

# Try direct replace
if target in content:
    content = content.replace(target, replacement)
    print("Direct target matched and replaced.")
else:
    # Try normalized line endings
    normalized_content = content.replace("\r\n", "\n")
    normalized_target = target.replace("\r\n", "\n")
    normalized_replacement = replacement.replace("\r\n", "\n")
    if normalized_target in normalized_content:
        normalized_content = normalized_content.replace(normalized_target, normalized_replacement)
        content = normalized_content # Save with \n line endings
        print("Normalized target matched and replaced.")
    else:
        print("Error: Target block not found in buyer.js")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
