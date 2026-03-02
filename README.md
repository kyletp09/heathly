# Healthly

> A community dedicated to eradicating toxicity from our daily lives — one ingredient at a time.

> https://devpost.com/software/1210842/joins/IRCYL8FvotrzU_jjvu4IFg

---

## What is Healthly?

Healthly is a consumable ingredient rating platform that lets users scan or search any product — food, makeup, skincare, supplements, household goods — and instantly understand what's inside it and whether it's right for *them*.

---

## Core Features

### Barcode & Camera Scanning
- Point your camera at any product barcode for an instant lookup
- Uses the browser's `BarcodeDetector` API (or a JS library fallback) via `getUserMedia`
- Decoded barcode → passed directly to the `/product/<id>` backend endpoint
- Works on mobile and desktop (any device with a camera)

### Ingredient Analysis
- Breaks down every ingredient in a product
- Covers all consumable categories: food, beauty, skincare, supplements, and more
- Automatically categorizes the product type (food vs. beauty vs. household, etc.)

### Personalized Health Profiles
- Users input their health concerns, allergies, dietary restrictions, and skin sensitivities
- Every product is scored against the user's personal profile
- Recommendations and warnings are tailored — not generic

### Triple Rating System
Each product displays three distinct ratings:
| Rating | Source | What It Means |
|---|---|---|
| ⭐ User Rating | Community | Real reviews from verified purchasers |
| ☣️ Toxicity Rating | Professionals | Expert-assessed safety score based on ingredients |
| 🎯 Profile Match | AI + User Data | How well the product suits *your* health profile (vegetarian/dietary restrictions/allergies, oily/dry skin, etc.)|

---

## Reviews & Trust

- **Verified Purchase Affiliate Links** — when a user rates a product after a verified purchase, we surface an affiliate link for seamless reordering
- **AI Image Detection** — verifies doctor/professional certifications uploaded by expert reviewers, and authenticates review images to prevent fake submissions
- **3-Month Follow-Up** — after a product recommendation, Healthly automatically sends a survey to check in: did it work for you? This closes the feedback loop and improves future recommendations

---

## Monetization
- Affiliate commissions on verified-purchase product links
- Promoted placements for clean/vetted brands
- Future: premium profile features and professional reviewer subscriptions

---

## Built at HOTH 13

---

## Team & Task Breakdown

