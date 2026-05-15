# 🧠 Fridge AI Expiry Guardian — Complete Interview Knowledge Guide (Part 1)

---

## 1. PROJECT OVERVIEW

**Project Name:** Fridge AI Expiry Guardian (also called "Smart Fridge Manager")

**What it does:**
A full-stack AI-powered web application that helps users manage food items in their fridge. It tracks expiry dates, predicts how long food will last, notifies users when items are about to expire or have already expired, and uses Google's Gemini AI to:
- Parse natural language input ("I bought 2 apples, some milk, and chicken breast")
- Recommend recipes based on selected fridge items
- Answer conversational questions about fridge contents

**Core Problem Solved:** Food waste reduction — people forget what's in their fridge and when it expires. This app gives real-time visibility and AI-driven insights.

---

## 2. TECH STACK — COMPLETE BREAKDOWN

### 2.1 Frontend

| Technology | Version | Why Used | Alternatives |
|---|---|---|---|
| **React** | 18.3.1 | Component-based UI, massive ecosystem, hooks for state | Vue.js, Svelte, Angular |
| **TypeScript** | 5.5.3 | Static typing prevents runtime bugs, better IDE support | Plain JavaScript |
| **Vite** | 5.4.1 | Extremely fast dev server using native ES modules, HMR | Create React App (CRA), Webpack, Parcel |
| **Tailwind CSS** | 3.4.11 | Utility-first CSS, no context switching, responsive design built-in | Bootstrap, Material UI, plain CSS |
| **shadcn/ui** | (via Radix UI) | Accessible, unstyled component primitives; copy-paste approach | Chakra UI, Ant Design, MUI |
| **React Router DOM** | 6.26.2 | Client-side routing for SPA navigation | TanStack Router, Wouter |
| **TanStack Query** | 5.56.2 | Server state management, caching, background refetching | SWR, Redux Toolkit Query |
| **Framer Motion / motion** | 12.x | Declarative animations, 3D card effects | React Spring, CSS animations |
| **Lucide React** | 0.462.0 | Beautiful SVG icon library for React | React Icons, Heroicons, Font Awesome |
| **date-fns** | 3.6.0 | Lightweight date utility functions | Moment.js (heavier), Day.js |
| **react-hook-form** | 7.53.0 | Performant forms with minimal re-renders | Formik |
| **zod** | 3.23.8 | Schema validation at runtime (TypeScript-first) | Yup, Joi |
| **sonner** | 1.5.0 | Toast/notification library | React Hot Toast, react-toastify |
| **next-themes** | 0.3.0 | Dark/light mode theme management | Manual CSS variables |
| **clsx + tailwind-merge** | latest | Conditional class merging utility | classnames package |
| **recharts** | 2.12.7 | Chart library (if used for stats) | Chart.js, Victory, D3.js |

### 2.2 Backend / BaaS (Backend as a Service)

| Technology | Why Used | Alternatives |
|---|---|---|
| **Supabase** | Open-source Firebase alternative. Provides PostgreSQL database, Authentication, Edge Functions, and real-time subscriptions — all in one | Firebase, AWS Amplify, PocketBase |
| **Supabase Auth** | Email/password authentication built-in with JWT tokens | Auth0, Clerk, Firebase Auth, custom JWT |
| **Supabase Edge Functions** | Serverless functions running on Deno runtime — used to safely call Gemini API without exposing the key to the frontend | AWS Lambda, Cloudflare Workers, Vercel Functions |
| **PostgreSQL** (via Supabase) | Relational database — reliable, ACID-compliant, supports RLS | MySQL, MongoDB, SQLite |
| **Row Level Security (RLS)** | Postgres feature ensuring users can ONLY access their own data at the database level | Application-level filtering (less secure) |

### 2.3 AI / External Services

| Technology | Why Used | Alternatives |
|---|---|---|
| **Google Gemini 2.5 Flash** | Fast, capable multimodal LLM for NLP parsing and recipe generation | OpenAI GPT-4o, Anthropic Claude, Mistral |
| **n8n (Workflow Automation)** | Self-hosted webhook automation tool — receives expiry notifications and triggers email/WhatsApp alerts | Zapier, Make (Integromat), custom email service |

### 2.4 Build & Development Tools

| Technology | Why Used | Alternatives |
|---|---|---|
| **@vitejs/plugin-react-swc** | Uses SWC (Rust-based compiler) instead of Babel — 20x faster compilation | @vitejs/plugin-react (Babel-based) |
| **ESLint** | Code linting for catching errors | TSLint (deprecated), Biome |
| **PostCSS + Autoprefixer** | CSS post-processing, adds vendor prefixes automatically | Manual vendor prefixes |
| **lovable-tagger** | Development plugin for component tagging (used by Lovable.dev platform) | N/A |
| **bun** | Fast JavaScript runtime and package manager (lock files present) | npm, yarn, pnpm |

---

## 3. PROJECT ARCHITECTURE

