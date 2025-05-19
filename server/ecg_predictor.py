import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import json
import time
from collections import deque

class ECGPredictor:
    def __init__(self, model_path='lstm_ecg_model.h5', window_size=100, threshold=0.8):
        """
        Initialize the ECG predictor with the trained LSTM model.
        
        Args:
            model_path (str): Path to the trained LSTM model (.h5 file)
            window_size (int): Number of ECG samples to consider for each prediction
            threshold (float): Confidence threshold for predictions
        """
        # Load the trained LSTM model
        self.model = load_model(model_path)
        self.window_size = window_size
        self.threshold = threshold
        
        # Initialize a buffer to store incoming ECG data
        self.ecg_buffer = deque(maxlen=window_size)
        
        # Initialize a scaler (assuming you used MinMax scaling during training)
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
        # Define your class labels (modify according to your model's classes)
        self.class_labels = {
            0: "Normal",
            1: "Risky",
            2: "Low",
            3: "Future Risk Detected"
        }
        
        # Initialize variables for trend analysis
        self.previous_prediction = None
        self.consecutive_anomalies = 0
        
    def preprocess_data(self, ecg_data):
        """
        Preprocess the ECG data to match the model's input requirements.
        
        Args:
            ecg_data (list): List of ECG values
            
        Returns:
            numpy.ndarray: Processed data ready for prediction
        """
        # Convert to numpy array and scale
        ecg_array = np.array(ecg_data).reshape(-1, 1)
        scaled_data = self.scaler.fit_transform(ecg_array)
        
        # Reshape for LSTM input (samples, time steps, features)
        processed_data = scaled_data.reshape(1, self.window_size, 1)
        
        return processed_data
    
    def predict_ecg_pattern(self, new_ecg_value):
        """
        Predict the ECG pattern based on incoming data.
        
        Args:
            new_ecg_value (float): New ECG reading from the monitor
            
        Returns:
            dict: Prediction result with confidence and additional analysis
        """
        # Add new value to buffer
        self.ecg_buffer.append(new_ecg_value)
        
        # Wait until we have enough data for a prediction
        if len(self.ecg_buffer) < self.window_size:
            return {"status": "collecting", "message": f"Collecting data ({len(self.ecg_buffer)}/{self.window_size})"}
        
        # Preprocess the data
        processed_data = self.preprocess_data(self.ecg_buffer)
        
        # Make prediction
        prediction = self.model.predict(processed_data)
        predicted_class = np.argmax(prediction)
        confidence = np.max(prediction)
        
        # Get the label
        label = self.class_labels.get(predicted_class, "Unknown")
        
        # Trend analysis
        current_time = time.strftime("%Y-%m-%d %H:%M:%S")
        trend_analysis = self._analyze_trend(label, confidence)
        
        # Prepare result
        result = {
            "timestamp": current_time,
            "prediction": label,
            "confidence": float(confidence),
            "ecg_value": new_ecg_value,
            "trend": trend_analysis,
            "alert": self._generate_alert(label, confidence)
        }
        
        return result
    
    def _analyze_trend(self, current_label, confidence):
        """
        Analyze the trend of predictions over time.
        
        Args:
            current_label (str): Current prediction label
            confidence (float): Prediction confidence
            
        Returns:
            str: Trend analysis message
        """
        if self.previous_prediction is None:
            self.previous_prediction = current_label
            return "Initial prediction, trend not established yet."
            
        if current_label != "Normal":
            self.consecutive_anomalies += 1
        else:
            self.consecutive_anomalies = 0
            
        if self.consecutive_anomalies >= 3:
            return f"Warning: {self.consecutive_anomalies} consecutive abnormal readings detected!"
            
        if current_label != self.previous_prediction:
            trend_msg = f"Pattern changed from {self.previous_prediction} to {current_label}"
        else:
            trend_msg = f"Consistent {current_label} pattern"
            
        self.previous_prediction = current_label
        return trend_msg
    
    def _generate_alert(self, label, confidence):
        """
        Generate alerts based on prediction and confidence.
        
        Args:
            label (str): Predicted label
            confidence (float): Prediction confidence
            
        Returns:
            str: Alert message if needed, otherwise empty string
        """
        if confidence < 0.6:
            return "Low confidence in prediction - please verify manually"
            
        if label == "Risky" and confidence > self.threshold:
            return "URGENT: Risky ECG pattern detected!"
            
        if label == "Future Risk Detected" and confidence > self.threshold:
            return "Warning: Potential future risk detected"
            
        return ""

# Example usage (this would be integrated with your IoT system)
if __name__ == "__main__":
    # Initialize the predictor
    predictor = ECGPredictor(model_path='lstm_ecg_model.h5')
    
    # Simulate receiving ECG data from your IoT device
    # In your actual implementation, this would come from your ECG monitor
    simulated_ecg_data = np.sin(np.linspace(0, 20, 200)) * 2 + np.random.normal(0, 0.2, 200)
    
    for i, ecg_value in enumerate(simulated_ecg_data):
        # Simulate real-time prediction
        result = predictor.predict_ecg_pattern(ecg_value)
        
        if "status" in result and result["status"] == "collecting":
            print(result["message"])
            continue
            
        print(f"\nECG Reading #{i+1}: {ecg_value:.2f}")
        print(f"Prediction: {result['prediction']} (Confidence: {result['confidence']*100:.1f}%)")
        print(f"Trend Analysis: {result['trend']}")
        if result['alert']:
            print(f"ALERT: {result['alert']}")
        
        # Add delay to simulate real-time
        time.sleep(0.1)