### Patrick — CS, Frontend Lead
**Files:** `healthly.html`, `search.html`, `product.html`, `style.css`
- [ ] Wire up search page — on submit, call Kyle's `/search` API and render product cards
- [ ] Wire up profile page — collect form data and POST to Kyle's `/profile` endpoint
- [ ] Make product cards on search results page link to `product.html`
- [ ] Connect product page to Kyle's `/product/<id>` endpoint (swap in real data)
- [ ] Integrate Evelyn's `profile.html` and Dung's `product-card.html` into the main pages
- [ ] Review and merge Evelyn + Dung's HTML/CSS work
- [ ] **Camera / Barcode Scanning** — add a "Scan" button on `search.html` that:
  1. Opens the device camera via `navigator.mediaDevices.getUserMedia({ video: true })`
  2. Detects barcodes using `BarcodeDetector` (with a `quagga.js` / `zxing-js` fallback for browsers that don't support it)
  3. On successful decode, navigates to `product.html?id=<barcode>&category=food` (or beauty)

---

### Kyle — CS, Python Backend
**Files:** `app.py` (create this), any helper modules
- [ ] Set up Flask server (`app.py`) with CORS enabled
- [ ] `GET /search?q=<query>` — hit Open Food Facts API or mock data, return list of products as JSON
- [ ] `GET /product/<id>` — return full product details (name, brand, ingredients, ratings)
- [ ] `POST /profile` — accept and store user health profile (dict is fine for hackathon)
- [ ] `POST /analyze` — send ingredient list to Claude API, get back toxicity score + flagged ingredients
- [ ] Return profile match % based on user profile vs product ingredients

---

### Evelyn — Data Sci, Frontend (Beginner)
**File:** `product-card.html` ← working with Dung (leaving in ~1 hour, prioritize these first)
- [ ] **PRIORITY:** Style `.checkbox-label` so it looks like a pill chip (border, padding, hover)
- [ ] **PRIORITY:** Make checked checkboxes glow green using `.checkbox-label:has(input:checked)`
- [ ] **PRIORITY:** Style `.radio-label` similarly (same approach as checkbox)
- [ ] Add `transition` so hover animations are smooth
- [ ] Before leaving: hand off any unfinished styling notes to Dung

---

### Dung — Data Sci, Frontend (Beginner)
**Files:** `product-card.html`, `product.html`
- [ ] Tweak colors and fonts on the product cards to match the site vibe (use CSS variables from `style.css`)
- [ ] In `product.html`, add a Wikipedia link next to each ingredient name in the ingredient list
  - Format: `<a href="https://en.wikipedia.org/wiki/[Ingredient_Name]" target="_blank">Learn more ↗</a>`
  - Add it inside each `.ing-row` or `.ing-detail` block
- [ ] Style the Wikipedia links — small, muted color (`var(--muted)`), underline on hover
- [ ] Add a hover effect to `.product-card` (lift with `transform: translateY(-4px)`)
- [ ] Change card border to subtle green on hover (`rgba(0,229,160,0.2)`)
- [ ] Add `transition` to `.product-card` for smooth animation
- [ ] After Evelyn leaves: take over her checkbox/radio styling if unfinished

---

## Pages

| File             | URL / Purpose |
|------------------|---------------|
| `healthly.html`  | Landing page — hero scan card, features carousel, reviews, stats |
| `search.html`    | Product search results — accepts `?q=` and `?dupes=1` query params |
| `product.html`   | Individual product detail — ingredient breakdown, ratings |
| `profile.html`   | User health profile — dietary prefs, allergies, skin type, conditions, scan history |
| `about.html`     | Business model — triple rating system, how Healthly works |

### Shared Modules
| File       | Purpose |
|------------|---------|
| `auth.js`  | Auth modal (Log in / Create account), nav state (Sign in ↔ Profile), scan history |
| `style.css`| Design tokens, shared nav, buttons, cards, footer |
| `app.py`   | Flask backend — search, product detail, auth, profile endpoints |

---

## Current Mock Products (available when API is offline)

| ID              | Name                                    | Category |
|-----------------|-----------------------------------------|----------|
| `737628064502`  | Kind Dark Chocolate Nuts & Sea Salt Bar | food     |
| `011110038364`  | Honey Nut Cheerios                      | food     |
| `granola001`    | Nature Valley Oats 'n Honey Granola Bar | food     |
| `beauty001`     | CeraVe Moisturizing Cream               | beauty   |

Live product data comes from [Open Food Facts](https://world.openfoodfacts.org) and [Open Beauty Facts](https://world.openbeautyfacts.org) APIs.

---

## Roadmap

### v1 — HOTH 13 MVP (current)
- [x] Landing hero with scan card (text search + image upload + live camera)
- [x] Product search via Open Food Facts / Open Beauty Facts (with mock fallback)
- [x] Individual product pages with ingredient list
- [x] Auth modal — Log in / Create account, localStorage persistence
- [x] User health profile — dietary, allergies, skin type, conditions
- [x] Scan history shown on landing page (logged-in users only)
- [x] Flask backend — mock auth, profile storage, external API proxy
- [x] Barcode scanning via BarcodeDetector API (camera + file upload)
- [x] "Find dupes" toggle on search

### v2 — Post-Hackathon
- [ ] Real password hashing (bcrypt) + JWT tokens — replace mock auth
- [ ] Password reset / forgot password email flow
- [ ] Persistent database (SQLite or Postgres) — users, profiles, scan history
- [ ] AI-powered ingredient flagging via Claude API (flag harmful chemicals against user profile)
- [ ] Toxicity score algorithm (weighted by ingredient risk level + user sensitivities)
- [ ] Community product ratings stored and averaged in DB
- [ ] "Find dupes" — surface cheaper alternatives with similar or better ingredient profiles
- [ ] Wikipedia links on ingredient detail rows

### v3 — Growth
- [ ] Progressive Web App (PWA) — installable, offline-capable
- [ ] Mobile camera scanning on all browsers (zxing-js fallback for Firefox/Safari)
- [ ] Community reviews and professional reviewer certification (AI image verification)
- [ ] 3-month follow-up surveys after product recommendations
- [ ] Affiliate link integration for verified purchases
- [ ] Brand partnership API for verified product data
- [ ] Browser extension for in-store and online shopping integration
- [ ] Subscription tier — advanced toxicity reports, trend alerts, priority scan

---

## Running Locally

```bash
# Install Python dependencies
pip install flask flask-cors requests

# Start backend
python app.py
# → http://localhost:5001

# Frontend — open healthly.html directly in browser
# (no build step needed)
```

> **Note:** Camera barcode scanning requires HTTPS in production. On `localhost` it works without HTTPS.
> **Note:** `BarcodeDetector` API is Chromium-only (Chrome, Edge). File upload fallback works everywhere.

---

Next prompt 2pm:

You have access to this project’s files. Implement the TODO below with minimal, clean changes. Keep styles consistent with existing design tokens in style.css. Do not introduce frameworks. 

Goal: Distinguish “quick scan/search” on landing page (no account) from “personalized account”. The top-right header button must be “Sign in” when logged out, and “Profile” (or an avatar + Profile) when logged in.

TODO Implementation:

1) Header auth entry point
- Update the shared nav header across pages so the upper-right button says “Sign in” (logged out).
- Clicking “Sign in” opens a popup modal with:
  - Tabs or two clear options: “Log in” and “Create account”
  - Email + password fields for both flows
  - Primary button: “Log in” or “Create account”
- If user is logged in, replace “Sign in” with “Profile” (or avatar + Profile) that links to profile.html.
- Persist login state in localStorage (ok for hackathon). Store at least: auth_token (mock ok), user_email, and optionally user_profile.
- Provide a “Log out” action in profile.html or in the modal when logged in (simple is fine).

2) Account creation and profile storage
- Creating an account should store user email and password (hackathon-level mock acceptable, but do NOT store plaintext password in localStorage; store only a mock token locally).
- On successful create or login:
  - Close modal
  - Update header state immediately
