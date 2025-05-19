import React, { useEffect } from 'react';
import { Activity, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import NotificationService from '../../services/notification';

const SpO2: React.FC = () => {
  const notificationService = new NotificationService();

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'SpO2',
      data: Array.from({ length: 24 }, () => Math.floor(Math.random() * (100 - 94) + 94)),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
        min: 90,
        max: 100,
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
    const checkSpO2 = async (level: number) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.phone) return;

      const alerts = [];
      
      if (level < 90) {
        alerts.push({
          type: 'critical',
          message: 'Severe Low Oxygen Saturation',
          value: level,
          unit: '%'
        });
      } else if (level < 95) {
        alerts.push({
          type: 'warning',
          message: 'Low Oxygen Saturation',
          value: level,
          unit: '%'
        });
      }

      if (alerts.length > 0 && alerts.some(alert => alert.type === 'critical')) {
        try {
          const message = notificationService.formatVitalAlerts(alerts);
          await notificationService.sendSMSAlert(user.phone, message);
        } catch (error) {
          console.error('Failed to send SpO2 alert:', error);
        }
      }
    };

    // Check SpO2 every minute
    const interval = setInterval(() => {
      // In a real app, this would get the actual SpO2 data
      const currentSpO2 = 98; // Example value
      checkSpO2(currentSpO2);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SpO2 Monitor</h1>
        <div className="flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg">
          <Activity className="w-5 h-5" />
          <span className="font-semibold">98%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-2xl font-semibold text-green-600">99%</p>
            </div>
            <ArrowUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">1 hour ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-2xl font-semibold text-orange-600">94%</p>
            </div>
            <ArrowDown className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">4 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-semibold text-blue-600">97%</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
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
          <h2 className="text-xl font-semibold mb-4">Oxygen Level Zones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Normal</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">95-100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mild Hypoxemia</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">90-94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Severe Hypoxemia</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">&lt; 90%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <p>Oxygen saturation is optimal. Continue normal activities.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <p>Practice deep breathing exercises to maintain good oxygen levels.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
              <p>Monitor for any sudden drops in oxygen levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpO2;