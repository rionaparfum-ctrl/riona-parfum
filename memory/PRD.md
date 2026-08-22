# RIONA PARFUM — PRD

## Original Problem Statement
Premium luxury perfume e-commerce platform "RIONA PARFUM". Tech: React (Vite), Tailwind, React Router, React Icons, i18next (AZ/EN/RU), Firebase (Auth + Firestore). Cloudinary for image uploads (NO Firebase Storage — to avoid billing). Netlify-ready SPA. Black (#0A0A0A) & gold (#D4AF37) luxury theme, Playfair Display + Inter, glassmorphism, Framer Motion. All data real from Firebase/Cloudinary — no mocks.

## Architecture
- Frontend: Vite + React 18 SPA on port 3000 (supervisor runs `yarn start` => vite). Build outDir `build`.
- Backend: Firebase (Auth Email/Password + Firestore). Direct browser SDK calls. Project `rionaparfumery`.
- Images: Cloudinary unsigned upload (cloud `dhz3lvda`, preset `riona_unsigned`) => secure_url stored in Firestore `imageUrl`.
- Deploy: Netlify (`netlify.toml` + `public/_redirects` for SPA). FastAPI/Mongo template backend UNUSED.

## Firestore Collections
- products: name, brand, gender, family, season, characters[], moods[], notes{top,middle,base}, variants[{label,price,stock}], imageUrl, featured, views, viewDay, viewToday, createdAt
- users: name, email, role (admin|user), points, createdAt
- orders: uid, customerName, items[], subtotal, bundleDiscount, promoCode, promoDiscount, tester, giftWrap, giftMessage, total, status, createdAt
- coupons: code, type (percent|fixed), value, active, createdAt

## Firestore Rules (set by user)
products/coupons: public read, auth write. orders: anyone create, auth read/update. users: public read, auth write.

## User Personas
- Shopper: browses, uses quiz/gift finder, builds cart, orders via WhatsApp, earns cashback.
- Admin: manages products (CRUD + Cloudinary upload), coupons, orders, sees dashboard.

## Implemented (2026-06 / verified 100% by testing agent)
- Multilingual UI (AZ/EN/RU) with language switcher
- Hero, Featured (up to 8), Mood chips on Home (removed Fast Delivery/Guaranteed cards per request)
- Catalog with filters: gender, family, character (Tünd/Şirin/Təravətli), season (incl. Sərin), mood + text search
- Product detail: fragrance pyramid, volume/gram builder (dynamic price), qty, FOMO stock badge + daily views
- Quick View modal
- Scent Quiz (AI-style rule-based): gender/character/mood => recommendations
- Gift Finder: gender + budget => recommendations
- Wishlist (localStorage) + page + header badge
- Cart: bundle 15% (3+ distinct), promo codes (Firestore coupons), gift wrap +3 ₼ + message, free tester (>50 ₼), customer name
- WhatsApp order (wa.me/9940513898998) with full details; creates Firestore order
- Cashback 5% for logged-in users; Account page with points, order history, one-click Re-order
- Auth (Firebase Email/Password) register/login
- Admin panel (protected /admin): Dashboard stats, Products CRUD + Cloudinary upload + variant/mood/character builder, Coupons CRUD + toggle, Orders list + status
- Footer/contact: "Naxçıvan, Azərbaycan"
- 8 sample products seeded

## Backlog / Future (P2)
- Route-based code splitting (single JS chunk ~980kB)
- Localize product family/season/character tag values per language (currently AZ values shown across langs)
- Real-time inventory decrement on order
- Admin: users management page, order search/export

## Credentials
Admin: admin@rionaparfum.com / Riona2026! (role=admin). See /app/memory/test_credentials.md
