import csv
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_PATH = os.path.join(DATA_DIR, 'mandi_prices.csv')

crops = ['tomato', 'onion', 'potato', 'wheat', 'rice', 'brinjal', 'cauliflower', 'mango']
regions = ['Punjab', 'Maharashtra', 'Karnataka']

base_prices = {
    'tomato':      {'Punjab': 12, 'Maharashtra': 15, 'Karnataka': 14},
    'onion':       {'Punjab': 18, 'Maharashtra': 20, 'Karnataka': 17},
    'potato':      {'Punjab': 10, 'Maharashtra': 12, 'Karnataka': 11},
    'wheat':       {'Punjab': 22, 'Maharashtra': 24, 'Karnataka': 20},
    'rice':        {'Punjab': 30, 'Maharashtra': 28, 'Karnataka': 32},
    'brinjal':     {'Punjab': 16, 'Maharashtra': 18, 'Karnataka': 15},
    'cauliflower': {'Punjab': 20, 'Maharashtra': 22, 'Karnataka': 19},
    'mango':       {'Punjab': 50, 'Maharashtra': 60, 'Karnataka': 55},
}

seasonal_multipliers = {
    'tomato':      [1.3,1.2,1.0,0.9,0.8,0.7,0.8,1.0,1.1,1.2,1.3,1.4],
    'onion':       [0.8,0.9,1.0,1.2,1.4,1.3,1.1,0.9,0.8,0.8,0.9,0.8],
    'potato':      [1.0,1.0,1.0,1.1,1.2,1.1,0.9,0.9,1.0,1.0,1.0,1.0],
    'wheat':       [1.0,1.0,1.0,0.9,0.9,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
    'rice':        [1.0,1.0,1.0,1.0,1.0,1.1,1.2,1.1,0.9,0.9,1.0,1.0],
    'brinjal':     [1.1,1.0,0.9,0.8,0.8,0.9,1.0,1.1,1.2,1.2,1.1,1.1],
    'cauliflower': [1.4,1.2,1.0,0.8,0.7,0.7,0.8,0.9,1.0,1.1,1.3,1.4],
    'mango':       [0.7,0.7,0.8,1.0,1.4,1.3,1.1,0.8,0.7,0.7,0.7,0.7],
}

rows = []
for crop in crops:
    for region in regions:
        for month in range(1, 13):
            base = base_prices[crop][region]
            mult = seasonal_multipliers[crop][month - 1]
            avg_price = round(base * mult, 2)
            min_price = round(avg_price * 0.85, 2)
            max_price = round(avg_price * 1.15, 2)
            rows.append({
                'crop': crop,
                'region': region,
                'month': month,
                'avg_price_per_kg': avg_price,
                'min_price': min_price,
                'max_price': max_price,
            })

with open(OUTPUT_PATH, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['crop', 'region', 'month', 'avg_price_per_kg', 'min_price', 'max_price'])
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV generated: {OUTPUT_PATH}")
print(f"Total rows: {len(rows)}")
