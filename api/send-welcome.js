const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return res.status(200).json({
      success: true,
      demo: true,
      message: 'Email credentials not configured in Vercel environment variables. Using demo fallback.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const displayName = username || email.split('@')[0];

    const mailOptions = {
      from: `"ReFashion Support" <${emailUser}>`,
      to: email,
      subject: 'Đăng ký tài khoản thành công | ReFashion',
      text: `Xin chào ${displayName},\n\nChúc mừng bạn đã đăng ký tài khoản thành công trên hệ thống ReFashion - Nền tảng thời trang bền vững xanh.\n\nChúc bạn có những trải nghiệm mua sắm và thanh lý tuyệt vời!\n\nTrân trọng,\nĐội ngũ ReFashion`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4">
        <tr><td style="padding:20px 10px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden">
        <tr><td style="padding:30px 30px 20px;background-color:#16a34a;text-align:center">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">♻ ReFashion</h1>
        <p style="margin:4px 0 0;color:#d1fae5;font-size:13px">Đăng ký thành công</p>
        </td></tr>
        <tr><td style="padding:30px 30px 20px">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5;font-weight:bold">Xin chào ${displayName},</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">Chúc mừng bạn đã đăng ký tài khoản thành công trên hệ thống **ReFashion** - Nền tảng mua bán và tái chế quần áo cũ vì môi trường xanh.</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">Chúng tôi đã tặng bạn **100 GreenCoins** làm quà chào mừng để bắt đầu hành trình mua sắm xanh của mình.</p>
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">Chúc bạn có những trải nghiệm mua sắm và thanh lý tuyệt vời!</p>
        </td></tr>
        <tr><td style="padding:20px 30px;border-top:1px solid #e5e7eb;text-align:center">
        <p style="margin:0;font-size:12px;color:#9ca3af">Đây là email tự động từ hệ thống ReFashion, vui lòng không phản hồi email này.</p>
        </td></tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, demo: false });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};
