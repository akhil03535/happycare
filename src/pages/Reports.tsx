import React, { useState, useEffect } from 'react';
import { Filter, FileCheck, Bell, AlertTriangle, Activity, Lock, Check } from 'lucide-react';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ThingSpeakService, type ThingSpeakData } from '../services/thingspeak';
import NotificationService from '../services/notification';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Initialize Stripe with proper error handling
type StripePromiseType = ReturnType<typeof loadStripe>;
let stripePromise: StripePromiseType | null = null;
try {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!stripeKey) {
    throw new Error('Stripe publishable key is not defined in environment variables');
  }
  stripePromise = loadStripe(stripeKey);
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  toast.error('Payment system initialization failed');
}

interface SensorData extends ThingSpeakData {
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
}

interface Alert {
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  value: string;
  unit: string;
}

const CheckoutForm = ({ onSuccess, userEmail }: { 
  onSuccess: () => void,
  userEmail: string 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode } = useTheme();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 60,
          currency: 'usd',
          description: 'Premium Health Report Access',
          email: userEmail
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error: ${response.status} - ${text}`);
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      const { clientSecret } = data;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Test User',
            address: {
              postal_code: '94111'
            }
          }
        }
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Store premium status with user's email as key
        const premiumUsers = JSON.parse(localStorage.getItem('premiumUsers') || '{}');
        premiumUsers[userEmail] = true;
        localStorage.setItem('premiumUsers', JSON.stringify(premiumUsers));
        
        toast.success('Payment successful! Premium features unlocked.');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl font-bold mb-4">Upgrade to Premium</h2>
        <p className="mb-4">Unlock premium PDF reports for just $4.99/month</p>
        
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center">
            <FileCheck className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-300" />
            <span className="font-medium">Premium Features:</span>
          </div>
          <ul className="mt-2 pl-6 list-disc text-sm">
            <li>Detailed PDF health reports</li>
            <li>30-day data history</li>
            <li>Priority notifications</li>
            <li>Advanced analytics</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: darkMode ? '#FFFFFF' : '#424770',
                    '::placeholder': {
                      color: darkMode ? '#9CA3AF' : '#aab7c4',
                    },
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  },
                },
                hidePostalCode: false,
              }}
              className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded p-3`}
            />
          </div>
          
          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Secure payment with Stripe
            </div>
            <button
              type="submit"
              disabled={!stripe || loading}
              className={`px-4 py-2 rounded-md flex items-center ${
                loading
                  ? 'bg-blue-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          You'll be charged $4.99 monthly until canceled.
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('24h');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const { darkMode } = useTheme();
  const notificationService = new NotificationService();

  const checkPremiumStatus = (email: string) => {
    const premiumUsers = JSON.parse(localStorage.getItem('premiumUsers') || '{}');
    return premiumUsers[email] === true;
  };

  const generateAlerts = (data: SensorData): Alert[] => {
    const alerts: Alert[] = [];
    
    // Temperature alerts
    if (data.temperature > 37.5) {
      alerts.push({
        type: data.temperature > 38.5 ? 'critical' : 'warning',
        message: 'High Temperature',
        timestamp: new Date(),
        value: data.temperature.toFixed(1),
        unit: '°C'
      });
    } else if (data.temperature < 35.5) {
      alerts.push({
        type: 'critical',
        message: 'Low Temperature',
        timestamp: new Date(),
        value: data.temperature.toFixed(1),
        unit: '°C'
      });
    }

    // Heart rate alerts
    if (data.heartRate > 100) {
      alerts.push({
        type: data.heartRate > 120 ? 'critical' : 'warning',
        message: 'High Heart Rate',
        timestamp: new Date(),
        value: data.heartRate.toString(),
        unit: 'BPM'
      });
    } else if (data.heartRate < 60) {
      alerts.push({
        type: data.heartRate < 50 ? 'critical' : 'warning',
        message: 'Low Heart Rate',
        timestamp: new Date(),
        value: data.heartRate.toString(),
        unit: 'BPM'
      });
    }

    // SpO2 alerts
    if (data.spo2 < 95) {
      alerts.push({
        type: data.spo2 < 90 ? 'critical' : 'warning',
        message: 'Low Oxygen Saturation',
        timestamp: new Date(),
        value: data.spo2.toString(),
        unit: '%'
      });
    }

    // Fall detection alert
    if (data.fallDetection === 1) {
      alerts.push({
        type: 'critical',
        message: 'Fall Detected',
        timestamp: new Date(),
        value: 'Emergency',
        unit: ''
      });
    }

    // Blood pressure alerts
    const { systolic, diastolic } = data.bloodPressure;
    if (systolic > 140 || diastolic > 90) {
      alerts.push({
        type: (systolic > 180 || diastolic > 120) ? 'critical' : 'warning',
        message: 'High Blood Pressure',
        timestamp: new Date(),
        value: `${systolic}/${diastolic}`,
        unit: 'mmHg'
      });
    } else if (systolic < 90 || diastolic < 60) {
      alerts.push({
        type: 'critical',
        message: 'Low Blood Pressure',
        timestamp: new Date(),
        value: `${systolic}/${diastolic}`,
        unit: 'mmHg'
      });
    }

    // Alcohol level alerts
    if (data.alcoholLevel > 0.08) {
      alerts.push({
        type: data.alcoholLevel > 0.15 ? 'critical' : 'warning',
        message: 'High Alcohol Level',
        timestamp: new Date(),
        value: data.alcoholLevel.toFixed(2),
        unit: '%'
      });
    }

    return alerts;
  };

  const downloadPDF = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!checkPremiumStatus(user.email)) {
      setShowPaymentModal(true);
      return;
    }

    try {
      const doc = new jsPDF();
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 87, 183);
      doc.text('Healthcare IoT Monitoring Report', pageWidth / 2, 20, { align: 'center' });
      
      // Patient Information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Information:', 20, 40);
      doc.setFontSize(10);
      doc.text(`Name: ${userData.name || 'Not specified'}`, 25, 50);
      doc.text(`Email: ${userData.email || 'Not specified'}`, 25, 57);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 25, 64);
      doc.text(`Period: ${dateRange === '24h' ? 'Last 24 Hours' : dateRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}`, 25, 71);

      // Alert Summary
      doc.setFontSize(12);
      doc.setTextColor(220, 53, 69);
      doc.text('Alert Summary:', 20, 90);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const alertsByType = {
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length
      };

      doc.text(`Critical Alerts: ${alertsByType.critical}`, 25, 100);
      doc.text(`Warnings: ${alertsByType.warning}`, 25, 107);
      doc.text(`Information: ${alertsByType.info}`, 25, 114);

      // Data Table
      doc.setFontSize(12);
      doc.setTextColor(0, 87, 183);
      doc.text('Sensor Data:', 20, 130);
      
      const headers = [['Time', 'Temp (°C)', 'HR (BPM)', 'SpO2 (%)', 'BP (mmHg)', 'Fall']];
      const dataRows = sensorData.map(reading => [
        new Date(reading.timestamp).toLocaleTimeString(),
        reading.temperature.toFixed(1),
        reading.heartRate.toString(),
        reading.spo2.toString(),
        `${reading.bloodPressure.systolic}/${reading.bloodPressure.diastolic}`,
        reading.fallDetection ? 'Yes' : 'No'
      ]);

      (doc as any).autoTable({
        startY: 135,
        head: headers,
        body: dataRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 87, 183] },
        styles: { fontSize: 8 },
      });

      doc.save(`health-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        setIsPremium(checkPremiumStatus(user.email));

        const thingspeak = new ThingSpeakService(user.thingspeakChannel, user.thingspeakApiKey);

        const hours = dateRange === '24h' ? 24 : dateRange === '7d' ? 168 : 720;
        const data = await thingspeak.getHistoricalData({ hours });
        
        // Transform ThingSpeakData to SensorData
        const transformedData: SensorData[] = data.map(item => ({
          ...item,
          bloodPressure: {
            systolic: 120, // Default values since ThingSpeak doesn't provide blood pressure
            diastolic: 80
          }
        }));
        
        setSensorData(transformedData);

        if (transformedData.length > 0) {
          const latestData = transformedData[transformedData.length - 1];
          const newAlerts = generateAlerts(latestData);
          setAlerts(newAlerts);

          // Send SMS for critical alerts
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.phone) {
            const alerts = newAlerts.filter(alert => alert.type === 'critical');
            if (alerts.length > 0) {
              try {
                const message = notificationService.formatVitalAlerts(alerts);
                await notificationService.sendSMSAlert(user.phone, message);
                toast.success('Critical alerts notifications sent');
              } catch (error) {
                console.error('Failed to send alert notifications:', error);
                toast.error('Failed to send notifications');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        toast.error('Failed to fetch sensor data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const handlePaymentSuccess = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsPremium(checkPremiumStatus(user.email));
    setShowPaymentModal(false);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {showPaymentModal && stripePromise && (
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            onSuccess={handlePaymentSuccess} 
            userEmail={user.email}
          />
        </Elements>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medical Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`rounded-md border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2`}
              aria-label="Select time range"
              title="Time range selector"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <button
            onClick={downloadPDF}
            className={`flex items-center px-4 py-2 rounded-md ${
              isPremium
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPremium ? (
              <>
                <FileCheck className="w-5 h-5 mr-2" />
                Generate PDF Report
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Unlock Premium Report
              </>
            )}
          </button>
        </div>
      </div>

      {isPremium && (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="w-4 h-4 mr-1" />
            Premium Member
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    alert.type === 'critical'
                      ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100'
                      : alert.type === 'warning'
                      ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                  }`}
                >
                  <div className="flex items-center">
                    {alert.type === 'critical' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : alert.type === 'warning' ? (
                      <Bell className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="ml-3">{alert.message}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-4">{alert.value}{alert.unit}</span>
                    <span className="text-sm opacity-75">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-center text-gray-500">No alerts to display</p>
              )}
            </div>
          </div>

          <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Sensor Data</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Temp (°C)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">HR (BPM)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SpO2 (%)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">BP (mmHg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sensorData.slice(0, 10).map((reading, index) => (
                    <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reading.temperature.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reading.heartRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reading.spo2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reading.bloodPressure.systolic}/{reading.bloodPressure.diastolic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {reading.fallDetection ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sensorData.length === 0 && (
                <p className="text-center text-gray-500 py-4">No sensor data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;