# Dunia Pancing Palembang — Codebase Reference

## 1. Project Overview

**Dunia Pancing** is a Next.js 15 App Router e-commerce application for a fishing tackle store in Palembang, Indonesia. Features client-side state (`localStorage`) for products/cart bridged with Server-Side Next.js APIs (e.g., KiriminAja shipping). Built with React 19, TypeScript, and Tailwind CSS 4.

### Tech Stack

- Next.js 15 (App Router)
- React 19, React DOM 19
- TypeScript
- Tailwind CSS 4 + PostCSS
- jsbarcode 3 (SVG barcodes)
- xlsx 0.18 (Excel import/export)
- Playwright (E2E testing)
- Next.js API Routes (KiriminAja logistics integration)

### Config

**`next.config.ts`** — Next.js configuration.
**`tsconfig.json`** — TypeScript configuration.
**`playwright.config.js`** — E2E testing configuration.
**`app/globals.css`** — Tailwind imports + custom theme.

---

## 2. Entry & App Shell

### `app/layout.tsx`

Root Next.js layout. Provides HTML structure containing Google Fonts, metadata, and wraps the app with Context Providers.

### Context Providers Hierarchy (via `app/providers.tsx`)

```tsx
LanguageProvider (i18n id/en)
  AuthProvider (auth + user mgmt)
    ProductStoreProvider (product & category CRUD)
      CartProvider (cart state)
        SearchContext
          ChatContext
```

### App Router Routes (`app/`)

| Path                       | View Component                  | Auth               |
| -------------------------- | ------------------------------- | ------------------ |
| `/`                        | `src/views/Home.tsx`            | Public             |
| `/catalog`                 | `src/views/Catalog.tsx`         | Public             |
| `/product/[id]`            | `src/views/ProductDetail.tsx`   | Public             |
| `/cart`                    | `src/views/Cart.tsx`            | Public             |
| `/checkout`                | `src/views/Checkout.tsx`        | Public             |
| `/order-success/[orderId]` | `src/views/OrderSuccess.tsx`    | Public             |
| `/blog`                    | `src/views/Blog.tsx`            | Public             |
| `/blog/[slug]`             | `src/views/BlogPost.tsx`        | Public             |
| `/login`                   | `src/views/Login.tsx`           | Public             |
| `/contact`                 | `src/views/Contact.tsx`         | Public             |
| `/account`                 | `src/views/Account.tsx`         | Protected (client) |
| `/admin`                   | `src/views/AdminDashboard.tsx`  | Protected (admin)  |
| `/admin/add`               | `src/views/AdminAddProduct.tsx` | Protected (admin)  |
| `/admin/import`            | `src/views/AdminImport.tsx`     | Protected (admin)  |
| `/admin/orders`            | `src/views/AdminOrders.tsx`     | Protected (admin)  |
| `/admin/revenue`           | `src/views/AdminRevenue.tsx`    | Protected (admin)  |

### API Routes

- `/api/health/route.ts` - Health check.
- `/api/kiriminaja/*` - KiriminAja API endpoints (pricing, couriers, create-order, etc.).

---

## 3. Context Providers (Client-Side)

### LanguageContext (`src/context/LanguageContext.tsx`)

- **Key:** `dunia-pancing-lang`
- **Usage:** `t(key, lang)` from locale JSONs (`src/locales/id.json`, `en.json`)

### AuthContext (`src/context/AuthContext.tsx`)

- **Storage:** `dunia-pancing-users`, `dunia-pancing-session`
- **Default admin:** username `admin`, password `admin123`, role `admin`

### ProductStore (`src/context/ProductStore.tsx`)

- **Storage:** `dunia-pancing-products`, `dunia-pancing-categories`
- **Seeds from:** `src/data/seed.json` (32 products) on first load

### CartContext (`src/context/CartContext.tsx`)

- **Storage:** `dunia-pancing-cart`

### ChatContext (`src/context/ChatContext.tsx`)

- **Storage:** `dunia-pancing-chat`

---

## 4. Features & UI Components

### Layout (`src/components/layout/Layout.tsx` and Next.js layout)

- Includes `<Navbar>`, `<Footer>`, `<ChatButton>`, `<ChatWindow>`.

### Features

- **UI Components:** Lives in `src/components/ui/` (ProductCard, Hero, VariantBuilder, StarRating, ProtectedRoute, etc.)
- **SEO Elements:** Handled by Next.js Metadata API (`app/layout.tsx` + page metadata).

---

## 5. Utils & Services

### `src/utils/order.ts`

- **Storage:** `dunia-pancing-orders`, `dunia-pancing-order-counter`
- Manages order creation, retrieval, invoice printing, and building WhatsApp confirmation messages.

### `src/services/kiriminaja.ts` & `src/lib/kiriminaja.ts`

- Handles integration with KiriminAja shipping API via Next.js serverless functions.

### `src/utils/formatters.ts`

- Format IDR, date, and calc discount percentages.

---

## 6. localStorage Keys

| Key                           | Content                             |
| ----------------------------- | ----------------------------------- |
| `dunia-pancing-products`      | Product catalog (JSON)              |
| `dunia-pancing-categories`    | Categories (JSON)                   |
| `dunia-pancing-cart`          | Cart items (JSON)                   |
| `dunia-pancing-users`         | User accounts (plaintext passwords) |
| `dunia-pancing-session`       | Current session                     |
| `dunia-pancing-orders`        | Order history                       |
| `dunia-pancing-order-counter` | Sequential counter                  |
| `dunia-pancing-chat`          | Chat messages                       |
| `dunia-pancing-lang`          | Language preference                 |

### Admin Credentials (hardcoded default)

- Username: `admin`
- Password: `admin123`

---

## 7. Testing (E2E)

**Playwright** tests located in `/e2e/`:

- `account-auth-flow.spec.js`
- `admin-comprehensive.spec.js`
- `admin-flow.spec.js`
- `customer-flow.spec.js`
- `edge-cases.spec.js`
- `order-management.spec.js`
- `product-flow.spec.js`
- `product-variants.spec.js`

---

## 8. Blog Feature

- Located under `app/blog/` App Router routes.
- Data stored in `src/data/blog.json`.
- Implements basic SEO optimization and individual post view components.

/Users/devoob/Downloads/tobedeleted/duniapancing/
├── .git/ # Git repository
├── .github/ # CI/CD workflows
├── .gitignore
├── .next/ # Next.js build output
├── .playwright-mcp/ # Playwright MCP config
├── app/ # Next.js App Router (pages + API routes)
│ ├── account/
│ ├── admin/
│ │ ├── add/ # Admin add product
│ │ ├── import/ # Admin bulk Excel import
│ │ ├── orders/ # Admin order management
│ │ ├── revenue/ # Admin revenue analytics
│ │ ├── layout.tsx # Admin sidebar layout
│ │ └── page.tsx # Admin dashboard (products)
│ ├── api/kiriminaja/ # API proxy routes for KiriminAja
│ │ ├── cancel/
│ │ ├── couriers/
│ │ ├── create-order/
│ │ ├── credit/
│ │ ├── pickup-schedules/
│ │ ├── pricing/
│ │ └── tracking/
│ ├── blog/
│ │ ├── [slug]/page.tsx
│ │ └── page.tsx
│ ├── cart/
│ ├── catalog/
│ ├── checkout/
│ ├── contact/
│ ├── login/
│ ├── order-success/[orderId]/
│ ├── product/[id]/
│ ├── globals.css # Tailwind v4 theme
│ ├── layout.tsx # Root layout + metadata
│ ├── page.tsx # Home page
│ └── providers.tsx # All React context providers
├── dist/ # Legacy Vite build output
├── e2e/ # Playwright E2E tests
│ ├── account-auth-flow.spec.js
│ ├── admin-comprehensive.spec.js
│ ├── admin-flow.spec.js
│ ├── customer-flow.spec.js
│ ├── edge-cases.spec.js
│ ├── order-management.spec.js
│ ├── product-flow.spec.js
│ └── product-variants.spec.js
├── public/ # Static assets (favicon, robots.txt)
├── src/
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Footer.tsx
│ │ │ ├── Layout.tsx # (legacy)
│ │ │ └── Navbar.tsx
│ │ └── ui/
│ │ ├── AwbPrint.tsx # AWB (waybill) printing
│ │ ├── Barcode.tsx # SVG barcode rendering
│ │ ├── CategoryChip.tsx
│ │ ├── ChatButton.tsx # WhatsApp floating button
│ │ ├── ChatWindow.tsx # Chat window
│ │ ├── FeatureBadges.tsx # Product feature badges display
│ │ ├── FeatureEditor.tsx # Admin feature editor
│ │ ├── GoogleMap.tsx
│ │ ├── Hero.tsx # Homepage hero
│ │ ├── ImageUploader.tsx
│ │ ├── InvoicePrint.tsx # Invoice template + print
│ │ ├── ProductCard.tsx # Product card
│ │ ├── ProtectedRoute.tsx
│ │ ├── QuantitySelector.tsx
│ │ ├── ScrollToTop.tsx
│ │ ├── ShareButtons.tsx
│ │ ├── SizeChartModal.tsx
│ │ ├── StarRating.tsx
│ │ ├── StepIndicator.tsx # Checkout stepper
│ │ ├── VariantBuilder.tsx # Admin variant creation
│ │ ├── VariantSelector.tsx # Customer variant picker
│ │ └── WishlistButton.tsx
│ ├── config/
│ │ └── env.ts # Store config (address, phone, KA toggle)
│ ├── context/
│ │ ├── AuthContext.tsx # Auth state management
│ │ ├── CartContext.tsx # Cart state management
│ │ ├── ChatContext.tsx # Chat state management
│ │ ├── LanguageContext.tsx # i18n (ID/EN toggle)
│ │ ├── ProductStore.tsx # Product CRUD + categories + variants
│ │ └── SearchContext.tsx # Global search state
│ ├── data/
│ │ ├── blog.json # Blog posts (1 article)
│ │ └── seed.json # ~20 seed fishing products
│ ├── lib/
│ │ └── kiriminaja.ts # Low-level KA API client (POST/GET proxy)
│ ├── locales/
│ │ ├── en.json # English translations
│ │ └── id.json # Indonesian translations
│ ├── services/
│ │ └── kiriminaja.ts # High-level KA service functions
│ ├── utils/
│ │ ├── formatters.ts # formatIDR, discountPercent, optimizePexelsUrl
│ │ ├── order.ts # Order CRUD + shipping/payment constants
│ │ └── shopee.ts # Shopee store URL (1 line)
│ ├── views/
│ │ ├── Account.tsx # Customer account + order history
│ │ ├── AdminAddProduct.tsx # Admin add product form
│ │ ├── AdminDashboard.tsx # Admin product inventory
│ │ ├── AdminImport.tsx # Admin Excel import
│ │ ├── AdminOrders.tsx # Admin order management (1077 lines)
│ │ ├── AdminRevenue.tsx # Admin revenue analytics
│ │ ├── Blog.tsx # Blog listing
│ │ ├── BlogPost.tsx # Blog single post
│ │ ├── Cart.tsx # Shopping cart
│ │ ├── Catalog.tsx # Product catalog
│ │ ├── Checkout.tsx # Multi-step checkout
│ │ ├── Contact.tsx # Contact page
│ │ ├── Home.tsx # Home page
│ │ ├── Login.tsx # Login/register
│ │ ├── OrderSuccess.tsx # Order confirmation
│ │ └── ProductDetail.tsx # Product detail (473 lines)
│ └── types.ts # All TypeScript types/interfaces
├── codebase.md # Project analysis doc
├── DUNIA_PANCING_CODABASE.md # Legacy comprehensive reference
├── next.config.ts # Next.js config
├── package.json # Dependencies
├── package-lock.json
├── plan.md # Development roadmap
├── playwright.config.js
├── postcss.config.mjs
├── README.md # Full project documentation
└── tsconfig.json # TypeScript config
