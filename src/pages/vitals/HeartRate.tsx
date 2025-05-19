import React, { useEffect } from 'react';
import { Heart, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import NotificationService from '../../services/notification';

const HeartRate: React.FC = () => {
  const notificationService = new NotificationService();

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Heart Rate',
      data: Array.from({ length: 24 }, () => Math.floor(Math.random() * (100 - 60) + 60)),
      borderColor: 'rgb(239, 68, 68)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        min: 40,
        max: 120,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  useEffect(() => {
    const checkHeartRate = async (bpm: number) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.phone) return;

      const alerts = [];
      
      if (bpm > 120) {
        alerts.push({
          type: 'critical',
          message: 'Dangerously High Heart Rate',
          value: bpm,
          unit: 'BPM'
        });
      } else if (bpm > 100) {
        alerts.push({
          type: 'warning',
          message: 'Elevated Heart Rate',
          value: bpm,
          unit: 'BPM'
        });
      } else if (bpm < 50) {
        alerts.push({
          type: 'critical',
          message: 'Dangerously Low Heart Rate',
          value: bpm,
          unit: 'BPM'
        });
      } else if (bpm < 60) {
        alerts.push({
          type: 'warning',
          message: 'Low Heart Rate',
          value: bpm,
          unit: 'BPM'
        });
      }

      if (alerts.length > 0 && alerts.some(alert => alert.type === 'critical')) {
        try {
          const message = notificationService.formatVitalAlerts(alerts);
          await notificationService.sendSMSAlert(user.phone, message);
        } catch (error) {
          console.error('Failed to send heart rate alert:', error);
        }
      }
    };

    // Check heart rate every minute
    const interval = setInterval(() => {
      // In a real app, this would get the actual heart rate data
      const currentBPM = 75; // Example value
      checkHeartRate(currentBPM);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Heart Rate Monitor</h1>
        <div className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg">
          <Heart className="w-5 h-5" />
          <span className="font-semibold">75 BPM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-2xl font-semibold text-red-600">98 BPM</p>
            </div>
            <ArrowUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">2 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-2xl font-semibold text-blue-600">62 BPM</p>
            </div>
            <ArrowDown className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">5 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-semibold text-green-600">75 BPM</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Last 24 hours</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">24-Hour Trend</h2>
        <Line data={chartData} options={chartOptions} className="h-[300px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Status Indicators</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Resting Heart Rate</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Heart Rate Variability</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recovery Status</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Moderate</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <p>Heart rate is within normal range. Continue regular activities.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
              <p>Consider light exercise to improve recovery status.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <p>Monitor heart rate during physical activities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartRate;