"""Price estimation with ML model or CSV fallback."""
import os
import re

import joblib
import pandas as pd
from django.conf import settings

MODEL = None
MODEL_PATH = os.path.join(settings.BASE_DIR, "annonces", "model_price.pkl")
CSV_PATHS = [
    os.path.join(settings.BASE_DIR, "immobilier.csv"),
    os.path.join(settings.BASE_DIR, "annonces", "data", "immobilier.csv"),
]

if os.path.exists(MODEL_PATH):
    try:
        MODEL = joblib.load(MODEL_PATH)
    except Exception:
        MODEL = None

_CSV_DF = None


def _load_csv():
    global _CSV_DF
    if _CSV_DF is not None:
        return _CSV_DF
    for path in CSV_PATHS:
        if os.path.exists(path):
            _CSV_DF = pd.read_csv(path)
            return _CSV_DF
    return None


def estimate_price(ville, type_bien, superficie, nombre_pieces):
    superficie = float(superficie)
    nombre_pieces = int(nombre_pieces)
    ville = str(ville).strip()
    type_bien = str(type_bien).strip()

    if MODEL is not None:
        try:
            input_data = pd.DataFrame([{
                "ville": ville,
                "type_bien": type_bien,
                "superficie": superficie,
                "nombre_pieces": nombre_pieces,
            }])
            prediction = float(MODEL.predict(input_data)[0])
            return {
                "estimated_price": int(prediction),
                "method": "model",
                "confidence": "high",
                "message": "Estimation basée sur le modèle ML entraîné.",
            }
        except Exception:
            pass

    df = _load_csv()
    if df is None or df.empty:
        return None

    subset = df[
        (df["ville"].str.lower() == ville.lower())
        & (df["type_bien"].str.lower() == type_bien.lower())
    ]
    if subset.empty:
        subset = df[df["ville"].str.lower() == ville.lower()]
    if subset.empty:
        subset = df

    subset = subset.copy()
    subset["price_per_m2"] = subset["prix"] / subset["superficie"].replace(0, 1)
    avg_per_m2 = float(subset["price_per_m2"].median())
    room_factor = 1 + (nombre_pieces - 3) * 0.03
    estimated = avg_per_m2 * superficie * room_factor

    confidence = "medium" if len(subset) >= 3 else "low"
    return {
        "estimated_price": int(estimated),
        "method": "csv_average",
        "confidence": confidence,
        "message": "Estimation basée sur les moyennes du marché (CSV).",
    }


def check_price(prix, ville, type_bien, superficie, nombre_pieces):
    result = estimate_price(ville, type_bien, superficie, nombre_pieces)
    if not result:
        return None

    prediction = result["estimated_price"]
    if prediction <= 0:
        return None

    diff_percent = ((float(prix) - prediction) / prediction) * 100

    if diff_percent > 25:
        status = "high"
        message = "Le prix semble trop élevé par rapport au marché."
    elif diff_percent < -25:
        status = "low"
        message = "Le prix semble moins cher que la moyenne du marché."
    else:
        status = "normal"
        message = "Le prix semble cohérent avec le marché."

    return {
        "entered_price": int(prix),
        "estimated_price": prediction,
        "difference_percent": round(diff_percent, 2),
        "status": status,
        "message": message,
        "method": result["method"],
    }
