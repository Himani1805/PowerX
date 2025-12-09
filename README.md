# PowerX - Next-Generation Customer Relationship Management System

<div align="center">

![PowerX](https://img.shields.io/badge/PowerX-CRM-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

**A modern, scalable CRM platform built for fast-growing startups**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

**Live Demo:**
```
Frontend: https://power-x-pink.vercel.app
Backend API: https://powerx-v3pk.onrender.com
```

---

**Default Admin Credentials:**
```
Email: admin@crm.com
Password: admin123
```

---

## 📖 Overview

PowerX is a full-stack Customer Relationship Management system designed to streamline lead management, automate workflows, and provide real-time insights for sales teams. Built with modern technologies and best practices, it offers enterprise-grade features with a focus on user experience and scalability.

### 🎯 Key Highlights

- **Role-Based Access Control (RBAC)** - Granular permissions for Admin, Manager, and Sales Executive roles
- **Real-time Notifications** - Instant updates via WebSocket (Socket.io)
- **Advanced Search & Filtering** - Find leads quickly with multi-field search and status filters
- **Activity Timeline** - Complete audit trail of all interactions with leads
- **Dashboard Analytics** - Visual insights into sales performance and pipeline health
- **Email Automation** - Automated notifications for status changes and password resets
- **Responsive Design** - Beautiful, modern UI that works on all devices

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Bcrypt password hashing
- Role-Based Access Control (RBAC)
- Password reset with token-based verification
- Helmet.js for HTTP header security
- CORS configuration

### 👥 User Management
- User registration and login
- Three role levels: **ADMIN**, **MANAGER**, **SALES_EXECUTIVE**
- Forgot password / Reset password flow
- Email verification for password resets

### 📊 Lead Management
- **Create, Read, Update, Delete (CRUD)** operations
- **Search functionality** - Search by name, email, organization, or phone
- **Pagination** - Efficiently handle large datasets
- **Advanced filtering** - Filter by status (NEW, CONTACTED, QUALIFIED, WON, LOST)
- **Status tracking** - Visual pipeline management
- **Owner assignment** - Leads assigned to specific sales reps
- **RBAC enforcement** - Sales Executives see only their leads

### 📝 Activity Timeline
- Comprehensive activity logging (Notes, Calls, Meetings, Status Changes, Emails)
- Automatic activity creation on status changes
- User attribution for all activities
- Chronological timeline view
- Full audit trail

### 📈 Dashboard & Analytics
- **Lead counts by status** - NEW, CONTACTED, QUALIFIED, WON, LOST
- **Lead distribution by owner** - Performance tracking per sales rep
- **Role-based analytics** - Custom views for different user roles
- **Real-time data updates**

### ⚡ Real-time Features
- Socket.io integration for instant updates
- Live notifications for new activities
- Toast notifications in UI
- WebSocket connection management

### 📧 Email Notifications
- Automated emails on lead status changes
- Password reset emails with secure tokens
- Configurable SMTP settings
- Fallback logging when email service is unavailable

### 🎨 Frontend
- Modern React application with Redux Toolkit
- Responsive design with Tailwind CSS
- Protected routes with authentication
- Real-time UI updates
- Toast notifications
- Clean, intuitive interface

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** Bcrypt
- **Real-time:** Socket.io
- **Email:** Nodemailer
- **Security:** Helmet, CORS
- **Logging:** Morgan

### Frontend
- **Library:** React 18
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Notifications:** React Toastify
- **WebSocket:** Socket.io Client

### DevOps
- **Process Manager:** Nodemon (development)
- **Environment:** dotenv
- **Database Migrations:** Prisma Migrate

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Himani1805/PowerX.git
cd PowerX
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/powerx_crm?schema=public"

# Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

**Run Database Migrations:**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npm run seed
```

**Start the Backend Server:**

```bash
npm run dev
```

Server will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your frontend `.env` file:**

```env
VITE_API_URL=http://localhost:8000/api/v1
```

**Start the Frontend Server:**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000/api/v1`

## 📁 Project Structure

```
PowerX/
├── backend/                    # Backend API
│   ├── prisma/
│   │   ├── migrations/        # Database migrations
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth, RBAC, Error handling
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (Email, etc.)
│   │   ├── utils/            # Utilities (Prisma, AppError)
│   │   ├── app.js            # Express application
│   │   └── index.js          # Server entry point
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   └── package.json
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── app/              # Redux store setup
│   │   ├── components/       # Reusable components
│   │   ├── features/         # Redux slices & API
│   │   ├── pages/            # Page components
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── .env                  # Environment variables (not in git)
│   ├── .env.example          # Environment template
│   ├── vercel.json           # Vercel configuration
│   └── package.json
│
└── README.md                  # This file
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PATCH /auth/reset-password/:token
Content-Type: application/json

{
  "password": "newSecurePassword123"
}
```

### Lead Endpoints

#### Get All Leads (with search, filter, pagination)
```http
GET /leads?search=acme&status=NEW&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Lead by ID
```http
GET /leads/:id
Authorization: Bearer <token>
```

#### Create Lead
```http
POST /leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "organization": "Acme Corp",
  "status": "NEW"
}
```

#### Update Lead
```http
PATCH /leads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONTACTED",
  "phone": "+1987654321"
}
```

#### Delete Lead (Admin/Manager only)
```http
DELETE /leads/:id
Authorization: Bearer <token>
```

### Activity Endpoints

#### Get Activities for Lead
```http
GET /leads/:leadId/activities
Authorization: Bearer <token>
```

#### Create Activity
```http
POST /leads/:leadId/activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "NOTE",
  "content": "Follow up next week"
}
```

### Dashboard Endpoints

#### Get Lead Statistics by Status
```http
GET /dashboard/status
Authorization: Bearer <token>
```

#### Get Lead Statistics by Owner (Admin/Manager only)
```http
GET /dashboard/owner
Authorization: Bearer <token>
```

---

## 🎯 User Roles & Permissions

| Feature | SALES_EXECUTIVE | MANAGER | ADMIN |
|---------|----------------|---------|-------|
| View Own Leads | ✅ | ✅ | ✅ |
| View All Leads | ❌ | ✅ | ✅ |
| Create Leads | ✅ | ✅ | ✅ |
| Update Own Leads | ✅ | ✅ | ✅ |
| Update All Leads | ❌ | ✅ | ✅ |
| Delete Leads | ❌ | ✅ | ✅ |
| View Activities | ✅ | ✅ | ✅ |
| Create Activities | ✅ | ✅ | ✅ |
| Dashboard Stats (Own) | ✅ | ✅ | ✅ |
| Dashboard Stats (All) | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```
---

