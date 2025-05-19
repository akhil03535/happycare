import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Heart, Zap, AlertTriangle, Activity, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThingSpeakService } from '../services/thingspeak';
import MLPredictionService from '../services/mlPrediction';
import NotificationService from '../services/notification';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ReactToPrint from 'react-to-print';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ECG interpretation constants
const ECG_INTERPRETATIONS = {
  NORMAL: {
    label: "Normal Sinus Rhythm",
    color: "green",
    description: "Regular rhythm with normal P waves, PR interval, QRS complex, and T waves.",
    recommendations: [
      "No immediate action required",
      "Continue regular monitoring",
      "Maintain healthy lifestyle habits"
    ]
  },
  TACHYCARDIA: {
    label: "Sinus Tachycardia",
    color: "orange",
    description: "Heart rate >100 BPM. May be caused by exercise, stress, fever, or other conditions.",
    recommendations: [
      "Assess for underlying causes (fever, dehydration, anxiety)",
      "Consider reducing caffeine intake",
      "If persistent, consult cardiologist"
    ]
  },
  BRADYCARDIA: {
    label: "Sinus Bradycardia",
    color: "orange",
    description: "Heart rate <60 BPM. Common in athletes but may indicate conduction problems.",
    recommendations: [
      "Check for symptoms like dizziness or fatigue",
      "Review medications that may slow heart rate",
      "If symptomatic, seek medical evaluation"
    ]
  },
  ARRHYTHMIA: {
    label: "Irregular Rhythm",
    color: "red",
    description: "Irregular heart rhythm detected. Possible atrial fibrillation or other arrhythmia.",
    recommendations: [
      "Immediate medical evaluation recommended",
      "Check for pulse irregularities",
      "May require ECG or Holter monitoring"
    ]
  },
  FLATLINE: {
    label: "Asystole (Flatline)",
    color: "red",
    description: "No electrical activity detected. Critical condition requiring immediate intervention.",
    recommendations: [
      "EMERGENCY: Initiate CPR immediately",
      "Call emergency services",
      "Prepare defibrillator"
    ]
  },
  NOISY: {
    label: "Poor Signal Quality",
    color: "yellow",
    description: "ECG signal is noisy or interrupted. May lead to inaccurate readings.",
    recommendations: [
      "Check electrode connections",
      "Ensure patient is still",
      "Clean skin surface if needed"
    ]
  }
};

interface ChartContext {
  tick: {
    value: number;
  };
}

interface TooltipContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

