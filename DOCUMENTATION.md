# PowerX CRM - Project Documentation

## 📚 Table of Contents
- [Quick Start Guide](#quick-start-guide)
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start Guide

### First Time Setup

1. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb powerx_crm
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE powerx_crm;
   ```

2. **Backend Setup**
   ```bash
   cd crm-backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd crm-frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000
   - Default login: admin@crm.com / admin123

## 🏗️ Architecture Overview

### System Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │◄──────► │   React     │◄──────► │  Express    │
│  (Client)   │   HTTP  │  Frontend   │   REST  │  Backend    │
└─────────────┘         └─────────────┘         └─────────────┘
                               │                        │
                               │                        │
                        WebSocket                   Prisma ORM
                           (Socket.io)                  │
                               │                        ▼
                               │                 ┌─────────────┐
                               └────────────────►│ PostgreSQL  │
                                                 │  Database   │
                                                 └─────────────┘
```

### Backend Architecture

```
crm-backend/
├── src/
│   ├── controllers/      # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── lead.controller.js
│   │   ├── activity.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── middleware/       # Request processing
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── errorHandler.js         # Error handling
│   │   └── validateRequest.js      # Input validation
│   │
│   ├── routes/          # API endpoints
│   │   ├── auth.routes.js
│   │   ├── lead.routes.js
│   │   ├── activity.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── services/        # External services
│   │   └── email.service.js
│   │
│   ├── utils/          # Helper functions
│   │   ├── prisma.js
│   │   └── AppError.js
│   │
│   ├── app.js          # Express app setup
│   └── index.js        # Server entry point
```

### Frontend Architecture

```
crm-frontend/
├── src/
│   ├── app/            # Store configuration
│   │   ├── store.js
│   │   └── api/
│   │       └── apiSlice.js
│   │
│   ├── features/       # Feature-based modules
│   │   ├── auth/
│   │   │   ├── authSlice.js
│   │   │   └── authApiSlice.js
│   │   └── leads/
│   │       └── leadsApiSlice.js
│   │
│   ├── pages/          # Route components
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsPage.jsx
│   │   └── EditLeadPage.jsx
│   │
│   ├── components/     # Reusable UI
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   └── App.jsx        # Main app component
```

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Lead       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄───────┤│ id (PK)         │
│ email           │  owns   │ firstName       │
│ password        │         │ lastName        │
│ name            │         │ email           │
│ role            │         │ phone           │
│ resetToken      │         │ organization    │
│ tokenExpires    │         │ status          │
└─────────────────┘         │ ownerId (FK)    │
                            └─────────────────┘
                                    │
                                    │ has many
                                    ▼
                            ┌─────────────────┐
                            │    Activity     │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ type            │
                            │ content         │
                            │ leadId (FK)     │
                            │ userId (FK)     │
                            │ createdAt       │
                            └─────────────────┘
```

### Prisma Schema

```prisma
enum Role {
  ADMIN
  MANAGER
  SALES_EXECUTIVE
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  LOST
  WON
}

enum ActivityType {
  NOTE
  CALL
  MEETING
  STATUS_CHANGE
  EMAIL
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(SALES_EXECUTIVE)
  
  ownedLeads  Lead[]     @relation("OwnerLeads")
  activities  Activity[]
  
  resetPasswordToken   String?
  resetPasswordExpires DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Lead {
  id           Int        @id @default(autoincrement())
  firstName    String
  lastName     String
  email        String     @unique
  phone        String?
  organization String?
  status       LeadStatus @default(NEW)
  ownerId      Int
  
  owner        User       @relation("OwnerLeads", fields: [ownerId], references: [id])
  activities   Activity[]
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Activity {
  id        Int          @id @default(autoincrement())
  type      ActivityType
  content   String
  leadId    Int
  userId    Int
  
  lead      Lead         @relation(fields: [leadId], references: [id])
  user      User         @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
}
```

## 🔐 Authentication Flow

### Registration & Login

```
1. User submits credentials
   ↓
2. Backend validates input
   ↓
3. Password hashed with bcrypt
   ↓
4. User saved to database
   ↓
5. JWT token generated
   ↓
6. Token sent to client
   ↓
7. Client stores token in Redux
   ↓
8. Token sent in Authorization header for subsequent requests
```

### Password Reset Flow

```
1. User requests password reset
   ↓
2. Backend generates random token
   ↓
3. Token hashed and saved to DB with expiry
   ↓
4. Email sent with reset link (unhashed token)
   ↓
5. User clicks link, enters new password
   ↓
6. Backend verifies hashed token
   ↓
7. Password updated, token cleared
   ↓
8. User logged in with new JWT
```

## 🌐 API Reference

### Response Format

All API responses follow this format:

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Pagination Response

```json
{
  "status": "success",
  "data": {
    "leads": [...],
    "items": [...]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "results": 10
}
```

## 🚀 Deployment Guide

### Heroku Deployment (Backend)

```bash
# Create Heroku app
heroku create powerx-crm-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git subtree push --prefix crm-backend heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd crm-frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 8000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: powerx_crm
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./crm-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/powerx_crm
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  frontend:
    build: ./crm-frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://backend:8000/api/v1

volumes:
  postgres_data:
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 8000
npx kill-port 8000

# Or on Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d powerx_crm
```

#### Prisma Generate Fails
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
npx prisma generate
```

#### JWT Token Invalid
- Check JWT_SECRET matches between sessions
- Verify token hasn't expired
- Clear browser localStorage and re-login

#### CORS Errors
- Ensure backend CORS is configured for frontend URL
- Check VITE_API_URL in frontend .env

### Debug Mode

Enable detailed logging:

```javascript
// Backend: src/index.js
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Frontend: Enable Redux DevTools
// Already configured in store.js
```

## 📈 Performance Optimization

### Backend
- Use database indexes on frequently queried fields
- Implement caching with Redis
- Use connection pooling for PostgreSQL
- Compress responses with compression middleware

### Frontend
- Code splitting with React.lazy()
- Memoize expensive computations
- Optimize bundle size with tree shaking
- Use React.memo for expensive components

## 🔒 Security Best Practices

1. **Never commit .env files**
2. **Use strong JWT secrets** (32+ characters)
3. **Implement rate limiting** for API endpoints
4. **Validate all inputs** on both client and server
5. **Use HTTPS** in production
6. **Keep dependencies updated**
7. **Implement CSRF protection**
8. **Use prepared statements** (Prisma handles this)

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/powerx-crm/issues)
- Email: support@powerxcrm.com
- Documentation: [View docs](https://docs.powerxcrm.com)

---

**Last Updated:** December 2025
