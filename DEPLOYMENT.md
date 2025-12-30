# Deployment & Setup Guide

## What's Complete

✅ **OTP SMS Authentication** via Twilio (or dev console)
✅ **User Profiles** - Signup, login, delete account
✅ **Post Items** - Lost & Found posts with descriptions
✅ **SMS Notifications** - Users get confirmations and alerts
✅ **Admin Dashboard** - View all users, posts, and block accounts
✅ **Professional UI** - Responsive design with validation
✅ **Error Handling** - Form validation and user feedback

## Local Testing

The app is running locally. Open **http://localhost:3000/index.html**

**Test Flow:**
1. Enter phone: `+15551234567`
2. Click "Send OTP"
3. Check server console for OTP (displayed since Twilio not configured)
4. Enter the 6-digit code
5. Post items, delete account, try admin panel

**Admin Password:** Not set yet — create `.env` with `ADMIN_PASSWORD=demo` to test admin features.

## Deployment to Render (Recommended)

### Step 1: Push to GitHub

```bash
cd /workspaces/Campus-Lost-And-Found-
git init
git add .
git commit -m "Campus Lost & Found - Complete OTP App"
git remote add origin https://github.com/YOUR_USERNAME/Campus-Lost-And-Found-.git
git push -u origin main
```

### Step 2: Create on Render

1. Go to **https://render.com** → Sign up (free, no credit card)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Fill in settings:
   - **Name**: `campus-lost-found`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables

In Render dashboard, under **Environment**:

```
PORT=3000
ADMIN_PASSWORD=your-secure-password-here
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
TWILIO_FROM=optional (+1234567890)
```

### Step 4: Deploy

Click **Create Web Service**. Your app goes live in ~2 min at:
```
https://<your-service-name>.onrender.com/index.html
```

## Features to Add Next (Optional)

- **Database**: Replace in-memory storage with MongoDB or PostgreSQL
- **Image Uploads**: Allow users to upload photos of items
- **Search & Filter**: Search by item type, location, date
- **Email Verification**: Alternative to SMS
- **Rate Limiting**: Prevent abuse
- **User Profiles**: Allow users to see other users' posts and contact info
- **Notifications Dashboard**: Track item status

## API Endpoints Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/send-otp` | POST | None | Send OTP to phone |
| `/api/verify-otp` | POST | None | Verify OTP, create user |
| `/api/post-item` | POST | Token | Post lost/found item |
| `/api/posts` | GET | None | Get all posts |
| `/api/delete-account` | POST | Token | Delete user & posts |
| `/api/admin/login` | POST | None | Admin login |
| `/api/admin/users` | GET | Admin | View all users |
| `/api/admin/posts` | GET | Admin | View all posts |
| `/api/admin/block-user` | POST | Admin | Block a user |

## Important Notes

### Production Checklist

- [ ] Add `ADMIN_PASSWORD` to `.env`
- [ ] Configure Twilio credentials for real SMS
 
### India-only notes

- This demo is currently restricted to Indian phone numbers only. Enter numbers as `+91XXXXXXXXXX` or `10`-digit mobile numbers (e.g. `9876543210`).
- If using Twilio, ensure your `TWILIO_FROM` number and account are allowed to send SMS to India.
- [ ] Replace in-memory storage with database
- [ ] Add rate limiting middleware
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Add input validation on backend
- [ ] Set up error logging
- [ ] Test all user flows end-to-end

### Security

- Tokens are currently just phone numbers (insecure) — use JWT in production
- In-memory storage is lost on restart — use Redis/Database
- No CSRF protection — add helmet.js
- No rate limiting — add express-rate-limit

### Data Storage

Current: In-memory Map (demo only)
Recommended for production:
- **Users**: PostgreSQL/MongoDB
- **Posts**: PostgreSQL/MongoDB
- **OTP Cache**: Redis (TTL)
- **Sessions**: JWT or Redis

## Support

For issues or questions, check:
- Server logs in terminal
- Browser console (F12)
- Network tab (Chrome DevTools)

Enjoy! 🎉
