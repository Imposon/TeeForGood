# TeeForGood Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name: `teeforgood`
4. Choose region closest to your users
5. Note down the **Project URL** and **Anon Key**

### 2. Run Schema SQL

1. Open Supabase SQL Editor
2. Copy contents of `/database/supabase-schema.sql`
3. Run the SQL

This creates:
- All 11 tables with proper relationships
- 30+ indexes for performance
- Row Level Security (RLS) policies
- Auto-triggers for timestamps and score limits
- 8 sample charities

### 3. Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from:
- Settings → API → Project URL
- Settings → API → anon public
- Settings → API → service_role (keep secret!)

### 4. Enable Storage (For Winner Proofs)

1. Go to Storage in Supabase Dashboard
2. Create bucket: `winner-proofs`
3. Set policies:
   - **INSERT**: `auth.uid() = user_id` (authenticated users)
   - **SELECT**: `true` (admins need to view)
   - **UPDATE/DELETE**: `auth.uid() = user_id`

### 5. Configure Auth

In Authentication → Settings:
- Site URL: `http://localhost:3000` (dev) / your domain (prod)
- Enable: Email provider
- Disable: Confirm email (optional for dev)

## Database Structure

```
┌─────────────────┐
│     users       │◄────┐
├─────────────────┤     │
│ auth.users (fk) │     │
│ charity_id (fk) ├─────┼──► charities
│ subscription_...│     │
└─────────────────┘     │
         │              │
         ▼              │
┌─────────────────┐     │
│    scores       │     │
├─────────────────┤     │
│ user_id (fk)    ├─────┘
│ score (1-45)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  subscriptions  │
├─────────────────┤
│ user_id (fk)    │
│ stripe_...      │
└─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│    payments     │     │    donations    │
├─────────────────┤     ├─────────────────┤
│ user_id (fk)    │     │ user_id (fk)    │
│ subscription(fk)│     │ charity_id (fk) │
└─────────────────┘     └─────────────────┘

┌─────────────────┐
│     draws       │◄────┐
├─────────────────┤     │
│ winning_numbers │     │
│ status          │     │
└─────────────────┘     │
         ▲              │
         │              │
┌─────────────────┐     │
│  draw_entries   │     │
├─────────────────┤     │
│ draw_id (fk)    ├─────┤
│ user_id (fk)    ├─────┘
│ numbers[]       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    winnings     │
├─────────────────┤
│ draw_id (fk)    │
│ user_id (fk)    │
│ entry_id (fk)   │
│ status          │
└─────────────────┘
```

## Key Features

### Row Level Security (RLS)
All tables have secure policies:
- **Users**: Can only access own data
- **Scores**: 5-score limit enforced via trigger
- **Draws**: Public read, admin write
- **Winnings**: User uploads proof, admin verifies
- **Charities**: Public read, admin write

### Automatic Triggers
- `updated_at` auto-updates on all tables
- `handle_new_user`: Creates profile on signup
- `limit_user_scores`: Enforces 5-score limit

### Indexes (Performance)
- User lookups by email, charity, subscription
- Score queries by user + date
- Draw entries by draw/user
- Winnings by status + expiry

## Common Queries

### Get User with Charity
```sql
SELECT users.*, charities.name as charity_name
FROM users
LEFT JOIN charities ON users.charity_id = charities.id
WHERE users.id = 'user-uuid';
```

### Get Last 5 Scores
```sql
SELECT * FROM scores
WHERE user_id = 'user-uuid'
ORDER BY played_date DESC
LIMIT 5;
```

### Get Current Month Draw
```sql
SELECT * FROM draws
WHERE year = EXTRACT(YEAR FROM NOW())
AND month = EXTRACT(MONTH FROM NOW());
```

### Get User Winnings
```sql
SELECT w.*, d.draw_date, d.winning_numbers
FROM winnings w
JOIN draws d ON w.draw_id = d.id
WHERE w.user_id = 'user-uuid'
ORDER BY w.created_at DESC;
```

## API Usage

```typescript
import { 
  getCurrentUser, 
  getUserScores, 
  addScore,
  getCharities,
  enterDraw,
  getUserWinnings 
} from '@/lib/supabase/api'

// Get current user with charity info
const user = await getCurrentUser()

// Get last 5 scores
const scores = await getUserScores(user.id)

// Add new score (auto-replaces oldest if > 5)
const newScore = await addScore({
  user_id: user.id,
  score: 42,
  course_name: 'Pebble Beach',
  played_date: '2024-01-15'
})

// Get featured charities
const charities = await getCharities({ featured: true })

// Enter draw with random numbers
const entry = await enterDraw(drawId, user.id, [5, 12, 23, 34, 41], 'random')

// Get user winnings
const winnings = await getUserWinnings(user.id)
```

## Realtime Subscriptions

```typescript
import { subscribeToUserScores } from '@/lib/supabase/api'

// Subscribe to score changes
const subscription = subscribeToUserScores(userId, (payload) => {
  console.log('Score updated:', payload)
  // Refresh UI
})

// Unsubscribe when done
subscription.unsubscribe()
```

## Admin Operations

```typescript
import { 
  adminGetAllUsers,
  adminUpdateDraw,
  adminVerifyWinning 
} from '@/lib/supabase/api'

// Requires SUPABASE_SERVICE_ROLE_KEY
const users = await adminGetAllUsers()

// Update draw results
await adminUpdateDraw(drawId, {
  winning_numbers: [5, 12, 23, 34, 41],
  status: 'published'
})

// Verify winning
await adminVerifyWinning(winningId, 'approved', adminId, 'Proof verified')
```

## Troubleshooting

### "relation does not exist"
- Run schema SQL in correct database
- Check schema is `public`

### RLS errors
- Ensure user is authenticated
- Check policies allow the operation

### Type errors
- Import types from `@/lib/supabase/client`
- Use `Database['public']['Tables']['table']['Row']`

## Migrations

For future schema changes:
1. Create new SQL file in `/database/migrations/`
2. Test in staging first
3. Run in production SQL editor
4. Update types if needed
