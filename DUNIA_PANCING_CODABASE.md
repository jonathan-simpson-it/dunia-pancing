# Dunia Pancing Palembang — Codebase Reference

## 1. Project Overview

**Dunia Pancing** is a React 19 SPA e-commerce app for a fishing tackle store in Palembang, Indonesia. Fully client-side — all data in `localStorage`. Built with Vite 6, Tailwind CSS 4, React Router 7.

### Tech Stack
- React 19, React DOM 19
- Vite 6 + @vitejs/plugin-react
- Tailwind CSS 4 + @tailwindcss/vite
- react-router-dom 7
- react-helmet-async 2
- jsbarcode 3 (SVG barcodes)
- xlsx 0.18 (Excel import/export)

### Config
**`vite.config.js`** — Minimal: `@vitejs/plugin-react` + `@tailwindcss/vite`. No proxy/API.

**`index.html`** — Root `<div id="root">`, Google Fonts (Inter + Plus Jakarta Sans), `<html lang="id">`.

**`src/index.css`** — Tailwind imports + custom theme:
- `--font-sans`: Inter
- `--font-display`: Plus Jakarta Sans
- `--color-brand-primary`: sky-500 (#0ea5e9)
- `--color-brand-secondary`: emerald-500 (#10b981)
- `--color-brand-dark`: slate-900 (#0f172a)
- Scrollbar-hide utility, pulse-shadow & slide-up animations

---

## 2. Entry & App Shell

### `main.jsx`
```jsx
<StrictMode><App /></StrictMode>
```

### `App.jsx`
```
HelmetProvider
  LanguageProvider (i18n id/en)
    AuthProvider (auth + user mgmt)
      ProductStoreProvider (product & category CRUD)
        CartProvider (cart state)
          BrowserRouter
            Layout (render-prop pattern)
              Routes
```

### Routes

| Path | Component | Auth |
|---|---|---|
| `/` | Home | Public |
| `/catalog` | Catalog | Public |
| `/product/:id` | ProductDetail | Public |
| `/cart` | Cart | Public |
| `/checkout` | Checkout | Public |
| `/order-success/:orderId` | OrderSuccess | Public |
| `/login` | Login | Public |
| `/contact` | Contact | Public |
| `/admin` | AdminDashboard | Protected (admin) |
| `/admin/add` | AdminAddProduct | Protected (admin) |
| `/admin/import` | AdminImport | Protected (admin) |
| `/admin/revenue` | AdminRevenue | Protected (admin) |
| `/account` | Account | Protected (client) |

---

## 3. Context Providers

### LanguageContext (`context/LanguageContext.jsx`)
- **Key:** `dunia-pancing-lang`
- **State:** `lang` ('id'|'en'), `toggleLang()`
- **Usage:** `t(key, lang)` from locale JSONs

### AuthContext (`context/AuthContext.jsx`)
- **Storage:** `dunia-pancing-users`, `dunia-pancing-session`
- **Default admin:** username `admin`, password `admin123`, role `admin`
- **State:** `user` ({username, role, name}), `loaded`
- **Functions:**
  - `login(username, password)` → boolean
  - `register({name, phone, password})` → boolean (username = phone)
  - `logout()`
- **Derived:** `isAdmin`, `isClient`, `isLoggedIn`

### ProductStore (`context/ProductStore.jsx`)
- **Storage:** `dunia-pancing-products`, `dunia-pancing-categories`
- **Default categories:** rods (🎣 Joran), reels (🔄 Reel), lines (〰️ Senar), hooks (🪝 Kail), lures (🐟 Umpan), accessories (🧰 Aksesoris)
- **State:** `products[]`, `categories[]`, `loaded`
- **Functions:**
  - `addProduct(product)` — prepends
  - `updateProduct(id, updates)` — merges
  - `deleteProduct(id)`
  - `getProduct(id)` → product|null
  - `nextId()` → `dp-XXX`
  - `importPrices(priceUpdates)` → updated[] ({id, name, old, new})
  - `addCategory({key, name_id, name_en, icon})` → boolean
  - `renameCategory(key, updates)`
  - `deleteCategory(key)` → boolean (only if no products)
  - `getCategoryName(key, lang)` → string
- **Seeds from:** `data/seed.json` (32 products) on first load

### CartContext (`context/CartContext.jsx`)
- **Storage:** `dunia-pancing-cart`
- **Cart item:** `{ id, name_id, name_en, image, price_idr, original_price_idr, stock_qty, category, brand, qty }`
- **State:** `items[]`, `loaded`
- **Functions:**
  - `addToCart(product, qty=1)` — caps at stock_qty
  - `removeFromCart(productId)`
  - `updateQty(productId, qty)` — if ≤0, removes
  - `clearCart()`
- **Derived:** `itemCount`, `subtotal`

### ChatContext (`context/ChatContext.jsx`)
- **Storage:** `dunia-pancing-chat`
- **State:** `messages[]`, `isOpen`, `unread`, `loaded`
- Auto-replies based on keywords (id/en) after 1500ms

---

## 4. Layout Components

### Layout (`components/layout/Layout.jsx`)
- Manages `searchTerm` state
- Wraps in `<ChatProvider>`
- Renders: `<Navbar>`, `<main>{children}</main>`, `<Footer>`, `<ChatButton>`, `<ChatWindow>`
- Render-prop: `{children({ searchTerm, setSearchTerm })}`

### Navbar (`components/layout/Navbar.jsx`)
- **Props:** `searchTerm`, `onSearchChange`
- Sticky dark navbar (`bg-slate-900/95 backdrop-blur`)
- Desktop links: Home, Catalog, Contact, Dashboard (admin only)
- User icon (→ /admin or /account), Login button (→ /login)
- Cart icon with badge (capped at "99+")
- Language toggle (ID/EN)
- Search bar only on `/catalog` route

### Footer (`components/layout/Footer.jsx`)
- Brand, nav links, legal links, newsletter (non-functional), copyright

---

## 5. UI Components

### ProductCard (`components/ui/ProductCard.jsx`)
- **Props:** `product`
- Image, out-of-stock overlay, discount badge, name, price, rating, sold count, "Buy Now" link
- Links to `/product/{product.id}`

### Hero (`components/ui/Hero.jsx`)
- Full-width hero with Pexels background, CTA buttons, stat counters (2k+ Products, 10k+ Customers, 15y Experience)

### CategoryChip (`components/ui/CategoryChip.jsx`)
- **Props:** `category`, `active`, `onClick`, `count`
- Category filter button with count badge

### QuantitySelector (`components/ui/QuantitySelector.jsx`)
- **Props:** `value`, `onChange`, `min`(1), `max`(99)
- +/- buttons with disabled states

### StarRating (`components/ui/StarRating.jsx`)
- **Props:** `rating` (0-5), `size` (10px)

### ProtectedRoute (`components/ui/ProtectedRoute.jsx`)
- **Props:** `children`, `role` ("admin"|"client")
- Redirects to `/login` if not logged in, to `/` if wrong role

### ImageUploader (`components/ui/ImageUploader.jsx`)
- **Props:** `value`, `onChange`, `label`, `previewClass`, `maxFiles`(10)
- Client-side compression (max 800×800, quality 0.8, JPEG)
- Preview gallery with ordering and delete

### ChatButton (`components/ui/ChatButton.jsx`)
- Floating button (bottom-right), unread badge (max "9+")

### ChatWindow (`components/ui/ChatWindow.jsx`)
- Full-screen on mobile, card bottom-right on desktop
- Header, message list (date separators), input bar, send

### StepIndicator (`components/ui/StepIndicator.jsx`)
- **Props:** `steps[]`, `current` (0-indexed)

### Barcode (`components/ui/Barcode.jsx`)
- **Props:** `value`, `height`, `width`, `fontSize`
- JsBarcode CODE128 SVG

### InvoicePrint (`components/ui/InvoicePrint.jsx`)
- **Props:** `order`
- Full invoice layout with print button

### GoogleMap (`components/ui/GoogleMap.jsx`)
- Static Google Maps iframe

### MetaTags (`components/seo/MetaTags.jsx`)
- **Props:** `title`, `description`
- Sets `<title>` + meta/OG tags via react-helmet-async

---

## 6. Pages

### Home (`pages/Home.jsx`) — Route: `/`
- **Sections:** Hero, Category Grid (6 cards), Featured Products (first 4), Best Sellers (top 4 by sold_count), Trust Badges, About Section
- Category links → `/catalog?category={key}`

### Catalog (`pages/Catalog.jsx`) — Route: `/catalog`
- **Props:** `searchTerm`, `setSearchTerm`
- **State:** `sort` (relevance|latest|bestseller|price_asc|price_desc), `showFilter`, `scrollRef`
- **URL param:** `?category={key}`
- Horizontal scrollable category chips, sort buttons, filter popover (click-outside)
- 2-column product grid, empty state with reset button
- Filters by name, brand, category (id/en)

### ProductDetail (`pages/ProductDetail.jsx`) — Route: `/product/:id`
- **State:** `selectedImg`, `qty`, `added`
- Breadcrumb: Home > Catalog > Category > Product
- Image gallery (thumbnails if multiple), product info, price, stock, weight
- Key features, specifications, description (locale-aware), reviews, related products
- Add to Cart (with "Added!" feedback) / Buy Now buttons
- Product not found → 404 with link to catalog

### Cart (`pages/Cart.jsx`) — Route: `/cart`
- Empty state with illustration + catalog link
- Item list: image, name, price, QtySelector, remove button, clear all
- Order summary: subtotal, shipping (--), total, Checkout button

### Checkout (`pages/Checkout.jsx`) — Route: `/checkout`
- 4-step form:
  1. Customer Info (name, phone, address, city, notes) — validates required
  2. Shipping Method (6 options: JNE Reg/YES, J&T, SiCepat, Grab/GoSend, Store Pickup)
  3. Payment Method (7 options: BCA/BRI/Mandiri transfer, COD, GoPay, OVO, Pay at Store)
  4. Review & Confirm (editable sections, item list, totals)
- **Place Order:** creates order via localStorage → clears cart → updates sold_count → opens WhatsApp → navigates to `/order-success/{id}`
- Empty cart guard

### OrderSuccess (`pages/OrderSuccess.jsx`) — Route: `/order-success/:orderId`
- Success header, order number, "Menunggu Pembayaran" status
- Payment info (bank transfer: copy + confirm via WA; non-bank: WA button)
- Order summary, barcode, invoice print, "Continue Shopping"

### Login (`pages/Login.jsx`) — Route: `/login`
- **Tabs:** Admin (username/password) | Customer (phone/password or register)
- Register fields: name, phone, password, confirm password
- Redirects on success (admin→/admin, client→/)
- Already logged in → redirect to /

### Account (`pages/Account.jsx`) — Route: `/account` (protected)
- Profile card with name, username, logout
- Order history (by phone, with status badges)

### Contact (`pages/Contact.jsx`) — Route: `/contact`
- Address, hours (Mon-Sat 08-18, Sun closed), WhatsApp CTA, Google Maps, Shopee link

### AdminDashboard (`pages/AdminDashboard.jsx`) — Route: `/admin`
- **Two tabs:** Products & Categories
- **Sidebar:** Products, Categories, Add Product, Price Import, Revenue, Logout
- **Products tab:** search, table (ID, Name, Category, Price, Stock, Actions), inline edit (name, brand, category, price, stock, images), delete with double-click confirm
- **Categories tab:** Add form (key, name_id, name_en, icon), inline edit/delete (prevents deletion with products)

### AdminAddProduct (`pages/AdminAddProduct.jsx`) — Route: `/admin/add`
- **Fields:** name_id*, name_en, brand*, category*, price_idr*, original_price_idr, stock_qty*, weight, specs, description_id, description_en, images (ImageUploader)
- Submits → success toast → navigates to /admin after 1.5s
- Fallback image: Pexels default

### AdminImport (`pages/AdminImport.jsx`) — Route: `/admin/import`
- Template download (CSV/Excel)
- Drag-and-drop upload (CSV/XLSX/XLS, max 5MB)
- Preview table: matched (yellow if changed) / unmatched (red)
- "Apply Changes" calls `importPrices()`

### AdminRevenue (`pages/AdminRevenue.jsx`) — Route: `/admin/revenue`
- Stats: Total Revenue, Total Orders, Avg Order Value, Total Items Sold
- Top Products (by sold_count, medals 🥇🥈🥉)
- Charts (CSS-only): Revenue by Payment, Shipping, Monthly
- Recent Orders (last 20)

---

## 7. Utils

### `utils/order.js`
- **Storage:** `dunia-pancing-orders`, `dunia-pancing-order-counter`
- **`createOrder({items, subtotal, customer, shipping, payment})`** → order
- **`loadOrders()`** → orders[]
- **`getOrder(orderId)`** → order|null
- **`buildWhatsAppMessage(order, lang)`** → formatted WA message
- **`printInvoice(order)`** → opens print window with full HTML invoice
- **Shipping methods:** 6 options (JNE Reg/YES, J&T, SiCepat, Grab/GoSend, Store Pickup)
- **Payment methods:** 7 options (BCA/BRI/Mandiri, COD, GoPay, OVO, Pay at Store)

### `utils/formatters.js`
- `formatIDR(amount)` → "Rp158.422" (no decimals)
- `discountPercent(original, current)` → integer %

### `utils/shopee.js`
- `SHOPEE_STORE_URL = 'https://shopee.co.id/alphastore1'`

---

## 8. localStorage Keys

| Key | Content |
|---|---|
| `dunia-pancing-products` | Product catalog (JSON) |
| `dunia-pancing-categories` | Categories (JSON) |
| `dunia-pancing-cart` | Cart items (JSON) |
| `dunia-pancing-users` | User accounts (plaintext passwords) |
| `dunia-pancing-session` | Current session |
| `dunia-pancing-orders` | Order history |
| `dunia-pancing-order-counter` | Sequential counter |
| `dunia-pancing-chat` | Chat messages |
| `dunia-pancing-lang` | Language preference |

### Admin Credentials (hardcoded default)
- Username: `admin`
- Password: `admin123`

---

## 9. Test Data Notes

- 32 seed products in `data/seed.json`
- First product: `dp-001` — Joran Shikari Warrior (rods category)
- Prices range ~10,000 to 500,000+ IDR
- Images from Pexels (fishing stock photos)
- Brands: Shikari, Kaito, Fantastik, Monster, X-Dragon, Armada, etc.
- Some products have discounts (original_price_idr > price_idr)
- Products have sold_count, rating, specifications, key_features

---

## 10. Common Text (Indonesian — Default)

| Key | ID Text | EN Text |
|---|---|---|
| nav_home | Beranda | Home |
| nav_catalog | Katalog | Catalog |
| nav_contact | Kontak | Contact |
| login_signin | Masuk | Sign In |
| login_signup | Daftar | Sign Up |
| cart_empty | Keranjang belanja kosong | Your cart is empty |
| cart_checkout | Checkout | Checkout |
| checkout_place_order | Buat Pesanan | Place Order |
| product_detail_add_cart | + Keranjang | Add to Cart |
| product_detail_buy_now | Beli Langsung | Buy Now |

Language toggle button shows ID/EN with active color (text-sky-400).
