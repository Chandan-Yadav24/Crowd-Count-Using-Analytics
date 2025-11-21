# Next.js Frontend Structure

## Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # User Login
│   │   │   └── admin-login/
│   │   │       └── page.tsx          # Admin/SuperAdmin Login
│   │   ├── (dashboard)/
│   │   │   ├── user/
│   │   │   │   └── page.tsx          # User Dashboard
│   │   │   └── admin/
│   │   │       └── page.tsx          # Admin Dashboard
│   │   ├── layout.tsx                # Root Layout
│   │   ├── page.tsx                  # Landing Page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   ├── landing/                  # Landing page components
│   │   ├── auth/                     # Auth components
│   │   └── dashboard/                # Dashboard components
│   ├── lib/
│   │   ├── api.ts                    # API client
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── index.ts                  # TypeScript types
├── public/
│   └── images/                       # Static images
└── package.json
```

## Pages

1. **Landing Page** (`/`) - Hero, features, CTA
2. **User Login** (`/login`) - Normal user authentication
3. **Admin Login** (`/admin-login`) - Admin/SuperAdmin authentication
4. **User Dashboard** (`/user`) - Video upload, zone drawing, analytics
5. **Admin Dashboard** (`/admin`) - User management, system overview

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Axios for API calls
