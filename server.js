const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve all static files from the project root
app.use(express.static(__dirname));

// -----------------------------------------------------------------------
// MoMo Payment API – real integration (no sandbox, no mock)
// -----------------------------------------------------------------------
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO';
const MOMO_ACCESS_KEY   = process.env.MOMO_ACCESS_KEY   || 'F8BBA842ECF85';
const MOMO_SECRET_KEY   = process.env.MOMO_SECRET_KEY   || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const MOMO_ENDPOINT     = process.env.MOMO_ENDPOINT     || 'https://test-payment.momo.vn/v2/gateway/api/create';

function postMomoRequest(url, bodyData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(bodyData);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Failed to parse MoMo response: ' + body)); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

app.post('/api/create-momo-payment', async (req, res) => {
  const { orderId, amount, redirectUrl } = req.body;
  if (!orderId || !amount || !redirectUrl) {
    return res.status(400).json({ error: 'Missing orderId, amount, or redirectUrl' });
  }

  const requestId = orderId + '_' + Date.now();
  const orderInfo = 'Thanh toan don hang ReFashion #' + orderId;
  const ipnUrl = redirectUrl;
  const requestType = 'captureWallet';
  const extraData = '';

  const rawSignature = [
    'accessKey=' + MOMO_ACCESS_KEY,
    'amount=' + amount,
    'extraData=' + extraData,
    'ipnUrl=' + ipnUrl,
    'orderId=' + orderId,
    'orderInfo=' + orderInfo,
    'partnerCode=' + MOMO_PARTNER_CODE,
    'redirectUrl=' + redirectUrl,
    'requestId=' + requestId,
    'requestType=' + requestType
  ].join('&');

  const signature = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode: MOMO_PARTNER_CODE,
    partnerName: 'ReFashion',
    storeId: 'ReFashion',
    requestId,
    amount: parseInt(amount),
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    lang: 'vi',
    signature
  };

  try {
    const data = await postMomoRequest(MOMO_ENDPOINT, requestBody);
    return res.status(200).json(data);
  } catch (error) {
    console.error('MoMo API error:', error.message);
    return res.status(500).json({ error: 'MoMo API error: ' + error.message });
  }
});

// Optional .html extension redirect (for clean URLs)
app.use((req, res, next) => {
  if (req.path.endsWith('/')) return next();
  if (req.path.includes('.')) return next(); // has extension, skip
  const filePath = path.join(__dirname, req.path + '.html');
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log('ReFashion server running at http://localhost:' + PORT);
  console.log('MoMo endpoint: ' + MOMO_ENDPOINT);
  console.log('To use production MoMo, set MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create and proper credentials in .env');
});
