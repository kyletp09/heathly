# Healthly

Healthly is a hackathon web app for scanning or searching products and reviewing ingredients with optional personalization from a user profile.

Project link: https://devpost.com/software/1210842/joins/IRCYL8FvotrzU_jjvu4IFg

## What Works

- Shared navigation across pages (`Home`, `Search`, `About`, auth button)
- Auth modal includes `Log in`, `Create account`, and `Forgot password` / reset flows
- Logged-out state shows `Sign in`; logged-in state shows `Profile`
- Login state persisted in `localStorage` via mock token fallback when backend is offline
- Landing page search and scan entry points
- Search queries route to `search.html?q=...`
- Barcode scan/upload plumbing is wired and can drive search/history flows
- Search page is wired to backend `GET /search` for query-based results (`all`, `food`, `beauty`) with static fallback cards
- Search page still supports local category/text filtering, ratings pills (⭐ user, ☀️ health, 🎯 match, 💲 price), and image fallback behavior
- Search page thumbnail fallbacks show correct emojis per category (💄 beauty, 🧴 skincare, 💊 supplements, 🧹 household, 🥗 food)
- About page "Where the money goes" breakdown (Retailer Sale, Affiliate Commission, Your Cut, Healthly Platform) is left-aligned
- Profile page includes preference sections (diet, allergies, skin type, skin concerns, conditions)
- Profile preferences save to local cache (`hl_prefs`) and POST to backend `/profile` when backend is running
- Recent search history rendering with per-item delete UI
- Skin type can be deselected by clicking the selected option again
- Product/search/profile match UI is hidden when logged out on search/product pages
- Flask backend with CORS and working endpoints: `/search`, `/product/<id>`, `/image-proxy`, `/auth/*`, `/profile`

## What Could Be Added

- Replace mock auth with real auth (password hashing + token/session validation)
- Add persistent database storage for users, profiles, and history
- Improve barcode mapping coverage beyond current known UPC/EAN mappings
- Add stricter validation and better error states for profile/auth forms
- Add richer product coverage (live pricing, better match logic, more reliable image sources)
- Add automated tests (auth flows, profile save, search filters, history behavior)
- Add deployment config and environment-based API URL handling

## Regression Checklist

- `python app.py` starts without errors.
- Backend smoke checks return `200`: `/search`, `/product/<id>`, `/auth/register`, `/auth/login`, `/auth/reset-password`, `/profile`.
- Logged out: nav button is `Sign in`; logged in: nav button is `Profile`.
- Landing page: Enter query in hero box and press Enter routes to `search.html?q=...`.
- Landing page: Barcode scan/upload flow can navigate to search query when a barcode is decoded.
- Search page: Opening `search.html?q=monster` fetches backend results and shows matching products.
- Search page: Category pills `All/Food/Beauty` fetch through backend; non-backend categories still filter visible cards locally.
- Search page: Profile match pills/filter controls are hidden while logged out and visible when logged in.
- Profile page: Save profile stores local `hl_prefs`.
- Profile page: With backend running, save triggers `POST /profile` successfully.
- Profile page: Recent searches render only for logged-in users; hover + `x` deletes an item.

## Run Locally

```bash
pip install -r requirements.txt
python app.py
```

Then open `healthly.html` in your browser.

## Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Flask + Flask-CORS
- APIs/data sources: Open Food Facts / Open Beauty Facts (plus local/mock fallback)
