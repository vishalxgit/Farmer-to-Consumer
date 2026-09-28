# Farm2Market - Product Overview and Technical Specification

---

## 1. Executive Summary

**Farm2Market** is a direct digital agricultural commerce platform that directly connects agricultural producers (farmers) with retail buyers and consumers. By bypassing multi-tier supply chain intermediaries - including village aggregate traders, regional commission agents, terminal market wholesalers, and retail distributors - Farm2Market increases farmer revenue realization by up to 40% while lowering retail produce prices by 20-35% for consumers.

The platform integrates Machine Learning price intelligence trained on regional Indian mandi seasonal dynamics to benchmark fair prices, prevent distress selling, and offer predictive 14-day market demand indicators.

---

## 2. The Core Problem

In traditional Indian agricultural distribution:
`Farmer -> Local Village Trader -> APMC Mandi Commission Agent -> City Wholesaler -> Retail Vendor -> Consumer`

1. **Severe Value Extraction:** A kilogram of tomatoes sold by a grower for ₹12 frequently retails for ₹32 in urban centers. Over 60% of the consumer spend is absorbed by intermediary margins and logistical handoffs rather than value creation.
2. **Asymmetric Market Intelligence:** Smallholder farmers lack real-time pricing data and predictive demand forecasts, forcing them to accept low gate prices during peak harvest windows.
3. **Quality Degradation and Food Waste:** Multi-stage handling extends delivery timelines from farm to kitchen to 3-5 days, resulting in 15-25% post-harvest spoilage.

---

## 3. Product Solution

Farm2Market resolves these market inefficiencies through a unified digital marketplace:

- **Direct Farmer Listings:** Producers list harvest directly with quantity, asking price, harvest date, and media from any mobile browser.
- **AI Fair-Price Guidance:** Real-time pricing recommendations benchmarked against multi-region APMC mandi historical records.
- **Hyperlocal Geolocation Discovery:** Haversine distance computations rank nearest farmers first to reduce transportation times and transit costs.
- **Transparent Price Comparison:** Listings visibly contrast the farmer asking price against AI fair estimates and prevailing mandi averages.
- **Unified 4-Stage Order Lifecycle:** Both farmer and buyer have synchronized visibility into order state: `Placed -> Confirmed -> In Transit -> Delivered`.

---

## 4. Key Differentiators

| Capability | Traditional APMC Mandis | eNAM Platform | Standard Aggregators | **Farm2Market** |
|---|---|---|---|---|
| **Intermediary Layers** | 4-5 middlemen | 2-3 licensed traders | Centralized aggregator | **Zero (Direct Farmer-to-Consumer)** |
| **Farmer Revenue Share** | 30% - 40% | 50% - 60% | 55% - 65% | **85% - 100%** |
| **AI Fair Price Guidance** | Not available | Not available | Proprietary markup | **Integrated ML Fair-Price Engine** |
| **14-Day Demand Forecast** | Not available | Not available | Internal only | **Integrated Seasonality Model** |
| **Hyperlocal Matching** | Manual | Regional lots | Regional warehouses | **Haversine Geodesic Smart Match** |
| **Order Lifecycle Tracking**| Paper vouchers | Gate-pass system | Aggregator tracking | **Synchronized 4-Stage Stepper** |

---

## 5. Technical Architecture

- **Frontend Client:** React 19 single-page application built on Vite and TailwindCSS v4. Provides responsive mobile-first views with role-tailored dashboards for farmers and buyers.
- **Application Backend:** Node.js Express REST API utilizing Node 24 embedded `node:sqlite` for transactional state, JWT authentication, and automated AI proxy routing.
- **Machine Learning Microservice:** Python FastAPI service executing scikit-learn `RandomForestRegressor` models for multi-factor price estimation (`crop`, `region`, `season/month`, `quantity`) and time-series demand heuristics.

---

## 6. Product Roadmap

1. **Logistics Aggregation:** Partnership integration with regional postal and decentralized delivery networks to provide scheduled farmgate pickup.
2. **Vernacular Voice Interface:** Integration of Indian multilingual speech-to-text models (Bhashini AI) to enable voice-based listing for regional dialects.
3. **Smart Escrow Payments:** Automated fund disbursement held in escrow and released upon buyer delivery confirmation.
4. **IoT and Weather Telemetry:** Incorporation of satellite weather and soil sensor telemetry to anticipate harvest yields and harvest readiness.
