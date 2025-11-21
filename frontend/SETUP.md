# Frontend Setup Guide

## ✅ Structure Created

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          ✅ User Login
│   │   │   └── admin-login/page.tsx    ✅ Admin Login
│   │   ├── (dashboard)/
│   │   │   ├── user/page.tsx           ✅ User Dashboard
│   │   │   └── admin/page.tsx          ✅ Admin Dashboard
│   │   ├── page.tsx                    ✅ Landing Page
│   │   ├── layout.tsx                  ✅ Root Layout
│   │   └── globals.css                 ✅ Global Styles
│   ├── components/
│   │   ├── ui/                         📁 UI Components
│   │   ├── landing/                    📁 Landing Components
│   │   ├── auth/                       📁 Auth Components
│   │   └── dashboard/                  📁 Dashboard Components
│   ├── lib/
│   │   └── api.ts                      ✅ API Client
│   └── types/
│       └── index.ts                    ✅ TypeScript Types
└── package.json                        ✅ Dependencies
```

## 🚀 Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📄 Pages Overview

### 1. Landing Page (`/`)
- Hero section with gradient background
- Feature cards (Video Upload, Crowd Detection, Analytics, Security)
- CTAs for User Login and Admin Login
- Modern, professional design

### 2. User Login (`/login`)
- Blue gradient theme
- Username/password form
- API integration with backend
- Redirects to `/user` dashboard on success
- Link to registration (to be implemented)

### 3. Admin Login (`/admin-login`)
- Purple gradient theme with shield icon
- Role-based authentication (admin/superadmin only)
- Redirects to `/admin` dashboard on success
- Enhanced security messaging

### 4. User Dashboard (`/user`)
- Protected route (requires user authentication)
- Video upload section
- Zone drawing interface
- Analytics view
- Logout functionality

### 5. Admin Dashboard (`/admin`)
- Protected route (requires admin/superadmin role)
- User management
- System statistics
- Video management
- Reports section

## 🎨 Design Features

- **Dark Theme**: Modern dark UI with gray-900 background
- **Gradients**: Blue for users, Purple for admins
- **Icons**: Lucide React icons throughout
- **Responsive**: Mobile-first design with Tailwind CSS
- **Animations**: Smooth transitions and hover effects

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend calls `/api/login` endpoint
3. Backend returns JWT token + role
4. Token stored in localStorage
5. Protected routes check token + role
6. Redirect if unauthorized

## 📡 API Integration

All API calls are centralized in `src/lib/api.ts`:
- `login()` - User authentication
- `register()` - User registration
- `uploadVideo()` - Video upload
- `listVideos()` - Get user videos
- `createZone()` - Create monitoring zone
- `listZones()` - Get video zones

## 🛠️ Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Test landing page: http://localhost:3000
4. Test user login: http://localhost:3000/login
5. Test admin login: http://localhost:3000/admin-login

## 📝 Notes

- Backend must be running on `http://127.0.0.1:8000`
- CORS must be enabled in FastAPI backend
- All routes use TypeScript for type safety
- Tailwind CSS for styling (no external CSS frameworks needed)
