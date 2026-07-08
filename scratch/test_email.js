const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually load env variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS:', emailPass ? '********' : 'NOT SET');

if (!emailUser || !emailPass) {
  console.error('Error: EMAIL_USER or EMAIL_PASS not found in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

const mailOptions = {
  from: `"ReFashion Support" <${emailUser}>`,
  to: emailUser, // Send back to self for testing
  subject: 'Test App Password Verification | ReFashion',
  text: 'Chào bạn,\n\nĐây là email kiểm tra tính năng gửi mail tự động bằng App Password của Gmail từ hệ thống ReFashion.\n\nChúc mừng hệ thống gửi mail hoạt động thành công!',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #16a34a; text-align: center;">♻ ReFashion Mail Verification</h2>
      <p>Chào bạn,</p>
      <p>Đây là email kiểm tra tính năng gửi mail tự động bằng <strong>Gmail App Password</strong> của bạn <strong>(${emailUser})</strong> từ hệ thống ReFashion.</p>
      <p style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; text-align: center; font-weight: bold; color: #1e293b;">
        KẾT QUẢ: GỬI MAIL THÀNH CÔNG!
      </p>
      <p>Cảm ơn bạn đã đồng hành cùng ReFashion.</p>
    </div>
  `
};

console.log('Sending test email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Failed to send email:', error);
  } else {
    console.log('Success! Response:', info.response);
  }
});
