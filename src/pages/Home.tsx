import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Thermometer, Activity, AlertTriangle, Droplet, PersonStanding } from 'lucide-react';
import { ThingSpeakService } from '../services/thingspeak';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Home.module.css';

interface VitalData {
  temperature: number;
  heartRate: number;
  spo2: number;
  alcoholLevel: number;
  fallDetection: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [vitalData, setVitalData] = useState<VitalData>({
    temperature: 0,
    heartRate: 0,
    spo2: 0,
    alcoholLevel: 0,
    fallDetection: 'Normal',
    bloodPressure: {
      systolic: 0,
      diastolic: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    const channelId = (user.thingspeakChannelId || user.thingspeakChannel)?.trim();
    const apiKey = user.thingspeakApiKey?.trim();
    
    if (!channelId || !apiKey) {
      toast.error('Please configure your ThingSpeak settings in Profile');
      setError('ThingSpeak configuration is missing. Please set up your channel ID and API key in your profile.');
      return;
    }

    // Validate API key format
    if (!/^[A-Z0-9]{16}$/i.test(apiKey)) {
      const error = 'Invalid ThingSpeak API key format. Please check your configuration.';
      toast.error(error);
      setError(error);
      return;
    }

    // Validate channel ID is numeric
    if (!/^\d+$/.test(channelId)) {
      const error = 'Invalid ThingSpeak channel ID. Please check your configuration.';
      toast.error(error);
      setError(error);
      return;
    }

    const thingspeak = new ThingSpeakService(channelId, apiKey);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await thingspeak.getLatestData();
        setVitalData({
          temperature: data.temperature,
          heartRate: data.heartRate,
          spo2: data.spo2,
          alcoholLevel: data.alcoholLevel,
          fallDetection: data.fallDetection === 1 ? 'Fall Detected' : 'Normal',
          bloodPressure: {
            systolic: 120, // Default values since ThingSpeak data doesn't include blood pressure
            diastolic: 80
          }
        });
      } catch (err: any) {
        console.error('Error fetching ThingSpeak data:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6"
    >
      <h1 className="text-3xl font-bold mb-8">Health Monitoring Dashboard</h1>
      
      <motion.div 
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        <motion.div 
          variants={item}
          onClick={() => navigate('/heart-rate')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Heart Rate</p>
              <p className="text-2xl font-semibold">{vitalData.heartRate} BPM</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full" 
              style={{ width: `${(vitalData.heartRate / 200) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 60-100 BPM</p>
        </motion.div>

        <motion.div 
          variants={item}
          onClick={() => navigate('/temperature')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Thermometer className="w-8 h-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-semibold">{vitalData.temperature}°C</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{ width: `${((vitalData.temperature - 35) / 5) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 36.5-37.5°C</p>
        </motion.div>

        <motion.div 
          variants={item}
          onClick={() => navigate('/spo2')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">SpO2</p>
              <p className="text-2xl font-semibold">{vitalData.spo2}%</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${vitalData.spo2}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Normal Range: 95-100%</p>
        </motion.div>

        <motion.div 
          variants={item}
          onClick={() => navigate('/alcohol')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Droplet className="w-8 h-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Alcohol Level</p>
              <p className="text-2xl font-semibold">{vitalData.alcoholLevel}%</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full" 
              style={{ width: `${(vitalData.alcoholLevel / 0.08) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Legal Limit: 0.08%</p>
        </motion.div>

        <motion.div 
          variants={item}
          onClick={() => navigate('/fall-detection')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <PersonStanding className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Fall Detection</p>
              <p className="text-2xl font-semibold">{vitalData.fallDetection}</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                vitalData.fallDetection === 'Normal' ? 'bg-green-500' : 'bg-red-500'
              }`} 
              style={{ width: '100%' }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Status: Active Monitoring</p>
        </motion.div>

        <motion.div 
          variants={item}
          onClick={() => navigate('/alerts')}
          className={`${styles.statsCard} ${darkMode ? styles.darkModeCard : styles.lightModeCard}`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Blood Pressure</p>
              <p className="text-2xl font-semibold">
                {vitalData.bloodPressure.systolic}/{vitalData.bloodPressure.diastolic}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-500">Systolic: {vitalData.bloodPressure.systolic} mmHg</div>
            <div className="text-sm text-gray-500">Diastolic: {vitalData.bloodPressure.diastolic} mmHg</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default Home;