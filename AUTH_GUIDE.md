# TeeForGood Authentication System Guide

## Overview
The authentication system is now fully implemented with:
- **Modal-based login/signup** (glassmorphism UI with smooth animations)
- **JWT-based authentication** with httpOnly cookies
- **bcrypt password hashing**
- **Protected routes** with automatic redirect
- **Persisted login state** via React Context

## Components

### 1. AuthModal (`components/AuthModal.tsx`)
A beautiful glassmorphism modal with:
- Two-step signup (account info → charity selection)
- Login form with "remember me" option
- Password visibility toggle
- Real-time validation
- Animated transitions between views

**Usage:**
```tsx
import { AuthModal } from '@/components/AuthModal'

// In your component:
const [showModal, setShowModal] = useState(false)

<AuthModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)}
  defaultView="login" // or "signup"
/>
```

### 2. AuthButton (`components/AuthButton.tsx`)
Displays either:
- "Sign In" button (when logged out) → opens AuthModal
- User avatar with dropdown (when logged in) → shows Dashboard/Logout options

**Usage:**
```tsx
import { AuthButton } from '@/components/AuthButton'

// Place in navigation:
<AuthButton />
```

### 3. AuthGuard (`components/AuthGuard.tsx`)
Wrap protected pages to require authentication:

**Usage:**
```tsx
import { AuthGuard } from '@/components/AuthGuard'

// In your page or layout:
<AuthGuard requireAuth={true} requireSubscription={false}>
  <YourProtectedContent />
</AuthGuard>
```

**Props:**
- `requireAuth` - Shows auth modal if not logged in
- `requireSubscription` - Redirects to /pricing if no active subscription

### 4. AuthProvider (`lib/providers/AuthProvider.tsx`)
Wrap your app in `layout.tsx`:

```tsx
import { AuthProvider } from '@/lib/providers/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

### 5. useAuth Hook (`lib/hooks/useAuth.ts`)
Access auth state and methods:

```tsx
import { useAuth } from '@/lib/hooks/useAuth'

function MyComponent() {
  const { user, isLoading, isAuthenticated, login, signup, logout } = useAuth()
  
  if (isLoading) return <Loading />
  if (!isAuthenticated) return <PleaseSignIn />
  
  return <Welcome user={user} />
}
```

## API Routes

- `POST /api/auth/signup` - Create account (includes charity selection)
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

## Protected Pages Setup

### Option 1: Using AuthGuard Component
```tsx
// app/dashboard/layout.tsx
'use client'
import { AuthGuard } from '@/components/AuthGuard'

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  )
}
```

### Option 2: Using Middleware (already configured)
The `middleware.ts` file already protects:
- `/dashboard/*` - Requires authentication
- `/api/scores/*` - Requires subscription
- `/api/draws/*` - Requires subscription

## Flow

1. **New Visitor**: Sees "Sign In" button in nav
2. **Click Sign In**: AuthModal opens with login form
3. **No Account?**: Click "Sign up" → Step 1 (account info)
4. **Step 2**: Select charity + contribution percentage
5. **Success**: Auto-logged in, redirected to pricing page
6. **Subscribe**: After payment, full access granted

## Security Features

- HttpOnly cookies (XSS protection)
- bcrypt password hashing (12 rounds)
- JWT tokens with 7-day expiration
- Automatic token refresh
- Role-based access control (user/admin)
- Middleware route protection

## Styling

All auth components use the glassmorphism design system:
- `glass-card` class for frosted glass effect
- Neon accents (cyan, green, gold)
- Smooth Framer Motion animations
- Custom cursor preserved
