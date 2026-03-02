import uuid
import requests
from urllib.parse import urlparse
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# In-memory stores (fine for hackathon)
profiles = {}
users = {}  # email -> hashed token (mock)

ALLOWED_IMAGE_HOSTS = {
    "images.openfoodfacts.org",
    "images.openbeautyfacts.org",
}

# ─── Mock Data (fallback when external APIs are unavailable) ───────────────────

MOCK_PRODUCTS = [
    {
        "id": "737628064502",
        "name": "Kind Dark Chocolate Nuts & Sea Salt Bar",
        "brand": "Kind",
        "image": "",
        "category": "food",
        "ingredients_text": "almonds, dark chocolate, honey, palm kernel oil, sea salt",
        "ingredients": [
            {"id": "en:almond", "name": "Almonds", "percent": 40},
            {"id": "en:dark-chocolate", "name": "Dark Chocolate", "percent": 30},
            {"id": "en:honey", "name": "Honey", "percent": 10},
            {"id": "en:palm-kernel-oil", "name": "Palm Kernel Oil", "percent": 10},
            {"id": "en:sea-salt", "name": "Sea Salt", "percent": 5},
        ],
    },
    {
        "id": "011110038364",
        "name": "Honey Nut Cheerios",
        "brand": "General Mills",
        "image": "",
        "category": "food",
        "ingredients_text": "whole grain oats, sugar, oat bran, modified corn starch, honey, salt, tripotassium phosphate, canola oil, natural almond flavor",
        "ingredients": [
            {"id": "en:whole-grain-oats", "name": "Whole Grain Oats", "percent": 50},
            {"id": "en:sugar", "name": "Sugar", "percent": 15},
            {"id": "en:oat-bran", "name": "Oat Bran", "percent": 10},
            {"id": "en:modified-corn-starch", "name": "Modified Corn Starch", "percent": 8},
            {"id": "en:honey", "name": "Honey", "percent": 5},
            {"id": "en:salt", "name": "Salt", "percent": 2},
            {"id": "en:tripotassium-phosphate", "name": "Tripotassium Phosphate", "percent": 1},
            {"id": "en:canola-oil", "name": "Canola Oil", "percent": 4},
        ],
    },
    {
        "id": "beauty001",
        "name": "CeraVe Moisturizing Cream",
        "brand": "CeraVe",
        "image": "https://images.openbeautyfacts.org/images/products/333/787/559/7384/front_en.18.400.jpg",
        "category": "beauty",
        "ingredients_text": "water, glycerin, cetearyl alcohol, caprylic/capric triglyceride, behentrimonium methosulfate, ceramide NP, ceramide AP, ceramide EOP, carbomer, sodium lauroyl lactylate, cholesterol, phenoxyethanol, dimethicone, hyaluronic acid",
        "ingredients": [
            {"id": "en:water", "name": "Water", "percent": 70},
            {"id": "en:glycerin", "name": "Glycerin", "percent": 8},
            {"id": "en:cetearyl-alcohol", "name": "Cetearyl Alcohol", "percent": 5},
            {"id": "en:ceramide", "name": "Ceramide NP", "percent": 2},
            {"id": "en:hyaluronic-acid", "name": "Hyaluronic Acid", "percent": 1},
            {"id": "en:phenoxyethanol", "name": "Phenoxyethanol", "percent": 1},
        ],
    },
    {
        "id": "070847899488",
        "name": "Monster Energy Ultra Wild Passion",
        "brand": "Monster Beverage Corporation",
        "image": "https://images.openfoodfacts.org/images/products/070/847/899/488/front_en.13.400.jpg",
        "category": "food",
        "ingredients_text": "Carbonated Water, Erythritol, Citric Acid, Natural Flavors, Taurine, Sodium Citrate, L-Carnitine L-Tartrate, Caffeine, Sorbic Acid, Benzoic Acid, Niacinamide, Sucralose, Acesulfame Potassium, Salt, D-Glucuronolactone, Inositol, Guarana Extract, Pyridoxine Hydrochloride, Riboflavin, Cyanocobalamin",
        "health_score": 52,
        "user_rating": 4.3,
        "profile_match": 40,
        "ingredients": [
            {"id": "en:water",           "name": "Carbonated Water",         "percent": 87,  "safety": "safe",    "function": "Base",          "detail": "Water infused with CO₂. The base of all carbonated drinks. Completely safe."},
            {"id": "en:erythritol",      "name": "Erythritol",               "percent": 4,   "safety": "caution", "function": "Sweetener",     "detail": "Sugar alcohol with near-zero calories and low glycemic impact. Generally well-tolerated, but high doses (>50g) can cause digestive discomfort. Recent studies (2023) suggest high blood levels may be associated with cardiovascular risk — more research ongoing."},
            {"id": "en:citric-acid",     "name": "Citric Acid",              "percent": 0.8, "safety": "safe",    "function": "Acidulant",     "detail": "Natural acid found in citrus fruits. Used as a flavor enhancer and pH regulator. Generally safe."},
            {"id": "en:natural-flavors", "name": "Natural Flavors",          "percent": 0.5, "safety": "caution", "function": "Flavoring",     "detail": "An umbrella term for hundreds of compounds. No disclosure requirement. Source and safety vary widely."},
            {"id": "en:taurine",         "name": "Taurine (1000mg)",         "percent": 0.4, "safety": "caution", "function": "Amino Acid",    "detail": "Naturally found in meat and fish. At 1000mg per can, long-term effects of high supplemental doses are not fully established."},
            {"id": "en:sodium-citrate",  "name": "Sodium Citrate",           "percent": 0.3, "safety": "safe",    "function": "Buffer",        "detail": "Sodium salt of citric acid. Acts as an acidity regulator. Safe at typical food concentrations."},
            {"id": "en:caffeine",        "name": "Caffeine (150mg)",         "percent": 0.1, "safety": "caution", "function": "Stimulant",     "detail": "~150mg per 16oz can — over a third of the FDA's 400mg daily max. Can cause rapid heartbeat, anxiety, insomnia. Combined with guarana, total caffeine may be higher."},
            {"id": "en:benzoic-acid",    "name": "Sodium Benzoate",          "percent": 0.05,"safety": "avoid",   "function": "Preservative",  "detail": "Reacts with citric acid under heat and UV to form benzene, a Group 1 carcinogen (IARC). Linked to hyperactivity and ADHD symptoms in children."},
            {"id": "en:sucralose",       "name": "Sucralose",                "percent": 0.05,"safety": "caution", "function": "Sweetener",     "detail": "Artificial sweetener 600× sweeter than sugar. Some studies suggest gut microbiome disruption. FDA-approved but long-term effects remain debated."},
            {"id": "en:acesulfame-k",    "name": "Acesulfame Potassium",     "percent": 0.05,"safety": "caution", "function": "Sweetener",     "detail": "Artificial sweetener (Ace-K) often used alongside sucralose to enhance sweetness. Some animal studies suggest potential effects on gut health and metabolism. FDA-approved."},
            {"id": "en:sorbic-acid",     "name": "Potassium Sorbate",        "percent": 0.05,"safety": "safe",    "function": "Preservative",  "detail": "Common mold and yeast inhibitor. Considered safe at normal food concentrations."},
            {"id": "en:niacinamide",     "name": "Niacinamide (B3)",         "percent": 0.01,"safety": "safe",    "function": "Vitamin",       "detail": "Vitamin B3, essential for energy metabolism. The dose in Monster (~100% DV) is well within safe limits."},
            {"id": "en:riboflavin",      "name": "Riboflavin (B2)",          "percent": 0.01,"safety": "safe",    "function": "Vitamin",       "detail": "Vitamin B2, essential for energy production. Excess is excreted in urine (harmless yellow-green color)."},
            {"id": "en:pyridoxine",      "name": "Pyridoxine HCl (B6)",      "percent": 0.01,"safety": "safe",    "function": "Vitamin",       "detail": "Vitamin B6, important for protein metabolism. Safe at the levels present in Monster."},
            {"id": "en:guarana",         "name": "Guarana Extract",          "percent": 0.01,"safety": "caution", "function": "Stimulant",     "detail": "A natural caffeine source. When combined with added caffeine, total stimulant load increases beyond the label's stated amount."},
            {"id": "en:l-carnitine",     "name": "L-Carnitine L-Tartrate",   "percent": 0.01,"safety": "safe",    "function": "Amino Acid",    "detail": "Involved in fatty acid transport into mitochondria. Generally well-tolerated at supplement doses."},
            {"id": "en:d-glucuronolact", "name": "D-Glucuronolactone",       "percent": 0.01,"safety": "safe",    "function": "Metabolite",    "detail": "A naturally occurring compound produced by the liver during glucose metabolism. Considered safe at the amounts found in energy drinks."},
            {"id": "en:inositol",        "name": "Inositol",                 "percent": 0.01,"safety": "safe",    "function": "Nutrient",      "detail": "A carbocyclic sugar involved in cell signaling. Safe and sometimes used therapeutically for mood support."},
            {"id": "en:cyanocobalamin",  "name": "Cyanocobalamin (B12)",     "percent": 0.01,"safety": "safe",    "function": "Vitamin",       "detail": "Synthetic Vitamin B12, essential for nerve function and red blood cell production. Safe even at high doses."},
        ],
        "flagged": [
            {"name": "Sodium Benzoate",       "safety": "avoid",   "reason": "Reacts with citric acid and heat to form benzene, a known Group 1 carcinogen (IARC). Linked to ADHD symptoms and hyperactivity in children in multiple double-blind studies."},
            {"name": "Caffeine (150mg/can)",  "safety": "caution", "reason": "Over a third of the FDA's 400mg daily max in a single can. Combined with guarana's undisclosed caffeine, actual total may exceed 170mg. Risk of heart palpitations, hypertension, and insomnia."},
            {"name": "Erythritol",            "safety": "caution", "reason": "A 2023 study (Nature Medicine) found elevated erythritol blood levels correlated with increased cardiovascular risk. More research is ongoing, but caution is warranted for high-frequency consumption."},
            {"name": "Acesulfame Potassium",  "safety": "caution", "reason": "Animal studies suggest Ace-K may affect gut microbiome diversity and insulin response. Approved by FDA, but some researchers recommend limiting intake until more human data is available."},
        ],
    },
    {
        "id": "6937003707909",
        "name": "Chi Forest Sparkling Pomelo Zest",
        "brand": "Chi Forest",
        "image": "https://images.openfoodfacts.org/images/products/693/700/370/7909/front_en.5.400.jpg",
        "category": "food",
        "ingredients_text": "carbonated water, erythritol, citric acid, natural flavor, sucralose, acesulfame potassium",
        "health_score": 80,
        "user_rating": 4.2,
        "profile_match": 68,
        "ingredients": [
            {"id": "en:carbonated-water", "name": "Carbonated Water", "percent": 92, "safety": "safe", "function": "Base", "detail": "Primary base ingredient in sparkling beverages."},
            {"id": "en:erythritol", "name": "Erythritol", "percent": 4, "safety": "caution", "function": "Sweetener", "detail": "Low-calorie sweetener; generally tolerated but can cause GI upset at high intake."},
            {"id": "en:citric-acid", "name": "Citric Acid", "percent": 1, "safety": "safe", "function": "Acidulant", "detail": "Common acidity regulator used in beverages."},
            {"id": "en:natural-flavor", "name": "Natural Flavor", "percent": 1, "safety": "caution", "function": "Flavoring", "detail": "Broad label term that can represent multiple compounds."},
            {"id": "en:sucralose", "name": "Sucralose", "percent": 0.05, "safety": "caution", "function": "Sweetener", "detail": "Artificial sweetener; safe by regulation, with mixed long-term evidence."},
            {"id": "en:acesulfame-k", "name": "Acesulfame Potassium", "percent": 0.05, "safety": "caution", "function": "Sweetener", "detail": "Frequently paired with sucralose to enhance sweetness."},
        ],
    },
    {
        "id": "granola001",
        "name": "Nature Valley Oats 'n Honey Granola Bar",
        "brand": "Nature Valley",
        "image": "",
        "category": "food",
        "ingredients_text": "whole grain oats, sugar, canola oil, honey, brown sugar syrup, salt, soy lecithin, baking soda",
        "ingredients": [
            {"id": "en:whole-grain-oats", "name": "Whole Grain Oats", "percent": 55},
            {"id": "en:sugar", "name": "Sugar", "percent": 12},
            {"id": "en:canola-oil", "name": "Canola Oil", "percent": 8},
            {"id": "en:honey", "name": "Honey", "percent": 6},
            {"id": "en:brown-sugar-syrup", "name": "Brown Sugar Syrup", "percent": 5},
            {"id": "en:salt", "name": "Salt", "percent": 1},
            {"id": "en:soy-lecithin", "name": "Soy Lecithin", "percent": 1},
        ],
    },
]