const ECGMonitor: React.FC = () => {
  const [ecgData, setEcgData] = useState<number[]>([]);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [signalQuality, setSignalQuality] = useState<string>('Excellent');
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [interpretation, setInterpretation] = useState(ECG_INTERPRETATIONS.NORMAL);
  const { darkMode } = useTheme();
  const mlService = new MLPredictionService();
  const notificationService = new NotificationService();

  // ThingSpeak configuration
  const THINGSPEAK_CHANNEL_ID = '2917036';
  const THINGSPEAK_API_KEY = 'VL392M64XGGOZMA2';

  // Generate a realistic ECG waveform pattern with medical accuracy
  const generateECGPeak = () => {
    const points = [];
    
    // Baseline (isoelectric line)
    for (let i = 0; i < 10; i++) points.push(0);
    
    // P wave (atrial depolarization) - 0.1-0.3mV, 80-120ms
    for (let i = 0; i < 3; i++) points.push(0.25 * (i/3));
    for (let i = 3; i > 0; i--) points.push(0.25 * (i/3));
    
    // PR segment (50-120ms)
    for (let i = 0; i < 5; i++) points.push(0);
    
    // QRS complex (ventricular depolarization) - 70-110ms
    points.push(-0.1); // Q wave
    points.push(-0.5); // R wave descent
    points.push(1.5);  // R wave peak (0.5-1.6mV in lead II)
    points.push(-0.7); // S wave
    points.push(-0.2); // S wave return
    points.push(0);    // J point
    
    // ST segment (isoelectric)
    for (let i = 0; i < 4; i++) points.push(0);
    
    // T wave (ventricular repolarization) - 0.1-0.5mV
    for (let i = 0; i < 6; i++) points.push(0.3 * (i/6));
    for (let i = 6; i > 0; i--) points.push(0.3 * (i/6));
    
    // TP segment (isoelectric)
    for (let i = 0; i < 15; i++) points.push(0);
    
    return points;
  };

  const fetchECGData = async () => {
    try {
      const thingspeak = new ThingSpeakService(THINGSPEAK_CHANNEL_ID, THINGSPEAK_API_KEY);
      const data = await thingspeak.getLatestData();
      
      let newECGData = [];
      if (data?.ecgData && data.ecgData.length > 0) {
        // Use real data if available
        newECGData = data.ecgData.map(val => Number(val) || 0);
      } else {
        // Generate synthetic ECG data for demonstration
        newECGData = generateECGPeak();
      }

      setEcgData(prev => {
        const updatedData = [...prev, ...newECGData];
        return updatedData.slice(-500); // Keep more points for medical accuracy
      });

      // Analyze for abnormalities
      analyzeECG(newECGData);

      // Update heart rate if available
            // Update heart rate if available
            if (data?.heartRate) {
              setHeartRate(Math.round(data.heartRate));
            } else {
              // Simulate natural heart rate variability
              setHeartRate(prev => Math.max(50, Math.min(120, prev + (Math.random() > 0.5 ? 1 : -1))));
            }
    } catch (error) {
      console.error('Error fetching ECG data:', error);
      // Fallback to generated data if API fails
      setEcgData(prev => {
        const newData = [...prev, ...generateECGPeak()];
        return newData.slice(-500);
      });
      setSignalQuality('Poor');
      setAlerts(['Warning: Connection to monitor lost. Showing simulated data.']);
    } finally {
      setLoading(false);
    }
  };

  const analyzeECG = (data: number[]) => {
    const newAlerts = [];
    let newInterpretation = ECG_INTERPRETATIONS.NORMAL;
    
    // Calculate signal quality metrics
    const signalNoise = calculateSignalNoise(data);
    if (signalNoise > 0.3) {
      newAlerts.push('Warning: High signal noise detected');
      setSignalQuality('Poor');
      newInterpretation = ECG_INTERPRETATIONS.NOISY;
    } else if (signalNoise > 0.15) {
      setSignalQuality('Fair');
    } else {
      setSignalQuality('Excellent');
    }
    
    // Detect QRS complexes
    const qrsComplexes = detectQRSComplexes(data);
    
    // Check for flatline (asystole)
    if (qrsComplexes.length === 0) {
      newAlerts.push('CRITICAL: No QRS complexes detected - possible asystole');
      newInterpretation = ECG_INTERPRETATIONS.FLATLINE;
    } 
    // Calculate heart rate from QRS complexes
    else if (qrsComplexes.length > 1) {
      const intervals = [];
      for (let i = 1; i < qrsComplexes.length; i++) {
        intervals.push(qrsComplexes[i] - qrsComplexes[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedHR = Math.round(60000 / (avgInterval * 10)); // Convert to BPM
      
      if (calculatedHR !== heartRate) {
        setHeartRate(calculatedHR);
      }
      
      // Check for tachycardia
      if (calculatedHR > 100) {
        newAlerts.push(`Warning: Tachycardia detected (${calculatedHR} BPM)`);
        newInterpretation = ECG_INTERPRETATIONS.TACHYCARDIA;
      }
      // Check for bradycardia
      else if (calculatedHR < 60) {
        newAlerts.push(`Warning: Bradycardia detected (${calculatedHR} BPM)`);
        newInterpretation = ECG_INTERPRETATIONS.BRADYCARDIA;
      }
      
      // Check for irregular rhythm
      const irregularity = calculateRhythmIrregularity(intervals);
      if (irregularity > 0.25) {
        newAlerts.push('Warning: Irregular rhythm detected (possible arrhythmia)');
        newInterpretation = ECG_INTERPRETATIONS.ARRHYTHMIA;
      }
    }
    
    // Additional ECG feature analysis
    const ecgFeatures = analyzeECGFeatures(data, qrsComplexes);
    if (ecgFeatures.stElevation) {
      newAlerts.push('Warning: ST segment elevation detected');
    }
    if (ecgFeatures.stDepression) {
      newAlerts.push('Warning: ST segment depression detected');
    }
    if (ecgFeatures.prolongedQT) {
      newAlerts.push('Warning: Prolonged QT interval detected');
    }
    
    setAlerts(newAlerts);
    setInterpretation(newInterpretation);
  };

  // Helper functions for ECG analysis
  const calculateSignalNoise = (data: number[]) => {
    const baseline = data.filter((_, i) => i % 10 === 0).reduce((a, b) => a + b, 0) / (data.length / 10);
    const deviations = data.map(val => Math.abs(val - baseline));
    return deviations.reduce((a, b) => a + b, 0) / deviations.length;
  };

  const detectQRSComplexes = (data: number[]) => {
    const peaks = [];
    for (let i = 2; i < data.length - 2; i++) {
      if (data[i] > 0.8 && data[i] > data[i-1] && data[i] > data[i+1]) {
        peaks.push(i);
      }
    }
    return peaks;
  };

  const calculateRhythmIrregularity = (intervals: number[]) => {
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.map(i => Math.pow(i - avg, 2)).reduce((a, b) => a + b, 0) / intervals.length;
    return Math.sqrt(variance) / avg;
  };

  const analyzeECGFeatures = (data: number[], qrsIndices: number[]) => {
    const features = {
      stElevation: false,
      stDepression: false,
      prolongedQT: false
    };
    
    if (qrsIndices.length > 0) {
      // Analyze ST segment (80ms after QRS)
      const stSegmentIndex = qrsIndices[0] + 8;
      if (stSegmentIndex < data.length) {
        const stValue = data[stSegmentIndex];
        features.stElevation = stValue > 0.2;
        features.stDepression = stValue < -0.1;
      }
      
      // Analyze QT interval (from QRS to T wave end)
      if (qrsIndices.length > 1) {
        const qtDuration = qrsIndices[1] - qrsIndices[0];
        // Corrected QT (QTc) = QT / sqrt(RR interval)
        const rrInterval = qrsIndices[1] - qrsIndices[0];
        const qtc = qtDuration / Math.sqrt(rrInterval / 100);
        features.prolongedQT = qtc > 0.45; // Approximate threshold
      }
    }
    
    return features;
  };

  // Prepare medical-grade chart data
  const chartData = {
    labels: Array.from({ length: ecgData.length }, (_, i) => `${(i * 0.04).toFixed(2)}`),
    datasets: [
      {
        label: 'Lead II ECG',
        data: ecgData,
        borderColor: darkMode ? '#00ff00' : '#000000',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        tension: 0,
        pointRadius: 0,
        segment: {
          borderColor: (ctx: any) => {
            const value = ctx.p0.parsed.y;
            return Math.abs(value) > 1.5 ? '#ff0000' : (darkMode ? '#00ff00' : '#000000');
          }
        }
      },
      {
        label: 'Grid',
        data: Array(ecgData.length).fill(0),
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.2)',
        borderWidth: 1,
        borderDash: [2, 2],
        pointRadius: 0
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      y: {
        type: 'linear',
        min: -2,
        max: 3,
        grid: {
          color: (ctx: any) => {
            return ctx.tick.value === 0
              ? (darkMode ? '#ffffff' : '#ff0000')
              : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)');
          },
          lineWidth: (ctx: any) => ctx.tick.value === 0 ? 2 : 1,
          drawTicks: true
        },
        title: {
          display: true,
          text: 'Voltage (mV)',
          color: darkMode ? '#ffffff' : '#333333',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#333333',
          stepSize: 0.5,
          callback: (value: number) => `${value} mV`
        }
      },
      x: {
        type: 'linear',
        grid: {
          color: (ctx: any) => {
            return (ctx.tick.value * 25) % 5 === 0
              ? (darkMode ? '#ffffff' : '#ff0000')
              : (darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)');
          },
          lineWidth: 1,
          drawTicks: true
        },
        title: {
          display: true,
          text: 'Time (seconds)',
          color: darkMode ? '#ffffff' : '#333333',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          color: darkMode ? '#ffffff' : '#333333',
          callback: (value: number) => `${(value * 0.04).toFixed(1)}s`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} mV`;
          }
        }
      }
    }
  };

  useEffect(() => {
    fetchECGData();
    const interval = setInterval(fetchECGData, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Add notification handler for critical alerts
    const handleCriticalAlert = async (alert: string) => {
      if (user.phone && alert.startsWith('CRITICAL')) {
        const ecgAlert = {
          prediction: interpretation.label,
          confidence: interpretation === ECG_INTERPRETATIONS.NORMAL ? 0.95 : 0.85,
          alert: alert,
          trend: interpretation.description
        };
        
        try {
          const message = notificationService.formatECGAlert(ecgAlert);
          await notificationService.sendSMSAlert(user.phone, message);
        } catch (error) {
          console.error('Failed to send ECG alert:', error);
        }
      }
    };

    // Watch for new alerts
    if (alerts.length > 0) {
      const criticalAlerts = alerts.filter(alert => alert.startsWith('CRITICAL'));
      criticalAlerts.forEach(handleCriticalAlert);
    }
  }, [alerts, interpretation]);

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-6">Medical ECG Monitor</h1>
      <div className="flex items-center mb-2">
        <Activity className="w-5 h-5 mr-2 text-blue-500" />
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Lead II Configuration | 25mm/s | 10mm/mV
        </span>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Heart Rate */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm border-l-4 ${
              heartRate > 100 ? 'border-orange-500' : 
              heartRate < 60 ? 'border-orange-500' : 
              'border-green-500'
            }`}>
              <div className="flex items-center">
                <Heart className="w-6 h-6 text-red-500" />
                <div className="ml-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Heart Rate</p>
                  <p className="text-xl font-semibold">{heartRate} <span className="text-sm">BPM</span></p>
                </div>
              </div>
            </div>

            {/* Signal Quality */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm border-l-4 ${
              signalQuality === 'Poor' ? 'border-red-500' : 
              signalQuality === 'Fair' ? 'border-yellow-500' : 
              'border-green-500'
            }`}>
              <div className="flex items-center">
                <Zap className="w-6 h-6 text-blue-500" />
                <div className="ml-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Signal Quality</p>
                  <p className={`text-xl font-semibold ${
                    signalQuality === 'Poor' ? 'text-red-500' : 
                    signalQuality === 'Fair' ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {signalQuality}
                  </p>
                </div>
              </div>
            </div>

            {/* ECG Interpretation */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm border-l-4 ${
              interpretation.color === 'red' ? 'border-red-500' : 
              interpretation.color === 'orange' ? 'border-orange-500' : 
              'border-green-500'
            }`}>
              <div className="flex items-center">
                <Info className="w-6 h-6 text-purple-500" />
                <div className="ml-3">
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>ECG Interpretation</p>
                  <p className={`text-xl font-semibold ${
                    interpretation.color === 'red' ? 'text-red-500' : 
                    interpretation.color === 'orange' ? 'text-orange-500' : 
                    'text-green-500'
                  }`}>
                    {interpretation.label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ECG Waveform Display */}
          <div className={`${darkMode ? 'bg-black' : 'bg-white'} p-4 rounded-lg shadow-lg mb-6 border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="h-96"> {/* Medical standard height */}
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Diagnosis and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* ECG Interpretation Details */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                ECG Interpretation
              </h2>
              <div className={`p-4 rounded-md mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className="font-medium mb-2">{interpretation.label}</p>
                <p className="text-sm">{interpretation.description}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-1">Heart Rate:</p>
                  <p className="text-sm">{heartRate} BPM ({heartRate > 100 ? 'Tachycardia' : heartRate < 60 ? 'Bradycardia' : 'Normal'})</p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Rhythm:</p>
                  <p className="text-sm">{interpretation === ECG_INTERPRETATIONS.ARRHYTHMIA ? 'Irregular' : 'Regular'}</p>
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Signal Quality:</p>
                  <p className="text-sm">{signalQuality}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Clinical Recommendations
              </h2>
              <ul className="space-y-3">
                {interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${
                      interpretation.color === 'red' ? 'bg-red-500' : 
                      interpretation.color === 'orange' ? 'bg-orange-500' : 
                      'bg-green-500'
                    }`}></span>
                    <p className="text-sm">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Critical Alerts
              </h2>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-md flex items-start ${
                      alert.startsWith('CRITICAL') ? 
                        (darkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-100 text-red-800') : 
                        (darkMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100 text-yellow-800')
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 mt-0.5 mr-2 ${
                      alert.startsWith('CRITICAL') ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default ECGMonitor;