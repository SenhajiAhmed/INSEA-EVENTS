import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import INSEALogo from '../INSEA_Events_logo.png';
import MohssImage from '../mohss.jpg';
import ZikotajinoImage from '../zikotajino.jpg';
import SevenMedImage from '../7med.jpg';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`Background ${index + 1}`}
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
            <button className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm">
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
        <div className="w-2/5 p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-white text-2xl mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm mb-8">
              Don't have an account? 
              <button 
                onClick={onSwitchToSignup}
                className="text-purple-400 hover:text-purple-300 ml-1"
              >
                Sign up
              </button>
            </p>

            <form className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-400">
                    Remember me
                  </label>
                </div>
                <button className="text-sm text-purple-400 hover:text-purple-300">
                  Forgot password?
                </button>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg">
                Sign in
              </Button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">Or sign in with</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 