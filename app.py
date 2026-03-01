import uuid
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory profile store (fine for hackathon)
profiles = {}

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
        "image": "",
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
        mock = get_mock_product(product_id)
        if mock:
            return jsonify({**mock, "nutrition": {}, "source": "mock"})
        return jsonify({"error": "Product not found"}), 404


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
