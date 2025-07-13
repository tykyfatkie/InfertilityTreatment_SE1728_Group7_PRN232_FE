import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Homepage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import PatientHomepage from './pages/Patient/PatientHomePage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import AdminDoctor from './pages/Admin/AdminDoctor';
import AdminPatient from './pages/Admin/AdminPatient';
import RegisterPage from './pages/Register/RegisterPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminServiceRequest from './pages/Admin/AdminServiceRequest';
import AdminMedications from './pages/Admin/AdminMedications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>    

          {/* Guest    */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/contact-us" element={<ContactPage />} />


          {/* Patient       */}
          <Route path="/home" element={<PatientHomepage />} />


          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDoctor />} />
          <Route path="/admin/patients" element={<AdminPatient />} />
          <Route path="/admin/services" element={<AdminServiceRequest />} />
          <Route path="/admin/medications" element={<AdminMedications />} />


          {/* Doctor */}



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