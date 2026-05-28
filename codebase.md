Codebase Analysis: Dunia Pancing

## 1. Project Type & Tech Stack

**Project Type:** E-commerce web application (fishing equipment store) -- a single-vendor storefront with admin dashboard.

**Tech Stack:**

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4 + PostCSS
- **Language:** TypeScript
- **Testing:** Playwright (E2E tests in `/e2e/`)
- **Shipping API Integration:** KiriminAja (Indonesian logistics service)
- **Barcode Printing:** JsBarcode
- **Data Storage:** Mock/localStorage (no database -- products live in a JSON seed file, orders/cart live in localStorage)
- **I18n:** Custom simple locale system (JSON files for `id` and `en`)

## 2. Blog Status: NONE EXISTS

There is **no blog feature** in this project. The codebase has:

- No `/blog` directory or route
- No `/posts` or `/content` directories
- No `.md` or `.mdx` files (the only `.md` files are `README.md`, `plan.md`, and `DUNIA_PANCING_CODABASE.md` -- none are blog content)
- No blog-related configuration, types, or components
- No references to "blog", "article", "post", or "artikel" in any source file

## 3. Current Page Structure (App Router Routes)

All routes live under `/Users/devoob/Downloads/tobedeleted/duniapancing/app/`:

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Home page |
| `/catalog` | `app/catalog/page.tsx` | Product catalog with search/filter |
| `/product/[id]` | `app/product/[id]/page.tsx` | Product detail page |
| `/cart` | `app/cart/page.tsx` | Shopping cart |
| `/checkout` | `app/checkout/page.tsx` | Checkout flow |
| `/order-success/[orderId]` | `app/order-success/[orderId]/page.tsx` | Order confirmation |
| `/contact` | `app/contact/page.tsx` | Contact/store info page |
| `/login` | `app/login/page.tsx` | Login/register page |
| `/account` | `app/account/page.tsx` | Customer account page |
| `/admin` | `app/admin/page.tsx` | Admin dashboard |
| `/admin/orders` | `app/admin/orders/page.tsx` | Order management |
| `/admin/add` | `app/admin/add/page.tsx` | Add product form |
| `/admin/import` | `app/admin/import/page.tsx` | Bulk price import |
| `/admin/revenue` | `app/admin/revenue/page.tsx` | Revenue report |
| `/api/kiriminaja/*` | `app/api/kiriminaja/` | API routes for shipping |
| `/blog` | `app/blog/page.tsx` | Blog listing |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Individual blog post |

## 4. Blog Directory Structure

Blog content and views live at:

```
app/blog/              (route pages)
app/blog/[slug]/       (dynamic route for individual posts)
src/views/Blog.tsx     (blog listing view component)
src/views/BlogPost.tsx (individual blog post view component)
src/data/blog.json     (blog post data)
```

## 5. Existing Blog Post Names

- `seo-optimisation` — "SEO Optimisation untuk Toko Alat Pancing Online"

## 6. How Blogs Are Registered/Configured

The blog system follows the project's existing patterns:

**Page registration** -- Follows the existing Next.js App Router pattern:

- `app/blog/page.tsx` (listing)
- `app/blog/[slug]/page.tsx` (individual post)

**Navigation registration** -- The navbar (`src/components/layout/Navbar.tsx`) and footer (`src/components/layout/Footer.tsx`) define navigation links in arrays. A blog link has been added to both.

**Locale/i18n** -- New translation keys have been added to:

- `src/locales/id.json`
- `src/locales/en.json`

**SEO metadata** -- Each page exports a `metadata: Metadata` object (Next.js convention). Blog pages follow the same pattern with per-article dynamic metadata via `generateMetadata`.

## 7. Format/Template for Blog Posts

Blog posts follow a JSON-based content model:

- **Blog data** is stored as JSON in `src/data/blog.json` (an array of blog post objects)
- **Types** are defined in `src/types.ts` with a `BlogPost` interface
- **Views** are React components in `src/views/`
- Each blog post has: `id`, `slug`, `title`, `excerpt`, `content`, `date`, `author`, `image`, `category`

## 8. Relevant Config Files

| File | Path | Relevance |
|---|---|---|
| `package.json` | `package.json` | Dependencies, scripts |
| `next.config.ts` | `next.config.ts` | Next.js configuration (image domains) |
| `tsconfig.json` | `tsconfig.json` | TypeScript config |
| `robots.txt` | `public/robots.txt` | Points to `https://duniapancing.my.id/sitemap.xml` |
| `app/layout.tsx` | `app/layout.tsx` | Root layout with metadata template and OpenGraph |
| `src/config/env.ts` | `src/config/env.ts` | Store configuration (address, phone, etc.) |
| `src/types.ts` | `src/types.ts` | All TypeScript interfaces including `BlogPost` |
| `src/locales/id.json` | `src/locales/id.json` | Indonesian translations (incl. SEO strings) |
| `src/locales/en.json` | `src/locales/en.json` | English translations (incl. SEO strings) |
| `src/data/blog.json` | `src/data/blog.json` | Blog post data |
| `src/data/seed.json` | `src/data/seed.json` | Product seed data |
| `src/components/layout/Navbar.tsx` | `src/components/layout/Navbar.tsx` | Navigation bar with blog link |
| `src/components/layout/Footer.tsx` | `src/components/layout/Footer.tsx` | Footer with blog link |
| `.github/workflows/deploy.yml` | `.github/workflows/deploy.yml` | CI/CD deployment workflow |

## 9. SEO-Related Content

- **Root layout metadata** (`app/layout.tsx`): Title template (`%s | Dunia Pancing Palembang`), default title, description, OpenGraph tags
- **Per-page metadata**: Each page route exports `metadata: Metadata`
- **Blog metadata**: Blog listing and individual posts include SEO metadata with dynamic titles/descriptions
- **robots.txt**: Allows all crawlers

## 10. Summary

This is a **Next.js 15 e-commerce application** for a fishing equipment store based in Palembang, Indonesia. It previously had **no blog feature** — now it includes a blog system with a listing page, individual article pages, and one initial article about "SEO Optimisation untuk Toko Alat Pancing Online". The blog follows the project's existing patterns: App Router pages, locale JSON files, view components in `src/views/`, and a JSON data source in `src/data/blog.json`.
