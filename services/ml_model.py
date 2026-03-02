# services/ml_model.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np

# -------------------------
# TRAINING DATA (Demo)
# -------------------------

training_data = [
    ("Emergency heart surgery needed ICU critical condition", "Medical"),
    ("Cancer treatment urgent hospital operation", "Medical"),
    ("School fees support for poor student education", "Education"),
    ("Flood relief support for families disaster help", "Disaster"),
    ("Earthquake victims need urgent shelter", "Disaster"),
    ("College tuition financial assistance required", "Education"),
]

texts = [item[0] for item in training_data]
labels = [item[1] for item in training_data]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = MultinomialNB()
model.fit(X, labels)


# -------------------------
# PREDICT CATEGORY USING ML
# -------------------------

def predict_category(title: str, description: str) -> str:
    text = f"{title} {description}"

    # Transform input
    transformed = vectorizer.transform([text])

    # Predict
    prediction = model.predict(transformed)

    # Extract actual string from numpy array
    if hasattr(prediction, "__iter__"):
        return str(prediction[0])
    
    return str(prediction)
# -------------------------
# CALCULATE PRIORITY SCORE
# -------------------------

def calculate_priority(required_amount: float, urgency_level: str):
    score = 0

    if urgency_level == "CRITICAL":
        score += 50
    elif urgency_level == "HIGH":
        score += 30
    else:
        score += 10

    if required_amount > 500000:
        score += 15
    elif required_amount > 100000:
        score += 10
    else:
        score += 5

    return score