import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password, rememberMe });
    // Add your authentication logic here
  };

  return (
    <div className="landing-container">
      {/* Modified header for login page */}
      <header className="header" style={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
        <a href="/" className="back-button" style={{ 
          color: 'var(--medium-blue)', 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontWeight: 500 
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Home
        </a>
        <div className="logo" style={{ color: 'var(--dark-blue)' }}>YourLogo</div>
      </header>
      
      {/* Login container */}
      <div style={{ 
        width: '100%', 
        minHeight: 'calc(100vh - 70px)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'var(--background)' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', 
          padding: '2.5rem', 
          width: '100%', 
          maxWidth: '420px', 
          textAlign: 'center' 
        }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 700, 
            color: 'var(--dark-blue)', 
            marginBottom: '1.5rem' 
          }}>YourLogo</div>
          
          <h2 style={{ 
            fontSize: '1.6rem', 
            color: 'var(--medium-blue)', 
            marginBottom: '1.5rem' 
          }}>Log In to Your Account</h2>
          
          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.2rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ textAlign: 'left' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text-dark)', 
                fontWeight: 500 
              }}>Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '1rem', 
                }} 
              />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text-dark)', 
                fontWeight: 500 
              }}>Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter your password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '1rem', 
                }} 
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.9rem',
              '@media (max-width: 480px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.5rem'
              } 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" style={{ 
                color: 'var(--light-blue)', 
                textDecoration: 'none' 
              }}>Forgot password?</a>
            </div>
            
            <button type="submit" style={{ 
              backgroundColor: 'var(--orange)', 
              color: 'white', 
              border: 'none', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '4px', 
              fontWeight: 500, 
              cursor: 'pointer', 
              width: '100%', 
              fontSize: '1rem', 
            }}>Log In</button>
          </form>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '1.5rem 0', 
            color: '#777' 
          }}>
            <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
            <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>OR</span>
            <div style={{ flex: 1, borderBottom: '1px solid #ddd' }}></div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            {/* Google icon */}
            <a href="#" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '1px solid #ddd', 
              color: '#555', 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
              </svg>
            </a>
            
            {/* Facebook icon */}
            <a href="#" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '1px solid #ddd', 
              color: '#555', 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
              </svg>
            </a>
            
            {/* Twitter/X icon */}
            <a href="#" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '1px solid #ddd', 
              color: '#555', 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
              </svg>
            </a>
            
            {/* LinkedIn icon */}
            <a href="#" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              border: '1px solid #ddd', 
              color: '#555', 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
              </svg>
            </a>
          </div>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
            Don't have an account? <a href="#" style={{ color: 'var(--light-blue)', textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;