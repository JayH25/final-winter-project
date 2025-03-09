/* global chrome */

import React, { useState } from 'react';
import './Login.css';
// import Signup from './signup';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Add this state to handle signup view
  const [showSignup, setShowSignup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For demo purposes, simulate API call with timeout
      // Replace this with your actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      // In a real app, you would validate credentials with your backend
      if (formData.email && formData.password) {
        // Store user info if needed
        const userData = {
          email: formData.email,
          lastLogin: new Date().toISOString()
        };
        
        // Use Chrome storage for persistence
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ userData, isLoggedIn: true }, () => {
            console.log('User data saved');
          });
        }
        
        // Notify parent component of successful login
        onLoginSuccess();
      } else {
        setErrors({ general: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Handle signup click
  const handleSignupClick = (e) => {
    e.preventDefault();
    setShowSignup(true);
  };

  // If showing signup, import and render the Signup component
  if (showSignup) {
    // Since we're in the same file, we'll need to import Signup dynamically or use props
    // For this example, let's assume you'll import Signup from a separate file
    const Signup = require('./signup').default;
    return (
      <Signup 
        onSignupSuccess={onLoginSuccess} 
        onBackToLogin={() => setShowSignup(false)} 
      />
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue with Resume Parser</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'input-error' : ''}
              />
              <span className="input-icon">✉️</span>
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="password-toggle"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#" onClick={handleSignupClick}>Sign Up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;