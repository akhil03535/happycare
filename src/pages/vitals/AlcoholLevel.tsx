import React, { useEffect } from 'react';
import { Wine, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { notificationService, type VitalAlert } from '../../services/notification';

const AlcoholLevel: React.FC = () => {
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Alcohol Level',
      data: Array.from({ length: 24 }, () => (Math.random() * 0.08).toFixed(3)),
      borderColor: 'rgb(168, 85, 247)',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
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
        min: 0,
        max: 0.1,
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
    const checkAlcoholLevel = async (level: number) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.phone) return;

      const alerts: VitalAlert[] = [];
      
      if (level > 0.15) {
        alerts.push({
          type: 'critical',
          message: 'CRITICAL: Dangerously High Alcohol Level - Immediate Action Required',
          value: level.toFixed(2),
          unit: '%'
        });
      } else if (level > 0.08) {
        alerts.push({
          type: 'critical',
          message: 'CRITICAL: High Alcohol Level - Above Legal Limit',
          value: level.toFixed(2),
          unit: '%'
        });
      }

      if (alerts.length > 0 && alerts.some(alert => alert.type === 'critical')) {
        try {
          const message = notificationService.formatVitalAlerts(alerts);
          await notificationService.sendSMSAlert(user.phone, message);

          // Also notify emergency contact if alcohol level is critically high
          if (level > 0.15 && user.emergencyContact?.phone) {
            const emergencyMessage = `EMERGENCY: ${user.name} has a dangerously high alcohol level of ${level.toFixed(2)}%. Immediate assistance may be required.`;
            await notificationService.sendSMSAlert(user.emergencyContact.phone, emergencyMessage);
          }
        } catch (error) {
          console.error('Failed to send alcohol level alert:', error);
        }
      }
    };

    // Check alcohol level every minute
    const interval = setInterval(() => {
      // In a real app, this would get the actual alcohol level data
      const currentLevel = 0.02; // Example value
      checkAlcoholLevel(currentLevel);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alcohol Level Monitor</h1>
        <div className="flex items-center space-x-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-lg">
          <Wine className="w-5 h-5" />
          <span className="font-semibold">0.02%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-2xl font-semibold text-red-600">0.08%</p>
            </div>
            <ArrowUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">2 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-2xl font-semibold text-green-600">0.00%</p>
            </div>
            <ArrowDown className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">8 hours ago</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-semibold text-purple-600">0.02%</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
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
              <span>Current Level</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Safe</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Legal Limit</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">0.08%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Level</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Low</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
              <p>Current alcohol level is within safe limits.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <p>Stay hydrated and monitor your consumption.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-purple-500"></div>
              <p>Set up alerts for elevated alcohol levels.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlcoholLevel;