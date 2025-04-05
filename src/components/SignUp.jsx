// File: src/components/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Reuse same styles

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (!email || !username || password.length < 6 || password !== confirmPassword) {
        setError('Please fill all fields correctly. Passwords must match and be at least 6 characters.');
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      navigate('/home');
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-container animate-slide-left">
          <div className="login-header">
            <div className="logo animate-scale">SecureSignup</div>
            <h2 className="animate-fade-down">Create Account</h2>
            <p className="animate-fade-down-delay">Sign up to get started</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form animate-fade-in">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                className="input-focus-effect"
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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

            <button type="submit" className="login-button hover-effect" disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : 'Sign Up'}
            </button>
          </form>

          <div className="register-option animate-fade-in-delay">
            <p>Already have an account? <a href="/login">Log in</a></p>
          </div>
        </div>

        <div className="login-image-container animate-slide-right">
          <img
            src="/login-image.png"
            alt="Signup illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
