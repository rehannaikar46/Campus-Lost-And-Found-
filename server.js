require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Twilio = require('twilio');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting to prevent abuse
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 OTP requests per IP
  message: 'Too many OTP requests, please try again later'
});

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 posts per hour per IP
  message: 'Too many posts, please try again later'
});

const PORT = process.env.PORT || 3000;

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const store = new Map(); // phone -> { code, expiresAt }

// Simple in-memory stores for demo purposes
const users = new Map(); // phone -> { phone, createdAt, blocked }
const posts = []; // { id, posterPhone, type, title, description, contactPhone, createdAt }

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSms(to, body) {
  if (!to) return { ok: false, error: 'no phone' };
  try {
    if (twilioClient && process.env.TWILIO_FROM) {
      await twilioClient.messages.create({ body, from: process.env.TWILIO_FROM, to });
      return { ok: true, sent: true };
    } else {
      console.log('[DEV SMS]', { to, body });
      return { ok: true, sent: false };
    }
  } catch (err) {
    console.error('SMS send error', err);
    return { ok: false, error: 'failed to send' };
  }
}

app.post('/api/send-otp', otpLimiter, async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone is required' });

  const code = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;
  store.set(phone, { code, expiresAt });

  const message = `Your Campus Lost & Found OTP is ${code}. It expires in 5 minutes.`;

  try {
    const r = await sendSms(phone, message);
    return res.json({ ok: true, sent: r.sent, note: r.sent ? undefined : 'Twilio not configured; SMS logged to server console' });
  } catch (err) {
    console.error('Twilio send error', err);
    return res.status(500).json({ error: 'failed to send sms' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

  const entry = store.get(phone);
  if (!entry) return res.status(400).json({ ok: false, error: 'no otp requested for this phone' });

  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return res.status(400).json({ ok: false, error: 'otp expired' });
  }

  if (entry.code !== code) return res.status(400).json({ ok: false, error: 'invalid otp' });

  store.delete(phone);
  // Create user if doesn't exist
  if (!users.has(phone)) {
    users.set(phone, { phone, createdAt: Date.now(), blocked: false });
  }

  // For demo, return a simple token (the phone) — replace with real session/token in prod
  return res.json({ ok: true, message: 'verified', token: phone });
});

// Protected helper for demo: token is just the phone string
function authFromReq(req) {
  const token = req.headers['x-token'] || req.body.token;
  if (!token) return null;
  const user = users.get(token);
  return user && !user.blocked ? user : null;
}

app.post('/api/post-item', postLimiter, async (req, res) => {
  const user = authFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: 'unauthenticated or blocked' });

  const { type, title, description, contactPhone } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type and title required' });

  const id = posts.length + 1;
  const post = { id, posterPhone: user.phone, type, title, description: description || '', contactPhone: contactPhone || null, createdAt: Date.now() };
  posts.push(post);

  // Notify poster
  await sendSms(user.phone, `You posted the item (${type}) successfully: ${title}`);

  // If this is a 'found' post and the poster provided a contactPhone, notify that contact
  if (type === 'found' && contactPhone) {
    await sendSms(contactPhone, `Your item may have been found: ${title}. Contact: ${user.phone}`);
  }

  return res.json({ ok: true, post });
});

app.get('/api/posts', (req, res) => {
  return res.json({ ok: true, posts });
});

app.post('/api/delete-account', (req, res) => {
  const token = req.headers['x-token'] || req.body.token;
  if (!token) return res.status(400).json({ error: 'token required' });
  const user = users.get(token);
  if (!user) return res.status(404).json({ error: 'user not found' });

  // Remove user's posts
  for (let i = posts.length - 1; i >= 0; i--) {
    if (posts[i].posterPhone === user.phone) posts.splice(i, 1);
  }
  users.delete(user.phone);
  return res.json({ ok: true });
});

// Admin
const adminSessions = new Map(); // token -> true
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password required' });
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    const token = Math.random().toString(36).slice(2);
    adminSessions.set(token, true);
    return res.json({ ok: true, token });
  }
  return res.status(401).json({ ok: false, error: 'invalid password' });
});

function adminAuth(req) {
  const t = req.headers['x-admin-token'] || req.body.adminToken;
  return t && adminSessions.has(t);
}

app.get('/api/admin/users', (req, res) => {
  if (!adminAuth(req)) return res.status(401).json({ error: 'admin auth required' });
  const list = Array.from(users.values());
  return res.json({ ok: true, users: list });
});

app.get('/api/admin/posts', (req, res) => {
  if (!adminAuth(req)) return res.status(401).json({ error: 'admin auth required' });
  return res.json({ ok: true, posts });
});

app.post('/api/admin/block-user', (req, res) => {
  if (!adminAuth(req)) return res.status(401).json({ error: 'admin auth required' });
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const u = users.get(phone);
  if (!u) return res.status(404).json({ error: 'user not found' });
  u.blocked = true;
  users.set(phone, u);
  return res.json({ ok: true });
});

app.listen(PORT, () => console.log(`OTP demo server running on port ${PORT}`));
