from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = ECGPredictor(model_path='lstm_ecg_model.h5')

@app.post("/predict")
async def predict_ecg(request: Request):
    data = await request.json()
    ecg_value = data.get('ecg_value')
    if ecg_value is None:
        return {"error": "No ECG value provided"}
    
    result = predictor.predict_ecg_pattern(ecg_value)
    return result