# MEAN Real-Time Admin Dashboard

A production-ready, fully functional real-time admin dashboard built with **Angular 20**, **Node.js/Express**, **MongoDB**, and **Socket.io**.

## Assignment Submission (Use this section for your email reply)

Follow these exact steps when submitting the assignment by email (reply-all in the same mail thread):

- **Platform:** You may use any platform to complete the assignment — this repo is your submission.
- **Deadline:** Submit by **Sunday EOD** (include the date in the email subject if required).
- **Reply-All:** Reply on the same mail trail only — do not send a separate email.
- **Attach README:** Include this `README.md` contents inline or attach the file in the email.
- **Include Screenshots:** Attach screenshots of all required pages (see "Screenshots & Submission Checklist" section below).

### What to include in the email body (copy/paste)

Subject: [Assignment Submission] Admin Dashboard — <Your Name> — Submission

Body:
```
Hello,

Please find my assignment submission attached in reply to this mail thread.

Repository: (attached) or link to repository if requested
Project: Admin Dashboard
Author: Veeresh Hedderi (or replace with your name)
Deadline: Submitted by Sunday EOD

Setup & Run (short instructions):
- Backend: cd backend && npm install && copy .env.example to .env and set MONGO_URI & SMTP vars, then npm run dev
- Frontend: cd .. (project root) && npm install && npm start

Screenshots: Attached (login, dashboard, kanban, users, notifications)

Please let me know if you need any further details.

Best regards,
<Your Name>
```

Include this README and the screenshots folder when replying.


## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Start MongoDB (if local):
```bash
mongod
```

6. Run database seed:
```bash
npm run seed
```

7. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Install dependencies (from root):
```bash
npm install
```

2. Start Angular dev server:
```bash
npm start
```

Frontend will run on `http://localhost:4200`

## 🔐 Demo Credentials

After seeding:
- **Admin**: admin@example.com / admin123
- **User**: john@example.com / password123

## 📁 Project Structure

```
.
├── src/                           # Angular Frontend
│   ├── app/
│   │   ├── models/               # TypeScript interfaces
│   │   ├── services/             # API & Socket services
│   │   ├── guards/               # Route guards
│   │   ├── interceptors/         # HTTP interceptors
│   │   ├── pages/                # Page components
│   │   │   ├── auth/            # Login, Register, Verify Email
│   │   │   └── dashboard/       # Dashboard pages
│   │   ├── layout/              # Layout components
│   │   ├── app.routes.ts        # Routes configuration
│   │   └── app.config.ts        # App configuration
│   ├── environments/            # Environment config
│   ├── styles.css              # Global styles
│   └── main.ts                 # Entry point
├── backend/                     # Node.js/Express Backend
│   ├── src/
│   │   ├── config/             # Database config
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middlewares/        # Express middlewares
│   │   ├── utils/              # Utilities
│   │   └── index.ts            # Server entry
│   ├── scripts/                # Database seed script
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── jest.config.js
├── docker-compose.yml          # Docker setup
└── README.md
```

## ✨ Features Implemented

### Authentication
- ✅ User registration with email verification
- ✅ JWT login with refresh token rotation
- ✅ Role-based access control (user/admin)
- ✅ Logout with token revocation
- ✅ Password reset via email
- ✅ Secure token storage with interceptors

### Dashboard
- ✅ Real-time KPI cards (total users, active now, etc.)
- ✅ Analytics charts with real-time updates
- ✅ Quick action buttons
- ✅ Responsive grid layout

### User Management
- ✅ List users with pagination
- ✅ Search, filter, and sort users
- ✅ User details view
- ✅ Role change (user ↔ admin)
- ✅ Delete users
- ✅ CSV export
- ✅ Real-time online status

### Session Management
- ✅ Live active sessions list
- ✅ Session duration timer
- ✅ Terminate sessions (admin only)
- ✅ IP and device information
- ✅ Real-time session updates via Socket.io

### Notifications
- ✅ Real-time notifications via Socket.io
- ✅ Unread count badge
- ✅ Mark as read functionality
- ✅ Send individual notifications (admin)
- ✅ Broadcast messages to users/admins

### Activity Logging
- ✅ Immutable audit log
- ✅ Filter by action and date range
- ✅ User activity history
- ✅ CSV export

### Kanban Board
- ✅ Create and manage boards
- ✅ Drag-and-drop cards between columns
- ✅ Assign users to cards
- ✅ Real-time authorization status badges
- ✅ Filter by role, verified, online status
- ✅ Inline role change for assignees

### Settings
- ✅ Theme selection (light/dark)
- ✅ Sidebar layout options (full/mini/hidden)
- ✅ Container type (full/boxed)
- ✅ Card style options
- ✅ Persisted per-admin settings

### Guide Me (Onboarding)
- ✅ Interactive onboarding tour
- ✅ Real-time KPI values
- ✅ UI element highlighting
- ✅ Admin-only access
- ✅ Saved progress

### Real-Time Features
- ✅ WebSocket (Socket.io) integration
- ✅ Live user presence tracking
- ✅ Real-time notifications
- ✅ Analytics deltas
- ✅ Session events

