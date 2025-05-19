import React, { useEffect, useState } from 'react';
import { PersonStanding } from 'lucide-react';
import NotificationService from '../../services/notification';
import type { VitalAlert } from '../../services/notification';

const FallDetection: React.FC = () => {
  const [fallStatus, setFallStatus] = useState({
    detected: false,
    timestamp: new Date(),
  });
  const notificationService = new NotificationService();

  useEffect(() => {
    const handleFallDetection = async (detected: boolean) => {
      if (!detected) return;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.phone) return;

      const alerts: VitalAlert[] = [
        {
          type: 'critical',
          message: 'Fall Detected - Emergency',
          value: 'EMERGENCY',
          unit: '',
        },
      ];

      try {
        // Send alert to user
        const message = notificationService.formatVitalAlerts(alerts);
        await notificationService.sendSMSAlert(user.phone, message);

        // Send alert to emergency contact if available
        if (user.emergencyContact?.phone) {
          const emergencyMessage = `EMERGENCY: Fall detected for ${user.name}. Location: ${
            user.location || 'Unknown'
          }. Immediate assistance may be required.`;
          await notificationService.sendSMSAlert(user.emergencyContact.phone, emergencyMessage);
        }

        // Optional: Send alert to healthcare provider
        if (user.doctor?.phone) {
          const doctorMessage = `Medical Alert: Fall detected for patient ${user.name} (ID: ${user.id}). Patient status being monitored.`;
          await notificationService.sendSMSAlert(user.doctor.phone, doctorMessage);
        }
      } catch (error) {
        console.error('Failed to send fall detection alerts:', error);
      }
    };

    // Check for falls every 5 seconds
    const interval = setInterval(() => {
      // In a real app, this would get the actual fall detection data
      const detected = Math.random() < 0.001; // Very low probability for testing
      if (detected) {
        setFallStatus({ detected, timestamp: new Date() });
        handleFallDetection(detected);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fall Detection Monitor</h1>
        <div
          className={`flex items-center space-x-2 ${
            fallStatus.detected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          } px-4 py-2 rounded-lg`}
        >
          <PersonStanding className="w-5 h-5" />
          <span className="font-semibold">
            {fallStatus.detected ? 'Fall Detected!' : 'No Falls Detected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Detection Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Sensitivity</span>
              <select
                className="text-sm border rounded-md px-2 py-1"
                title="Fall Detection Sensitivity"
                aria-label="Fall Detection Sensitivity"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Response Time</span>
              <select
                className="text-sm border rounded-md px-2 py-1"
                title="Alert Response Time"
                aria-label="Alert Response Time"
              >
                <option>Immediate</option>
                <option>After 5 seconds</option>
                <option>After 10 seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Last Detection</h2>
          <div className="space-y-4">
            {fallStatus.detected ? (
              <>
                <div className="text-red-600 font-semibold">
                  Fall Detected at {fallStatus.timestamp.toLocaleTimeString()}
                </div>
                <p className="text-sm text-gray-600">
                  Emergency contacts have been notified. Medical assistance is being arranged.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                No falls detected in the last 24 hours. System is actively monitoring.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallDetection;