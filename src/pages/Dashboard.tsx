import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Thermometer, Activity, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/heart-rate')}
          className="bg-white p-6 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Heart Rate</p>
              <p className="text-2xl font-semibold">75 BPM</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full progress-75"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 60-100 BPM</p>
        </div>

        <div 
          onClick={() => navigate('/temperature')}
          className="bg-white p-6 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Thermometer className="w-8 h-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Spo2</p>
              <p className="text-2xl font-semibold">37.2°C</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full progress-60"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 36.5-37.5°C</p>
        </div>

        <div 
          onClick={() => navigate('/spo2')}
          className="bg-white p-6 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">ECG</p>
              <p className="text-2xl font-semibold">98%</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full progress-98"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 95-100%</p>
        </div>

        <div 
          onClick={() => navigate('/alerts')}
          className="bg-white p-6 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Alerts</p>
              <p className="text-2xl font-semibold">2</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-red-500">• High Temperature</div>
            <div className="text-sm text-orange-500">• Low SpO2</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">ECG Reading #{index + 1}</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Normal
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alerts History</h2>
          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Irregular Heartbeat Detected</p>
                  <p className="text-sm text-gray-500">3 hours ago</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Critical
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;