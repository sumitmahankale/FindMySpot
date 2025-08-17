import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CSS/LoginPage.css';
import Swal from 'sweetalert2';
import { getApiUrl } from '../config/api.js';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Backend now handles admin auth via /auth/admin/login and env credentials

  // Success alert function
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Continue',
      confirmButtonColor: 'var(--medium-blue)',
      timer: 2000,
      timerProgressBar: true,
      background: '#f8f9fa',
      iconColor: '#4CAF50',
    }).then(() => {
      navigate('/admin');
    });
  };

  // Error alert function
  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#f44336',
      background: '#f8f9fa',
      iconColor: '#f44336',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('auth/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('fullName', data.fullName || 'Admin');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', 'true');
      showSuccessAlert('Admin login successful!');
    } catch (err) {
      showErrorAlert(err.message);
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
              AdminPanel
            </div>
            <h2 className="animate-fade-down">
              Admin Login
            </h2>
            <p className="animate-fade-down-delay">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form animate-fade-in">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                className="input-focus-effect"
                type="text"
                id="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                className="input-focus-effect"
                type="password"
                id="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              
            </div>

            <button
              type="submit"
              className="login-button hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Admin Login'
              )}
            </button>
            <Link to="/" className="back-link" align="center">
              ← Home
            </Link>
          </form>

          <div className="register-option animate-fade-in-delay">
            
          </div>
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/admin.png"
            alt="Admin login illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;