```
fridge-ai-expiry-guardian/
├── index.html                   ← Single HTML entry point (SPA)
├── vite.config.ts               ← Vite build config
├── tailwind.config.ts           ← Tailwind theme customization
├── tsconfig.json                ← TypeScript config
├── package.json                 ← Dependencies
├── .env                         ← Supabase credentials
│
├── src/
│   ├── main.tsx                 ← React DOM entry, mounts <App />
│   ├── App.tsx                  ← Root component: routing, providers
│   ├── index.css                ← Global CSS variables (theme tokens)
│   │
│   ├── pages/
│   │   ├── Index.tsx            ← Main dashboard (ALL CRUD logic lives here)
│   │   ├── Auth.tsx             ← Login/Signup page
│   │   └── NotFound.tsx         ← 404 page
│   │
│   ├── components/
│   │   ├── HeaderBar.tsx        ← App header with branding + logout
│   │   ├── FridgeStatsCards.tsx ← 4 stat cards (total/expiring/fresh/expired)
│   │   ├── NaturalLanguageInput.tsx ← AI-powered text input for adding items
│   │   ├── SmartQuery.tsx       ← Ask Gemini about your fridge
│   │   ├── NotificationPanel.tsx ← Shows expiring/expired items
│   │   ├── ItemDashboard.tsx    ← 3D card grid of all fridge items
│   │   ├── ItemCard.tsx         ← Individual item display card
│   │   ├── AddItemForm.tsx      ← Form for manual add/edit
│   │   ├── RecipeRecommendations.tsx ← AI recipe suggestions
│   │   ├── RecipeDragDrop.tsx   ← Drag & drop UI for selecting items
│   │   └── ui/                  ← shadcn/ui primitives (Button, Card, etc.)
│   │
│   ├── services/
│   │   └── geminiService.ts     ← All Gemini AI API calls (class-based)
│   │
│   ├── types/
│   │   └── FridgeItem.ts        ← TypeScript interfaces
│   │
│   ├── hooks/
│   │   ├── use-toast.ts         ← Toast notification hook
│   │   └── use-mobile.tsx       ← Responsive breakpoint hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        ← Supabase client singleton
│   │       └── types.ts         ← Auto-generated DB types
│   │
│   ├── lib/
│   │   └── utils.ts             ← cn() utility for Tailwind class merging
│   │
│   └── utils/
│       └── webhooks.ts          ← n8n webhook notification function
│
└── supabase/
    ├── config.toml
    ├── functions/
    │   ├── gemini-chat/         ← Edge Function: Gemini API proxy
    │   │   └── index.ts
    │   └── check-expired-items/ ← Edge Function: Cron-style expiry checker
    │       └── index.ts
    └── migrations/              ← SQL migration files (DB schema history)
        └── *.sql
```

---

## 4. DATA MODEL

### FridgeItem Interface (TypeScript)

```typescript
export interface FridgeItem {
  id: string;              // UUID from Supabase
  name: string;            // e.g., "Organic Milk"
  category: string;        // dairy | vegetables | fruits | meat | seafood | beverages | condiments | leftovers
  openDate: Date;          // When the user opened/bought the item
  printedExpiry: Date;     // The date printed on the package
  predictedExpiry: Date;   // AI-predicted expiry based on category + open date
  status: 'fresh' | 'warning' | 'critical' | 'expired';
  notificationSent: boolean; // Tracks if n8n webhook was triggered
}
```

### Status Logic (computed dynamically)
```
daysLeft <= 0   → 'expired'
daysLeft <= 2   → 'critical'  (red)
daysLeft <= 5   → 'warning'   (amber)
daysLeft > 5    → 'fresh'     (green)
```

### Supabase DB Table: `food_items`
```sql
id               UUID PRIMARY KEY
name             TEXT
category         TEXT
open_date        DATE
printed_expiry   DATE
predicted_expiry DATE
status           TEXT
notification_sent BOOLEAN DEFAULT false
user_id          UUID (FK → auth.users)
expiry_date      DATE  (legacy support field)
```

### Row Level Security (RLS) Policies
All four operations (SELECT, INSERT, UPDATE, DELETE) are protected:
```sql
-- Users can ONLY see/edit/delete their own rows
USING (user_id = auth.uid())
```
This means even if someone knows the API key, they cannot access another user's data.

---

## 5. AUTHENTICATION FLOW

**Library:** Supabase Auth (`@supabase/supabase-js`)

**Flow:**
1. User visits `/auth` page
2. Signs up with email + password → `supabase.auth.signUp()`
3. Or logs in → `supabase.auth.signInWithPassword()`
4. Supabase returns a **JWT session** stored in localStorage
5. `Index.tsx` listens with `supabase.auth.onAuthStateChange()` 
6. If no session → redirect to `/auth` via `useNavigate()`
7. If session → load user's items from DB
8. Logout → `supabase.auth.signOut()` → redirect to `/auth`

**Why Supabase Auth instead of building custom auth?**
- JWT handling is automatic
- Session persistence across page refreshes
- No need to build token refresh logic
- Integrates directly with PostgreSQL RLS

**Alternatives:** Auth0, Clerk, NextAuth.js, Firebase Auth, custom JWT with bcrypt

---

## 6. AI INTEGRATION — GEMINI

