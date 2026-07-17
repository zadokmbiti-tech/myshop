# MyShop (MargStitch Crochet)

A lightweight e-commerce site for a solo handmade-goods shop (knits & crochet), built to run entirely on Vercel's free tier: a static storefront, a small FastAPI backend, and Vercel Blob for image storage — no user accounts, no payment gateway, checkout happens over WhatsApp.

It lets the shop owner list products with photos and categories, and lets customers browse, build a cart, and send the order straight to the owner's WhatsApp with a formatted order message and item photos.

## What it does

**Storefront**
Home page with featured products, a full shop page filterable by category (men / women / children), and individual product pages with image galleries, descriptions, and sale pricing.

**Cart & Checkout**
Client-side cart stored in `localStorage` (no backend cart/session needed). Checkout doesn't charge a card — it builds a message summarizing items, quantities, and totals and opens WhatsApp with it pre-filled, so the owner closes the sale in a normal chat.

**Admin**
A single shared-password gate for admin management — appropriate for a one-person shop rather than a multi-user system. Lets the owner create/edit/delete products, upload and reorder product images, mark items "new" or "on sale," and set per-product sale pricing.

**Image uploads**
Product photos are uploaded as base64 from the browser to a Vercel Serverless Function, which stores them in Vercel Blob and returns a public URL that gets attached to the product record.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Static HTML/CSS/vanilla JS (no framework/build step) |
| Backend API | FastAPI (Python), deployed as a Vercel Serverless Function |
| Database | PostgreSQL, accessed via `psycopg2` (raw SQL, no ORM) |
| Image storage | Vercel Blob (`@vercel/blob`) |
| Checkout | WhatsApp deep link (`api.whatsapp.com/send`) — no payment processor |
| Hosting | Vercel (frontend as static site, backend via `vercel.json` rewrite to `/api/index`) |

## Project structure

```
myshop/
├── main.py               # FastAPI app — all routes (products, admin CRUD, images)
├── api/
│   └── index.py           # Vercel entrypoint — imports `app` from main.py
├── requirements.txt        # fastapi, uvicorn, psycopg2-binary, python-dotenv, pydantic, python-multipart
├── vercel.json             # rewrites all requests to /api/index (backend deploy)
├── uploads/                 # local scratch folder (gitignored)
├── .env                     # DATABASE_URL, ADMIN_SECRET (not committed)
│
└── myshop-web/               # static frontend, deployed separately on Vercel
    ├── index.html            # home page — featured products
    ├── shop.html              # full catalog, filterable by category
    ├── product.html            # single product detail + gallery
    ├── cart.html                # cart view + WhatsApp checkout
    ├── contact.html              # contact / social links
    ├── admin.html                 # admin login gate
    ├── manage.html                 # product create/edit/delete + image upload UI
    ├── config.js                    # API_URL, WhatsApp number, contact/social links
    ├── layout.js                     # shared header/nav, site branding
    ├── cart.js                        # localStorage cart logic + WhatsApp message builder
    ├── admin-auth.js                   # shared-secret admin session handling
    ├── styles.css                       # site styling
    ├── images/                           # static site images
    └── api/
        └── upload.js                      # Vercel function: receives base64 image, stores in Blob
```

## Data model (high level)

- **products** — name, description, price, sale_price (optional), category, is_new flag
- **product_images** — one-to-many per product, with `is_primary` and `sort_order` for gallery ordering

All product reads join in the primary image (or full gallery, for the product detail page). There are no `users`, `orders`, or `payments` tables — orders live in WhatsApp chat history, not the database.

## Getting started

**Requirements:** Python 3.11+, a PostgreSQL database, Node.js (for the frontend's Vercel Blob upload function)

```bash
# --- backend ---
cd myshop
python -m venv venv
venv\Scripts\activate        # or `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt

# set environment variables in .env
# DATABASE_URL   — Postgres connection string
# ADMIN_SECRET   — shared password required on all /admin/* routes

uvicorn main:app --reload    # http://localhost:8000
```

```bash
# --- frontend ---
cd myshop-web
npm install                   # installs @vercel/blob for api/upload.js

# set environment variables in .env.local
# ADMIN_SECRET          — same value as backend's ADMIN_SECRET
# BLOB_READ_WRITE_TOKEN — from Vercel Blob store settings
# BLOB_STORE_ID         — from Vercel Blob store settings

# update config.js with your deployed API_URL and WHATSAPP_NUMBER
# serve the folder with any static server, or `vercel dev` to also run api/upload.js locally
```

The frontend and backend deploy as two separate Vercel projects — `vercel.json` in the backend routes every request to the FastAPI app; the frontend is served as a static site with its own `api/upload.js` serverless function for image uploads.

## API endpoints

All routes are served by `main.py`, unauthenticated unless noted:

- `GET /` — health check
- `GET /products?category=` — list products, optional category filter
- `GET /products/{product_id}` — single product with full image gallery
- `POST /admin/products` 🔒 — create product
- `PUT /admin/products/{product_id}` 🔒 — update product
- `DELETE /admin/products/{product_id}` 🔒 — delete product
- `POST /admin/products/{product_id}/images` 🔒 — add an image
- `PUT /admin/products/{product_id}/image` 🔒 — replace all images with one
- `POST /api/upload` 🔒 *(frontend function, not FastAPI)* — upload a file to Vercel Blob, returns its public URL

🔒 = requires `X-Admin-Secret` header matching `ADMIN_SECRET`.

## Status

This is a working MVP for a single-owner shop: catalog browsing, category filtering, cart, WhatsApp checkout, and full admin product/image management are implemented end-to-end. There's no payment gateway, no order history/database, and no multi-admin accounts by design — natural next additions would be M-Pesa STK Push checkout and a persisted orders table if the shop outgrows the WhatsApp workflow.

## License

MIT
