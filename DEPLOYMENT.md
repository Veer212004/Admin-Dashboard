# Deployment Guide

Quick reference for deployed URLs and configuration.

## 🌐 Deployed URLs

### Frontend (Vercel)
- **URL**: https://admin-dashboard-d924.vercel.app
- **Platform**: Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend (Render)
- **URL**: https://admin-dashboard-b14w.onrender.com
- **Platform**: Render
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: 5000

## 📝 Environment Configuration

### Frontend Environment Files

#### `src/environments/environment.ts` (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',        // Local backend
  socketUrl: 'http://localhost:5000',
  socketPath: '/socket.io',
};
```

#### `src/environments/environment.prod.ts` (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://admin-dashboard-b14w.onrender.com/api',  // Render backend
  socketUrl: 'https://admin-dashboard-b14w.onrender.com',
  socketPath: '/socket.io',
};
```

### Backend Environment Variables (Render Dashboard)

Set these in Render → Services → admin-dashboard → Environment:

```bash
# Database
MONGO_URI=mongodb+srv://dbuser:PASSWORD@admin-dashboard.o4tdzmv.mongodb.net/admin-dashboard?retryWrites=true&w=majority&appName=Admin-Dashboard

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-change-this-in-production
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS (comma-separated)
FRONTEND_URL=https://admin-dashboard-d924.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=50

# Socket.IO
SOCKET_PATH=/socket.io

# Email (Gmail SMTP with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=veereshhedderi18@gmail.com
SMTP_PASS=dhsb kyao kmqi wtwv
EMAIL_FROM=Admin-Dashboard <veereshhedderi18@gmail.com>
```

## 🚀 Quick Deployment Commands

### Deploy Frontend to Vercel
```powershell
# Commit changes
git add .
git commit -m "Update configuration"
git push origin main

# Vercel auto-deploys on push to main
# Or manual deploy:
npx vercel --prod
```

### Deploy Backend to Render
```powershell
# Commit changes
git add .
git commit -m "Update backend configuration"
git push origin main

# Render auto-deploys on push to main
# Or trigger manual deploy from Render Dashboard
```

## 🔧 Local Development Setup

### Start Backend Locally
```powershell
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Start Frontend Locally
```powershell
# From project root
npm install
npm start
# Runs on http://localhost:4200
```

### Test Email Service
```powershell
# Test SMTP connection (with backend running)
curl -X POST http://localhost:5000/api/debug/send-test-email -H "Content-Type: application/json" -d "{\"to\":\"your@email.com\"}"

# Or test on deployed backend:
curl -X POST https://admin-dashboard-b14w.onrender.com/api/debug/send-test-email -H "Content-Type: application/json" -d "{\"to\":\"your@email.com\"}"
```

## 🔍 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` includes your frontend URL
- For Render: Update environment variable in Render Dashboard
- For local: Update `backend/.env`

### Email Not Sending
1. Check backend logs for `[EmailService]` messages
2. Verify SMTP credentials in environment variables
3. Test with debug endpoint: `POST /api/debug/send-test-email`
4. Gmail users: Ensure "App Password" is used (not regular password)

### Socket Connection Failed
- Verify `socketUrl` and `socketPath` match in frontend environment
- Check backend CORS allows your frontend origin
- Ensure backend is running and accessible

### 403 Forbidden on Login
- User email not verified - use "Resend email" button
- Or manually verify in MongoDB: `db.users.updateOne({email: "user@example.com"}, {$set: {verified: true}})`

## 📋 Pre-Deployment Checklist

- [ ] Update `FRONTEND_URL` in backend environment
- [ ] Verify SMTP credentials are set
- [ ] Check MongoDB connection string is correct
- [ ] Update JWT secrets for production
- [ ] Test email sending with debug endpoint
- [ ] Verify CORS settings allow frontend origin
- [ ] Test socket connection from frontend
- [ ] Check all environment files are committed (except `.env`)

## 🔄 Switching Between Local and Deployed Backend

### Option 1: Use Deployed Backend for Local Frontend Testing
Update `src/environments/environment.ts`:
```typescript
apiUrl: 'https://admin-dashboard-b14w.onrender.com/api',
socketUrl: 'https://admin-dashboard-b14w.onrender.com',
```

### Option 2: Use Local Backend (Default)
Keep `src/environments/environment.ts` as:
```typescript
apiUrl: 'http://localhost:5000/api',
socketUrl: 'http://localhost:5000',
```

## 📞 Support

- Frontend Logs: Vercel Dashboard → Deployments → Logs
- Backend Logs: Render Dashboard → Services → Logs
- Email Test: `POST /api/debug/send-test-email`
- Health Check: `GET https://admin-dashboard-b14w.onrender.com/health`
