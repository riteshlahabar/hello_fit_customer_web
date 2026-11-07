# HelloFit customer website

React + Next.js conversion of the client's static demo
(`../website design frontview/`).

A real project component — one of five folders, alongside `hello_fit_backend/` (the
NestJS API) and `hellofit_admin/` (React + Vite, not yet created). It is a **separate
front-end on the same API**, not something that lives inside the backend: a second
toolchain under the backend's `src/` breaks `nest build` on the TS6059 `rootDir` trap
recorded in the root `claude.md`.

Nothing here is wired to the API yet. The original demo is left untouched as the reference
to compare against.

Stack: Next.js 16.4.5 (App Router) · React 19.3 · TypeScript · Node 24.

```bash
npm install
npm run dev      # http://localhost:3000 — change the port when the API also runs locally
npm run build
npm run lint
```

**Port note:** the backend serves on 3000 too. Run this on 3001 (`next dev -p 3001`) when
both are up locally; on the VPS it runs under PM2 on 3001 behind Nginx at the apex domain,
with the API at `api.` and the admin panel as a static build at `admin.`.

To compare a page against the original demo:

```bash
cd "../website design frontview" && npx http-server -p 8899
```

## What is converted

**All 22 pages.** Build clean, lint clean, every route returns 200, and pages were compared
side by side against the demo served from `npx http-server` on port 8899.

| Route | Route | Route |
|---|---|---|
| `/` | `/find-a-trainer` | `/trainer-profile` |
| `/booking` | `/checkout` | `/booking-confirmed` |
| `/login` | `/dashboard` | `/profile` |
| `/my-bookings` | `/saved-trainers` | `/reviews` |
| `/help` | `/notifications` | `/membership-plans` |
| `/billing` | `/refunds` | `/support-tickets` |
| `/goals` | `/workout-history` | `/workout-plans` |
| `/session-details` | | |

The homepage was hand-built into components (`src/components/`, `src/data/home.ts`). The
other 21 were converted mechanically — see below — and each keeps its own `page.css` and
its original `<title>`.

## Known gap: six pages still have empty list sections

The demo renders some lists from JavaScript data arrays rather than markup, and the
converter strips `<script>`. Those containers currently come through empty:

| Page | Data in the demo | Container |
|---|---|---|
| ~~`/my-bookings`~~ | **done** — `src/data/bookings.ts` + `BookingList.tsx` | |
| `/saved-trainers` | `trainers` — 5 | `#grid` |
| `/reviews` | `reviews` — 6 | `#reviews` |
| `/workout-history` | `workouts` — 8 | — |
| `/dashboard` | `bookings` 2, `trainerData` 3 | — |
| `/workout-plans` | `sessions` 6, `plans` 3 | — |
| `/session-details` | `exercises` 6 | — |

Everything above and below those containers renders correctly. The fix is to lift each
array into `src/data/<slug>.ts` and render it in the page — which is also the shape these
need to be in when they become API calls, so it is work that counts twice.

## How the conversion was done

A one-off migration script (parse5-based) did the mechanical work. It has served its
purpose — **the files under `src/` are now the source of truth and are hand-maintained.**
Do not regenerate over them.

Two things made a regex pass impossible, and both are worth knowing:

1. **The demo HTML has unbalanced tags** — stray `</div>`, unclosed `<div>`. Browsers repair
   that with the HTML5 tree-construction algorithm; JSX just fails to parse. parse5
   implements that exact algorithm, so serialising its tree produces well-formed JSX.
2. **Every page's CSS is scoped** under `[data-hf-page="<slug>"]`. The demo pages define
   **15 different `:root` blocks** and redefine `.btn`, `.brand`, `.card`, `.topbar`
   differently per page. Unscoped, whichever stylesheet loaded last would break every other
   page.

**The attribute is `data-hf-page`, not `data-page`.** The demo's own dashboard sidebar uses
`data-page="overview"` on its nav buttons, so a bare `[data-page]` rule in `globals.css`
matched those too and made every nav button `100vh` tall. Caught by comparing against the
demo in the browser; don't rename it back.

**The CSS is otherwise kept verbatim**, so the output is pixel-faithful and any visual
difference is a real bug, not a restyle. Pages use the demo's own class names. Do not
rewrite these into Tailwind utilities — the design is not signed off, and the demo is the
thing being approved.

Tailwind is installed (it ships with `create-next-app`) but **unused**, and deliberately not
imported into `globals.css`: its preflight reset would fight the demo's styles. It is there
for whatever gets built after sign-off.

**What changed, and why:**

| Demo | Here |
|---|---|
| Logo as a 293 KB base64 blob, twice per page | `public/hellofit-logo.png`, once |
| CSS inline in all 24 files | A tiny global reset + one scoped `page.css` per route |
| `showToast()` global | `ToastProvider` + `useToast()` |
| `onclick="showToast(…)"` | React `onClick` handlers |
| Other inline `on*` handlers | Dropped — see "empty list sections" above |
| `<a href="hellofit-x.html">` | `<Link href="/x">`, so navigation is client-side |
| Per-file `<title>` | Per-route `metadata` export |
| "All Pages" demo dropdown | Dropped — a demo-navigation device, not product UI |

Each file is ~640 KB in the demo and the whole set is 9 MB; 93% of that was the duplicated
logo. The whole React source is 653 KB including the logo.

The hand-built homepage additionally uses `next/image` and keeps its content in
`src/data/home.ts`.

## The toasts are deliberate

Buttons for screens that do not exist yet ("Trainer profile page is part of the next design
stage") still show the demo's placeholder toast. They mark exactly where a route or an API
call goes, and they keep the gaps visible during review. Replace them as each page lands,
rather than hiding the controls.

## Known gaps

- **Fonts load via `<link>`, not `next/font`.** `globals.css` names the families directly
  (`'Anton'`, `'Poppins'`), so `next/font` would mean rewriting every `font-family` rule.
  Worth doing after design sign-off, not before. The ESLint rule for this is suppressed with
  the reason inline in `layout.tsx`.
- **Photos hotlink to Unsplash.** Fine for a prototype; before launch they become real
  provider photos on the project's own S3 + CDN.
- All copy, trainers, ratings and prices are prototype placeholders.
- `create-next-app` initialised a **git repo inside this folder**. The project root is not a
  repo, so this is currently an island. Fold it in if the root ever gets `git init`.

## Next

1. **Finish the six remaining list sections** (table above) — same pattern as
   `/my-bookings`: lift the demo's array into `src/data/<slug>.ts`, render it in a client
   component beside `src/components/`.
2. **Wire the pages that have a backend today** — catalog, booking, payment, reviews and
   sessions. Profile/address, memberships, coupons, support tickets, saved trainers,
   notifications and workout plans have **no endpoints at all** yet; those pages stay on
   sample data until the API catches up.
3. **Before wiring booking or trainer-profile**, settle the open question in the root
   `claude.md`: **marketplace or single institute?** The demo is a marketplace — customers
   browse and pick a trainer. The backend implements the institute model, where a scoring
   engine assigns the teacher and offers cascade. Converting the markup was safe; connecting
   it is not, and the answer decides whether `assignment/` and `catalog/` get rewritten.
