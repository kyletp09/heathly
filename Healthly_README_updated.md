# Healthly

> A community dedicated to eradicating toxicity from our daily lives ---
> one ingredient at a time.

Devpost:
https://devpost.com/software/1210842/joins/IRCYL8FvotrzU_jjvu4IFg

------------------------------------------------------------------------

## 🌿 What is Healthly?

Healthly is a personalized ingredient intelligence platform.

Users can: - Search or scan products - Understand ingredient-level
toxicity - Get profile-matched recommendations - Earn money for
verified, high-quality reviews

------------------------------------------------------------------------

# ✅ Current Implementation Status

## Frontend (HTML/CSS)

### 🏠 Landing Page --- `healthly.html`

-   Hero section with product scan preview
-   Features carousel
-   "How it works" flow
-   Recommendation comparison UI
-   CTA section
-   Fully styled using shared design system

### 🔎 Search Page --- `search.html`

-   Search input UI
-   Category filter pills (Food, Beauty, Skincare, etc.)
-   Sidebar filters (toxicity, profile match, etc.)
-   Product grid layout
-   Styled product cards
-   Client-side filtering (mock data)

### 📦 Product Page --- `product.html`

-   Product header
-   Triple rating system UI:
    -   ⭐ User rating
    -   ☣️ Toxicity score
    -   🎯 Profile match
-   Ingredient expandable rows
-   Flagged ingredient section
-   Alternative product grid
-   Reviews section UI

### 🧩 Product Card Component --- `product-card.html`

-   Reusable product card layout
-   Rating pills
-   Match bar
-   "Avoid" flag styling
-   Grid layout preview

### 👤 Profile Page --- `profile.html`

-   Dietary restriction section
-   Allergy section
-   Skin type radio group
-   Text input fields
-   Form layout structured and styled
-   Ready for backend connection

### 🎨 Shared Design System --- `style.css`

-   Global tokens (colors, spacing, radius, etc.)
-   Button system
-   Badge system
-   Ingredient tag system
-   Card base styles
-   Typography system

------------------------------------------------------------------------

## 🖥 Backend (Scaffolded)

### Environment

-   Flask
-   Flask-CORS
-   Requests

### Planned Endpoints

-   `GET /search?q=<query>`
-   `GET /product/<id>`
-   `POST /profile`
-   `POST /analyze`

Backend logic not yet fully implemented.

------------------------------------------------------------------------

# 🚧 In Progress

-   Connect search page to `/search` endpoint
-   Replace mock data with live backend results
-   Connect product page to `/product/<id>`
-   Wire profile form to `POST /profile`
-   Dynamic rendering of ingredient lists
-   Dynamic rating injection
-   Implement barcode scanning via camera

------------------------------------------------------------------------

# 🗺 Roadmap

## Phase 1 --- Functional MVP

-   Live search with Open Food Facts API
-   Product detail page fully dynamic
-   Toxicity scoring (via LLM API and lookup?)
-   Profile match algorithm
-   Verified purchase tagging
-   Basic review submission

## Phase 2 --- Trust & Intelligence

-   AI ingredient explanation summaries
-   Professional reviewer verification
-   AI image authenticity detection
-   Review credibility scoring

## Phase 3 --- Monetization

-   Affiliate link integration
-   Commission split logic
-   User payout tracking
-   Brand promotion tier

## Phase 4 --- Advanced Personalization

-   Long-term health feedback loop
-   3-month follow-up surveys
-   Reinforcement-based recommendation engine
-   AI-driven product substitution suggestions

------------------------------------------------------------------------

# 💡 New Ideas & Future Experiments

-   Ingredient similarity clustering
-   "Safer alternative" automatic swap engine
-   Scan history timeline
-   Toxicity trend tracking
-   Clean brand certification badge
-   Social leaderboard
-   Chrome extension for ingredient scanning
-   Mobile app version
-   Doctor dashboard portal
-   Regulatory database integration
