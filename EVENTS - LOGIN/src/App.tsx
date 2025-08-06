import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './mainlink/authentification/LoginPage';
import SignupPage from './components/SignupPage';
import MainPage from './mainlink/MainPage';

function AppRoutes() {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onSwitchToSignup={() => navigate('/signup')} />} />
      <Route path="/signup" element={<SignupPage onSwitchToLogin={() => navigate('/login')} />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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