# Design Decisions — Bulk Product Upload UI

This document captures the intentional design choices made while implementing the Bulk Product Upload UI. It is written to help reviewers and future maintainers understand why things were done a certain way and what trade‑offs were accepted.

## High-level goals
- Simple, pragmatic UI for listing, adding, and bulk-uploading products.
- Keep the frontend decoupled from a specific backend implementation while matching an agreed REST contract.
- Fast feedback during uploads (progress), and avoid unnecessary network trips where safe.

## Framework & Patterns
- Next.js (App Router) + React 19 + TypeScript.
  - App Router chosen for file-based routing, server/client component separation, and good DX with Next dev server.
- CSS Modules for scoped component styles — small, contained styling without a heavy global CSS framework.

## API contract & layering
- Single axios instance in `app/service/api.ts` centralizes base URL (`NEXT_PUBLIC_API_BASE`) and headers.
- Backend route shape expected by UI:
  - `GET /api/products` (paginated)
  - `GET /api/products/:id`
  - `POST /api/products/upload` — multipart with `files` and `product` (JSON string) for single-product multi-image uploads
  - `POST /api/products/bulk-upload` — multipart with `files` and `products` (JSON string) for bulk, one-image-per-product uploads
- Rationale: explicit multipart parts `files` + `product(s)` keep the upload payload unambiguous for the backend (Spring Boot Multipart handling is straightforward with these part names).

## Upload strategy
- Two upload flows implemented:
  1. Add Product page: uploads multiple images for a single product via one multipart request. Progress reported via axios `onUploadProgress` and displayed as an overlay on image previews.
  2. Bulk Upload page: user adds many product rows (one image each). The UI collects completed rows and sends a single multipart request with `files` and a `products` JSON array. Progress is reported globally.
- Trade-offs:
  - Single-request bulk upload is simple and keeps the backend contract compact, but progress is overall (not per-file). For per-file progress we would either issue one request per file or implement chunked uploads.
  - The UI currently skips incomplete rows on upload to avoid sending partial entries. A stricter validation flow could block upload until all rows are complete.

## Client-side caching & navigation
- To avoid an extra `GET /api/products/:id` when a user navigates from the product list to a detail page, the list stores the clicked product into `sessionStorage` (`product_{id}`) before navigation.
  - Benefit: instant navigation without an extra network call for client-side routing.
  - Drawbacks: `sessionStorage` is ad-hoc and limited — it doesn't handle cache invalidation or updates from other clients. For a larger app, a client cache (SWR/React Query/Context) would be preferable.
- Fallback behavior: direct page loads / refreshes still fetch product detail from the API.

## Error handling & UX
- Form validation: basic client-side checks (required name/description/price, at least one image). Error messages appear inline on the form.
- Upload progress: displayed to provide immediate feedback; success message and redirect/clear on completion.
- Disabled states: primary buttons are disabled during ongoing uploads to prevent repeated submissions.

## Image handling
- Previews are generated client-side with `FileReader` and base64 data URLs for quick feedback.
- Some `next/image` usage is marked `unoptimized` where needed (for dev workflow and cross-origin images). For production optimization, add `images.domains` in `next.config.js` and remove `unoptimized`.

## Styling choices
- CSS Modules keep styles local and predictable. Colors and spacing are intentionally simple to keep focus on functionality.

## Testing & verification
- Manual verification instructions are provided in `README_REVIEWER.md`. Key checks include:
  - Pagination and listing behavior
  - Detail navigation avoids extra fetch when navigating from the list
  - Add product shows upload overlay and completes
  - Bulk-upload collects rows and sends `files` + `products` in a single multipart request

## Security & CORS
- The reviewer must ensure the backend allows CORS from the frontend origin (e.g., `http://localhost:3000`) to enable browser requests.

## Next steps / Improvements
- Introduce a proper client cache (SWR or React Query) to replace ad‑hoc `sessionStorage` caching and provide cache invalidation.
- Per-file upload progress for the bulk flow (one request per file) or server-side support for chunked uploads.
- Add stronger field validation and per-row validation UI on the bulk uploader.
- Add automated end-to-end tests (Cypress / Playwright) to exercise the flows: list → detail, add product, bulk upload.
