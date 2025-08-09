import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import INSEALogo from '../../INSEA_Events_logo.png';
import MohssImage from '../../mohss.jpg';
import ZikotajinoImage from '../../zikotajino.jpg';
import SevenMedImage from '../../7med.jpg';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Array of background images for the carousel
  const backgroundImages = [
    MohssImage,
    ZikotajinoImage,
    SevenMedImage
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the token in localStorage (in production, consider using a more secure approach)
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId.toString());
      if (typeof data.isAdmin !== 'undefined') {
        localStorage.setItem('isAdmin', JSON.stringify(!!data.isAdmin));
      }

      // Redirect to main page
      navigate('/main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full h-[600px] flex">
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
                className="h-32 w-auto"
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
            <h2 className="text-white text-3xl mb-8">
              Welcome Back,<br />
              Sign In to Continue
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
        {/* Right Panel - Login Form */}
        <div className="w-2/5 bg-gray-900 p-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <ImageWithFallback
                src={INSEALogo}
                alt="INSEA Events"
                className="w-32 mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to continue</p>
            </div>

            {error && (
              <div className="bg-red-600 text-white p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
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
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="text-center text-gray-400">
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToSignup}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}