# Dunia Pancing — Fishing Tackle E-Commerce Platform

A fully client-side React e-commerce web application for a fishing tackle store in Palembang, Indonesia. Built with React 19, Vite 6, Tailwind CSS 4, and React Router 7. All data is stored locally in `localStorage`.

🔗 **Repository**: https://github.com/jonathan-simpson-it/dunia-pancing.git  
🌐 **Multilingual**: Supports Indonesian (ID) and English (EN)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Key Concepts](#key-concepts)
- [Contexts & State Management](#contexts--state-management)
- [Development Guide](#development-guide)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Local Storage Schema](#local-storage-schema)
- [Default Credentials](#default-credentials)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### Customer Features

- 🏠 **Home Page**: Hero section, featured products, category preview
- 📦 **Catalog**: Browse fishing tackle by category (rods, reels, lines, hooks, lures, accessories)
- 🔍 **Product Search**: Real-time search by name/description across all categories
- ⭐ **Product Details**: Full product page with ratings, images, and descriptions
- 📊 **Star Ratings**: Rate products on a 1-5 star scale
- 🛒 **Shopping Cart**: Add/remove items, quantity adjustment, persistent storage
- 💳 **Checkout**: Multi-step checkout flow with customer information
- 📄 **Invoice & Barcode**: Auto-generated invoice with product barcode
- 📞 **WhatsApp Integration**: Floating chat button for customer support
- 👤 **User Accounts**: Register and login; view order history
- 🌍 **Multi-language**: Toggle between Indonesian and English

### Admin Features

- 🎛️ **Admin Dashboard**: Product inventory overview and management
- ➕ **Add Products**: Create new fishing tackle products with details
- 📥 **Bulk Import**: Import/update product prices via Excel (XLSX)
- 💰 **Revenue Analytics**: View sales revenue and order statistics
- ✏️ **Edit Products**: Update existing product information
- 🗑️ **Delete Products**: Remove products from inventory

---

## 🛠️ Tech Stack

| Layer                | Technology              |
| -------------------- | ----------------------- |
| **Framework**        | React 19 + React DOM 19 |
| **Build Tool**       | Vite 6                  |
| **Styling**          | Tailwind CSS 4          |
| **Routing**          | React Router 7          |
| **State Management** | React Context API       |
| **SEO**              | React Helmet Async      |
| **Barcodes**         | jsbarcode (SVG)         |
| **Excel**            | xlsx (import/export)    |
| **Testing**          | Playwright              |
| **Package Manager**  | npm                     |

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome

---

## 📦 Installation

### Prerequisites

- **Node.js**: v16.8+ (check with `node --version`)
- **npm**: v7+ (check with `npm --version`)
- **Git**: Latest version

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/jonathan-simpson-it/dunia-pancing.git
cd dunia-pancing

# Install dependencies
npm install

# Verify installation
npm run dev
```

The dev server runs on `http://localhost:5173`

---

## 🚀 Quick Start

### Development

```bash
npm run dev
# Opens http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/ folder (ready for deployment)
```

### Preview Production Build

```bash
npm run preview
# Test production build locally on http://localhost:4173
```

### Run E2E Tests

```bash
npm test  # runs Playwright tests (if configured)
```

### Default Test Account

- **Role**: Admin
- **Username**: `admin`
- **Password**: `admin123`

---

## 📂 Project Structure

```
dunia-pancing/
├── public/                          # Static assets
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # Main layout wrapper with navbar & footer
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   └── Footer.jsx          # Footer component
│   │   ├── seo/
│   │   │   └── MetaTags.jsx        # SEO metadata injector
│   │   └── ui/                     # Reusable UI components
│   │       ├── Barcode.jsx         # SVG barcode generator
│   │       ├── CategoryChip.jsx    # Category filter chip
│   │       ├── ChatButton.jsx      # WhatsApp floating button
│   │       ├── ChatWindow.jsx      # Chat window (reserved)
│   │       ├── GoogleMap.jsx       # Map embed
│   │       ├── Hero.jsx            # Hero banner section
│   │       ├── ImageUploader.jsx   # Product image upload
│   │       ├── InvoicePrint.jsx    # Invoice template
│   │       ├── ProductCard.jsx     # Product card component
│   │       ├── ProtectedRoute.jsx  # Auth route guard
│   │       ├── QuantitySelector.jsx # +/- quantity button
│   │       ├── StarRating.jsx      # 1-5 star rating
│   │       └── StepIndicator.jsx   # Checkout steps indicator
│   ├── context/
│   │   ├── AuthContext.jsx         # Authentication & user management
│   │   ├── CartContext.jsx         # Shopping cart state
│   │   ├── ChatContext.jsx         # Chat state (reserved)
│   │   ├── LanguageContext.jsx     # i18n (ID/EN toggle)
│   │   └── ProductStore.jsx        # Product & category CRUD
│   ├── pages/
│   │   ├── Home.jsx                # Homepage with hero & featured
│   │   ├── Catalog.jsx             # Product catalog with search
│   │   ├── ProductDetail.jsx       # Single product page
│   │   ├── Cart.jsx                # Shopping cart page
│   │   ├── Checkout.jsx            # Multi-step checkout
│   │   ├── OrderSuccess.jsx        # Order confirmation + invoice
│   │   ├── Login.jsx               # Login/register form
│   │   ├── Account.jsx             # User account & orders
│   │   ├── Contact.jsx             # Contact page
│   │   ├── AdminDashboard.jsx      # Admin inventory overview
│   │   ├── AdminAddProduct.jsx     # Add/edit product form
│   │   ├── AdminImport.jsx         # Bulk Excel import
│   │   └── AdminRevenue.jsx        # Sales analytics
│   ├── data/
│   │   └── seed.json               # Initial product seed data
│   ├── locales/
│   │   ├── id.json                 # Indonesian translations
│   │   └── en.json                 # English translations
│   ├── utils/
│   │   ├── formatters.js           # Number/currency formatting
│   │   ├── order.js                # Order generation logic
│   │   └── shopee.js               # Shopee integration (reserved)
│   ├── App.jsx                     # Main app component with routes
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind + custom theme
├── e2e/                            # Playwright E2E tests
│   ├── admin-flow.spec.js          # Admin workflow tests
│   ├── customer-flow.spec.js       # Customer workflow tests
│   └── edge-cases.spec.js          # Edge case tests
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite configuration
├── playwright.config.js            # E2E test config
├── index.html                      # HTML entry point
├── README.md                       # This file
├── DUNIA_PANCING_CODABASE.md      # Detailed codebase reference
└── plan.md                         # Development roadmap

```

---

## 📜 Available Scripts

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Build for production (creates dist/)
npm run preview       # Preview production build locally
npx playwright test   # Run E2E tests
```

---

## 🧠 Key Concepts

### Client-Side Only Architecture

- **No backend server** — All data lives in the browser's `localStorage`
- **All state persists** — Data survives page refresh and browser restart
- **Perfect for demo/MVP** — Easy to show features without infrastructure

### React Router Structure

- **Single-Page App (SPA)** — No page reloads, instant navigation
- **Protected Routes** — Admin routes require admin login
- **Client routes** — User account page requires client login
- **Public routes** — Home, catalog, product details, login, contact

### Context API for State

- **LanguageContext**: Global i18n state (ID/EN)
- **AuthContext**: Authentication & user session
- **ProductStore**: Product catalog & category management
- **CartContext**: Shopping cart (add/remove/quantities)

---

## 🔄 Contexts & State Management

### AuthContext (`src/context/AuthContext.jsx`)

**Storage Keys:**

- `dunia-pancing-users` — All registered users
- `dunia-pancing-session` — Current logged-in user

**Key Methods:**

```javascript
login(username, password); // → { success: boolean, message: string }
register(name, phone, pwd); // → { success: boolean, message: string }
logout(); // Clears session
```

**Derived Values:**

```javascript
isAdmin; // true if user.role === 'admin'
isClient; // true if user.role === 'client'
isLoggedIn; // true if user is in session
```

**Default Admin Account:**

```
Username: admin
Password: admin123
Role: admin
```

---

### ProductStore (`src/context/ProductStore.jsx`)

**Storage Keys:**

- `dunia-pancing-products` — All products
- `dunia-pancing-categories` — All categories

**Default Categories:**
| Icon | Key | Name (ID) | Name (EN) |
|------|-----|-----------|-----------|
| 🎣 | `rods` | Joran | Rods |
| 🔄 | `reels` | Reel | Reels |
| 〰️ | `lines` | Senar | Lines |
| 🪝 | `hooks` | Kail | Hooks |
| 🐟 | `lures` | Umpan | Lures |
| 🧰 | `accessories` | Aksesoris | Accessories |

**Key Methods:**

```javascript
addProduct(product)                    // Prepends new product
updateProduct(id, updates)             // Merges updates
deleteProduct(id)                      // Removes product
getProduct(id)                         // Returns product or null
nextId()                               // Generates new ID: dp-XXX
importPrices(priceUpdates)             // Excel import handler
addCategory({key, name_id, ...})       // Add new category
renameCategory(key, updates)           // Update category
deleteCategory(key)                    // Remove if no products
```

---

### CartContext (`src/context/CartContext.jsx`)

**Storage Key:**

- `dunia-pancing-cart` — Cart items

**State:**

```javascript
{
  items: [
    { id, productId, quantity, price, title, category, image },
    ...
  ]
}
```

---

### LanguageContext (`src/context/LanguageContext.jsx`)

**Storage Key:**

- `dunia-pancing-lang` — 'id' | 'en'

**Key Method:**

```javascript
t(key, lang); // Looks up key in locale JSON
toggleLang(); // Switch between ID ↔ EN
```

---

## 👨‍💻 Development Guide

### Adding a New Page

1. **Create component** in `src/pages/YourPage.jsx`:

```jsx
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import Layout from "../components/layout/Layout";

export default function YourPage() {
  const { t, lang } = useContext(LanguageContext);
  return (
    <div className="container mx-auto py-8">
      <h1>{t("your_page_title", lang)}</h1>
    </div>
  );
}
```

2. **Add route** in `src/App.jsx`:

```jsx
<Route path="/your-page" element={<YourPage />} />
```

3. **Add translation keys** in `src/locales/id.json` and `src/locales/en.json`:

```json
{
  "your_page_title": "Halaman Anda"  // ID
  "your_page_title": "Your Page"     // EN
}
```

### Adding a Protected Route

```jsx
// For admin only
<Route
  path="/admin/new-feature"
  element={<ProtectedRoute role="admin"><NewFeature /></ProtectedRoute>}
/>

// For logged-in clients
<Route
  path="/client/feature"
  element={<ProtectedRoute role="client"><ClientFeature /></ProtectedRoute>}
/>
```

### Using the Product Store

```jsx
import { useContext } from "react";
import { ProductStoreContext } from "../context/ProductStore";

export default function MyComponent() {
  const { products, addProduct, updateProduct, getProduct } =
    useContext(ProductStoreContext);

  const handleAddProduct = () => {
    addProduct({
      id: "dp-001",
      name: "Fishing Rod",
      category: "rods",
      price: 150000,
      image: "url",
      description: "Premium fishing rod",
      stock: 10,
    });
  };

  return <button onClick={handleAddProduct}>Add Product</button>;
}
```

### Using Translations

```jsx
import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function MyComponent() {
  const { t, lang, toggleLang } = useContext(LanguageContext);

  return (
    <div>
      <h1>{t("hello_world", lang)}</h1>
      <button onClick={toggleLang}>
        Switch to {lang === "id" ? "English" : "Bahasa Indonesia"}
      </button>
    </div>
  );
}
```

---

## 🧪 Testing

### End-to-End Tests with Playwright

Tests are located in `e2e/`:

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/customer-flow.spec.js

# Run in debug mode
npx playwright test --debug

# View test report
npx playwright show-report
```

**Test Coverage:**

- `admin-flow.spec.js` — Admin product CRUD operations
- `customer-flow.spec.js` — Customer purchase journey
- `edge-cases.spec.js` — Error handling & edge cases

### Testing Best Practices

1. **Test user flows**, not implementation
2. **Use data-testid** attributes for selectors
3. **Mock localStorage** in tests
4. **Test multilingual** content
5. **Verify protected routes** return 401/403

---

## 🔧 Troubleshooting

### Issue: Dev server won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Styles not loading

```bash
# Vite isn't processing Tailwind CSS
# Check vite.config.js has both plugins:
# - @vitejs/plugin-react
# - @tailwindcss/vite
```

### Issue: Routes returning 404 in production

```bash
# SPA needs fallback to index.html
# If hosting on Netlify:
# Create netlify.toml with:
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: localStorage is cleared unexpectedly

```
// Dev server clearing cache?
// Check browser DevTools > Application > Storage > Clear all
// OR check localStorage quota exceeded (usually 5-10MB)
```

### Issue: Admin can't login

```
// Verify seed data loaded
// Check localStorage key: dunia-pancing-users
// Default: { username: "admin", password: "admin123", role: "admin" }
// Try clearing localStorage and refreshing
```

### Issue: Images not loading

```
// Check public/ folder has files OR
// Use URLs instead of local paths
// Example: image: "https://example.com/image.jpg"
```

---

## 💾 Local Storage Schema

### `dunia-pancing-users`

```json
[
  {
    "id": "user-1",
    "username": "admin",
    "password": "admin123",
    "name": "Administrator",
    "role": "admin"
  },
  {
    "id": "user-2",
    "username": "62812345678",
    "phone": "62812345678",
    "password": "hashed_pwd",
    "name": "John Doe",
    "role": "client",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### `dunia-pancing-session`

```json
{
  "id": "user-2",
  "username": "62812345678",
  "name": "John Doe",
  "role": "client"
}
```

### `dunia-pancing-products`

```json
[
  {
    "id": "dp-001",
    "name": "Premium Fishing Rod",
    "category": "rods",
    "price": 250000,
    "stock": 15,
    "description": "High-quality carbon fiber rod",
    "image": "https://example.com/rod.jpg",
    "rating": 4.5,
    "reviews": 12
  }
]
```

### `dunia-pancing-categories`

```json
{
  "rods": {
    "key": "rods",
    "name_id": "Joran",
    "name_en": "Rods",
    "icon": "🎣"
  },
  "reels": {
    "key": "reels",
    "name_id": "Reel",
    "name_en": "Reels",
    "icon": "🔄"
  }
}
```

### `dunia-pancing-cart`

```json
{
  "items": [
    {
      "id": "cart-item-1",
      "productId": "dp-001",
      "quantity": 2,
      "price": 250000,
      "title": "Premium Fishing Rod",
      "category": "rods"
    }
  ]
}
```

### `dunia-pancing-lang`

```
"id"  // or "en"
```

---

## 🔑 Default Credentials

### Admin Account

| Field        | Value      |
| ------------ | ---------- |
| **Username** | `admin`    |
| **Password** | `admin123` |
| **Role**     | admin      |

### Demo Customer Account (Create Your Own)

| Field        | Value        |
| ------------ | ------------ |
| **Name**     | John Doe     |
| **Phone**    | 62812345678  |
| **Password** | any_password |
| **Role**     | client       |

---

## 🚀 Future Enhancements

### Phase 4: Advanced Catalog

- [ ] Price range filter
- [ ] Brand filtering
- [ ] Pagination / Load More
- [ ] Search suggestions
- [ ] Skeleton loading
- [ ] Quick view modal

### Phase 5: Wishlist

- [ ] Heart button on products
- [ ] Wishlist page
- [ ] Add to cart from wishlist
- [ ] Share wishlist

### Backend Integration

- [ ] Replace localStorage with REST API
- [ ] User authentication with JWT
- [ ] Payment gateway integration (Stripe/Midtrans)
- [ ] Email notifications
- [ ] Admin analytics dashboard

### Mobile App

- [ ] React Native version
- [ ] Native payment integration
- [ ] Push notifications
- [ ] Offline support

### SEO & Performance

- [ ] Static site generation (SSG)
- [ ] Image optimization
- [ ] Lazy loading for images
- [ ] Sitemap & robots.txt
- [ ] Structured data (Schema.org)

---

## 📝 Common Development Tasks

### Import Products from Excel

1. Go to `/admin/import`
2. Upload XLSX file with columns: `id`, `name`, `price`, `stock`
3. Review changes
4. Click "Confirm Import"

### Backup Products to Excel

```javascript
// In browser console
const products = JSON.parse(localStorage.getItem("dunia-pancing-products"));
console.table(products);
// Copy to Excel
```

### Reset All Data

```javascript
// In browser console (WARNING: irreversible!)
localStorage.removeItem("dunia-pancing-products");
localStorage.removeItem("dunia-pancing-users");
localStorage.removeItem("dunia-pancing-cart");
localStorage.removeItem("dunia-pancing-session");
localStorage.removeItem("dunia-pancing-categories");
window.location.reload();
```

### Add Test Products via Console

```javascript
// In browser console
const store = JSON.parse(localStorage.getItem("dunia-pancing-products")) || [];
store.push({
  id: "dp-test-" + Date.now(),
  name: "Test Rod",
  category: "rods",
  price: 100000,
  stock: 5,
  description: "Testing",
  image: "https://via.placeholder.com/300",
});
localStorage.setItem("dunia-pancing-products", JSON.stringify(store));
```

---

## 🐛 Debugging Tips

### Enable Redux DevTools (if migrated to Redux)

```javascript
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
```

### Check Context Values

```jsx
// In React DevTools
// Open Components tab
// Search for Context providers
// Inspect their current values
```

### Monitor localStorage Changes

```javascript
// In browser console
window.addEventListener("storage", (e) => {
  console.log(`${e.key} changed:`, e.oldValue, "→", e.newValue);
});
```

### Performance Profiling

```javascript
// React.Profiler in DevTools
// Record interactions
// Check component render times
```

---

## 📞 Support & Contact

For issues, questions, or feature requests:

- **GitHub Issues**: https://github.com/jonathan-simpson-it/dunia-pancing/issues
- **Email**: dev@dunia-pancing.local
- **WhatsApp**: Embedded in app via ChatButton

---

## 📄 License

This project is private. All rights reserved © 2024 Dunia Pancing.

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Test all pages in production mode (`npm run build && npm run preview`)
- [ ] Test all user flows (cart → checkout → order)
- [ ] Test admin flows (add → edit → delete products)
- [ ] Clear all test data from localStorage
- [ ] Verify translations are complete (ID & EN)
- [ ] Check images load correctly
- [ ] Test on mobile devices
- [ ] Run Playwright tests (`npx playwright test`)
- [ ] Check SEO meta tags with React Helmet
- [ ] Verify CORS if using external APIs
- [ ] Set up error logging (Sentry/LogRocket)
- [ ] Test on slow connections (Chrome DevTools throttle)
- [ ] Backup production data before deployment

---

**Last Updated**: May 24, 2024  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
