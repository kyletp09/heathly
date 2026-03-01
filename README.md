# Healthly

> A community dedicated to eradicating toxicity from our daily lives — one ingredient at a time.

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


demo: scanning hackathon food
-We going to remove the search button and replace it with a search bar