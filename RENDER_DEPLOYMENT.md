# Render Deployment Guide

## Quick Deployment (2 minutes)

Follow these exact steps to deploy to Render:

### Step 1: Go to Render
1. Open https://render.com
2. **Sign up** (use GitHub for fastest auth)
3. Click **Authorization** → **GitHub** → grant repo access

### Step 2: Create Web Service
1. Click **New +** → **Web Service**
2. Select `Campus-Lost-And-Found-` repo
3. Fill in:
   - **Name**: `campus-lost-found`
   - **Runtime**: `Node`
   - **Region**: `Singapore` (closest to India)
   - **Plan**: `Free` (good for demo)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Add Environment Variables (CRITICAL)
Before clicking **Create**, scroll to **Environment** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `3000` | Required |
| `ADMIN_PASSWORD` | `your-secret-password-here` | **Change this!** Use a strong password |
| `TWILIO_ACCOUNT_SID` | (leave empty) | Optional — add later if you have Twilio |
| `TWILIO_AUTH_TOKEN` | (leave empty) | Optional |
| `TWILIO_FROM` | (leave empty) | Optional |

**Example admin password**: `SecureAdminPassword2025`

### Step 4: Deploy
1. Click **Create Web Service**
2. Watch the build logs (should take ~1-2 minutes)
3. Once **Live** status appears, you're done!

### Step 5: Test Your Live App
Your app is live at:
```
https://campus-lost-found.onrender.com
```

**Test flow:**
1. Open: `https://campus-lost-found.onrender.com/index.html`
2. Enter phone: `9876543210` or `+919876543210` (India only)
3. Click "Send OTP"
4. Check Render logs for OTP code (since Twilio not configured)
5. Enter code to verify
6. Post items, delete account, test admin panel

---

## Troubleshooting

### Build fails
- Check the build logs in Render dashboard
- Ensure `.env` is NOT in `.gitignore` (we committed it)
- Verify `package.json` exists and is valid

### App crashes after deploy
- Check **Logs** tab in Render dashboard
- Ensure all required env vars are set (especially `ADMIN_PASSWORD`)
- Common error: missing `ADMIN_PASSWORD` → causes admin login to fail (app still works for users)

### Non-Indian phone numbers rejected
- This is by design! The app is India-only
- Test with: `9876543210`, `8765432109`, `+919876543210`, or `09876543210`
- Server validates and normalizes to `+91XXXXXXXXXX` format

### SMS not sending
- Twilio not configured (normal for free demo)
- Render logs will show `[DEV SMS]` entries with the message body
- To enable real SMS: add your Twilio credentials to Environment vars

---

## Production Checklist

- [x] Code pushed to GitHub
- [x] `.env` file with `ADMIN_PASSWORD` created
- [x] Rate limiting enabled (5 OTP/15min, 20 posts/hour)
- [x] India-only phone validation (server + client)
- [x] `render.yaml` config created
- [ ] Deploy to Render (do now ↑)
- [ ] Set strong `ADMIN_PASSWORD` on Render
- [ ] Test live app thoroughly
- [ ] (Optional) Add Twilio credentials for real SMS
- [ ] Share live URL with users

---

## After Deployment

### Monitor your app
- Render dashboard: https://dashboard.render.com
- View logs: Click service → **Logs** tab
- Check performance: **Metrics** tab

### Update code
1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Render auto-redeploys within 1-2 minutes

### Add real SMS (Optional)
1. Get Twilio account at https://twilio.com
2. Get `ACCOUNT_SID`, `AUTH_TOKEN`, and `FROM` number
3. In Render dashboard, update **Environment**:
   - `TWILIO_ACCOUNT_SID=your_sid`
   - `TWILIO_AUTH_TOKEN=your_token`
   - `TWILIO_FROM=+1234567890` (your Twilio number)
4. Click **Save**

### Custom domain (Optional)
1. In Render service → **Settings**
2. Add custom domain (requires DNS setup)

---

## App Features (India-Only)

✅ OTP SMS verification (6-digit codes)
✅ Lost & Found posting
✅ SMS notifications to poster & original owner
✅ User profiles with delete account
✅ Admin dashboard (view users, posts, block accounts)
✅ Rate limiting (prevents abuse)
✅ India phone validation

---

## Support

If you have issues:
1. Check Render logs first
2. Verify all env vars are set
3. Test locally: `npm start`
4. Common issue: Non-Indian phone numbers → must use +91 or 10-digit Indian numbers
