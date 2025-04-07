import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [headingText, setHeadingText] = useState('');
  const fullHeading = "Never Circle The Block Again";
  const mainText = "Never Circle The Block ";
  const highlightedText = "Again";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    setIsAnimated(true);
    
    // Letter-by-letter animation for the heading
    const animateHeading = () => {
      if (isPaused) return;
      
      if (currentIndex <= fullHeading.length) {
        if (currentIndex < mainText.length) {
          // Animating the main text portion
          setHeadingText(mainText.substring(0, currentIndex));
        } else {
          // Animating the highlighted text portion
          const highlightedIndex = currentIndex - mainText.length;
          // Use display: inline-block to ensure text stays on same line
          setHeadingText(
            mainText + 
            `<span style="color: #FF7A00; display: inline;">${highlightedText.substring(0, highlightedIndex)}</span>`
          );
        }
        
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        // Text is complete, start pause
        setIsPaused(true);
        
        // After 3 seconds, reset and start over
        setTimeout(() => {
          setCurrentIndex(0);
          setHeadingText('');
          setIsPaused(false);
        }, 3000);
      }
    };
    
    // Set interval for the letter animation
    const letterAnimationInterval = setInterval(animateHeading, 150);
    
    // Clean up interval
    return () => clearInterval(letterAnimationInterval);
  }, [currentIndex, isPaused, mainText, highlightedText, fullHeading]);

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const navigatemain = useNavigate();

  const handleLoginClickk = () => {
    navigatemain('/signup');
  };
  
  const navigateabout = useNavigate();

  const handleabout = () => {
    navigateabout('/about');
  };
  
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #0a1929, #0d2748)", color: "white" }}>
      
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="FindMySpot Logo" 
            className="h-20 mr-2 -ml-10" 
          />
        </div>
        <div className="flex items-center space-x-6">
          <a href="#become-lister" className="hover:text-yellow-500" style={{ transition: "color 0.3s" }}>Lister </a>
          <a href="#features" className="hover:text-yellow-500" style={{ transition: "color 0.3s" }}>Features</a>
          <a href="#how-it-works" className="hover:text-yellow-500" style={{ transition: "color 0.3s" }}>How It Works</a>
          <a href="#pricing" className="hover:text-yellow-500" style={{ transition: "color 0.3s" }}>Pricing</a>
          <button style={{ 
              backgroundColor: "#FF7A00", 
              padding: "0.5rem 1.5rem", 
              borderRadius: "9999px", 
              fontWeight: "500",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#E56E00"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#FF7A00"}
            onClick={handleLoginClick}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-24 relative">
        <div style={{
          transition: "all 1s",
          transform: isAnimated ? 'translateY(0)' : 'translateY(10px)',
          opacity: isAnimated ? 1 : 0
        }}>
          <h1 className="text-5xl font-bold mb-6 max-w-2xl whitespace-nowrap" style={{ minHeight: "3.5rem" }}>
  <span 
    dangerouslySetInnerHTML={{ __html: headingText }}
  />
  <span className="animate-blink">|</span>
</h1>
          <p className="text-xl mb-8 max-w-xl" style={{ color: "#CBD5E0" }}>
            Find and reserve parking spots in real-time. Save time, reduce stress, and never worry about where to park.
          </p>
          <div className="flex flex-wrap gap-4">
            <button style={{ 
                backgroundColor: "#FF7A00", 
                padding: "0.75rem 2rem", 
                borderRadius: "9999px", 
                fontWeight: "500",
                fontSize: "1.125rem",
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#E56E00";
                e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 122, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#FF7A00";
                e.target.style.boxShadow = "none";
              }}
              onClick={handleLoginClickk}
            >
              Get Started
            </button>
            <button style={{ 
                border: "2px solid #FF7A00", 
                color: "#FF7A00",
                padding: "0.75rem 2rem", 
                borderRadius: "9999px", 
                fontWeight: "500",
                fontSize: "1.125rem",
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#FF7A00";
                e.target.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#FF7A00";
              }}
              onClick={handleabout}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Animated Car and Parking Graphic */}
        <div className="absolute right-0 bottom-0 w-1/2 h-4/5" style={{ pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            transition: "all 1.5s ease-out",
            transform: isAnimated ? 'translateX(0)' : 'translateX(8rem)',
            opacity: isAnimated ? 1 : 0
          }}>
            <svg viewBox="0 0 200 200" className="w-full h-full" style={{ opacity: 0.9 }}>
              <rect x="20" y="50" width="40" height="80" rx="4" fill="#1A365D" stroke="#FF7A00" strokeWidth="2" />
              <rect x="70" y="50" width="40" height="80" rx="4" fill="#1A365D" stroke="#FF7A00" strokeWidth="2" />
              <rect x="120" y="50" width="40" height="80" rx="4" fill="#FF7A00" opacity="0.3" stroke="#FF7A00" strokeWidth="2" />
              <path d="M140 150 L150 120 L170 120 L180 150 Z" fill="#0d2748" />
              <rect x="135" y="150" width="50" height="20" rx="4" fill="#0d2748" />
              <circle cx="145" cy="170" r="8" fill="#555" />
              <circle cx="175" cy="170" r="8" fill="#555" />
              <rect x="150" y="130" width="20" height="10" fill="#7DD3FC" />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ backgroundColor: "rgba(10, 25, 41, 0.8)", padding: "5rem 0",}}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Features That Make Parking <span style={{ color: "#FF7A00" }}>Effortless</span>
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
            {[
              {
                icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                title: "Real-Time Availability",
                desc: "See open parking spots instantly on the map as they become available."
              },
              {
                icon: "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z",
                title: "Spot Reservation",
                desc: "Reserve parking in advance and guarantee your spot will be waiting."
              },
              {
                "icon": "M3 12l18-6-6 18-4-8-8-4z",
                "title": "Smart Navigation",
                "desc": "Get turn-by-turn directions to the nearest available parking spot with real-time updates."
              },              
              {
                icon: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
                title: "Secure Payment",
                desc: "Contactless payment processing for a seamless parking experience."
              }
              
            ].map((feature, index) => (
              <div key={index} style={{ 
                backgroundColor: "#0d2748", 
                padding: "1.5rem", 
                borderRadius: "0.75rem",
                transition: "all 0.3s"
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 122, 0, 0.1)";
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = "none";
              }}
              >
                <div style={{ 
                  backgroundColor: "rgba(255, 122, 0, 0.2)", 
                  padding: "1rem", 
                  borderRadius: "0.5rem", 
                  display: "inline-block",
                  marginBottom: "1rem"
                }}>
                  <svg viewBox="0 0 24 24" className="h-8 w-8" style={{ color: "#FF7A00" }} fill="currentColor">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p style={{ color: "#CBD5E0" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ padding: "5rem 0" }}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">
            How <span style={{ color: "#FF7A00" }}>FindMySpot</span> Works
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }} >
            {[
              { 
                step: 1, 
                title: "Download App", 
                desc: "Get the FindMySpot app on iOS or Android",
                icon: "M18 4l-4-4H6C4.9 0 4.01.9 4.01 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V6l-2-2zm-6 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
              },
              { 
                step: 2, 
                title: "Find Parking", 
                desc: "Search for spaces near your destination",
                icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              },
              { 
                step: 3, 
                title: "Reserve Spot", 
                desc: "Book a space with one tap",
                icon: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
              },
              { 
                step: 4, 
                title: "Park & Pay", 
                desc: "Follow directions and pay through the app",
                icon: "M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div style={{ 
                  backgroundColor: "#0d2748", 
                  height: "5rem", 
                  width: "5rem", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  margin: "0 auto 1rem auto"
                }}>
                  <div style={{ 
                    backgroundColor: "rgba(255, 122, 0, 0.2)", 
                    height: "4rem", 
                    width: "4rem", 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    position: "relative"
                  }}>
                    <svg viewBox="0 0 24 24" className="h-8 w-8" style={{ color: "#FF7A00" }} fill="currentColor">
                      <path d={item.icon} />
                    </svg>
                    <div style={{ 
                      position: "absolute", 
                      top: "-0.5rem", 
                      right: "-0.5rem", 
                      backgroundColor: "#FF7A00", 
                      color: "white", 
                      height: "1.5rem", 
                      width: "1.5rem", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: "bold"
                    }}>
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p style={{ color: "#CBD5E0" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "5rem 0" }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Spot?</h2>
          <p className="text-xl mb-8 max-w-xl mx-auto" style={{ color: "#CBD5E0" }}>
            Join thousands of drivers who save time and avoid parking stress every day.
          </p>
          <button style={{ 
              backgroundColor: "#FF7A00", 
              padding: "0.75rem 2rem", 
              borderRadius: "9999px", 
              fontWeight: "500",
              fontSize: "1.125rem",
              transition: "all 0.3s"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#E56E00";
              e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 122, 0, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#FF7A00";
              e.target.style.boxShadow = "none";
            }}
          >
            Get Started Now
          </button>
        </div>
      </div>
      
      {/* Want to be a Lister? Section */}
      <div style={{ padding: "5rem 0", backgroundColor: "#0d2748" }}id="become-lister">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to be a Lister?</h2>
          <p className="text-xl mb-8 max-w-xl mx-auto" style={{ color: "#CBD5E0" }}>
            Turn your unused parking space into income. Register your spot for betterment of everyone.
          </p>
          <button style={{ 
              backgroundColor: "#FF7A00", 
              padding: "0.75rem 2rem", 
              borderRadius: "9999px", 
              fontWeight: "500",
              fontSize: "1.125rem",
              transition: "all 0.3s"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#E56E00";
              e.target.style.boxShadow = "0 10px 15px -3px rgba(255, 122, 0, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#FF7A00";
              e.target.style.boxShadow = "none";
            }}
          >
            Get Started
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ backgroundColor: "#071423", padding: "3rem 0" }}>
        <div className="container mx-auto px-6">
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            marginBottom: "3rem"
          }}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <svg viewBox="0 0 24 24" className="h-8 w-8 mr-2" style={{ color: "#FF7A00" }} fill="currentColor">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                </svg>
                <span className="text-2xl font-bold">FindMySpot</span>
              </div>
              <p style={{ color: "#A0AEC0", maxWidth: "20rem" }}>
                Making parking simple, fast, and stress-free in cities across the country.
              </p>
            </div>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
              gap: "2rem"
            }}>
              <div>
                <h3 className="font-bold mb-4">Company</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">About Us</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Careers</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Support</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Help Center</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Contact Us</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">FAQs</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Legal</h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Terms</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Privacy</a></li>
                  <li><a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ 
            borderTop: "1px solid #2D3748", 
            paddingTop: "1.5rem", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center"
          }}>
            <p style={{ color: "#718096", fontSize: "0.875rem" }}>© 2025 FindMySpot. All rights reserved.</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548z" />
                </svg>
              </a>
              <a href="#" style={{ color: "#A0AEC0" }} className="hover:text-orange-500">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;