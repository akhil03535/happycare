import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import Home from './pages/Home';
import ECGMonitor from './pages/ECGMonitor';
import HeartRate from './pages/vitals/HeartRate';
import Temperature from './pages/vitals/Temperature';
import SpO2 from './pages/vitals/SpO2';
import AlcoholLevel from './pages/vitals/AlcoholLevel';
import FallDetection from './pages/vitals/FallDetection';
import Alerts from './pages/vitals/Alerts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import HowToUse from './pages/HowToUse';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/ecg" element={<ECGMonitor />} />
          <Route path="/heart-rate" element={<HeartRate />} />
          <Route path="/temperature" element={<Temperature />} />
          <Route path="/spo2" element={<SpO2 />} />
          <Route path="/alcohol" element={<AlcoholLevel />} />
          <Route path="/fall-detection" element={<FallDetection />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;