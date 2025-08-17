import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginPage.css';
import { getApiUrl, getAuthHeaders } from '../config/api.js';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Modify the showSuccessAlert function
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: 'var(--medium-blue)',
      timer: 2000,
      timerProgressBar: true,
      background: '#f8f9fa',
      iconColor: '#4CAF50',
    }).then(() => {
      // Instead of just navigating, reload the page with the new URL
      window.location.href = '/userdashboard';
      // This is different from navigate() as it causes a full page reload
    });
  };

  // Modify the showErrorAlert function
  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#f44336', // You can change this red color if needed
      // Add more custom styling
      background: '#f8f9fa', // Light background
      iconColor: '#f44336', // Red icon
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the backend login API endpoint
      const response = await fetch(getApiUrl('auth/login'), {
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

      // Store authentication data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('userId', data.userId);

      // Show success alert and redirect
      showSuccessAlert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      showErrorAlert(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-container animate-slide-left">
          <div className="login-header">
            <div className="logo animate-scale">
              SecureLogin
            </div>
            <h2 className="animate-fade-down">
              Welcome Back
            </h2>
            <p className="animate-fade-down-delay">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form animate-fade-in">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                className="input-focus-effect"
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  className="input-focus-effect"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="eye-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <a href="#" onClick={() => navigate('/forgetpass')} className="hover-orange">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="register-option animate-fade-in-delay">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            <Link to="/" className="back-link">
              ← Home
            </Link>
          </div>
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/newlogin.png"
            alt="Login illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;