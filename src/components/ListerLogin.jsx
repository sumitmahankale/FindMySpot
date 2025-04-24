import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginPage.css'; // Assuming you have a similar CSS file for login
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const ListerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Replace the showSuccessAlert function
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: 'var(--medium-blue)',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      // Use window.location.href instead of navigate()
      window.location.href = '/Listerdashboard';
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#f44336'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      showErrorAlert('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/lister/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
    
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }
      
      // Store user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username || email);
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('businessName', data.businessName || '');
      localStorage.setItem('role', 'lister');
      localStorage.setItem('token', data.token);
      localStorage.setItem('listerId', data.listerId);
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      console.log('Login successful! Stored listerId:', data.listerId);
      
      // Show success alert and redirect on close
      showSuccessAlert('Logged in successfully!');
      
    } catch (err) {
      showErrorAlert(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
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
              Lister Login
            </h2>
            <p className="animate-fade-down-delay">
              Welcome back! Log in to manage your parking spaces
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
              <div className="forgot-password">
                <a href="#" onClick={() => navigate('/listerforgetpass')} className="hover-orange">
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="login-button hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="register-option animate-fade-in-delay">
            <p>Don't have an account? <Link to="/listersignup">Sign up</Link></p>
            <Link to="/" className="back-link">
              ← Home
            </Link>
          </div>
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/login1.png"
            alt="Login illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ListerLoginPage;