### Exports
- ✅ Users CSV export
- ✅ Activity log CSV export
- ✅ Sessions CSV export

## 🔧 API Endpoints

See `backend/README.md` for complete API documentation.

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Users
- `GET /api/users` (with filters & pagination)
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PUT /api/users/:id/role` (admin)
- `DELETE /api/users/:id` (admin)

### Sessions
- `POST /api/sessions/start`
- `GET /api/sessions/active`
- `GET /api/sessions`
- `POST /api/sessions/:id/terminate` (admin)

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/send` (admin)
- `POST /api/notifications/broadcast` (admin)
- `POST /api/notifications/mark-read/:id`

### Analytics
- `GET /api/analytics/summary`
- `GET /api/analytics/signups`
- `GET /api/analytics/sessions`

### Kanban
- `GET /api/kanban/boards`
- `POST /api/kanban/boards`
- `GET /api/kanban/cards`
- `POST /api/kanban/cards`
- `PUT /api/kanban/cards/:id`
- `DELETE /api/kanban/cards/:id`

### Activity
- `GET /api/activity` (admin)
- `GET /api/activity/user/:userId`

### Exports
- `GET /api/export/users`
- `GET /api/export/activity`
- `GET /api/export/sessions`

## 🔌 Real-Time Events (Socket.io)

### Client → Server
- `registerUserSocket { userId, role }` - Register user socket
- `terminateSession { sessionId }` - Terminate session
- `joinBoardRoom { boardId }` - Join Kanban board room
- `leaveBoardRoom { boardId }` - Leave Kanban board room

### Server → Client
- `newNotification` - New notification event
- `analyticsUpdate` - Analytics delta update
- `sessionStarted` - New session created
- `sessionEnded { sessionId }` - Session ended
- `presenceUpdate { userId, online }` - User presence change
- `userUpdated { userId, ...updates }` - User data updated
- `roleChanged { userId, newRole }` - User role changed
- `onlineCountUpdate { count, onlineUserIds }` - Online count update
- `kanbanUpdate` - Kanban board updated

## 🐳 Docker Deployment

Run entire stack with Docker Compose:

```bash
docker-compose up
```

This starts:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 4200

## 📧 Email Configuration

### Development (Mailtrap)
1. Create [Mailtrap](https://mailtrap.io) account
2. Get SMTP credentials
3. Add to backend `.env`:
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Production Options
- SendGrid
- Mailgun
- Resend
- AWS SES

Update SMTP settings in `.env`

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Coverage
```bash
cd backend
npm test -- --coverage
```

## 📦 Production Build

### Frontend
```bash
npm run build
# Output in dist/
```

### Backend
```bash
cd backend
npm run build
# Output in dist/
npm start
```

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Rate limiting on auth endpoints
- ✅ CORS enabled
- ✅ Admin role-based access control
- ✅ Refresh token rotation
- ✅ Secure token storage
- ✅ SQL injection prevention
- ✅ XSS protection

## 🚀 Performance

- Lazy-loaded Angular modules
- Pagination on all list endpoints
- Real-time updates via Socket.io
- Database indexing on frequently queried fields
- JWT token caching
- Gzip compression
- CDN-ready assets

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Angular Guide**: See inline component documentation
- **Environment Setup**: See `.env.example` files

## 🛠️ Tech Stack

### Frontend
- Angular 20
- TypeScript 5.8
- TailwindCSS 3.4
- Socket.io Client 4.7
- Chart.js & ng2-charts
- RxJS 7.8

### Backend
- Node.js 20+
- Express.js 4.18
- MongoDB with Mongoose 8.0
- Socket.io 4.7
- JWT (jsonwebtoken 9.1)
- Bcrypt 5.1
- Nodemailer 6.9
- Jest 29.7

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- TypeScript compilation
- ESLint & Prettier

## 📈 Scalability

- Stateless backend (horizontal scaling ready)
- MongoDB Atlas cloud database support
- Socket.io adapter for multiple instances
- Session persistence in MongoDB
- JWT-based stateless authentication
- Containerized deployment

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and patterns.

## 📄 License

MIT License - feel free to use this project

## 🆘 Support

For issues and questions:
1. Check the documentation in `backend/README.md`
2. Review the component inline comments
3. Check the environment configuration
4. Verify MongoDB connection

## 📝 Changelog

### v1.0.0 - Initial Release
- Complete Angular frontend
- Node.js/Express backend
- MongoDB database
- Socket.io real-time features
- JWT authentication
- Role-based authorization
- User management
- Session tracking
- Notifications system
- Activity logging
- Kanban board
- Export functionality
- Settings persistence
- Email notifications
- Docker support

## 🎯 Future Enhancements

- Two-factor authentication (2FA)
- OAuth2 Google SSO
- Payment processing (Stripe)
- Advanced analytics & reports
- File upload & management
- Team collaboration features
- Mobile app (React Native)
- Multi-language support (i18n)
- Advanced search with Elasticsearch
- GraphQL API option

---

