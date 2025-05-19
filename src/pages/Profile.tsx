import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, User, Mail, Phone, Key, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Profile.module.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  thingspeakChannel: string;
  thingspeakApiKey: string;
  profileImage?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    thingspeakChannel: '',
    thingspeakApiKey: '',
  });
  const { darkMode } = useTheme();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  });

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setProfile(prev => ({
        ...prev,
        ...parsedData
      }));
    }
  }, []);

  const handleSaveChanges = async () => {
    try {
      // Save to localStorage
      const userData = {
        ...profile,
        thingspeakChannelId: profile.thingspeakChannel,
        thingspeakApiKey: profile.thingspeakApiKey
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Also save to a separate settings object for easy access
      localStorage.setItem('thingspeakConfig', JSON.stringify({
        channelId: profile.thingspeakChannel,
        apiKey: profile.thingspeakApiKey
      }));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 ${darkMode ? 'dark' : ''}`}>
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h1>

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
                }`}
              >
                <input {...getInputProps()} />
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className={`w-8 h-8 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload Photo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-grow space-y-6">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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

      <div className={`rounded-lg shadow-sm p-6 mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ThingSpeak Configuration
        </h2>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                type="text"
                value={profile.thingspeakChannel}
                onChange={(e) => setProfile({ ...profile, thingspeakChannel: e.target.value })}
                className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                type="password"
                value={profile.thingspeakApiKey}
                onChange={(e) => setProfile({ ...profile, thingspeakApiKey: e.target.value })}
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

      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;