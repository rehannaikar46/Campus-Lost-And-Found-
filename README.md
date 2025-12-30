# Campus Lost & Found - OTP Demo

A Node.js/Express app with OTP SMS verification, lost/found posting, user profiles, and admin dashboard.

## Features

- **OTP SMS Verification**: Sign up and login via 6-digit OTP sent via Twilio (or logged to console).
 - **OTP SMS Verification (India only)**: Sign up and login via 6-digit OTP sent to Indian phone numbers (+91 or 10-digit).
- **Post Items**: Users can post "Lost" or "Found" items with descriptions.
- **Delete Account**: Users can delete their account and all posts.
- **SMS Notifications**: Poster gets confirmation; found-item contacts are notified via SMS.
- **Admin Dashboard**: Admin login to view all users, posts, and block abusive accounts.

## Quick Start (Local)

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. (Optional) Add Twilio credentials to `.env` for real SMS:

```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM=+1234567890
ADMIN_PASSWORD=your-secret-password
```

4. Run the server:

```bash
npm start
```

5. Open `http://localhost:3000/signup.html` in your browser.

## How It Works

- **Send OTP**: Enter a phone number (e.g., `+15551234567`). Server generates a 6-digit code.
 - **Send OTP**: Enter a phone number (India only — e.g., `+919876543210` or `9876543210`). Server generates a 6-digit code.
  - If Twilio is configured, SMS is sent; otherwise, code is logged to console.
- **Verify OTP**: Enter the 6-digit code to authenticate and create a user.
- **Post Items**: Choose "Lost" or "Found", add title/description, and submit.
  - Poster gets SMS confirmation.
  - If "Found" item, original owner's contact is notified.
- **Profile**: View logged-in user; delete account and all posts.
- **Admin Panel**: Login with `ADMIN_PASSWORD` to see all users and posts; block abusive users.

## Deploy to Render (Free)

1. Push to GitHub:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/Campus-Lost-And-Found-.git
git push -u origin main
```

2. Go to https://render.com and sign up (free tier, no credit card).

3. Click **New +** → **Web Service**.

4. Connect your GitHub repo and fill in:
   - **Name**: `campus-lost-found`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add environment variables under **Environment**:
   - `PORT=3000`
   - `ADMIN_PASSWORD=your-secret-password` (required)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (optional)

6. Click **Create Web Service** — your app will be live in ~2 minutes at:
   ```
   https://<your-service-name>.onrender.com/signup.html
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-otp` | Send OTP to phone |
| POST | `/api/verify-otp` | Verify OTP code and create user |
| POST | `/api/post-item` | Post a lost/found item |
| GET | `/api/posts` | Get all posts |
| POST | `/api/delete-account` | Delete user and posts |
| POST | `/api/admin/login` | Admin login with password |
| GET | `/api/admin/users` | View all users (admin only) |
| GET | `/api/admin/posts` | View all posts (admin only) |
| POST | `/api/admin/block-user` | Block a user (admin only) |

## Notes

- **In-Memory Storage**: This demo stores OTPs and users in memory (lost on server restart). For production, use Redis or a database.
- **Authentication**: Uses a simple token (phone number) for demo; replace with real session/JWT in production.
- **Rate-Limiting**: Add rate-limiting middleware for production.
- **Twilio Optional**: If Twilio is not configured, SMS messages are logged to the server console for testing.

## Environment Variables

```
PORT=3000
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
TWILIO_FROM=optional (e.g., +1234567890)
ADMIN_PASSWORD=required (set a strong password)
```

## Next Steps

- Integrate with a real database (MongoDB, PostgreSQL).
- Add rate-limiting and input validation.
- Implement real session management (JWT or server sessions).
- Add email-based OTP as an alternative.
- Improve UI/UX with a frontend framework (React, Vue).
