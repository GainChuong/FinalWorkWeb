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

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Missing email or otp' });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return res.status(200).json({
      success: true,
      demo: true,
      message: 'Email credentials not configured in Vercel environment variables. Using demo fallback.',
      otp: otp
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

    const mailOptions = {
      from: `"ReFashion Support" <${emailUser}>`,
      to: email,
      subject: 'Password Reset OTP Code | ReFashion',
      text: `Hello,\n\nYou (or someone) requested a password reset for your ReFashion account.\n\nYour OTP verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you did not request this change, please ignore this email.\n\n---\nThis is an automated email from the ReFashion system, please do not reply.`,
      html: `
        <!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4">
<tr><td style="padding:20px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="padding:30px 30px 20px;background-color:#10b981;text-align:center">
<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">ReFashion</h1>
<p style="margin:4px 0 0;color:#d1fae5;font-size:13px">Password Reset</p>
</td></tr>
<tr><td style="padding:30px 30px 20px">
<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">Hello,</p>
<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">You (or someone) requested a password reset for your ReFashion account.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;border-radius:6px;margin:0 0 16px">
<tr><td style="padding:15px;text-align:center">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280">Your OTP verification code:</p>
<p style="margin:0;font-size:36px;font-weight:700;letter-spacing:6px;color:#10b981">${otp}</p>
<p style="margin:8px 0 0;font-size:12px;color:#9ca3af">This code is valid for 5 minutes.</p>
</td></tr>
</table>
<p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.5">If you did not request this change, please ignore this email.</p>
</td></tr>
<tr><td style="padding:20px 30px;border-top:1px solid #e5e7eb;text-align:center">
<p style="margin:0;font-size:12px;color:#9ca3af">This is an automated email from the ReFashion system, please do not reply.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
      `,
      headers: {
        'List-Unsubscribe': '<mailto:support@refashion.vn?subject=unsubscribe>',
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply'
      }
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, demo: false });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
};
