const fs = require('fs');
let buyer = fs.readFileSync('js/buyer.js', 'utf8');
let seller = fs.readFileSync('js/seller.js', 'utf8');

// Extract VTON logic from buyer.js
let vtonIndex = buyer.indexOf('/* ==================== VTON STUDIO ==================== */');
if (vtonIndex === -1) process.exit(1);

let vtonLogic = buyer.substring(vtonIndex);

// Replace variables and IDs for Seller
vtonLogic = vtonLogic.replace(/vtonState/g, 'sellerVtonState');
vtonLogic = vtonLogic.replace(/VTON_PRESET_MODELS/g, 'SELLER_VTON_PRESET_MODELS');
vtonLogic = vtonLogic.replace(/getActiveModelImageUrl/g, 'sellerGetActiveModelImageUrl');
vtonLogic = vtonLogic.replace(/getGarmentImageUrl/g, 'sellerGetGarmentImageUrl');
vtonLogic = vtonLogic.replace(/getGarmentType/g, 'sellerGetGarmentType');

vtonLogic = vtonLogic.replace(/openVtonStudio/g, 'sellerOpenVtonStudio');
vtonLogic = vtonLogic.replace(/closeVtonStudio/g, 'sellerCloseVtonStudio');
vtonLogic = vtonLogic.replace(/loadHfTokenFromEnv/g, 'sellerLoadHfTokenFromEnv');
vtonLogic = vtonLogic.replace(/renderVtonModels/g, 'sellerRenderVtonModels');
vtonLogic = vtonLogic.replace(/renderVtonGarment/g, 'sellerRenderVtonGarment');
vtonLogic = vtonLogic.replace(/selectVtonModel/g, 'sellerSelectVtonModel');
vtonLogic = vtonLogic.replace(/handleVtonUserUpload/g, 'sellerHandleVtonUserUpload');
vtonLogic = vtonLogic.replace(/toggleSimulateMode/g, 'sellerToggleSimulateMode');
vtonLogic = vtonLogic.replace(/resetVtonResult/g, 'sellerResetVtonResult');
vtonLogic = vtonLogic.replace(/setVtonState/g, 'sellerSetVtonState');
vtonLogic = vtonLogic.replace(/logVton/g, 'sellerLogVton');
vtonLogic = vtonLogic.replace(/setVtonProgress/g, 'sellerSetVtonProgress');
vtonLogic = vtonLogic.replace(/startVtonInference/g, 'sellerStartVtonInference');
vtonLogic = vtonLogic.replace(/runSimulationMode/g, 'sellerRunSimulationMode');
vtonLogic = vtonLogic.replace(/runRealVtonAPI/g, 'sellerRunRealVtonAPI');
vtonLogic = vtonLogic.replace(/showVtonSuccess/g, 'sellerShowVtonSuccess');
vtonLogic = vtonLogic.replace(/getBlobFromUrl/g, 'sellerGetBlobFromUrl');

// Replace DOM IDs
vtonLogic = vtonLogic.replace(/getElementById\('vton-/g, "getElementById('seller-vton-");
vtonLogic = vtonLogic.replace(/getElementById\('btn-start-vton'\)/g, "getElementById('seller-btn-start-vton')");
vtonLogic = vtonLogic.replace(/getElementById\('compare-slider-bar'\)/g, "getElementById('seller-vton-compare-slider-bar')");


// We need an extra function to use the result
vtonLogic += '\n\nfunction sellerUseVtonResult() {\n' +
  '  if (sellerVtonState.resultImageUrl) {\n' +
  '    var gallery = document.getElementById("product-image-gallery");\n' +
  '    var placeholder = document.getElementById("product-upload-placeholder");\n' +
  '    if (placeholder) placeholder.style.display = "none";\n' +
  '    if (gallery) {\n' +
  '      var item = document.createElement("div");\n' +
  '      item.className = "gallery-item";\n' +
  '      item.innerHTML = "<img src=\\"" + sellerVtonState.resultImageUrl + "\\" alt=\\"AI Result\\">" +\n' +
  '                       "<button type=\\"button\\" class=\\"btn-remove-img\\" onclick=\\"this.parentElement.remove()\\">&times;</button>";\n' +
  '      gallery.appendChild(item);\n' +
  '    }\n' +
  '    sellerCloseVtonStudio();\n' +
  '  }\n' +
  '}\n';

vtonLogic += '\n\nfunction sellerDownloadVtonResult() {\n' +
  '  if (sellerVtonState.resultImageUrl) {\n' +
  '    var a = document.createElement("a");\n' +
  '    a.href = sellerVtonState.resultImageUrl;\n' +
  '    a.download = "AI_Model_Image_" + Date.now() + ".jpg";\n' +
  '    a.click();\n' +
  '  }\n' +
  '}\n';

// Fix openVtonStudio logic since product is undefined when clicking the new button
vtonLogic = vtonLogic.replace(/function sellerOpenVtonStudio\(product\) \{/, 'function sellerOpenVtonStudio() {\n  var product = {};\n  // Try to find the first image in the gallery as the product image\n  var gallery = document.getElementById("product-image-gallery");\n  if (gallery) {\n    var firstImg = gallery.querySelector("img");\n    if (firstImg) product.clothFile = firstImg.src;\n  }\n  if (!product.clothFile) {\n    product.clothFile = "../images/products/MEN-Denim-id_00000080-01_7_additional.jpg";\n  }\n');
vtonLogic = vtonLogic.replace(/if \(\!product \|\| \!product.clothFile\) \{ showToast\('This product does not support AI Try-On yet.'\); return; \}/, '');

// Also fix slider listeners (need to use seller-vton-compare-slider-bar)
vtonLogic = vtonLogic.replace(/var slider = document\.getElementById\('vton-compare-slider-bar'\);/, "var slider = document.getElementById('seller-vton-compare-slider-bar');");
vtonLogic = vtonLogic.replace(/var slider = document\.getElementById\('vton-compare-slider-bar'\);/, "var slider = document.getElementById('seller-vton-compare-slider-bar');"); // Replace any remaining

// Clean up some things
if (seller.indexOf('/* ==================== VTON STUDIO ==================== */') === -1) {
    fs.appendFileSync('js/seller.js', '\n' + vtonLogic);
    console.log('Successfully appended Seller VTON logic');
} else {
    console.log('VTON logic already exists in seller.js');
}
