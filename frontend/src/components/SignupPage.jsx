import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SignUp.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getApiUrl } from '../config/api.js';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      // Navigate to animation page after alert is closed
      // This happens both on button click or when timer ends
      navigate('/animation');
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
    if (!email || !password || !confirmPassword || !fullName) {
      showErrorAlert('All fields are required');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      showErrorAlert('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showErrorAlert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('auth/register'), {
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
        throw new Error(data.error || 'Failed to register user');
      }
      
      // Store user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username || email);
      localStorage.setItem('fullName', data.fullName || fullName);
      localStorage.setItem('token', data.token || '');
      
      // Show success alert and redirect on close
      showSuccessAlert('Account created successfully!');
      
    } catch (err) {
      showErrorAlert(err.message || 'Error creating account. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
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
                  I agree to the <a href="/terms" className="terms-link">Terms of Service</a>
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
            <Link to="/" className="back-link">
              ← Home
            </Link>
          </div>
          
        </div>

        <div className="signup-image-container animate-slide-right">
          <img
            src="/signupnew.png"
            alt="Signup illustration"
            className="signup-image"
          />
        </div>
        
      </div>
     
    </div>
  );
};

export default SignupPage;