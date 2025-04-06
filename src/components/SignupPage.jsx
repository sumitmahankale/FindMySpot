import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SignUp.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simple validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('Account created successfully!');
      
      // Store user data (in a real app, this would be handled by a backend)
      localStorage.setItem('isAuthenticated', 'true');
      const username = email.split('@')[0];
      localStorage.setItem('username', username);
      localStorage.setItem('fullName', fullName);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-form-container animate-slide-left">
          <div className="signup-header">
            <div className="logo animate-scale">
              SecureLogin
            </div>
            <h2 className="animate-fade-down">
              Create Account
            </h2>
            <p className="animate-fade-down-delay">
              Sign up to get started
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="signup-form animate-fade-in">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                className="input-focus-effect"
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
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
              <input
                className="input-focus-effect"
                type="password"
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="password-requirements">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="input-focus-effect"
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <div className="terms-agreement">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <a href="#terms" className="terms-link">Terms of Service</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="signup-button hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="login-option animate-fade-in-delay">
            <p>Already have an account? <a href="#login" onClick={() => navigate('/login')}>Log in</a></p>
          </div>
        </div>

        <div className="signup-image-container animate-slide-right">
          <img
            src="/Welcome.png"
            alt="Signup illustration"
            className="signup-image"
          />
          {/* <div className="security-badge animate-pulse">
            <div className="lock-icon"></div>
            <span>Secure Signup</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;