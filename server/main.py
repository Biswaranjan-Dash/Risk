# from fastapi import FastAPI
# from pydantic import BaseModel
# import numpy as np
# import pickle
# from tensorflow.keras.models import load_model
# import pandas as pd

# # Load model and preprocessing objects
# model = load_model("model/vehicle_risk_classification_model.h5")
# with open("model/scaler.pkl", "rb") as f:
#     scaler = pickle.load(f)
# with open("model/label_encoder.pkl", "rb") as f:
#     le = pickle.load(f)

# app = FastAPI()

# class InputData(BaseModel):
#     Speed: float
#     Traffic_Condition: str
#     Linear_X: float
#     Linear_Y: float
#     Linear_Z: float
#     Angular_X: float
#     Angular_Y: float
#     Angular_Z: float

# @app.post("/predict")
# def predict(data: InputData):
#     # Convert the traffic condition to the same encoding used during training
#     # Create a one-element series to use pd.Categorical().codes exactly as in training
#     traffic_series = pd.Series([data.Traffic_Condition])
#     traffic_val = pd.Categorical(traffic_series).codes[0]
    
#     input_features = np.array([
#         data.Speed,
#         traffic_val,  # Now using the consistent encoding
#         data.Linear_X,
#         data.Linear_Y,
#         data.Linear_Z,
#         data.Angular_X,
#         data.Angular_Y,
#         data.Angular_Z
#     ]).reshape(1, -1)

#     # Scale the input using the same scaler from training
#     scaled_input = scaler.transform(input_features)
    
#     # Get prediction
#     prediction_probs = model.predict(scaled_input)
#     predicted_index = np.argmax(prediction_probs, axis=1)[0]
#     predicted_label = le.inverse_transform([predicted_index])[0]
#     confidence = float(prediction_probs[0][predicted_index])

#     return {
#         "risk_level": predicted_label,
#         "confidence_score": round(confidence * 100, 2)
#     }




# CHAT GPT
# ----------- Load all saved assets -----------
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import pickle
import tensorflow as tf
import pandas as pd

model = tf.keras.models.load_model("model/vehicle_risk_classification_model.h5")
with open("model/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)
with open("model/label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

# ----------- Define FastAPI app -----------
app = FastAPI()

# ----------- Define input data schema -----------
class VehicleData(BaseModel):
    Speed: float
    Traffic_Condition: str
    Linear_X: float
    Linear_Y: float
    Linear_Z: float
    Angular_X: float
    Angular_Y: float
    Angular_Z: float

# ----------- Encode traffic condition -----------
def encode_traffic_condition(condition: str) -> int:
    mapping = {'Low': 1, 'Medium': 2, 'High': 0}
    return mapping.get(condition, 0)  # default to 0 if not found

# ----------- Prediction route -----------
@app.post("/predict")
def predict_risk(data: VehicleData):
    features = [
        data.Speed,
        encode_traffic_condition(data.Traffic_Condition),
        data.Linear_X,
        data.Linear_Y,
        data.Linear_Z,
        data.Angular_X,
        data.Angular_Y,
        data.Angular_Z
    ]
    input_array = np.array(features).reshape(1, -1)
    scaled_input = scaler.transform(input_array)
    prediction = model.predict(scaled_input)
    predicted_class_index = np.argmax(prediction, axis=1)[0]
    predicted_label = label_encoder.inverse_transform([predicted_class_index])[0]
    return {"risk_level": predicted_label}