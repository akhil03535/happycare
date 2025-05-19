import React from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle } from 'lucide-react';

const Alerts: React.FC = () => {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'High Temperature Detected',
      value: '38.5°C',
      time: '10 minutes ago',
      details: 'Temperature exceeded normal range. Consider medical attention if persistent.',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Low SpO2 Reading',
      value: '93%',
      time: '30 minutes ago',
      details: 'Oxygen saturation slightly below normal. Monitor closely.',
    },
    {
      id: 3,
      type: 'info',
      message: 'Irregular Heart Rate',
      value: '110 BPM',
      time: '1 hour ago',
      details: 'Heart rate elevated during rest period.',
    },
    {
      id: 4,
      type: 'resolved',
      message: 'Normal ECG Pattern Restored',
      value: 'Normal',
      time: '2 hours ago',
      details: 'ECG readings have returned to normal sinus rhythm.',
    },
  ];

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'resolved':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alerts</h1>
        <div className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">2 Active Alerts</span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border rounded-lg ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{alert.message}</h3>
                  <p className="text-sm opacity-75">{alert.time}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm opacity-90">{alert.details}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Reading: {alert.value}</span>
                  <button className="text-sm underline hover:opacity-75">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alert Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Email Alerts</span>
              <div className="relative inline-block w-12 h-6 rounded-full bg-green-500">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <div className="relative inline-block w-12 h-6 rounded-full bg-gray-300">
                <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alert History</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Total Alerts Today</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Critical Alerts</span>
              <span className="font-medium text-red-600">1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Warnings</span>
              <span className="font-medium text-yellow-600">1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Resolved</span>
              <span className="font-medium text-green-600">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;