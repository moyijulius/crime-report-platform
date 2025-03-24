import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ReportCrime from './components/ReportCrime';
import TrackCase from './components/TrackCase';
import OfficerDashboard from './components/OfficerDashboard';
import UserProfile from './components/UserProfile';
import ContactUs from './components/ContactUs';
import Login from './components/Login';
import Register from './components/Register';
import ReviewPage from './components/ReviewPage';
import AdminTestimonials from './components/AdminTestimonials';

// Protected Route component for authenticated users
const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Layout component to control Header/Footer visibility
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide Header and Footer if on login page
  const hideHeaderFooter = location.pathname === '/login' || location.pathname === '/officer/dashboard' || location.pathname === '/track' || location.pathname === '/report' || location.pathname === '/admin/testimonials';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {children}
      {!hideHeaderFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Hero /><HowItWorks /><Testimonials /></>} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track" element={<TrackCase />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />

          {/* Login Page - No Header/Footer */}
          <Route path="/login" element={<Login />} />

          {/* Protected User Routes */}
          <Route path="/report" element={<ProtectedUserRoute><ReportCrime /></ProtectedUserRoute>} />
          <Route path="/profile" element={<ProtectedUserRoute><UserProfile /></ProtectedUserRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
