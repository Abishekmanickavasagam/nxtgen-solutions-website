// api/contact.js - Secure contact form submission handler running on Vercel via secure SMTP Nodemailer
const nodemailer = require('nodemailer');

// In-memory rate limiting map (IP -> array of submission timestamps)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return false;
  }

  const timestamps = rateLimitMap.get(ip);
  // Filter out timestamps outside the active window
  const activeTimestamps = timestamps.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
  
  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, activeTimestamps);
    return true;
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);
  return false;
}

// Simple HTML escaping helper to sanitize values
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Strips carriage returns and line feeds to prevent header injection
function stripNewlines(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[\r\n]/g, '').trim();
}

module.exports = async (req, res) => {
  // 1. Ensure method is POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed. Please send a POST request.' });
  }

  // 2. Extract client IP and evaluate rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ 
      status: 'error', 
      message: 'Too many submissions. Please wait a minute and try again.' 
    });
  }

  // 3. Destructure and validate input parameters
  const { fullName, phone, email, service, message } = req.body || {};

  // Clean values of newlines to prevent email header injection
  const cleanName = stripNewlines(fullName);
  const cleanPhone = stripNewlines(phone);
  const cleanEmail = stripNewlines(email);
  const cleanService = stripNewlines(service);
  const cleanMessage = escapeHtml(message ? message.trim() : '');

  // Validation checks
  if (!cleanName) {
    return res.status(400).json({ status: 'error', message: 'Full Name is required.' });
  }
  if (!cleanPhone) {
    return res.status(400).json({ status: 'error', message: 'Phone Number is required.' });
  }
  if (!cleanEmail) {
    return res.status(400).json({ status: 'error', message: 'Email Address is required.' });
  }
  if (!cleanService) {
    return res.status(400).json({ status: 'error', message: 'Service Selection is required.' });
  }
  if (!cleanMessage) {
    return res.status(400).json({ status: 'error', message: 'Message is required.' });
  }

  // Validate email address format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ status: 'error', message: 'Please enter a valid email address.' });
  }

  // Validate phone number format
  const phoneRegex = /^\+?[0-9\s\-]{8,20}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return res.status(400).json({ status: 'error', message: 'Please enter a valid phone number.' });
  }

  // 4. Validate SMTP Environment Configuration and return descriptive errors if missing
  const missingVars = [];
  if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
  if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
  if (!process.env.SMTP_PASSWORD) missingVars.push('SMTP_PASSWORD');
  if (!process.env.MAIL_FROM) missingVars.push('MAIL_FROM');
  if (!process.env.MAIL_TO) missingVars.push('MAIL_TO');

  if (missingVars.length > 0) {
    console.error(`SMTP Configuration error: Missing environment variables: ${missingVars.join(', ')}`);
    return res.status(500).json({ 
      status: 'error', 
      message: `SMTP configuration error: Missing environment variables: ${missingVars.join(', ')}` 
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT, 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const mailFrom = process.env.MAIL_FROM;
  const mailTo = process.env.MAIL_TO;

  // 5. Gather Date, Time, and Environment Metadata
  const now = new Date();
  // Adjust to IST timezone offset
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  const currentDate = istDate.toISOString().split('T')[0];
  const currentTime = istDate.toISOString().split('T')[1].substring(0, 8);

  // 6. Construct professional HTML email content
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #2563EB, #10B981); padding: 30px; text-align: center; color: #ffffff; }
    .header h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .detail-row { display: table; width: 100%; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .detail-label { display: table-cell; width: 35%; font-weight: bold; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { display: table-cell; width: 65%; color: #0f172a; font-size: 15px; }
    .message-box { background: #f8fafc; border-left: 4px solid #2563EB; padding: 15px; border-radius: 4px; margin-top: 20px; font-style: italic; color: #334155; line-height: 1.6; }
    .footer { background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>NXTGEN Solutions</h2>
      <p>New Website Enquiry Received</p>
    </div>
    <div class="content">
      <div class="detail-row">
        <div class="detail-label">Full Name</div>
        <div class="detail-value">${cleanName}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Phone Number</div>
        <div class="detail-value">${cleanPhone}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Email Address</div>
        <div class="detail-value"><a href="mailto:${cleanEmail}" style="color: #2563EB; text-decoration: none;">${cleanEmail}</a></div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Selected Service</div>
        <div class="detail-value"><strong>${cleanService}</strong></div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Submission Date & Time</div>
        <div class="detail-value">${currentDate} ${currentTime} IST</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Visitor IP</div>
        <div class="detail-value">${clientIP}</div>
      </div>
      <div style="margin-top: 25px;">
        <strong style="color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Enquiry Message:</strong>
        <div class="message-box">
          "${cleanMessage.replace(/\n/g, '<br>')}"
        </div>
      </div>
    </div>
    <div class="footer">
      This is an automated delivery from the NXTGEN Solutions contact portal.<br>
      &copy; 2026 NXTGEN Solutions. All rights reserved.
    </div>
  </div>
</body>
</html>`;

  // 7. Setup Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // True for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Enforce TLS matching
    tls: {
      rejectUnauthorized: true,
    }
  });

  // 8. Verify connection / authentication and return descriptive errors if it fails
  try {
    await transporter.verify();
  } catch (verifyError) {
    console.error('SMTP Connection/Authentication Failed:', verifyError);
    return res.status(500).json({
      status: 'error',
      message: `SMTP Connection/Authentication failed: ${verifyError.message}`
    });
  }

  // 9. Configure Mail Payload
  const mailOptions = {
    from: `"${mailFrom}" <${smtpUser}>`,
    to: mailTo,
    replyTo: `"${cleanName}" <${cleanEmail}>`,
    subject: 'New Website Enquiry - NXTGEN Solutions',
    html: htmlContent,
  };

  // 10. Deliver Email
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ 
      status: 'success', 
      message: 'Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly.' 
    });
  } catch (error) {
    // Log the actual exception strictly on the server side for debugging
    console.error('SMTP Mail Transmission Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: `Something went wrong. SMTP Transmission failed: ${error.message}` 
    });
  }
};
