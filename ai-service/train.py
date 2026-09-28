import pandas as pd
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'mandi_prices.csv')
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_price_model():
    df = pd.read_csv(DATA_PATH)
    
    le_crop = LabelEncoder()
    le_region = LabelEncoder()
    df['crop_enc'] = le_crop.fit_transform(df['crop'])
    df['region_enc'] = le_region.fit_transform(df['region'])
    
    X = df[['crop_enc', 'region_enc', 'month']].values
    y = df['avg_price_per_kg'].values
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    with open(os.path.join(MODELS_DIR, 'price_model.pkl'), 'wb') as f:
        pickle.dump({'model': model, 'le_crop': le_crop, 'le_region': le_region}, f)
    
    print('Price model trained and saved.')
    return model, le_crop, le_region

def train_demand_model():
    df = pd.read_csv(DATA_PATH)
    
    # Store monthly averages per crop/region for trend analysis
    demand_data = {}
    for _, row in df.iterrows():
        key = f"{row['crop']}_{row['region']}"
        if key not in demand_data:
            demand_data[key] = {}
        demand_data[key][int(row['month'])] = float(row['avg_price_per_kg'])
    
    with open(os.path.join(MODELS_DIR, 'demand_model.pkl'), 'wb') as f:
        pickle.dump(demand_data, f)
    
    print('Demand model trained and saved.')
    return demand_data

if __name__ == '__main__':
    train_price_model()
    train_demand_model()
