"""Natural language parsing and smart search scoring."""
import re

CITIES = [
    "alger", "oran", "constantine", "annaba", "blida", "setif", "batna",
    "djelfa", "sidi bel abbes", "biskra", "tebessa", "el oued", "skikda",
    "tiaret", "bejaia", "tlemcen", "boumerdes", "bechar", "mostaganem",
]

TYPE_KEYWORDS = {
    "appartement": "Appartement",
    "appart": "Appartement",
    "f2": "Appartement",
    "f3": "Appartement",
    "f4": "Appartement",
    "studio": "Appartement",
    "maison": "Maison",
    "villa": "Maison",
    "terrain": "Maison",
}

ROOM_PATTERNS = [
    r"(\d+)\s*pi[eè]ces?",
    r"(\d+)\s*chambres?",
    r"f(\d+)",
    r"(\d+)\s*rooms?",
]

PRICE_PATTERNS = [
    r"moins\s+de\s+([\d\s]+)",
    r"max(?:imum)?\s+([\d\s]+)",
    r"([\d\s]+)\s*da\b",
    r"([\d]+)\s*millions?",
]

SURFACE_PATTERNS = [
    r"(\d+)\s*m2",
    r"(\d+)\s*m²",
    r"superficie\s+(\d+)",
]


def _parse_number(text):
    if not text:
        return None
    cleaned = re.sub(r"[^\d]", "", str(text))
    if not cleaned:
        return None
    val = int(cleaned)
    if "million" in str(text).lower() and val < 1000:
        val *= 1_000_000
    return val


def parse_natural_language(query):
    q = (query or "").lower().strip()
    parsed = {
        "ville": "",
        "type_bien": "",
        "nombre_pieces": None,
        "max_prix": None,
        "min_prix": None,
        "superficie": None,
        "keywords": [],
    }

    for city in CITIES:
        if city in q:
            parsed["ville"] = city.title()
            break

    for kw, tb in TYPE_KEYWORDS.items():
        if kw in q:
            parsed["type_bien"] = tb
            break

    for pat in ROOM_PATTERNS:
        m = re.search(pat, q)
        if m:
            parsed["nombre_pieces"] = int(m.group(1))
            break

    for pat in PRICE_PATTERNS:
        m = re.search(pat, q)
        if m:
            num = _parse_number(m.group(1))
            if num:
                if "moins" in pat or "max" in pat:
                    parsed["max_prix"] = num
                else:
                    parsed["max_prix"] = parsed["max_prix"] or num
            break

    if "pas cher" in q or "bon marché" in q or "bon marche" in q:
        parsed["keywords"].append("budget")

    for pat in SURFACE_PATTERNS:
        m = re.search(pat, q)
        if m:
            parsed["superficie"] = int(m.group(1))
            break

    words = [w for w in re.findall(r"[a-zàâäéèêëïîôùûüç']+", q) if len(w) > 3]
    parsed["keywords"] = list(set(parsed["keywords"] + words[:8]))

    return parsed


def score_annonce(annonce, filters, keywords=None):
    score = 0
    why = []
    keywords = keywords or []

    ville = filters.get("ville", "")
    type_bien = filters.get("type_bien", "")
    nombre_pieces = filters.get("nombre_pieces")
    max_prix = filters.get("max_prix")
    min_prix = filters.get("min_prix")
    superficie = filters.get("superficie")

    if ville:
        if annonce.ville.lower() == ville.lower():
            score += 5
            why.append("city_match")
        elif ville.lower() in annonce.ville.lower():
            score += 3
            why.append("city_match")

    if type_bien:
        if annonce.type_bien.lower() == type_bien.lower():
            score += 4
            why.append("type_match")
        elif type_bien.lower() in annonce.type_bien.lower():
            score += 2
            why.append("type_match")

    if nombre_pieces is not None:
        diff = abs(annonce.nombre_pieces - int(nombre_pieces))
        if diff == 0:
            score += 4
            why.append("rooms_match")
        elif diff <= 1:
            score += 2
            why.append("rooms_match")

    if annonce.prix is not None:
        prix = float(annonce.prix)
        if max_prix and prix <= max_prix:
            score += 4
            why.append("price_match")
        if min_prix and prix >= min_prix:
            score += 2
            why.append("price_match")

    if superficie:
        diff = abs(float(annonce.superficie) - float(superficie))
        if diff <= 15:
            score += 3
            why.append("surface_match")

    text_blob = f"{annonce.titre} {annonce.description}".lower()
    for kw in keywords:
        if kw in text_blob:
            score += 1
            if "keywords_match" not in why:
                why.append("keywords_match")

    return score, list(dict.fromkeys(why))


def visible_annonces_queryset(user=None):
    from django.db.models import Q
    from .models import Annonce

    qs = Annonce.objects.select_related("proprietaire")
    if user and user.is_authenticated:
        qs = qs.filter(Q(is_hidden=False) | Q(proprietaire=user))
    else:
        qs = qs.filter(is_hidden=False)
    return qs.order_by("-date_publication")
