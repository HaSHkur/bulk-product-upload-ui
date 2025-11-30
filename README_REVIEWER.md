# Reviewer Guide — bulk-product-upload-ui

This document explains how to run and test the frontend UI for the Bulk Product Upload project.

Repository root: `bulk-product-upload-ui`

## Quick summary
- Frontend: Next.js App Router (`app/`), TypeScript
- Start dev server: `npm run dev` (defaults to `http://localhost:3000`)
- The UI expects backend API base at `NEXT_PUBLIC_API_BASE` (do not include `/api` — the frontend appends `/api`).
- Key features to verify:
  - Product listing (paginated, 20 per page)
  - Add product with multi-image upload and live upload progress
  - Product detail page reuses product data when navigated from the list (no extra network call)

---

## Prerequisites
- Node.js v18+ and npm
- A running backend exposing the contract described below
- Browser (Chrome/Firefox) for manual verification

## Backend contract
The frontend expects the backend to expose REST endpoints under `{API_BASE}/api`:

- `GET {API_BASE}/api/products?page=<n>&pageSize=<n>` — list paginated products
- `GET {API_BASE}/api/products/{id}` — product detail
- `POST {API_BASE}/api/products/upload` — create product with images
  - multipart/form-data parts:
    - `files` (repeatable field for each image)
    - `product` — JSON string with `{ "name": "...", "description": "...", "price": 12.34 }`

CORS: allow requests from `http://localhost:3000` (or the origin where the frontend runs).

Example Spring controller signature expected by the UI:
```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public String uploadProduct(@RequestPart("files") MultipartFile[] files,
                            @RequestPart("product") String productJson) throws IOException { ... }
```

## Environment
Create a file named `.env.local` in the project root (this is ignored by git) and set:

```bash
# point at your backend host (do NOT include /api)
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

After editing `.env.local`, restart the dev server so Next picks up the change.

## Install & Run (development)

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

Open `http://localhost:3000` (Next dev default).

## Build & Run (production)

1. Build:

```bash
npm run build
```

2. Start:

```bash
npm start
```

Make sure `NEXT_PUBLIC_API_BASE` is set in the environment used by `npm start`.

## Manual verification checklist

Follow these steps in the browser while watching DevTools → Network for API calls.

1. Landing page (Products)
   - Visit `http://localhost:3000`
   - Confirm the product grid appears and pagination works.
   - Verify a request to `GET {API_BASE}/api/products?page=1&pageSize=20` succeeded.

2. Product Detail (client-side navigation)
   - Click a product card on the landing page.
   - Expected: product detail opens and the UI re-uses the product data stored on click (no `GET /api/products/{id}` request should be emitted on that navigation). Use the Network panel to confirm.
   - If you hard-refresh or open the detail URL directly, the page will fetch the product from `GET /api/products/{id}` as a fallback.

3. Add Product (multi-image upload + progress)
   - Go to `http://localhost:3000/add`.
   - Fill out `Product Name`, `Description`, and `Price`.
   - Use the file input to select one or more images.
   - Click `Add Product`.
   - Expected behaviors:
     - A multipart `POST {API_BASE}/api/products/upload` occurs.
     - While uploading, each preview shows an overlay with a progress bar and percentage (this reflects overall upload progress).
     - On success, a success message appears and the app navigates back to `/`.

Example `curl` to test backend upload separately (replace file paths and API base):
```bash
curl -v \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F 'product={"name":"Example","description":"desc","price":12.34}' \
  http://localhost:8080/api/products/upload
```

## Files & code notes (what changed / where to look)
- API / upload progress:
  - `app/service/api.ts`
    - `createProduct(payload, onProgress?)` now accepts an optional `onProgress` callback and reports upload percent via axios `onUploadProgress`.
- Add product UI:
  - `app/add/page.tsx` — tracks `uploadProgress` and renders overlay progress on image previews while uploading.
  - `app/components/AddProduct.module.css` — styles for `.uploadOverlay`, `.progressBar`, etc.
- Product navigation cache:
  - `app/page.tsx` — stores clicked product into `sessionStorage` as `product_{id}` before navigating.
  - `app/products/[id]/page.tsx` — reads `sessionStorage` before making a network call; falls back to fetch when not present.

## Smoke test checklist (for reviewer)
- [ ] `npm install` completes without errors
- [ ] `npm run dev` serves `http://localhost:3000`
- [ ] Landing page loads products and pagination is functional
- [ ] Clicking a product from the list does NOT trigger `GET /api/products/{id}` (verify Network panel)
- [ ] Adding a product with images shows a progress overlay and completes successfully
- [ ] Direct load / refresh of a product detail URL issues `GET /api/products/{id}` and renders the product
- [ ] No CORS errors in console for API calls

## Troubleshooting
- CORS errors: configure backend to allow `http://localhost:3000`.
- Upload progress remains 0 or invisible:
  - Browser progress events are more obvious with larger files or slower networks.
  - If your local proxy or server buffers the full body before forwarding, the browser-side progress may be suppressed. Test direct backend endpoint with curl to confirm server behavior.
- Images not shown after upload:
  - Confirm the backend returns accessible image URLs in `product.imageUrls`.
  - If you want Next.js to optimize external images, add the remote host to `next.config.js` under `images.domains`.

## Optional next steps (not required for review)
- Implement per-file uploads (one HTTP request per image) to show independent per-image progress.
- Replace `sessionStorage` caching with a proper client-side cache using SWR or React Query for more robust data reuse across pages.