def search_mock(q, category):
    q_lower = q.lower()
    results = [
        p for p in MOCK_PRODUCTS
        if q_lower in p["name"].lower()
        or q_lower in p["brand"].lower()
        or q_lower in p["ingredients_text"].lower()
        or p["category"] == category
    ]
    return [{"id": p["id"], "name": p["name"], "brand": p["brand"],
             "image": p["image"], "category": p["category"],
             "ingredients_text": p["ingredients_text"]} for p in results]

def get_mock_product(product_id):
    return next((p for p in MOCK_PRODUCTS if p["id"] == product_id), None)


# ─── Search ────────────────────────────────────────────────────────────────────

@app.route("/search")
def search():
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "food").lower()  # food | beauty

    if not q:
        return jsonify({"products": []})

    if category == "beauty":
        base = "https://world.openbeautyfacts.org"
    else:
        base = "https://world.openfoodfacts.org"

    try:
        resp = requests.get(
            f"{base}/cgi/search.pl",
            params={"search_terms": q, "json": 1, "page_size": 20},
            timeout=8,
        )
        data = resp.json()
        products = []
        for p in data.get("products", []):
            products.append({
                "id": p.get("code", ""),
                "name": p.get("product_name", "Unknown"),
                "brand": p.get("brands", ""),
                "image": p.get("image_front_url", ""),
                "category": category,
                "ingredients_text": p.get("ingredients_text", ""),
            })
        return jsonify({"products": products, "source": "api"})
    except Exception:
        products = search_mock(q, category)
        return jsonify({"products": products, "source": "mock"})


