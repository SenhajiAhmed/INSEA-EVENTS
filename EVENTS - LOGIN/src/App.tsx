import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './mainlink/authentification/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './mainlink/MainPage';
import DashboardPage from './mainlink/dashboard/DashboardPage';
import BlogPostPage from './pages/BlogPostPage';

// Public route component - only for unauthenticated users
const PublicRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// Protected route component - only for authenticated users
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <Routes>
      {/* Public Routes - only for unauthenticated users */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={
          <LoginPage onSwitchToSignup={() => navigate('/signup')} />
        } />
        <Route path="/signup" element={
          <SignupPage onSwitchToLogin={() => navigate('/login')} />
        } />
      </Route>
      
      {/* Protected Routes - only for authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Public routes - accessible to all */}
      <Route path="/main" element={<MainPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      
      {/* Fallback route */}
      <Route 
        path="*" 
        element={
          <Navigate to={token ? "/dashboard" : "/login"} replace />
        } 
      />
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