import * as tf from '@tensorflow/tfjs';

class MLPredictionService {
  private ecgModel: tf.LayersModel | null = null;

  async loadECGModel() {
    try {
      this.ecgModel = await tf.loadLayersModel('/models/ecg_model/model.json');
    } catch (error) {
      console.error('Error loading ECG model:', error);
      throw error;
    }
  }

  async predictECGPattern(data: number[]) {
    if (!this.ecgModel) {
      await this.loadECGModel();
    }

    const tensor = tf.tensor2d([data], [1, data.length]);
    const prediction = await this.ecgModel!.predict(tensor) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // Map prediction to conditions
    const conditions = ['Normal', 'Arrhythmia', 'Myocardial Infarction'];
    const result = conditions[probabilities.indexOf(Math.max(...Array.from(probabilities)))];
    
    return result;
  }

  analyzeVitals(data: {
    temperature: number;
    heartRate: number;
    spo2: number;
    alcoholLevel: number;
    bloodPressure: { systolic: number; diastolic: number };
  }) {
    const alerts = [];

    // Temperature analysis
    if (data.temperature > 37.5) {
      alerts.push({
        type: 'warning',
        message: 'High temperature detected',
        value: data.temperature,
        unit: '°C'
      });
    }

    // Heart rate analysis
    if (data.heartRate > 100) {
      alerts.push({
        type: 'warning',
        message: 'Elevated heart rate',
        value: data.heartRate,
        unit: 'BPM'
      });
    } else if (data.heartRate < 60) {
      alerts.push({
        type: 'warning',
        message: 'Low heart rate',
        value: data.heartRate,
        unit: 'BPM'
      });
    }

    // SpO2 analysis
    if (data.spo2 < 95) {
      alerts.push({
        type: 'critical',
        message: 'Low oxygen saturation',
        value: data.spo2,
        unit: '%'
      });
    }

    // Alcohol level analysis
    if (data.alcoholLevel > 0.08) {
      alerts.push({
        type: 'critical',
        message: 'High alcohol level',
        value: data.alcoholLevel,
        unit: '%'
      });
    }

    // Blood pressure analysis
    if (data.bloodPressure.systolic > 140 || data.bloodPressure.diastolic > 90) {
      alerts.push({
        type: 'warning',
        message: 'High blood pressure',
        value: `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`,
        unit: 'mmHg'
      });
    }

    return alerts;
  }
}

export default MLPredictionService;