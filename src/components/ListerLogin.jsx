import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginPage.css'; // Assuming you have a similar CSS file for login
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const ListerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: '#4CAF50',
      timer: 3000,
      timerProgressBar: true
    }).then(() => {
      navigate('/Listerdashboard');
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
              <input
                className="input-focus-effect"
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot-password">
                <a href="#reset">Forgot Password?</a>
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
                    </div>
          
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/Welcome.png"
            alt="Login illustration"
            className="login-image"
          />
        </div>
        
      </div>
    </div>
  );
};

export default ListerLoginPage;