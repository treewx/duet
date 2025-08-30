'use client';

import { useState } from 'react';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = () => {
    const users = getUsersFromStorage();
    const user = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.password === formData.password
    );

    if (user) {
      // Set current user
      localStorage.setItem('duetCurrentUser', JSON.stringify(user));
      onLogin(user);
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  const handleSignup = () => {
    const users = getUsersFromStorage();
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (existingUser) {
      setErrors({ email: 'An account with this email already exists' });
      return;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      name: formData.name,
      createdAt: Date.now()
    };

    users.push(newUser);
    saveUsersToStorage(users);
    
    // Set current user
    localStorage.setItem('duetCurrentUser', JSON.stringify(newUser));
    onLogin(newUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Simulate API call delay
    setTimeout(() => {
      try {
        if (isLogin) {
          handleLogin();
        } else {
          handleSignup();
        }
      } catch (error) {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Duet</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Duet'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to continue your journey' 
              : 'Create your account to start connecting'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-red-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={switchMode}
            className="text-primary hover:text-red-600 font-medium mt-1 transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Demo Account */}
        {isLogin && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-2">Demo Account:</p>
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div>Email: demo@duet.com</div>
              <div>Password: demo123</div>
            </div>
            <button
              onClick={() => {
                setFormData({
                  email: 'demo@duet.com',
                  password: 'demo123',
                  name: '',
                  confirmPassword: ''
                });
              }}
              className="w-full mt-2 py-2 px-3 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Use Demo Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;