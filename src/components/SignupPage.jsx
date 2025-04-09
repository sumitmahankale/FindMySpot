import React, { useState, useEffect } from 'react';
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
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    // Load the Google Sign-In API script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        initializeGoogleSignIn();
      };
    };

    // Initialize Google Sign-In button
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
         // client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '', // Use environment variable
          callback: handleGoogleSignIn
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
        );
      }
    };

    loadGoogleScript();
    
    // Cleanup
    return () => {
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        googleScript.remove();
      }
    };
  }, []);

  // Handle Google Sign-In response
  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Send the ID token to your backend
      const result = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: response.credential
        })
      });
      
      const data = await result.json();
      
      if (!result.ok) {
        throw new Error(data.message || 'Failed to sign in with Google');
      }
      
      // Store user data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username);
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('token', data.token);
      
      setSuccess('Successfully signed in with Google!');
      setShowPopup(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error signing in with Google');
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Simple validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError('All fields are required');
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setShowPopup(true);
      setIsLoading(false);
      return;
    }

    try {
      // Send registration request to backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      // Store user data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username);
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('token', data.token);
      
      setSuccess('Account created successfully!');
      setShowPopup(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
      setShowPopup(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close popup after timeout
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000); // Auto-hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Handle popup close button
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="signup-page">
      {/* Popup Message */}
      {showPopup && (error || success) && (
        <div className={`popup-message ${error ? 'error-popup' : 'success-popup'}`}>
          <div className="popup-content">
            <span className="close-popup" onClick={handleClosePopup}>&times;</span>
            <div className="popup-icon">
              {error ? '❌' : '✅'}
            </div>
            <div className="popup-text">
              {error || success}
            </div>
          </div>
        </div>
      )}

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
            
            <div className="separator">
              <span>OR</span>
            </div>
            
            <div id="google-signin-button" className="google-signin"></div>
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
        </div>
      </div>
    </div>
  );
};

export default SignupPage;