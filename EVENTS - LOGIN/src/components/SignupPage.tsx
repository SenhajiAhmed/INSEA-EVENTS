import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import INSEALogo from '../INSEA_Events_logo.png';
import MohssImage from '../mohss.jpg';
import ZikotajinoImage from '../zikotajino.jpg';
import SevenMedImage from '../7med.jpg';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();

  const backgroundImages = [
    MohssImage,
    ZikotajinoImage,
    SevenMedImage
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId.toString());
      // New users are not admin by default
      localStorage.setItem('isAdmin', JSON.stringify(false));
      navigate('/main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full h-[550px] flex">
        {/* Left Panel - Image Carousel */}
        <div className="w-3/5 relative overflow-hidden">
          {/* Image Carousel */}
          <div className="relative w-full h-full">
            {backgroundImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-purple-700/60 to-purple-900/80"></div>
          {/* Logo Icon */}
          <div className="absolute top-0 left-2">
            <div className="flex items-center">
              <img 
                src={INSEALogo} 
                alt="INSEA Events" 
                className="h-24 w-auto"
              />
            </div>
          </div>
          {/* Back to website link */}
          <div className="absolute top-6 right-6">
            <button className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm" onClick={() => navigate('/main')}>
              Back to website
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
          {/* Text Content */}
          <div className="absolute bottom-12 left-6 right-6">
            <h2 className="text-white text-2xl mb-4">
              Welcome to INSEA Events,<br />
              Create your account to start planning and attending amazing events.
            </h2>
            {/* Slide Indicators */}
            <div className="flex gap-2">
              {backgroundImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'w-8 bg-white' 
                      : 'w-4 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-2/5 bg-gray-900 p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <ImageWithFallback
                src={INSEALogo}
                alt="INSEA Events"
                className="w-24 mx-auto mb-3"
              />
              <h1 className="text-xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400">Start planning and attending amazing events</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-gray-800 border-gray-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                    I agree to the terms and conditions
                  </label>
                </div>
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </Button>

              <div className="text-center text-gray-400 mt-4">
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-red-400 text-center py-4">
            {error}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}