- Use profile.html form fields as “preferences”.
- Wire profile.html “Save” to POST preferences to backend endpoint /profile.
- On successful save, cache preferences in localStorage too (so UI can use it even if backend is mocked).

3) Landing page: move search into healthly.html
- Remove the banner “Search” button/link from the header nav (but keep Search as a nav page link if it already exists and is useful).
- Add a prominent search bar to healthly.html similar to the one in search.html:
  - Search by product name, brand, or ingredient
  - A submit action should navigate to search.html with the query in the URL (example: search.html?q=cerave)
- Add a “Scan barcode / Upload” button next to the search bar:
  - When clicked, attempt to open the device camera and scan a barcode (BarcodeDetector first).
  - If BarcodeDetector is not supported, fall back to file upload input (accept image).
  - For this iteration, it is OK if scan is stubbed and just logs decoded barcode, but implement the UI and plumbing.

4) Search history in landing page
- On healthly.html, show a small “Recent scans” or “History” section if logged in.
- If logged out, hide that section entirely (do not show an empty placeholder).
- History source: localStorage list (append items when a search is run or barcode decoded).
- Each history item should be clickable and take the user back to search.html or product.html with relevant params.

5) Backend
- Edit app.py (Flask) with CORS enabled.
- Keep it simple and hackathon-ready. No database required.
- Ensure requirements.txt contains needed packages (flask, flask-cors, requests already present).

Acceptance criteria:
- “Sign in” button exists in top-right nav and opens modal on all pages.
- Create account/login updates UI state without refresh.
- Logged-in state shows “Profile” and enables History section on healthly.html.
- Landing page has search bar + scan/upload button.
- Searching from landing page routes to search.html with query prefilled.
- Profile save posts to backend and caches locally.

Make sure all pages still load with no console errors. Keep CSS changes minimal and consistent with style.css tokens.

Here's a full pre-push test checklist based on everything built so far:

landing:
- add camera icon button to open camera for barcode scanning. requests for webcam access and works

- move recent scans up, right below search bar

- no password verification. how to enable?

- provide an md with all the pages/current products available and a roadmap of the website


Auth flow
 Open healthly.html — nav shows "Sign in" (green)
 Click "Sign in" → modal opens with Log in / Create account tabs
 Create account: bad email → error message shows. Password < 6 chars → error. Passwords don't match → error
 Create account: valid email + matching 6+ char passwords → modal closes, nav shows "Profile"
 Refresh page → still shows "Profile" (localStorage persisted)
 Log in tab: enter same email, any password → logs in
 Navigate to about.html, search.html, profile.html — all show "Profile" in nav when logged in
 Go to profile.html → click Log out → redirects to healthly.html, nav shows "Sign in" again
Landing page search card
 Scan card shows textarea with placeholder "Paste ingredients or search"
 Type something → press Enter → navigates to search.html?q=...
 Shift+Enter inserts a newline instead of submitting
 Find dupes toggle clicks and visually toggles (green when on)
 With dupes on → URL includes &dupes=1
 Click Image button → file picker opens (or camera modal in Chrome/Edge)
 Upload a barcode image → either detects and navigates, or shows "No barcode detected" alert
Search page
 Navigate directly to search.html?q=cerave → input pre-filled, results filtered to CeraVe
 search.html?q=kind → KIND bar shows
 Empty query (search.html) → all 12 products visible
History
 While logged out on healthly.html → no "Recent Scans" section visible
 Log in, do a search from the landing page → go back to healthly.html → "Recent Scans" section appears with a chip
 Chip is clickable and goes back to the search
 On profile.html while logged in → Recent Searches card appears at top of form
 If no history yet → shows "No searches yet" message
Profile save
Without backend (file://):

 Check some boxes → click Save Profile → → shows "Saved locally (backend offline)"
 Refresh → checkboxes restore from localStorage
With backend running (python app.py):

 Same save → shows "Profile saved!" in green
 Open DevTools Network tab → confirm POST to localhost:5001/profile returned 200
Console errors
 Open DevTools (F12) on each page — zero red errors in console
 healthly.html, search.html, profile.html, about.html — all load clean
Quick console reset between tests

localStorage.clear(); location.reload();

Next:
no more icons use images of item from internet