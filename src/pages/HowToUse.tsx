import React from 'react';
import { BookOpen, Heart, Activity, Thermometer, Droplet, PersonStanding } from 'lucide-react';

const HowToUse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">How to Use Your Health Monitor</h1>
      
      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Getting Started
          </h2>
          <p className="text-gray-600 mb-4">
            Welcome to your comprehensive health monitoring system. This guide will help you understand
            how to use each feature effectively to monitor your vital signs.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-red-500" />
              Heart Rate Monitor
            </h3>
            <p className="text-gray-600">
              Monitor your heart rate in real-time. The normal resting heart rate range is 60-100 beats per minute.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-purple-500" />
              ECG Monitoring
            </h3>
            <p className="text-gray-600">
              View your electrocardiogram readings to track your heart's electrical activity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Thermometer className="h-5 w-5 text-orange-500" />
              Temperature
            </h3>
            <p className="text-gray-600">
              Keep track of your body temperature. Normal body temperature typically ranges from 97°F to 99°F.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Droplet className="h-5 w-5 text-blue-500" />
              Blood Oxygen (SpO2)
            </h3>
            <p className="text-gray-600">
              Monitor your blood oxygen saturation levels. Normal SpO2 levels are typically above 95%.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <PersonStanding className="h-5 w-5 text-green-500" />
            Fall Detection
          </h3>
          <p className="text-gray-600">
            The fall detection system automatically alerts your emergency contacts if a fall is detected.
            To test the system:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Ensure your emergency contacts are set up in Settings</li>
            <li>Keep the device properly secured when wearing</li>
            <li>Test the alert system monthly to ensure proper function</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HowToUse;