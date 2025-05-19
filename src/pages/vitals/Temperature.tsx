import React, { useEffect } from 'react';
import { Thermometer, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import NotificationService from '../../services/notification';

const Temperature: React.FC = () => {
  const notificationService = new NotificationService();

  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Temperature',
      data: Array.from({ length: 24 }, () => (Math.random() * (38 - 36) + 36).toFixed(1)),
      borderColor: 'rgb(249, 115, 22)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
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
        min: 35,
        max: 39,
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
    const checkTemperature = async (temp: number) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.phone) return;

      const alerts = [];
      
      if (temp > 38.5) {
        alerts.push({
          type: 'critical',
          message: 'Dangerously High Temperature',
          value: temp,
          unit: '°C'
        });
      } else if (temp > 37.5) {
        alerts.push({
          type: 'warning',
          message: 'Elevated Temperature',
          value: temp,
          unit: '°C'
        });
      } else if (temp < 35.0) {
        alerts.push({
          type: 'critical',
          message: 'Dangerously Low Temperature',
          value: temp,
          unit: '°C'
        });
      }

      if (alerts.length > 0 && alerts.some(alert => alert.type === 'critical')) {
        try {
          const message = notificationService.formatVitalAlerts(alerts);
          await notificationService.sendSMSAlert(user.phone, message);
        } catch (error) {
          console.error('Failed to send temperature alert:', error);
        }
      }
    };

    // Check temperature every minute
    const interval = setInterval(() => {
      // In a real app, this would get the actual temperature data
      const currentTemp = 37.2; // Example value
      checkTemperature(currentTemp);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Temperature Monitor</h1>
        <div className="flex items-center space-x-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-lg">
          <Thermometer className="w-5 h-5" />
          <span className="font-semibold">37.2°C</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-2xl font-semibold text-red-600">37.8°C</p>
            </div>
            <ArrowUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">1 hour ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-2xl font-semibold text-blue-600">36.5°C</p>
            </div>
            <ArrowDown className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">6 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-semibold text-green-600">37.0°C</p>
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
          <h2 className="text-xl font-semibold mb-4">Temperature Zones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Hypothermia</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">&lt; 35°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Normal</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">36.5-37.5°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fever</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">&gt; 37.5°C</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <p>Temperature is within normal range. No action needed.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
              <p>Stay hydrated and monitor for any changes.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <p>Check temperature every 4 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Temperature;