# ─── Product Detail ────────────────────────────────────────────────────────────

@app.route("/product/<product_id>")
def product(product_id):
    category = request.args.get("category", "food").lower()

    # Check curated mock products first — they have pre-computed safety data
    mock = get_mock_product(product_id)
    if mock:
        return jsonify({**mock, "nutrition": {}, "source": "mock"})

    # Fall back to live Open Food/Beauty Facts API
    if category == "beauty":
        base = "https://world.openbeautyfacts.org"
    else:
        base = "https://world.openfoodfacts.org"

    try:
        resp = requests.get(
            f"{base}/api/v0/product/{product_id}.json",
            timeout=8,
        )
        data = resp.json()

        if data.get("status") != 1:
            raise ValueError("not found")

        p = data["product"]
        ingredients = [
            {"id": ing.get("id", ""), "name": ing.get("text", ""), "percent": ing.get("percent_estimate")}
            for ing in p.get("ingredients", [])
        ]
        return jsonify({
            "id": product_id,
            "name": p.get("product_name", "Unknown"),
            "brand": p.get("brands", ""),
            "image": p.get("image_front_url", ""),
            "category": category,
            "ingredients": ingredients,
            "ingredients_text": p.get("ingredients_text", ""),
            "nutrition": p.get("nutriments", {}),
            "source": "api",
        })
    except Exception:
        return jsonify({"error": "Product not found"}), 404


@app.route("/image-proxy")
def image_proxy():
    image_url = (request.args.get("url") or "").strip()
    if not image_url:
        return jsonify({"error": "Missing image url"}), 400

    parsed = urlparse(image_url)
    if parsed.scheme not in ("http", "https"):
        return jsonify({"error": "Invalid image url scheme"}), 400
    if parsed.netloc not in ALLOWED_IMAGE_HOSTS:
        return jsonify({"error": "Image host not allowed"}), 400

    try:
        resp = requests.get(
            image_url,
            timeout=8,
            headers={"User-Agent": "HealthlyImageProxy/1.0"},
        )
        if resp.status_code != 200:
            return jsonify({"error": "Image fetch failed"}), 502

        content_type = (resp.headers.get("Content-Type") or "").split(";")[0].strip()
        if not content_type.startswith("image/"):
            return jsonify({"error": "URL did not return image content"}), 502

        return Response(
            resp.content,
            mimetype=content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception:
        return jsonify({"error": "Image proxy request failed"}), 502


# ─── Auth ─────────────────────────────────────────────────────────────────────
# users dict: email -> {hash, token}

@app.route("/auth/register", methods=["POST"])
def auth_register():
    body = request.get_json(silent=True) or {}
    email    = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or "@" not in email:
        return jsonify({"error": "Invalid email"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if email in users:
        return jsonify({"error": "Email already registered"}), 409
    token = str(uuid.uuid4())
    users[email] = {"hash": generate_password_hash(password), "token": token}
    return jsonify({"token": token, "email": email})


@app.route("/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json(silent=True) or {}
    email    = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    if not email or "@" not in email:
        return jsonify({"error": "Invalid email"}), 400
    if email not in users:
        return jsonify({"error": "No account found with that email"}), 401
    if not check_password_hash(users[email]["hash"], password):
        return jsonify({"error": "Incorrect password"}), 401
    return jsonify({"token": users[email]["token"], "email": email})


@app.route("/auth/reset-password", methods=["POST"])
def auth_reset_password():
    body         = request.get_json(silent=True) or {}
    email        = (body.get("email") or "").strip().lower()
    new_password = body.get("new_password") or ""
    if not email or "@" not in email:
        return jsonify({"error": "Invalid email"}), 400
    if email not in users:
        return jsonify({"error": "No account found with that email"}), 404
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    users[email]["hash"] = generate_password_hash(new_password)
    return jsonify({"message": "Password reset successfully"})


# ─── Profile ───────────────────────────────────────────────────────────────────

@app.route("/profile", methods=["POST"])
def save_profile():
    body = request.get_json(silent=True) or {}
    profile_id = body.get("profile_id") or str(uuid.uuid4())
    profiles[profile_id] = {
        "dietary": body.get("dietary", []),       # e.g. ["vegan", "gluten-free"]
        "allergies": body.get("allergies", []),   # e.g. ["peanuts", "shellfish"]
        "skin_type": body.get("skin_type", ""),   # e.g. "oily"
        "skin_concerns": body.get("skin_concerns", []),
        "conditions": body.get("conditions", []),
    }
    return jsonify({"profile_id": profile_id})


@app.route("/profile/<profile_id>")
def get_profile(profile_id):
    profile = profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify({"profile_id": profile_id, **profile})



# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5001)
