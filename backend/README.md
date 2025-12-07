# MEAN Real-Time Admin Dashboard - Backend

A production-ready Node.js/Express backend for a real-time admin dashboard with MongoDB, JWT authentication, and Socket.io real-time features.

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/mean-admin-dashboard
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_email
SMTP_PASS=your_mailtrap_api_key
```

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Build & Production

Build TypeScript to JavaScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Database Setup

### Local MongoDB

For development, install MongoDB locally:
```bash
# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

Start MongoDB:
```bash
mongod
```

### Docker MongoDB

Use docker-compose to run MongoDB:
```bash
docker-compose up -d mongodb
```

## Seeding Database

Create initial admin user and sample data:
```bash
npm run seed
```

**Default credentials:**
- Admin: `admin@example.com` / `admin123`
- User: `john@example.com` / `password123`

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (paginated, filterable, searchable)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Change user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Sessions
- `POST /api/sessions/start` - Start user session
- `GET /api/sessions/active` - Get active sessions
- `POST /api/sessions/:id/terminate` - Terminate session (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/send` - Send notification (admin only)
- `POST /api/notifications/broadcast` - Broadcast message (admin only)

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/signups` - Get signup trends
- `GET /api/analytics/sessions` - Get session trends

### Kanban
- `POST /api/kanban/boards` - Create board
- `GET /api/kanban/boards` - List boards
- `POST /api/kanban/cards` - Create card
- `PUT /api/kanban/cards/:id` - Update card

### Exports
- `GET /api/export/users` - Export users CSV
- `GET /api/export/activity` - Export activity log CSV
- `GET /api/export/sessions` - Export sessions CSV

## Real-Time Events (Socket.io)

### Client → Server
```javascript
socket.emit('registerUserSocket', { userId, role })
socket.emit('terminateSession', { sessionId })
```

### Server → Client
```javascript
socket.on('newNotification', (notification) => {})
socket.on('analyticsUpdate', (deltas) => {})
socket.on('sessionStarted', (session) => {})
socket.on('sessionEnded', ({ sessionId }) => {})
socket.on('presenceUpdate', ({ userId, online }) => {})
socket.on('userUpdated', ({ userId, ...updates }) => {})
socket.on('onlineCountUpdate', ({ count, onlineUserIds }) => {})
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/mean-admin-dashboard

# JWT
JWT_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-in-production
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Email
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_email
SMTP_PASS=your_password
EMAIL_FROM=noreply@meandashboard.local

# Frontend
FRONTEND_URL=http://localhost:4200

# Socket.io
SOCKET_PATH=/socket.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Email Configuration

### Mailtrap (Development)
1. Create account at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials
3. Add to `.env`

### SendGrid (Production)
Update `.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-email
SMTP_PASS=your-mailgun-password
```

## File Structure

```
backend/
├── src/
│   ├── config/       # Database configuration
│   ├── controllers/  # Route controllers
│   ├── middlewares/  # Express middlewares
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utilities (tokens, socket, etc)
│   └── index.ts      # Server entry point
├── scripts/          # Database seeding scripts
├── tests/            # Test files
├── package.json
├── tsconfig.json
├── jest.config.js
├── Dockerfile
└── .env.example
```

## Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth endpoints
- ✅ CORS enabled
- ✅ Input validation with express-validator
- ✅ Admin role-based access control
- ✅ Refresh token rotation and revocation

## License

MIT
