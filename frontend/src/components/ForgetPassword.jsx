import React, { useState } from 'react';
import { getApiUrl } from '../config/api.js';
import { Link } from 'react-router-dom';
import './CSS/ForgetPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    // Fix: Use the complete URL with correct API endpoint
  fetch(getApiUrl('auth/reset-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        newPassword 
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to reset password');
          });
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        setSuccess(true);
        console.log('Password reset successful:', data);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error.message || 'Failed to reset password. Please try again.');
        console.error('Password reset error:', error);
      });
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-form-container animate-slide-left">
          <div className="forgot-header">
            <div className="logo animate-scale">
              SecureLogin
            </div>
            <h2 className="animate-fade-down">
              Reset Password
            </h2>
            <p className="animate-fade-down-delay">
              Enter your email and create a new password
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          {success ? (
            <div className="success-message animate-fade-in">
              <div className="success-icon">✓</div>
              <h3>Password Reset Successfully!</h3>
              <p>Your password has been changed. You can now log in with your new password.</p>
              <Link to="/Login" className="back-to-login hover-effect">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="forgot-form animate-fade-in">
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
                <label htmlFor="newPassword">New Password</label>
                <input
                  className="input-focus-effect"
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  className="input-focus-effect"
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="8"
                />
              </div>

              <button
                type="submit"
                className="reset-button hover-effect"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
              
              <div className="back-option">
                <Link to="/Login" className="back-link">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="forgot-image-container animate-slide-right">
          <img
            src="/forgetpass.png"
            alt="Forgot password illustration"
            className="forgot-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;