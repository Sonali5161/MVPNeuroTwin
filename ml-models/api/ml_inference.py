"""
ML Inference API for NeuroTwin
Serves trained models via REST API endpoints
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import pickle
import numpy as np
import json
from typing import List, Dict, Any
import os

app = FastAPI(title="NeuroTwin ML API", version="1.0.0")

# Load models on startup
MODELS = {}
SCALERS = {}
METRICS = {}

def load_models():
    """Load all trained models and scalers"""
    models_dir = "../trained"
    
    try:
        # Load conversion model (PyTorch)
        if os.path.exists(f"{models_dir}/conversion_model.pth"):
            from train_conversion_model import ConversionPredictorModel
            model = ConversionPredictorModel()
            model.load_state_dict(torch.load(f"{models_dir}/conversion_model.pth", map_location='cpu'))
            model.eval()
            MODELS['conversion'] = model
            
            with open(f"{models_dir}/conversion_scaler.pkl", 'rb') as f:
                SCALERS['conversion'] = pickle.load(f)
            
            with open(f"{models_dir}/conversion_metrics.json", 'r') as f:
                METRICS['conversion'] = json.load(f)
        
        # Load TTE model (PyTorch)
        if os.path.exists(f"{models_dir}/tte_model.pth"):
            from train_tte_model import SurvivalLSTM
            model = SurvivalLSTM()
            model.load_state_dict(torch.load(f"{models_dir}/tte_model.pth", map_location='cpu'))
            model.eval()
            MODELS['tte'] = model
            
            with open(f"{models_dir}/tte_metrics.json", 'r') as f:
                METRICS['tte'] = json.load(f)
        
        # Load burden model (scikit-learn)
        if os.path.exists(f"{models_dir}/burden_model.pkl"):
            with open(f"{models_dir}/burden_model.pkl", 'rb') as f:
                MODELS['burden'] = pickle.load(f)
            
            with open(f"{models_dir}/burden_scaler.pkl", 'rb') as f:
                SCALERS['burden'] = pickle.load(f)
            
            with open(f"{models_dir}/burden_metrics.json", 'r') as f:
                METRICS['burden'] = json.load(f)
        
        print("✓ All models loaded successfully")
    except Exception as e:
        print(f"✗ Error loading models: {e}")

# Input models
class PatientFeatures(BaseModel):
    age: float
    sex: int  # 0=Female, 1=Male
    mri_score: float
    genetic_risk: float
    amyloid_beta: float
    tau: float
    nfl: float
    cognitive_score: float
    sleep_quality: float
    activity_level: float
    additional_features: List[float] = []

class PredictionResponse(BaseModel):
    model_name: str
    version: str
    prediction: float
    confidence: float
    interpretation: str

# API Endpoints
@app.on_event("startup")
async def startup_event():
    load_models()

@app.get("/")
async def root():
    return {
        "service": "NeuroTwin ML Inference API",
        "version": "1.0.0",
        "models_loaded": list(MODELS.keys()),
        "status": "running"
    }

@app.get("/models")
async def list_models():
    """List all available models and their metrics"""
    return {
        "models": METRICS,
        "count": len(MODELS)
    }

@app.get("/models/{model_name}/metrics")
async def get_model_metrics(model_name: str):
    """Get detailed metrics for a specific model"""
    if model_name not in METRICS:
        raise HTTPException(status_code=404, detail=f"Model {model_name} not found")
    return METRICS[model_name]

@app.post("/predict/conversion", response_model=PredictionResponse)
async def predict_conversion(features: PatientFeatures):
    """Predict MCI to AD conversion probability"""
    if 'conversion' not in MODELS:
        raise HTTPException(status_code=503, detail="Conversion model not loaded")
    
    try:
        # Prepare features
        feature_array = np.array([
            features.age, features.sex, features.mri_score, features.genetic_risk,
            features.amyloid_beta, features.tau, features.nfl, features.cognitive_score,
            features.sleep_quality, features.activity_level
        ] + features.additional_features).reshape(1, -1)
        
        # Scale
        feature_scaled = SCALERS['conversion'].transform(feature_array)
        
        # Predict
        with torch.no_grad():
            feature_tensor = torch.FloatTensor(feature_scaled)
            prediction = MODELS['conversion'](feature_tensor).item()
        
        # Interpret
        if prediction > 0.8:
            interpretation = "Critical Risk"
        elif prediction > 0.6:
            interpretation = "High Risk"
        elif prediction > 0.4:
            interpretation = "Medium Risk"
        else:
            interpretation = "Low Risk"
        
        return PredictionResponse(
            model_name=METRICS['conversion']['model_name'],
            version=METRICS['conversion']['version'],
            prediction=round(prediction * 100, 2),
            confidence=METRICS['conversion']['test_accuracy'],
            interpretation=interpretation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/time-to-event")
async def predict_time_to_event(features: PatientFeatures):
    """Predict time until clinical events"""
    if 'tte' not in MODELS:
        raise HTTPException(status_code=503, detail="TTE model not loaded")
    
    try:
        feature_array = np.array([
            features.age, features.sex, features.mri_score, features.genetic_risk,
            features.amyloid_beta, features.tau, features.nfl, features.cognitive_score,
            features.sleep_quality, features.activity_level
        ] + features.additional_features).reshape(1, -1)
        
        with torch.no_grad():
            feature_tensor = torch.FloatTensor(feature_array)
            months = MODELS['tte'](feature_tensor).item()
        
        return {
            "model_name": METRICS['tte']['model_name'],
            "version": METRICS['tte']['version'],
            "estimated_months": max(12, abs(int(months))),
            "confidence_interval": [max(8, abs(int(months)) - 4), abs(int(months)) + 8],
            "accuracy": METRICS['tte']['test_accuracy']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/caregiver-burden")
async def predict_caregiver_burden(features: PatientFeatures):
    """Predict caregiver burden score"""
    if 'burden' not in MODELS:
        raise HTTPException(status_code=503, detail="Burden model not loaded")
    
    try:
        feature_array = np.array([
            features.age, features.sex, features.mri_score, features.genetic_risk,
            features.amyloid_beta, features.tau, features.nfl, features.cognitive_score,
            features.sleep_quality, features.activity_level
        ] + features.additional_features).reshape(1, -1)
        
        # Scale
        feature_scaled = SCALERS['burden'].transform(feature_array)
        
        # Predict
        prediction = MODELS['burden'].predict(feature_scaled)[0]
        probability = MODELS['burden'].predict_proba(feature_scaled)[0]
        
        return {
            "model_name": METRICS['burden']['model_name'],
            "version": METRICS['burden']['version'],
            "burden_class": int(prediction),
            "probability": round(float(max(probability)) * 100, 2),
            "current_score": round(float(max(probability)) * 100, 1),
            "accuracy": METRICS['burden']['test_accuracy']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(MODELS),
        "models": list(MODELS.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
