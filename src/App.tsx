import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import PatientHomepage from './pages/Patient/PatientHomePage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import PatientBooking from './pages/Patient/PatientBookingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>       
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<PatientHomepage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/patient/booking/" element={<PatientBooking />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;