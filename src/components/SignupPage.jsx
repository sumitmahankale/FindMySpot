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
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
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
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error signing in with Google');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Send registration request to backend
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        fullName
      })
    })
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        setSuccess('Account created successfully!');
        
        // Store user data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.username);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('token', data.token);
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      })
      .catch(err => {
        setIsLoading(false);
        setError('Error creating account. Please try again.');
        console.error(err);
      });
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