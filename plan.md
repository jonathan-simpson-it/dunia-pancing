# Build Plan: Dunia Pancing Platform

## ✅ ALL FEATURES — COMPLETE

### Feature Status Summary

| Feature                  | Status     | Notes                                       |
| ------------------------ | ---------- | ------------------------------------------- |
| Product Variants         | ✅ Done    | Multi-type + per-variant price/stock/images |
| Shopping Cart & Checkout | ✅ Done    | API-backed, auto-fills for logged-in users  |
| Payment Gateway (Xendit) | ✅ Done    | Invoices + webhook auto-mark paid           |
| Shipping Integration     | ✅ Done    | KiriminAja live                             |
| Order Management         | ✅ Done    | DB-backed, linked to user account           |
| Customer Accounts        | ✅ Done    | NextAuth + phone exposed + profile          |
| SEO Product Pages        | ✅ Done    | Dynamic metadata + OpenGraph                |
| Product Search & Filter  | ✅ Done    | Client-side + DB-backed                     |
| Category Management      | ✅ Done    | API + admin UI                              |
| Inventory/Stock          | ✅ Done    | Decremented on order                        |
| Admin Dashboard          | 🟡 Partial | Products via localStorage (not API)         |
| Invoice Generation       | ✅ Done    | Print + barcode + AWB                       |
| Discounts & Vouchers     | ✅ Done    | Admin UI + checkout validation              |
| Product Reviews          | ✅ Done    | DB model + submission UI + photo upload     |
| Bulk Import/Export       | ✅ Done    | xlsx library                                |
| Multi-Language ID/EN     | ✅ Done    | Locale files                                |
| Blog                     | ✅ Done    | Static blog with SEO                        |
| WhatsApp Integration     | ✅ Done    | Configurable phone                          |
| Basic Analytics          | 🟡 Partial | Revenue page (API-backed)                   |

### ✅ Chat System (NEW)

| Feature                                      | Status  |
| -------------------------------------------- | ------- |
| Real-time Chat (DB persisted)                | ✅ Done |
| Admin Chat Panel (`/admin/chat`)             | ✅ Done |
| Auto-Reply Engine (ID + EN)                  | ✅ Done |
| Customer Polling (3s interval)               | ✅ Done |
| Order Lifecycle (checkout → admin → process) | ✅ Done |

### ✅ Multiple Addresses + Skip Customer Step (NEW)

| Feature                               | Status  | Key File                      |
| ------------------------------------- | ------- | ----------------------------- |
| `UserAddress` Prisma model            | ✅ Done | `prisma/schema.prisma`        |
| Address CRUD API                      | ✅ Done | `app/api/user/addresses/`     |
| Address management in Account page    | ✅ Done | `src/views/Account.tsx`       |
| Skip step 0 when logged in            | ✅ Done | `src/views/Checkout.tsx`      |
| Saved address selector in checkout    | ✅ Done | `src/views/Checkout.tsx`      |
| Auto-fill customer from saved address | ✅ Done | `src/views/Checkout.tsx`      |
| `user.phone` exposed in AuthContext   | ✅ Done | `src/context/AuthContext.tsx` |
| `userId` linked on order creation     | ✅ Done | `app/api/orders/route.ts`     |

### Architecture

| Layer     | Choice                                               |
| --------- | ---------------------------------------------------- |
| ORM       | Prisma 7 + SQLite (dev) → Supabase PostgreSQL (prod) |
| Auth      | Auth.js v5 — Credentials + Google OAuth              |
| Payments  | Xendit (invoice + webhook)                           |
| Shipping  | KiriminAja (7 proxy routes)                          |
| Chat      | Prisma models (Conversation + ChatMessage)           |
| Addresses | Prisma model (UserAddress)                           |

### Test Results

**32 of 33 tests pass** across all test files:

- `full-flow.spec.js`: ✅ Customer sends chat → buys → admin replies → processes
- `customer-flow.spec.js`: ✅ All 13 tests pass
- `product-flow.spec.js`: ✅ All 9 tests pass
- `product-variants.spec.js`: ✅ All 1 test passes
- `admin-flow.spec.js`: 🟡 1 pre-existing failure (Revenue page seeds localStorage)

### To Deploy

1. Fill `.env`: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `XENDIT_API_KEY`, `KIRIMINAJA_API_KEY`
2. Set `KIRIMINAJA_ENV=production` when live
3. Deploy to Vercel + Supabase PostgreSQL + Supabase Storage
4. Run `npx prisma migrate deploy` on production DB

### ⚠️ Pre-Deployment Cleanup: Remove Testing Shortcuts

**Status: STILL ACTIVE.** The following were added for development/testing only and MUST be removed before production:

| File                         | What to Remove                                                                              | Impact if Left In                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `.env` line 24               | `NEXT_PUBLIC_TESTING_MODE="true"`                                                           | Must be `false` or unset in prod — defaults off but risky              |
| `src/views/OrderSuccess.tsx` | The `testingMode` block with "Tandai Dibayar" + "Tandai Sampai" buttons                     | Customer could self-mark orders as paid or completed — **costing bug** |
| `src/views/Account.tsx`      | The `testingMode` block with "Tandai Dibayar" + "Tandai Sampai" buttons + handler functions | Same costing bug from order history page                               |
| `app/api/testing/`           | Entire `app/api/testing/` directory (contains `mark-paid` + `mark-completed` endpoints)     | Unauthenticated users could advance order status in production         |

**How the guard works:** All testing buttons check `process.env.NEXT_PUBLIC_TESTING_MODE === 'true'`. The testing API endpoint also checks this flag at the top — returns 404 if not set. Since the production build will not have this set (or set to `false`), the buttons will not render and the endpoint will return 404. However, for defense-in-depth, delete the button JSX/handlers and the entire `app/api/testing/` directory before deploying.

**To strip:** Set `.env` `NEXT_PUBLIC_TESTING_MODE` to `false` or remove the env var entirely, then verify neither page renders orange "🧪" buttons for any order status.
