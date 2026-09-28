from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import os
import math
from datetime import datetime
from typing import Optional, List
import numpy as np

app = FastAPI(title="Farm2Market AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load or train models on startup
price_bundle = None
demand_data = None

def load_models():
    global price_bundle, demand_data
    price_path = os.path.join(MODELS_DIR, 'price_model.pkl')
    demand_path = os.path.join(MODELS_DIR, 'demand_model.pkl')
    
    if not os.path.exists(price_path) or not os.path.exists(demand_path):
        from train import train_price_model, train_demand_model
        train_price_model()
        train_demand_model()
    
    with open(price_path, 'rb') as f:
        price_bundle = pickle.load(f)
    with open(demand_path, 'rb') as f:
        demand_data = pickle.load(f)

load_models()


class PricePredictRequest(BaseModel):
    crop: str
    region: str
    quantity: float = 1.0
    date: Optional[str] = None

class DemandForecastRequest(BaseModel):
    crop: str
    region: str

class FarmerInfo(BaseModel):
    farmer_id: int
    farmer_name: str
    lat: float
    lng: float
    price: float
    quantity: float
    product_id: int

class SmartMatchRequest(BaseModel):
    lat: float
    lng: float
    crop: str
    farmers: List[FarmerInfo]


def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@app.get("/")
def health():
    return {"status": "ok", "service": "Farm2Market AI"}


@app.post("/predict-price")
def predict_price(req: PricePredictRequest):
    try:
        model = price_bundle['model']
        le_crop = price_bundle['le_crop']
        le_region = price_bundle['le_region']
        
        crop_lower = req.crop.lower()
        region_lower = req.region.lower().capitalize()
        
        # Handle unknown crops/regions gracefully
        known_crops = list(le_crop.classes_)
        known_regions = list(le_region.classes_)
        
        if crop_lower not in known_crops:
            # Fall back to a midrange price
            return {"suggested_price": 20.0, "confidence": "low", "model": "fallback", "known_crops": known_crops}
        
        if region_lower not in known_regions:
            region_lower = known_regions[0]  # default to first region
        
        month = datetime.now().month
        if req.date:
            try:
                month = datetime.fromisoformat(req.date[:10]).month
            except:
                pass
        
        crop_enc = le_crop.transform([crop_lower])[0]
        region_enc = le_region.transform([region_lower])[0]
        
        X = np.array([[crop_enc, region_enc, month]])
        price = float(model.predict(X)[0])
        
        # Round to nearest 0.5
        price = round(price * 2) / 2
        
        return {
            "suggested_price": price,
            "confidence": "high",
            "model": "random_forest",
            "crop": crop_lower,
            "region": region_lower,
            "month": month
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/forecast-demand")
def forecast_demand(req: DemandForecastRequest):
    try:
        crop_lower = req.crop.lower()
        region_cap = req.region.lower().capitalize()
        
        key = f"{crop_lower}_{region_cap}"
        
        if key not in demand_data:
            # Try any matching crop
            matching = [k for k in demand_data if k.startswith(crop_lower + '_')]
            if matching:
                key = matching[0]
            else:
                return {"trend": "stable", "percent_change": 0.0, "period": "next_14_days", "confidence": "low"}
        
        monthly = demand_data[key]
        current_month = datetime.now().month
        next_month = (current_month % 12) + 1
        
        current_price = monthly.get(current_month, 0)
        next_price = monthly.get(next_month, 0)
        
        if current_price == 0:
            return {"trend": "stable", "percent_change": 0.0, "period": "next_14_days"}
        
        pct_change = ((next_price - current_price) / current_price) * 100
        
        if pct_change > 5:
            trend = "upward"
        elif pct_change < -5:
            trend = "downward"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "percent_change": round(pct_change, 1),
            "period": "next_14_days",
            "current_avg_price": current_price,
            "forecast_avg_price": next_price
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/smart-match")
def smart_match(req: SmartMatchRequest):
    try:
        # Calculate distances from buyer to each farmer
        results = []
        for farmer in req.farmers:
            dist = haversine(req.lat, req.lng, farmer.lat, farmer.lng)
            results.append({
                "farmer_id": farmer.farmer_id,
                "farmer_name": farmer.farmer_name,
                "distance_km": round(dist, 1),
                "price": farmer.price,
                "quantity": farmer.quantity,
                "product_id": farmer.product_id
            })
        
        # Sort by distance, then price
        results.sort(key=lambda x: (x['distance_km'], x['price']))
        
        return {"matches": results[:3], "crop": req.crop}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
