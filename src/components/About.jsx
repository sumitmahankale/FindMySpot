import React, { useEffect, useState } from "react";
import "./CSS/AboutEnhanced.css";
import { useNavigate } from 'react-router-dom'

const ParkingBanner = () => {
  return (
    <svg viewBox="0 0 800 250" xmlns="http://www.w3.org/2000/svg">
      {/* Definitions */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2b47" />
          <stop offset="70%" stopColor="#2d4263" />
          <stop offset="100%" stopColor="#3e5f8a" />
        </linearGradient>
        
        <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#333333" />
          <stop offset="100%" stopColor="#222222" />
        </linearGradient>
        
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
        
        <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" stroke="#3e5f8a" strokeWidth="0.5" strokeOpacity="0.3" />
        </pattern>
      </defs>
      
      {/* Night sky background with stars */}
      <rect width="800" height="250" fill="url(#skyGradient)" />
      
      Stars
      {[...Array(50)].map((_, i) => (
        <circle 
          key={i} 
          cx={Math.random() * 800} 
          cy={Math.random() * 100} 
          r={Math.random() * 1.5} 
          fill="#f5f5f5" 
          opacity={Math.random() * 0.8 + 0.2}
        />
      ))}
      
      {/* Moon */}
      <circle cx="700" cy="50" r="25" fill="#f5f5f5" filter="url(#glow)" />
      <circle cx="690" cy="45" r="8" fill="#2d4263" opacity="0.3" />
      
      {/* Digital grid overlay */}
      <rect width="800" height="250" fill="url(#gridPattern)" />
      
      {/* City skyline with dynamic, asymmetrical buildings */}
      <g className="cityscape" filter="url(#dropShadow)">
        {/* Left side buildings */}
        <path d="M0,150 L0,100 L30,100 L30,80 L50,80 L50,110 L70,110 L70,85 L100,85 L100,150 Z" fill="#1a2b47" />
        <path d="M110,150 L110,70 L140,70 L140,90 L150,90 L150,60 L170,60 L170,90 L190,90 L190,150 Z" fill="#2d4263" />
        <path d="M200,150 L200,50 L220,50 L220,70 L240,70 L240,40 L260,40 L260,70 L280,70 L280,150 Z" fill="#1a2b47" />
        
        {/* Central buildings */}
        <path d="M290,150 L290,30 L310,30 L310,60 L320,60 L320,20 L335,20 L335,50 L350,50 L350,150 Z" fill="#2d4263" />
        <path d="M360,150 L360,45 L380,45 L380,25 L400,5 L420,25 L420,45 L440,45 L440,150 Z" fill="#1a2b47" />
        
        {/* Right side buildings */}
        <path d="M450,150 L450,40 L470,40 L470,60 L490,60 L490,30 L510,30 L510,70 L530,70 L530,150 Z" fill="#2d4263" />
        <path d="M540,150 L540,50 L560,50 L560,30 L590,30 L590,60 L610,60 L610,45 L630,45 L630,150 Z" fill="#1a2b47" />
        <path d="M640,150 L640,70 L660,70 L660,40 L690,40 L690,60 L710,60 L710,80 L730,80 L730,150 Z" fill="#2d4263" />
        <path d="M740,150 L740,90 L760,90 L760,60 L780,60 L780,80 L800,80 L800,150 Z" fill="#1a2b47" />
      </g>
      
      {/* Building windows (randomly placed)
      {[...Array(100)].map((_, i) => {
        const x = Math.floor(Math.random() * 740) + 30;
        const y = Math.floor(Math.random() * 90) + 30;
        const width = Math.floor(Math.random() * 8) + 4;
        const height = Math.floor(Math.random() * 6) + 6;
        const opacity = Math.random() * 0.5 + 0.3;
        return (
          <rect 
            key={i} 
            x={x} 
            y={y} 
            width={width} 
            height={height} 
            fill="#ff9a40" 
            opacity={opacity} 
          />
        );
      })} */}
      
      {/* Road with perspective */}
      <path d="M0,150 L800,150 L800,250 L0,250 Z" fill="url(#roadGradient)" />
      
      {/* Road center line */}
      <path d="M0,200 L800,200" stroke="#f5f5f5" strokeWidth="3" strokeDasharray="40 20" />
      
      {/* Parking zones with 3D effect */}
      <g className="parking-area">
        {/* Left parking area */}
        <path d="M50,150 L200,150 L210,180 L40,180 Z" fill="#333333" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M60,155 L100,155 L105,175 L65,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M110,155 L150,155 L155,175 L115,175 Z" fill="#ff7d00" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M160,155 L190,155 L195,175 L165,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        
        {/* Center parking area */}
        <path d="M300,150 L500,150 L510,180 L290,180 Z" fill="#333333" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M310,155 L350,155 L355,175 L315,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M360,155 L400,155 L405,175 L365,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M410,155 L450,155 L455,175 L415,175 Z" fill="#ff9a40" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M460,155 L490,155 L495,175 L465,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        
        {/* Right parking area */}
        <path d="M600,150 L750,150 L760,180 L590,180 Z" fill="#333333" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M610,155 L650,155 L655,175 L615,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M660,155 L700,155 L705,175 L665,175 Z" fill="#ff7d00" stroke="#f5f5f5" strokeWidth="1" />
        <path d="M710,155 L740,155 L745,175 L715,175 Z" fill="#3e5f8a" stroke="#f5f5f5" strokeWidth="1" />
      </g>
      
      {/* Car in highlighted spot */}
      <g transform="translate(425, 162)">
        <path d="M0,5 C0,0 5,0 10,0 L25,0 C30,0 35,0 35,5 L35,10 C35,15 30,15 25,15 L10,15 C5,15 0,15 0,10 Z" fill="#1a2b47" />
        <path d="M5,0 L5,-3 L30,-3 L30,0 Z" fill="#1a2b47" />
        <rect x="8" y="3" width="19" height="6" fill="#2d4263" opacity="0.7" />
        <circle cx="8" cy="15" r="3" fill="#333333" stroke="#666666" strokeWidth="1" />
        <circle cx="27" cy="15" r="3" fill="#333333" stroke="#666666" strokeWidth="1" />
      </g>
      
      {/* Animated location pin */}
      <g className="pin-animation" transform="translate(430, 130)">
        <path 
          d="M0,0 C0,-15 20,-15 20,0 C20,10 10,20 10,20 C10,20 0,10 0,0" 
          fill="#ff9a40" 
          stroke="#ff7d00" 
          strokeWidth="2"
          filter="url(#glow)"
        >
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="10" cy="7" r="4" fill="#f5f5f5" />
      </g>
      
      {/* App name with dynamic styling */}
      {/* <g transform="translate(400, 80)" filter="url(#dropShadow)">
        <text 
          textAnchor="middle" 
          fontSize="46" 
          fontWeight="bold" 
          fontFamily="Arial, sans-serif" 
          fill="#f5f5f5"
        >
          <tspan x="0" y="0">Find</tspan>
          <tspan x="0" y="0" fill="#ff9a40">My</tspan>
          <tspan x="100" y="0">Spot</tspan>
        </text>
        <text 
          textAnchor="middle" 
          x="0" 
          y="25" 
          fontSize="14" 
          fontFamily="Arial, sans-serif" 
          fill="#f5f5f5"
        >PARKING MADE SIMPLE</text>
      </g> */}
      
      {/* Decorative elements */}
      <g className="decorative-elements">
        {/* Radar-like circles around highlighted spot */}
        <circle cx="430" cy="165" r="25" fill="none" stroke="#ff9a40" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values="25;40;25" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="430" cy="165" r="15" fill="none" stroke="#ff9a40" strokeWidth="1" opacity="0.7">
          <animate attributeName="r" values="15;30;15" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
};

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);
const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
    // navigate('/main'); // Redirects to LoginPage
    
  };
  useEffect(() => {
    // Set loaded state after a small delay for entrance animations
    setTimeout(() => setIsLoaded(true), 300);
    
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        const top = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (top < windowHeight - 100) {
          element.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // trigger on initial load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`about-page ${isLoaded ? "loaded" : ""}`}>
      <div className="logo-container">
        <div className="particle-container">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <img
          className="logo"
          src="/logo.jpg"
          alt="FindMySpot Logo"
        />
      </div>

      <div className="hero-section">
        <ParkingBanner className="about-banner" />
        {/* <div className="overlay">
          <h2 className="tagline">
            <span className="tagline-word">FIND</span>
            <span className="tagline-word">YOUR</span>
            <span className="tagline-word">PARKING</span>
            <span className="tagline-word">SPOT</span>
          </h2>
        </div> */}
      </div>

      <div className="about-content">
        <h1 className="about-title animate-on-scroll">
          <span className="title-text">About FindMySpot</span>
        </h1>
        <div className="divider animate-on-scroll">
          <span className="line"></span>
          <span className="dot"></span>
          <span className="line"></span>
        </div>
        <p className="about-text animate-on-scroll">
          <span className="highlight">FindMySpot</span> is a real-time parking locator platform designed to help drivers
          quickly find available parking spaces. Whether you're in a rush, unfamiliar with the area, or just tired of
          circling the block, <span className="highlight">FindMySpot</span> connects you with nearby listers sharing
          their free spots on a live map.
        </p>
        <div className="feature-cards">
          <div className="feature-card animate-on-scroll">
            <div className="icon-container">
              <div className="icon-background"></div>
              <div className="icon">🌍</div>
            </div>
            <h3>Real-Time Updates</h3>
            <p>Live parking availability data across your city</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="icon-container">
              <div className="icon-background"></div>
              <div className="icon">⏱️</div>
            </div>
            <h3>Save Time</h3>
            <p>No more circling blocks looking for parking</p>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="icon-container">
              <div className="icon-background"></div>
              <div className="icon">🌱</div>
            </div>
            <h3>Eco-Friendly</h3>
            <p>Reduce emissions by finding spots quickly</p>
          </div>
        </div>
        <div className="cta-section animate-on-scroll">
          <div className="cta-text">Ready to find your spot?</div>
          <button className="cta-button" onClick={handleClick}>Get Started</button>
        </div>
        <p className="mission-statement animate-on-scroll">
          We are on a mission to simplify urban mobility, save time, reduce emissions, and make your life easier — one
          parking spot at a time.
        </p>
      </div>
    </div>
  );
};

export default About;