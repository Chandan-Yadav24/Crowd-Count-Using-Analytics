# Crowd Count AI - Frontend

Next.js frontend for the Crowd Counting application.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` - Landing page
- `/login` - User login
- `/admin-login` - Admin/SuperAdmin login
- `/user` - User dashboard
- `/admin` - Admin dashboard

## Features

- ✅ Modern landing page
- ✅ Separate login pages for users and admins
- ✅ Role-based authentication
- ✅ User dashboard for video upload and zone drawing
- ✅ Admin dashboard for user management
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icons)

## API Integration

Backend API: `http://127.0.0.1:8000/api`

All API calls are in `src/lib/api.ts`
