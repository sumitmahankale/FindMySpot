import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CSS/ForgetPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Simple validation
      if (email && email.includes('@')) {
        setSuccess(true);
      } else {
        setError('Please enter a valid email address.');
      }
    }, 1500);
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
              Enter your email to receive a password reset link
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          {success ? (
            <div className="success-message animate-fade-in">
              <div className="success-icon">✓</div>
              <h3>Reset Link Sent!</h3>
              <p>Please check your email for instructions to reset your password.</p>
              <Link to="/" className="back-to-login hover-effect">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-form animate-fade-in">
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

              <button
                type="submit"
                className="reset-button hover-effect"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  'Send Reset Link'
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
            src="/forget.png"
            alt="Forgot password illustration"
            className="forgot-image"
          />
          
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;