### Architecture Pattern: Frontend → Supabase Edge Function → Gemini API

**Why not call Gemini directly from the frontend?**
- The API key would be exposed in browser network tab
- Security risk — anyone could steal it and rack up charges
- Edge Function acts as a secure proxy

### GeminiService Class (`src/services/geminiService.ts`)
A class with 3 main methods:

#### Method 1: `parseNaturalLanguageInput(input: string)`
- **Purpose:** User types "I bought 2 apples and some milk" → returns structured JSON
- **Prompt engineering:** Tells Gemini to return ONLY a JSON array in a specific format
- **Output:** `[{ name, category, quantity, confidence }]`
- **Used by:** `NaturalLanguageInput` component

#### Method 2: `getRecipeRecommendations(expiringItems: string[])`
- **Purpose:** Takes array of item names → returns 3 recipe suggestions
- **Output:** `[{ title, description, ingredients, cookingTime, difficulty }]`
- **Used by:** `RecipeRecommendations` component

#### Method 3: `processNaturalQuery(query: string, items: any[])`
- **Purpose:** Conversational Q&A about fridge contents
- **Example:** "What can I cook tonight?" → Gemini answers based on current inventory
- **Used by:** `SmartQuery` component

### Edge Function: `supabase/functions/gemini-chat/index.ts`
- Runtime: **Deno** (not Node.js) — required by Supabase Edge Functions
- Reads `GEMINI_API_KEY` from Supabase secrets (never exposed to client)
- Calls: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Returns: `{ response: string }`
- Has CORS headers for browser access

---

## 7. EXPIRY PREDICTION LOGIC

The `predictExpiry()` function in `AddItemForm.tsx` uses a **rule-based heuristic** (mock AI):

```
dairy:      5 days from open date
vegetables: 7 days
fruits:     5 days
meat:       3 days
seafood:    2 days
beverages:  30 days
condiments: 60 days
leftovers:  3 days
frozen:     90 days
other:      7 days
```
A random variation of ±24 hours is added to simulate AI unpredictability.

**The "soonest expiry" rule:** The system takes the **minimum** of `printedExpiry` and `predictedExpiry`:
```typescript
const expiryDate = new Date(Math.min(
  item.printedExpiry.getTime(),
  item.predictedExpiry.getTime()
));
```
This means if AI predicts the item will go bad before the printed date, the stricter date wins.

**Why two dates?**
- Printed expiry = what the manufacturer says (ideal conditions)
- Predicted expiry = accounting for when it was actually opened and real usage

---

## 8. NOTIFICATION SYSTEM (n8n Webhook)

**What happens when an item expires:**

1. **Frontend check** (`ItemDashboard.tsx`): On every render, checks all items
2. If `daysLeft <= 0` AND `notificationSent === false`:
   - Calls `notifyExpiry()` from `webhooks.ts`
   - Sends POST to n8n webhook URL
3. n8n receives the data and triggers an email/WhatsApp/Slack notification to the user
4. Frontend updates DB: sets `notification_sent = true`

**Edge Function check** (`check-expired-items/index.ts`):
- A second layer — runs as a serverless cron job
- Queries ALL users' items where `notification_sent = false`
- Sends notifications from server-side (reliable even if user isn't logged in)
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (admin access)

**Webhook payload:**
```json
{
  "itemName": "Milk",
  "expiryDate": "2026-05-15",
  "userEmail": "user@example.com",
  "timestamp": "2026-05-15T10:00:00.000Z",
  "source": "Smart Fridge App"
}
```

**Why n8n instead of sending email directly?**
- n8n is a no-code automation platform
- Can chain: webhook → email + WhatsApp + Slack in one workflow
- No need to configure SMTP in the app itself

**Alternatives:** Zapier, Make.com, custom Node.js mailer with Nodemailer

---

## 9. ROUTING (React Router DOM v6)

```typescript
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/"     element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="*"     element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Route guard logic** (in `Index.tsx`):
```typescript
useEffect(() => {
  if (!loading && !session) {
    navigate('/auth'); // redirect if not authenticated
  }
}, [session, loading, navigate]);
```

**Why React Router instead of Next.js routing?**
- This is a pure Vite + React SPA (no SSR needed)
- React Router v6 is the standard for SPAs
- Next.js would add SSR/SSG complexity not needed here

---

## 10. STATE MANAGEMENT

**No Redux** — state is managed with:

1. **`useState`** — local component state (form fields, modals, loading flags)
2. **`useEffect`** — side effects (auth listener, fetch items on login)
3. **`useCallback`** — memoized functions to prevent unnecessary re-renders
4. **`useRef`** — `notifiedItemsRef` tracks which items already got notifications in memory (avoids duplicate webhook calls per session)
5. **`React.memo`** — wraps `ItemDashboard` to prevent re-render unless props change
6. **TanStack Query** — imported but the main data fetching is done manually with `async/await` + Supabase client directly. TanStack Query is available for future use.

**Why no Redux?**
- App is simple enough — items live in one parent (`Index.tsx`) and flow down as props
- Supabase acts as the single source of truth
- Redux adds boilerplate complexity not justified here

---