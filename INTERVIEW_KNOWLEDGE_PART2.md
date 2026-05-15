# 🧠 Fridge AI Expiry Guardian — Complete Interview Knowledge Guide (Part 2)

---

## 11. KEY COMPONENTS — DEEP DIVE

### 11.1 `App.tsx` — Root Component
The root wraps the entire app with global providers:
- `QueryClientProvider` — provides TanStack Query context
- `TooltipProvider` — Radix UI tooltip context
- `Toaster` + `Sonner` — two toast systems (shadcn's built-in + sonner)
- `BrowserRouter` + `Routes` — client-side routing

### 11.2 `Index.tsx` — The Brain of the App
This is the **most important file** — it holds all CRUD operations and business logic.

**State variables:**
```typescript
session       // Supabase auth session (null = not logged in)
loading       // Auth loading state
items         // Array of FridgeItem[] fetched from Supabase
showAddForm   // boolean — toggles Add Item modal
editingItem   // FridgeItem | null — for Edit modal
itemsLoading  // boolean — shows overlay while fetching
```

**Key functions:**
| Function | What it does |
|---|---|
| `parseDbFridgeItem(row)` | Converts raw Supabase DB row → FridgeItem (snake_case → camelCase, strings → Dates) |
| `fridgeItemToDbRow(item, userId)` | Converts FridgeItem → DB row shape for insert/update |
| `getStatusFromPredicted(date)` | Calculates fresh/warning/critical/expired from days remaining |
| `addItem(newItem)` | INSERT to Supabase → update local state → toast |
| `addItemsFromAI(parsedItems)` | Loops through Gemini-parsed items and calls `addItem` for each |
| `removeItem(id)` | DELETE from Supabase → filter out from state |
| `updateItem(updatedItem)` | UPDATE in Supabase → replace in state |
| `updateItemFields(id, updates)` | Partial update (used for marking notificationSent) |
| `removeExpiredItems()` | Batch delete expired items |
| `purgeExpiredItems()` | Hard delete all expired — also shown in HeaderBar |
| `handleLogout()` | `supabase.auth.signOut()` → navigate to /auth |

**Pattern: Optimistic vs. Pessimistic updates:**
This app uses **pessimistic updates** — waits for Supabase to confirm the operation, then updates the local React state using the returned `data`. This avoids showing stale data.

---

### 11.3 `AddItemForm.tsx` — Dual-Purpose Form
Used for BOTH adding a new item AND editing an existing one. The same component is reused via props:
```typescript
interface AddItemFormProps {
  onAddItem: (item) => void;
  onCancel: () => void;
  initialItem?: FridgeItem;   // if provided → edit mode
  isEditing?: boolean;        // changes button label
}
```

**Date pickers:** Uses Radix UI `Popover` + shadcn `Calendar` (`react-day-picker` underneath).

**Why shadcn Calendar instead of a native `<input type="date">`?**
- Native date inputs look different across browsers
- Radix Popover + Calendar gives full visual control
- Works with Tailwind styling

---

### 11.4 `NaturalLanguageInput.tsx` — AI Smart Input
```
User types → handleSubmit → geminiService.parseNaturalLanguageInput()
  → Supabase Edge Function → Gemini API
  → Returns JSON array of food items
  → calls onItemsParsed(items) → Index.tsx adds them to DB
```
Shows `Loader2` spinning icon while processing. Uses `sonner` toast for feedback.

---

### 11.5 `SmartQuery.tsx` — Conversational AI
- Has 4 pre-built quick question buttons ("What's expiring this week?", etc.)
- On submit → calls `geminiService.processNaturalQuery(query, items)`
- Passes the **current inventory list with statuses** as context to Gemini
- Response shown in a box below the input

**useEffect:** Clears the response when `items.length` changes, so answers are always fresh.

---

### 11.6 `NotificationPanel.tsx` — Expiry Alerts UI
- Receives `expiringItems` array (pre-filtered to critical + warning in `Index.tsx`)
- Re-computes status locally using `getItemStatus()` for accurate real-time display
- Three categories: expired (red-100), critical (red-50), warning (amber-50)
- Uses `formatDistanceToNow` from `date-fns` → "Expired 2 days ago"

---

### 11.7 `ItemDashboard.tsx` — 3D Card Grid
- Uses `React.memo` to prevent unnecessary re-renders
- Uses `useRef<Set<string>>` to track notified items in memory (Session-level dedup)
- Sorts items by soonest expiry date before rendering
- Converts `FridgeItem[]` → `CardData[]` for the `Card3DList` component
- `useCallback` wraps `checkExpiredItems` to stabilize reference across renders

**Why `React.memo` here specifically?**
This component renders multiple cards and fires webhook checks — wrapping it prevents re-renders when parent re-renders for unrelated reasons (e.g., modal open/close).

---

### 11.8 `RecipeDragDrop.tsx` — HTML5 Drag & Drop
Uses the **browser's native HTML5 Drag and Drop API** — no external library.

```typescript
draggable                    // makes element draggable
onDragStart → setDraggedId   // track what's being dragged
onDragOver → e.preventDefault() // allow drop
onDrop → getData("text/plain")  // read dropped item ID
onDragEnd → cleanup
onDoubleClick                // alternative to dragging (accessibility)
```

**Two zones:**
1. "All Fridge Items" zone — items not yet selected
2. "Selected for Recipes" zone — drag items here to include in recipe request

Pressing "Get Recipes" fires `geminiService.getRecipeRecommendations(selectedItemNames)`.

**Alternatives to native DnD:** `react-dnd`, `dnd-kit`, `react-beautiful-dnd`

---

### 11.9 `HeaderBar.tsx` — App Header
- Shows branding (Refrigerator icon + "Smart Fridge Manager")
- Conditionally renders "Purge All Expired" button ONLY when `expiredItemsCount > 0`
- Shows user email
- Logout button

---

### 11.10 `FridgeStatsCards.tsx` — Dashboard Metrics
4 cards in a responsive grid (`grid-cols-1 md:grid-cols-4`):
- **Total Items** (green)
- **Expiring Soon** (amber) — critical + warning combined
- **Fresh Items** (blue)
- **Expired Items** (red)

Uses `bg-white/80 backdrop-blur-sm` — glassmorphism effect.

---

## 12. SUPABASE EDGE FUNCTIONS — DEEP DIVE

### 12.1 `gemini-chat` Edge Function
**Runtime:** Deno (TypeScript natively, no compilation needed)

**Flow:**
```
Frontend → supabase.functions.invoke('gemini-chat', { body: { prompt } })
  → Edge Function reads GEMINI_API_KEY from Deno.env
  → POST to Gemini REST API
  → Returns { response: string }
```

**Key code:**
```typescript
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
// API endpoint used:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`
```

**CORS handling:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
// OPTIONS (preflight) handled before the real request
```

### 12.2 `check-expired-items` Edge Function
- Designed to run on a **cron schedule** (e.g., daily at 9 AM)
- Uses `SUPABASE_SERVICE_ROLE_KEY` — has admin access, bypasses RLS
- Queries items where `notification_sent = false`
- For each expired item, fires n8n webhook + marks `notification_sent = true`
- Returns summary: `{ message, expiredItems[] }`

**Why service role key here?**
Regular `anon` key respects RLS — it would only see the current user's data. Edge Functions acting as cron jobs need admin access to process ALL users.

---

## 13. DATABASE MIGRATIONS

Located in `supabase/migrations/`. Each file is a SQL script with a timestamp-based filename, run in order.

**What the migrations do:**
1. Enable RLS on `food_items` table
2. Create 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
3. Add missing columns safely using `DO $$ IF NOT EXISTS $$` pattern:
   - `open_date` (DATE)
   - `predicted_expiry` (DATE)
   - `printed_expiry` (DATE)
   - `status` (TEXT)
   - `notification_sent` (BOOLEAN DEFAULT false)

**Why incremental migrations instead of one schema file?**
- Each migration is a point-in-time change
- Can roll back to any previous state
- Team members pull and run new migrations — keeps everyone's DB in sync
- Industry standard practice (like Alembic for Python, Flyway for Java)

---

## 14. TAILWIND CSS CONFIGURATION

```typescript
// tailwind.config.ts
darkMode: ["class"]   // Dark mode triggered by adding 'dark' class to HTML element
```

**Custom design tokens** (CSS variables → Tailwind colors):
- All colors defined as HSL CSS variables in `index.css`
- Tailwind references them: `bg-primary`, `text-foreground`, etc.
- This enables theming without touching Tailwind config

**Dark mode classes used throughout:**
```
dark:from-[#283e51] dark:via-[#485563] dark:to-[#232526]
dark:bg-[#112417]/80
dark:text-black
```

**Animations:**
- `tailwindcss-animate` plugin adds accordion open/close keyframes
- `animate-spin` used on Loader2 icon during AI loading

**`cn()` utility** (`lib/utils.ts`):
```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
- `clsx` handles conditional classes
- `twMerge` resolves Tailwind class conflicts (e.g., `p-2 p-4` → keeps only `p-4`)

---

## 15. ENVIRONMENT VARIABLES

```env
VITE_SUPABASE_PROJECT_ID=tiqnfldnraknzegtfqha
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...  (JWT anon key)
VITE_SUPABASE_URL=https://tiqnfldnraknzegtfqha.supabase.co
```

**`VITE_` prefix** — Vite exposes env vars to the browser ONLY if prefixed with `VITE_`.

**Supabase client (`src/integrations/supabase/client.ts`):**
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```
- The `anon` key is safe to expose publicly — RLS policies enforce security
- **Never** expose the `service_role` key in frontend code

**Supabase Edge Function secrets** (set via Supabase dashboard, not `.env`):
- `GEMINI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`

---

## 16. VITE CONFIGURATION

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",   // listen on all interfaces (IPv4 + IPv6)
    port: 8080,
  },
  plugins: [
    react(),                          // @vitejs/plugin-react-swc (SWC compiler)
    mode === 'development' && componentTagger(),  // only in dev
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // @ → src/
    },
  },
}));
```

**`@` path alias** — allows `import { Button } from '@/components/ui/button'` instead of `../../components/ui/button`. Cleaner imports.

**SWC vs Babel:**
- SWC is written in Rust → 20x faster than Babel
- `@vitejs/plugin-react-swc` uses SWC for JSX/TSX transformation
- No difference in output, just build speed

---

## 17. RADIX UI + shadcn/ui COMPONENTS USED

shadcn/ui is NOT a component library you install — you **copy the source code** into your project. This means full customization control.

Components used in this project:

| Component | Package | Used For |
|---|---|---|
| `Button` | `@radix-ui/react-slot` | Every interactive button |
| `Card` | Custom (shadcn) | Content containers |
| `Badge` | Custom (shadcn) | Status labels (Fresh/Warning/Critical/Expired) |
| `Input` | Custom (shadcn) | Text inputs |
| `Label` | `@radix-ui/react-label` | Form field labels |
| `Select` | `@radix-ui/react-select` | Category dropdown |
| `Calendar` | `react-day-picker` | Date picker calendar |
| `Popover` | `@radix-ui/react-popover` | Date picker popup wrapper |
| `Tooltip` | `@radix-ui/react-tooltip` | Hover tooltips |
| `Toast` / `Sonner` | `@radix-ui/react-toast` / `sonner` | Notifications |

**Why Radix UI?**
- Fully **accessible** (ARIA attributes, keyboard navigation built-in)
- **Unstyled by default** — you add Tailwind classes yourself
- No conflicting CSS to override
- Industry standard for accessible React component primitives

**Alternatives:** Headless UI (Tailwind Labs), Ark UI, React Aria (Adobe)

---

## 18. KEY DESIGN PATTERNS

### 18.1 Prop Drilling (intentional)
State lives in `Index.tsx` and is passed down as props. This is acceptable here because:
- The component tree is shallow (2-3 levels max)
- Avoids unnecessary complexity of Context or Redux

### 18.2 Utility-First CSS
All styling done with Tailwind utility classes. No CSS-in-JS, no separate `.css` files per component. Promotes consistency and avoids naming collisions.

### 18.3 Type Safety End-to-End
- **Frontend:** TypeScript interfaces for `FridgeItem`, `ParsedFoodItem`, `RecipeRecommendation`
- **Database:** Auto-generated Supabase types in `integrations/supabase/types.ts`
- **Forms:** Zod schemas (available for future validation)

### 18.4 Glassmorphism UI
```css
bg-white/80 backdrop-blur-sm
```
- Semi-transparent white background (`/80` = 80% opacity)
- `backdrop-blur-sm` blurs content behind the element
- Used on all Card components for a premium glass effect

### 18.5 Gradient Backgrounds
```css
bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50
dark:from-[#283e51] dark:via-[#485563] dark:to-[#232526]
```
Light mode: soft green gradient. Dark mode: deep blue-grey gradient.

---

## 19. COMMON INTERVIEW QUESTIONS & ANSWERS

### Q1: What is this project about?
**A:** "Fridge AI Expiry Guardian is a full-stack web app that helps users track food expiry dates in their fridge. It uses Google Gemini AI to let users add items via natural language, ask questions about their inventory, and get recipe recommendations. The backend is Supabase — a PostgreSQL-based BaaS that handles auth, database, and serverless functions. n8n automation sends email notifications when items expire."

### Q2: Why did you choose Supabase over Firebase?
**A:** "Supabase uses PostgreSQL — a relational database — which gives us proper SQL, joins, and Row Level Security. Firebase uses NoSQL (Firestore) which can be harder to query relationally. Supabase is also open-source and self-hostable. For a food inventory app where users have structured data with relationships, PostgreSQL was the right choice."

### Q3: How does the AI integration work?
**A:** "The frontend never calls the Gemini API directly — that would expose the API key. Instead, I have a Supabase Edge Function (serverless, runs on Deno) that acts as a secure proxy. The frontend calls `supabase.functions.invoke('gemini-chat', { body: { prompt } })`. The Edge Function reads the API key from secure environment secrets, calls Gemini, and returns the response."

### Q4: What is Row Level Security (RLS)?
**A:** "RLS is a PostgreSQL feature where you define policies at the database level. In this app, every SELECT/INSERT/UPDATE/DELETE query automatically checks `user_id = auth.uid()`. Even if someone had the Supabase anon key, they could only see their own data — the database enforces it, not just the application code."

### Q5: Why does the `ItemDashboard` use `React.memo`?
**A:** "ItemDashboard re-renders every time the parent (`Index.tsx`) state changes — including when modals open/close. Since it also runs an expensive `checkExpiredItems` function with webhook calls, wrapping it in `React.memo` ensures it only re-renders when its props (items, userEmail, callbacks) actually change."

### Q6: What is the difference between `printedExpiry` and `predictedExpiry`?
**A:** "Printed expiry is the date stamped on the package — the manufacturer's best estimate under ideal storage. Predicted expiry is our AI-estimated date based on when the item was opened and its category. Once opened, dairy or meat degrades faster than the printed date suggests. The app uses the minimum of the two dates for safety — whichever comes first."

### Q7: How does the Drag and Drop work?
**A:** "It uses the browser's native HTML5 Drag and Drop API — no library needed. Each item has `draggable={true}`. On `onDragStart`, we store the item ID in `dataTransfer`. On `onDrop`, we read that ID and move the item between the 'available' and 'selected' zones. Double-clicking is also supported as an accessibility fallback."

### Q8: Why Vite over Create React App?
**A:** "Vite uses native ES modules in development — no bundling at all, just serving files directly. This makes the dev server start in milliseconds vs. CRA's 30+ seconds for large apps. Vite also uses SWC (Rust-based compiler) which is 20x faster than Babel. CRA is essentially deprecated now."

### Q9: What is `cn()` and why is it used?
**A:** "`cn()` combines `clsx` (conditional class names) with `tailwind-merge`. The problem without it: if you write `className='p-2 p-4'`, both classes stay in the DOM and the browser picks unpredictably. `twMerge` resolves conflicts and keeps only the last relevant class. It's essential for conditional Tailwind styling."

### Q10: How does authentication persist across page refreshes?
**A:** "Supabase stores the JWT session in `localStorage` by default. On every page load, `supabase.auth.getSession()` checks localStorage and restores the session. `onAuthStateChange` is a listener that fires whenever auth state changes — login, logout, token refresh. So we set session in state and the app reacts accordingly."

### Q11: Why use TypeScript?
**A:** "TypeScript catches type errors at compile time, not runtime. For example, the `FridgeItem` interface ensures that every component that receives an item knows exactly what fields exist. Without TypeScript, you could accidentally pass `item.open_date` (DB column name) instead of `item.openDate` (camelCase interface field) and only find out when the app crashes in production."

### Q12: What is the `@hookform/resolvers` package for?
**A:** "It bridges `react-hook-form` with validation libraries like Zod. You define a Zod schema for your form, pass it through the resolver, and react-hook-form automatically validates field values against it. The form only submits if all validations pass."

### Q13: How does dark mode work?
**A:** "Tailwind is configured with `darkMode: ['class']` — dark mode activates when the `dark` class is on the `<html>` element. `next-themes` manages adding/removing that class and persists the preference in localStorage. Components use `dark:` prefix Tailwind classes for dark mode styles."

### Q14: What is the `components.json` file?
**A:** "It's the shadcn/ui configuration file. It tells the shadcn CLI where to put components, which path aliases to use, which CSS variable style to use, etc. When you run `npx shadcn-ui@latest add button`, it reads this file and generates the component in the right location."

### Q15: What would you improve?
**A:** 
- "Real ML model for expiry prediction instead of the rule-based heuristic"
- "Barcode scanner using device camera to auto-fill item details"  
- "Push notifications via Web Push API instead of just email"
- "TanStack Query for proper caching and background refetching of fridge items"
- "Shopping list feature — auto-generate based on items running low"
- "Unit tests with Vitest + React Testing Library"

---

## 20. QUICK-REFERENCE SUMMARY TABLE

| Concept | Technology | Why | Alternative |
|---|---|---|---|
| Frontend framework | React 18 | Component model, hooks | Vue, Svelte |
| Language | TypeScript | Type safety | JavaScript |
| Build tool | Vite + SWC | Speed | CRA, Webpack |
| Styling | Tailwind CSS | Utility-first | Bootstrap, plain CSS |
| Components | shadcn/ui + Radix | Accessible, unstyled | Chakra, MUI |
| Routing | React Router v6 | SPA navigation | TanStack Router |
| Server state | TanStack Query | Caching | SWR, Redux |
| Forms | react-hook-form | Performance | Formik |
| Validation | Zod | TS-first | Yup |
| Icons | Lucide React | Clean SVG icons | Font Awesome |
| Date utils | date-fns | Lightweight | Moment.js |
| Animations | Framer Motion | Declarative | React Spring |
| Toast | Sonner | Modern design | react-toastify |
| Dark mode | next-themes | Class-based | Manual CSS |
| Database | Supabase (PostgreSQL) | BaaS + RLS | Firebase, MongoDB |
| Auth | Supabase Auth | JWT, built-in | Auth0, Clerk |
| Serverless | Supabase Edge Functions (Deno) | Secure AI proxy | Vercel Functions |
| AI/LLM | Gemini 2.5 Flash | Fast + capable | GPT-4o, Claude |
| Notifications | n8n Webhooks | No-code automation | Zapier, custom SMTP |
| Class merging | clsx + tailwind-merge | Conflict resolution | classnames |

---

## 21. HOW TO EXPLAIN THE PROJECT IN 2 MINUTES (Elevator Pitch)

*"I built a full-stack AI-powered web application called Fridge AI Expiry Guardian. The problem it solves is food waste — people forget about food in their fridge until it's too late.*

*The tech stack is React with TypeScript on the frontend, built with Vite for fast development. For styling I used Tailwind CSS with shadcn/ui components — which are accessible, customizable Radix UI primitives. The backend is entirely Supabase — it gives me PostgreSQL with Row Level Security so each user's data is protected at the database level, not just the application level.*

*The most interesting part is the AI integration. I'm using Google's Gemini 2.5 Flash model via Supabase Edge Functions — serverless functions running on Deno. The Edge Functions act as a secure proxy so the Gemini API key never reaches the browser. Users can type naturally — 'I bought apples and milk' — and Gemini extracts the items automatically. They can also ask questions like 'what's expiring soon?' and get conversational answers about their inventory. There's also a drag-and-drop recipe recommender.*

*For notifications, when an item expires, the app calls an n8n webhook — which is a no-code automation tool that sends the user an email or WhatsApp alert. The `notification_sent` flag in the database prevents duplicate notifications.*

*The whole app supports dark mode and has a glassmorphism design with gradient backgrounds. All routes are protected — unauthenticated users are redirected to the login page."*

---

*Good luck with your interview! 🚀*
