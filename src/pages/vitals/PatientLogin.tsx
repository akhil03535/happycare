import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import DoctorLogin from './DoctorLogin';
import DoctorSignup from './DoctorSignup';
import PatientLogin from './PatientLogin';
import PatientSignup from './PatientSignup';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor-signup" element={<DoctorSignup />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-signup" element={<PatientSignup />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;