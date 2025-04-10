import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginPage.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginPage = () => {
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
      timer: 2000,
      timerProgressBar: true
    }).then(() => {
      // Navigate to parking page after alert is closed
      navigate('/listerdashboard');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      // Simple validation
      if (email && password.length >= 6) {
        localStorage.setItem('isAuthenticated', 'true');

        const username = email.split('@')[0];
        localStorage.setItem('username', username);

        // Show success alert and redirect on close
        showSuccessAlert('Login successful!');
      } else {
        showErrorAlert('Invalid credentials. Email required and password must be at least 6 characters.');
      }
    }, 1500);
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
              Welcome Back Lister
            </h2>
            <p className="animate-fade-down-delay">
              Sign in to access your account
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
            </div>

            <div className="form-options">
              <a href="#" onClick={() => navigate('/forgetpass')} className="hover-orange">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="register-option animate-fade-in-delay">
            <p>Don't have an account? <Link to="/listersignup">Sign up</Link></p>
          </div>
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/login-image.png"
            alt="Login illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;