## 🚀 Deployment

### Backend Deployment (Render)

#### 1. Create a Render Account
- Go to [Render](https://render.com) and sign up

#### 2. Create a PostgreSQL Database
1. Click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `powerx-crm-db`
   - **Database**: `powerx_crm`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **Plan**: Free or Starter
3. Click **Create Database**
4. Copy the **Internal Database URL** (starts with `postgresql://`)

#### 3. Create a Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `powerx-backend` (or any name you prefer)
   - **Region**: Same as database
   - **Branch**: `master` or `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

#### 4. Set Environment Variables
In the **Environment** section, add:
```bash
DATABASE_URL=<paste-your-internal-database-url>
JWT_SECRET=<your-secure-random-string>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 5. Deploy
- Click **Create Web Service**
- Render will automatically:
  - Install dependencies
  - Run Prisma migrations (`npm run build`)
  - Start the server
- Your backend will be live at: `https://your-service-name.onrender.com`

#### 6. Verify Deployment
Test your API:
```bash
curl https://your-service-name.onrender.com/
```

### Frontend Deployment (Vercel)

#### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

#### 2. Deploy via Vercel Dashboard (Recommended)
1. Go to [Vercel](https://vercel.com) and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 3. Set Environment Variables
In **Settings** → **Environment Variables**, add:
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
```
Select all environments: Production, Preview, Development

#### 4. Deploy
- Click **Deploy**
- Your frontend will be live at: `https://your-project.vercel.app`

#### 5. Redeploy (if needed)
After adding environment variables, go to **Deployments** → Click **...** → **Redeploy**

### Alternative: Deploy via CLI
```bash
# Deploy frontend
cd frontend
vercel --prod
```


---

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 8000 |
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `EMAIL_HOST` | SMTP host | No | - |
| `EMAIL_PORT` | SMTP port | No | 587 |
| `EMAIL_USER` | SMTP username | No | - |
| `EMAIL_PASS` | SMTP password | No | - |
| `FRONTEND_URL` | Frontend URL for emails | No | http://localhost:5173 |

### Frontend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | http://localhost:8000/api/v1 |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Himani Sharma**

- GitHub: [@Himani1805](https://github.com/Himani1805)
- Project Link: [https://github.com/Himani1805/PowerX](https://github.com/Himani1805/PowerX)

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise CRM solutions
- Thanks to the open-source community

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [API Documentation](#-api-documentation)
2. Review the [Installation Guide](#-installation)
3. Open an issue on GitHub
4. Contact via email: hinusharma18@gmail.com

---

<div align="center">

**Made with ❤️ by Himani Sharma**

⭐ Star this repo if you find it helpful!

</div>
