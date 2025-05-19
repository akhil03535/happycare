import React, { useState, useEffect } from 'react';
import { Bell, Shield, Moon, Sun, Wifi, Save } from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Thresholds {
  heartRate: { min: number; max: number };
  temperature: { min: number; max: number };
  spo2: { min: number; max: number };
  alcoholLevel: { max: number };
}

interface Notifications {
  email: boolean;
  sms: boolean;
  push: boolean;
  sound: boolean;
}

interface ThingSpeakConfig {
  channelId: string;
  apiKey: string;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ 
  checked, 
  onChange 
}) => {
  return (
    <div className="relative inline-block w-12 h-6">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0"
      />
      <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <span className={`absolute h-4 w-4 left-1 bottom-1 bg-white rounded-full transition-all duration-300 ${checked ? 'transform translate-x-6' : ''}`}></span>
      </span>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    sms: true,
    push: false,
    sound: true
  });

  const [thresholds, setThresholds] = useState<Thresholds>({
    heartRate: { min: 60, max: 100 },
    temperature: { min: 36.5, max: 37.5 },
    spo2: { min: 95, max: 100 },
    alcoholLevel: { max: 0.08 }
  });

  const [thingspeakConfig, setThingspeakConfig] = useState<ThingSpeakConfig>({
    channelId: user?.thingspeakChannelId || '',
    apiKey: user?.thingspeakApiKey || ''
  });

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        const savedThresholds = localStorage.getItem('thresholds');

        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        if (savedThresholds) {
          setThresholds(JSON.parse(savedThresholds));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle saving settings
  const handleSaveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(notifications));
      localStorage.setItem('thresholds', JSON.stringify(thresholds));

      // Update user context with ThingSpeak credentials
      if (user && updateUser) {
        const updatedUser = await updateUser({
          ...user,
          thingspeakChannelId: thingspeakConfig.channelId,
          thingspeakApiKey: thingspeakConfig.apiKey
        });

        // Verify the update was successful
        if (!updatedUser.thingspeakChannelId || !updatedUser.thingspeakApiKey) {
          throw new Error('Failed to update ThingSpeak credentials');
        }
      }

      toast.success('Settings saved successfully!', {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  const handleThingspeakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setThingspeakConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThresholdChange = (key: keyof Thresholds, field: 'min' | 'max', value: number) => {
    setThresholds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  return (
    <div className={`min-h-screen max-w-4xl mx-auto py-8 px-4 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex items-center mb-8">
        <SettingsIcon className="w-8 h-8 mr-3 text-blue-600" />
        <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* ThingSpeak Configuration */}
        <div className={`rounded-lg shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <Wifi className="w-5 h-5 mr-2 text-blue-500" />
            ThingSpeak Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="channelId" className="block text-sm font-medium mb-1 dark:text-white">
                Channel ID
              </label>
              <input
                type="text"
                id="channelId"
                name="channelId"
                value={thingspeakConfig.channelId}
                onChange={handleThingspeakChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter your ThingSpeak Channel ID"
              />
            </div>
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1 dark:text-white">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={thingspeakConfig.apiKey}
                onChange={handleThingspeakChange}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter your ThingSpeak API Key"
              />
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              These credentials are required for ECG monitoring functionality.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSaveSettings}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;