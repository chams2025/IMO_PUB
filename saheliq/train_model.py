import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LinearRegression
import joblib

# load data
df = pd.read_csv("immobilier.csv")

X = df[["ville", "type_bien", "superficie", "nombre_pieces"]]
y = df["prix"]

categorical = ["ville", "type_bien"]
numeric = ["superficie", "nombre_pieces"]

preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
    ("num", "passthrough", numeric)
])

model = Pipeline([
    ("prep", preprocessor),
    ("model", LinearRegression())
])

model.fit(X, y)

joblib.dump(model, "annonces/model_price.pkl")

print("Model trained successfully ")
