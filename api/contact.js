// api/contact.js - Secure contact form submission handler running on Vercel
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
    return res.status(455).json({ status: 'error', message: 'Method Not Allowed' });
  }

  // 2. Extract client IP and evaluate rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ 
      status: 'error', 
      message: 'Too many requests. Please try again in a minute.' 
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
  if (!cleanName || !cleanPhone || !cleanEmail || !cleanService || !cleanMessage) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
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

  // 4. Connect to Hostinger SMTP using Nodemailer
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT, 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const mailTo = process.env.MAIL_TO || 'info@nxt-gen.in';

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.error('SMTP Configuration missing from environment variables.');
    return res.status(500).json({ status: 'error', message: 'Something went wrong. Please try again later.' });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // True for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Enforce strict TLS matching to avoid self-signed cert blocks on Vercel
    tls: {
      rejectUnauthorized: true,
    }
  });

  // 5. Gather Date, Time, and Environment Metadata
  const now = new Date();
  // Adjust to IST timezone offset
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  const currentDate = istDate.toISOString().split('T')[0];
  const currentTime = istDate.toISOString().split('T')[1].substring(0, 8);
  
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  // 6. Build the email body layout exactly as specified
  const emailBody = `==================================================
NEW WEBSITE ENQUIRY
==================================================

Full Name:
${cleanName}

Phone Number:
${cleanPhone}

Email Address:
${cleanEmail}

Service Required:
${cleanService}

Message:
${cleanMessage}

--------------------------------------------------

Submitted On:
${currentDate} ${currentTime} IST

Website:
https://nxt-gen.in

IP Address:
${clientIP}

Browser:
${userAgent}

==================================================`;

  // 7. Configure Mail Options
  const mailOptions = {
    from: `"NXTGEN Solutions Website" <${smtpUser}>`,
    to: mailTo,
    replyTo: `"${cleanName}" <${cleanEmail}>`,
    subject: 'New Enquiry from NXTGEN Solutions Website',
    text: emailBody,
  };

  // 8. Deliver Email and Handle Responses
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ 
      status: 'success', 
      message: '✓ Thank you! Your enquiry has been submitted successfully. Our team will contact you within one business day.' 
    });
  } catch (error) {
    // Log the actual exception strictly on the server side
    console.error('SMTP Mail Transmission Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Something went wrong. Please try again later.' 
    });
  }
};
