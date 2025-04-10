import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SignUp.css'; // You can reuse the same CSS
import { Link } from 'react-router-dom';

const ListerSignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Required fields cannot be empty');
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

    try {
      const response = await fetch('http://localhost:5000/api/auth/lister/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          businessName,
          phone,
          address,
          role: 'lister' // Add role to identify user type
        })
      });
    
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register lister');
      }
      
      // Store user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', data.username || email);
      localStorage.setItem('fullName', data.fullName || fullName);
      localStorage.setItem('businessName', data.businessName || businessName);
      localStorage.setItem('role', 'lister'); // Set role as lister
      localStorage.setItem('token', data.token || '');
      
      // Show success message and redirect
      alert('Lister account created successfully!');
      
      // Redirect to lister page
      navigate('/lister');
      
    } catch (err) {
      setError(err.message || 'Error creating account. Please try again.');
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
              Create Lister Account
            </h2>
            <p className="animate-fade-down-delay">
              Sign up to start listing your parking spaces
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form animate-fade-in">
            <div className="form-group">
              <label htmlFor="fullName">Full Name*</label>
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
              <label htmlFor="email">Email*</label>
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
              <label htmlFor="businessName">Business Name (Optional)</label>
              <input
                className="input-focus-effect"
                type="text"
                id="businessName"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                className="input-focus-effect"
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Business Address (Optional)</label>
              <input
                className="input-focus-effect"
                type="text"
                id="address"
                placeholder="Enter your business address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password*</label>
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
              <label htmlFor="confirmPassword">Confirm Password*</label>
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
                'Create Lister Account'
              )}
            </button>
          </form>

          <div className="login-option animate-fade-in-delay">
            <p>Already have an account? <Link to="/listerlogin">Log in</Link></p>
            <Link to="/" className="back-link">
              ← Home
            </Link>
          </div>
          
        </div>

        <div className="signup-image-container animate-slide-right">
          <img
            src="/wel.png"
            alt="Signup illustration"
            className="signup-image"
          />
        </div>
        
      </div>
    </div>
  );
};

export default ListerSignupPage;