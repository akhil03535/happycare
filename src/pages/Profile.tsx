import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, User, Mail, Phone, Key, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { ThingSpeakService } from '../services/thingspeak';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  thingspeakApiKey?: string;
  thingspeakChannelId?: string;
  profileImage?: string;
}

const Profile: React.FC = () => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    thingspeakChannelId: '',
    thingspeakApiKey: '',
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        setError('Image must be less than 5MB');
      } else {
        setError('Please upload a valid image file');
      }
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          setImageLoading(true);
          setError(null);
          
          const reader = new FileReader();
          reader.onload = () => {
            setProfile(prev => ({
              ...prev,
              profileImage: reader.result as string
            }));
            setImageLoading(false);
          };
          reader.onerror = () => {
            setError('Failed to read image file');
            setImageLoading(false);
          };
          reader.readAsDataURL(file);
        } catch (err) {
          setError('Failed to process image');
          setImageLoading(false);
        }
      }
    }
  });

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setProfile(prev => ({
          ...prev,
          ...parsedData,
          thingspeakChannelId: parsedData.thingspeakChannelId || parsedData.thingspeakChannel || '',
          thingspeakApiKey: parsedData.thingspeakApiKey || ''
        }));
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data');
    }
  }, []);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!profile.name?.trim()) {
        throw new Error('Name is required');
      }

      if (!profile.email?.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profile.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!profile.phone?.trim() || !/^\+?[1-9]\d{1,14}$/.test(profile.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      if (!profile.thingspeakChannelId?.trim() || !profile.thingspeakApiKey?.trim()) {
        throw new Error('ThingSpeak Channel ID and API Key are required for ECG monitoring');
      }

      const userData = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        thingspeakChannelId: profile.thingspeakChannelId.trim(),
        thingspeakApiKey: profile.thingspeakApiKey.trim()
      };
      
      // Store updated user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Test ThingSpeak connection
      const thingspeak = new ThingSpeakService(
        profile.thingspeakChannelId.trim(),
        profile.thingspeakApiKey.trim()
      );
      
      toast.loading('Testing ThingSpeak connection...', { id: 'thingspeak-test' });
      
      const [result] = await Promise.all([
        thingspeak.getLatestData(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      if (!result) {
        throw new Error('No data received from ThingSpeak');
      }

      toast.dismiss('thingspeak-test');
      toast.success('Profile updated and ThingSpeak connection verified!');
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const [thingspeakApiKey, setThingspeakApiKey] = useState('');
  const [thingspeakChannelId, setThingspeakChannelId] = useState('');

  useEffect(() => {
    // Load existing configuration
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (userProfile.thingspeakApiKey) setThingspeakApiKey(userProfile.thingspeakApiKey);
    if (userProfile.thingspeakChannelId) setThingspeakChannelId(userProfile.thingspeakChannelId);
  }, []);

  const handleSaveThingspeak = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found');
      }

      const currentUser = JSON.parse(userData);
      const updatedUser = {
        ...currentUser,
        thingspeakApiKey,
        thingspeakChannelId
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('ThingSpeak configuration saved successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save ThingSpeak configuration';
      toast.error(message);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 ${darkMode ? 'dark' : ''}`}>
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Profile Settings
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className={`rounded-lg shadow-sm p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-start space-x-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <div
                {...getRootProps()}
                className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed overflow-hidden ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 hover:border-blue-400' 
                    : 'bg-gray-100 border-gray-300 hover:border-blue-500'
                } ${imageLoading ? 'opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                {imageLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className={`w-8 h-8 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Upload Photo
                    </p>
                  </div>
                )}
              </div>
              {imageLoading && (
                <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Processing image...
                </p>
              )}
            </div>
          </div>

          <div className="flex-grow space-y-6">
            <div>
              <label htmlFor="fullName" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}>
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  aria-label="Full Name"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(e) => {
                    setError(null);
                    setProfile(prev => ({ ...prev, name: e.target.value }));
                  }}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}>
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  aria-label="Email Address"
                  placeholder="Enter your email address"
                  value={profile.email}
                  onChange={(e) => {
                    setError(null);
                    setProfile(prev => ({ ...prev, email: e.target.value }));
                  }}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Phone field */}
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Phone Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-300' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}>
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  aria-label="Phone Number"
                  placeholder="Enter your phone number"
                  value={profile.phone}
                  onChange={(e) => {
                    setError(null);
                    setProfile(prev => ({ ...prev, phone: e.target.value }));
                  }}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ThingSpeak Configuration */}
      <div className={`rounded-lg shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ThingSpeak Configuration
        </h2>
        <div className="space-y-6">
          {/* Channel ID */}
          <div>
            <label htmlFor="thingspeakChannel" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Channel ID
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}>
                <Key className="h-4 w-4" />
              </span>
              <input
                id="thingspeakChannel"
                name="thingspeakChannel"
                type="text"
                required
                aria-label="ThingSpeak Channel ID"
                placeholder="Enter your ThingSpeak channel ID"
                value={profile.thingspeakChannelId}
                onChange={(e) => {
                  setError(null);
                  setProfile(prev => ({ ...prev, thingspeakChannelId: e.target.value }));
                }}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Your ThingSpeak channel ID for ECG monitoring</p>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="thingspeakApiKey" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              API Key
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}>
                <Key className="h-4 w-4" />
              </span>
              <input
                id="thingspeakApiKey"
                name="thingspeakApiKey"
                type="password"
                required
                aria-label="ThingSpeak API Key"
                placeholder="Enter your ThingSpeak API key"
                value={profile.thingspeakApiKey}
                onChange={(e) => {
                  setError(null);
                  setProfile(prev => ({ ...prev, thingspeakApiKey: e.target.value }));
                }}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">The API key used to read data from your ThingSpeak channel</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md flex items-center ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">ThingSpeak Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">ThingSpeak API Key</label>
            <input
              type="text"
              value={thingspeakApiKey}
              onChange={(e) => setThingspeakApiKey(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your ThingSpeak API Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ThingSpeak Channel ID</label>
            <input
              type="text"
              value={thingspeakChannelId}
              onChange={(e) => setThingspeakChannelId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your ThingSpeak Channel ID"
            />
          </div>
          <button
            onClick={handleSaveThingspeak}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save ThingSpeak Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;