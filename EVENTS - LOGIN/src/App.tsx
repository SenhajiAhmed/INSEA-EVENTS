import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './mainlink/authentification/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './mainlink/MainPage';
import DashboardPage from './mainlink/dashboard/DashboardPage';
import ScraperPage from './mainlink/dashboard/ScraperPage';

function AppRoutes() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Redirect to dashboard if token exists and user is on login page
  useEffect(() => {
    if (token && window.location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [navigate, token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onSwitchToSignup={() => navigate('/signup')} />} />
      <Route path="/signup" element={<SignupPage onSwitchToLogin={() => navigate('/login')} />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/scraper" element={<ScraperPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}