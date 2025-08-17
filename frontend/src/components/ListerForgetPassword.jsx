import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';


const ListerForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      // Sweet Alert for email validation error
      Swal.fire({
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--orange)',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      // Sweet Alert for password mismatch
      Swal.fire({
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--orange)',
      });
      return;
    }
    
    if (newPassword.length < 8) {
      // Sweet Alert for password length
      Swal.fire({
        title: 'Password Too Short',
        text: 'Password must be at least 8 characters long',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--orange)',
      });
      return;
    }

    setIsLoading(true);
    
    // API call to reset password
    fetch('http://localhost:5000/api/auth/lister/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        newPassword 
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Failed to reset password');
          });
        }
        return response.json();
      })
      .then((data) => {
        setIsLoading(false);
        
        // Sweet Alert for success with redirect option
        Swal.fire({
          title: 'Success!',
          text: 'Your password has been reset successfully',
          icon: 'success',
          confirmButtonText: 'Go to Login',
          confirmButtonColor: 'var(--medium-blue)',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/ListerLogin';
          }
        });
        
        console.log('Lister password reset successful:', data);
      })
      .catch((error) => {
        setIsLoading(false);
        
        // Sweet Alert for API error
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to reset password. Please try again.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: 'var(--orange)',
        });
        
        console.error('Lister password reset error:', error);
      });
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-form-container">
          <div className="forgot-header">
           
            <h2>Reset Lister Password</h2>
            <p>Enter your lister email and create a new password</p>
          </div>
          
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="form-group">
              <label htmlFor="email">Lister Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your lister email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="8"
              />
            </div>

            <button
              type="submit"
              className="reset-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="back-option">
              <Link to="/ListerLogin" className="back-link">
                ← Back to Lister Login
              </Link>
            </div>
          </form>
        </div>

        <div className="forgot-image-container">
          <img
            src="/forgetpass.png"
            alt="Forgot password illustration"
            className="forgot-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ListerForgetPassword;