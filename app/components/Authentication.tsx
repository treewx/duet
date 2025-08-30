'use client';

import { useState } from 'react';
import { UserManager } from '../utils/userManager';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

interface AuthenticationProps {
  onLogin: (user: User) => void;
}

const Authentication = ({ onLogin }: AuthenticationProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUsersFromStorage = (): User[] => {
    const users = localStorage.getItem('duetUsers');
    return users ? JSON.parse(users) : [];
  };

  const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem('duetUsers', JSON.stringify(users));
  };

  const handleLogin = async () => {
    try {
      // Try new API first, fall back to localStorage for backward compatibility
      try {
        const user = await UserManager.login(formData.email, formData.password);
        onLogin(user);
        return;
      } catch (apiError) {
        // Silently fall back to localStorage method for existing users
        // This happens when database isn't connected yet
      }

      // Fallback to localStorage method
      const users = getUsersFromStorage();
      const user = users.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase() && 
        u.password === formData.password
      );

      if (user) {
        // Migrate to database in background
        try {
          await UserManager.register(user.email, user.password, user.name);
        } catch (e) {
          // User might already exist in DB, try login
          await UserManager.login(user.email, user.password);
        }
        onLogin(user);
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed' });
    }
  };

  const handleSignup = async () => {
    try {
      const user = await UserManager.register(formData.email, formData.password, formData.name);
      onLogin(user);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        setErrors({ email: error.message });
      } else {
        setErrors({ general: error.message || 'Registration failed' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await UserManager.forgotPassword(formData.email);
      setResetSuccess(true);
    } catch (error: any) {
      setErrors({ email: error.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setResetSuccess(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const showForgotPasswordForm = () => {
    setShowForgotPassword(true);
    setIsLogin(true);
    setResetSuccess(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const backToLogin = () => {
    setShowForgotPassword(false);
    setResetSuccess(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Duet</h1>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back!' : 'Join Duet')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {showForgotPassword
              ? 'Enter your email to receive reset instructions'
              : (isLogin 
                ? 'Sign in to continue your journey' 
                : 'Create your account to start connecting'
              )
            }
          </p>
        </div>

        {/* Success Message for Reset */}
        {resetSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <div>
                <p className="text-green-800 font-medium text-sm">Reset instructions sent!</p>
                <p className="text-green-600 text-xs mt-1">Check your email for password reset instructions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!resetSuccess && (
          <form onSubmit={showForgotPassword ? (e) => { e.preventDefault(); handleForgotPassword(); } : handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && !showForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
            </div>

            {!showForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={showForgotPasswordForm}
                      className="text-xs sm:text-sm text-primary hover:text-red-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.password}</p>}
              </div>
            )}

            {!isLogin && !showForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs sm:text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-red-600 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-xs sm:text-sm">
                      {showForgotPassword ? 'Sending...' : (isLogin ? 'Signing In...' : 'Creating Account...')}
                    </span>
                  </div>
                ) : (
                  showForgotPassword ? 'Send Reset Instructions' : (isLogin ? 'Sign In' : 'Create Account')
                )}
              </button>

              {showForgotPassword && (
                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full py-3 px-4 text-sm sm:text-base rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </form>
        )}

        {/* Switch Mode */}
        {!showForgotPassword && !resetSuccess && (
          <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={switchMode}
              className="text-sm sm:text-base text-primary hover:text-red-600 font-medium mt-1 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Back to Sign In from Reset Success */}
        {resetSuccess && (
          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={backToLogin}
              className="text-sm sm:text-base text-primary hover:text-red-600 font-medium transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Authentication;