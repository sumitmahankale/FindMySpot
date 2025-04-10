import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CSS/listersignup.css';

const ListerSignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    businessName: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { email, password, confirmPassword, fullName, businessName, phone, address } = formData;

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
          role: 'lister'
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
      localStorage.setItem('role', 'lister');
      localStorage.setItem('token', data.token || '');
      
      alert('Lister account created successfully!');
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
            <div className="logo animate-scale">SecureLogin</div>
            <h2 className="animate-fade-down">Create Lister Account</h2>
            <p className="animate-fade-down-delay">Sign up to start listing your parking spaces</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="signup-form animate-fade-in">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name*</label>
                <input
                  className="input-focus-effect"
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  className="input-focus-effect"
                  type="text"
                  id="businessName"
                  placeholder="Enter your business name (optional)"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  className="input-focus-effect"
                  type="tel"
                  id="phone"
                  placeholder="Enter your phone number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Business Address</label>
              <input
                className="input-focus-effect"
                type="text"
                id="address"
                placeholder="Enter your business address (optional)"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <input
                  className="input-focus-effect"
                  type="password"
                  id="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  className="input-focus-effect"
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-footer">
              <div className="terms-agreement">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <a href="#terms" className="terms-link">Terms of Service</a>
                </label>
              </div>

              <button
                type="submit"
                className="signup-button hover-effect"
                disabled={isLoading}
              >
                {isLoading ? <div className="spinner"></div> : 'Create Lister Account'}
              </button>
            </div>
          </form>

          <div className="login-option animate-fade-in-delay">
            <p>
              Already have an account? <Link to="/listerlogin">Log in</Link>
              <span className="home-link"> | <Link to="/">Home</Link></span>
            </p>
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