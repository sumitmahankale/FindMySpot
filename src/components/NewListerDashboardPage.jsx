import React, { useState, useEffect, useRef } from 'react';
import { Car, MessageSquare, Map, Layout, ChevronRight, Bell, LogOut, HelpCircle, AlertTriangle, Navigation } from 'lucide-react';
import ListerDashboard from './ListerDashboard';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import ListerQueryComponent from './ListerQuery';

// Custom CSS variables
const styles = {
  darkBlue: '#1a2b47',
  mediumBlue: '#2d4263',
  lightBlue: '#3e5f8a',
  orange: 'rgb(255, 98, 0)',
  lightOrange: '#ff9a40',
  textLight: '#f5f5f5',
  textDark: '#333333',
  background: '#f9f9f9',
};

const ListerMainDashboard = () => {
  const [activeTab, setActiveTab] = useState('parking');
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed like AdminDashboard
  const [currentUser, setCurrentUser] = useState({
    fullName: '',
    businessName: '',
    initials: '',
    email: '',
    listerId: null
  });
  const [lastLogin, setLastLogin] = useState('Today, 10:30 AM');
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [contentAnimating, setContentAnimating] = useState(false);
  const sidebarRef = useRef(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    setPageLoaded(true);
    
    // Get user data from localStorage
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const businessName = localStorage.getItem('businessName');
    const username = localStorage.getItem('username'); // Email/username
    const lastLoginTime = localStorage.getItem('lastLogin');
    const listerId = localStorage.getItem('listerId');
    
    if (!token) {
      navigate('/listerlogin');
      return;
    }
    
    // Set user data
    const nameInitials = fullName 
      ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
      : username ? username[0].toUpperCase() : 'U';
      
    setCurrentUser({
      fullName: fullName || 'User',
      businessName: businessName || 'Parking Provider',
      initials: nameInitials,
      email: username || '',
      listerId: listerId
    });
    
    // Format and set last login time
    if (lastLoginTime) {
      const loginDate = new Date(lastLoginTime);
      const today = new Date();
      
      let formattedDate;
      if (loginDate.toDateString() === today.toDateString()) {
        formattedDate = `Today, ${loginDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      } else {
        formattedDate = loginDate.toLocaleDateString() + ', ' + 
                        loginDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
      
      setLastLogin(formattedDate);
    }
    
    // Update current login time in localStorage
    localStorage.setItem('lastLogin', new Date().toISOString());
    
    // Clean up any timeout when component unmounts
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [navigate, hoverTimeout]);

  // Similar hover functions as AdminDashboard
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400); // Slightly longer delay before collapsing sidebar for smoother experience
    setHoverTimeout(timeout);
  };

  const handleTabClick = (tab) => {
    if (activeTab === tab) return;
    
    setContentAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setContentAnimating(false);
      }, 50);
    }, 250);
  };

  const fetchParkingSpaces = async () => {
    const listerId = localStorage.getItem('listerId');
    const token = localStorage.getItem('token');
    
    if (!listerId || !token) {
      setError("User credentials not found. Please log in again.");
      return;
    }
    
    console.log(`Attempting to fetch parking spaces for lister ID: ${listerId}`);
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/lister/${listerId}/parking-spaces`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch parking spaces: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.length} parking spaces:`, data);
      setParkingSpaces(data);
    } catch (err) {
      console.error("Error fetching parking spaces:", err);
      setError(err.message || "Failed to load your parking spaces");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'spaces') {
      fetchParkingSpaces();
    }
  }, [activeTab]);

  const openLocationInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleLogoutPopup = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a2b47',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      background: '#f9fafb',
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('businessName');
        localStorage.removeItem('listerId');
        
        document.body.classList.add('fade-out');
        setTimeout(() => {
          navigate('/listerlogin');
        }, 400);
      }
    });
  };

  return (
    <div 
      className={`flex h-screen overflow-hidden ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} 
      style={{ 
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: styles.background 
      }}
    >
      {/* Side Navigation */}
      <div 
        ref={sidebarRef}
        className={`${isCollapsed ? 'w-20' : 'w-64'} text-white shadow-xl flex flex-col z-10`}
        style={{ 
          backgroundColor: styles.darkBlue,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          style={{ borderBottom: `1px solid ${styles.mediumBlue}` }}
        >
          <div 
            className={`overflow-hidden ${isCollapsed ? 'w-0' : 'w-full'}`}
            style={{ transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap' }}
          >
            <h1 className="text-xl font-bold" style={{ color: styles.textLight }}>Lister Dashboard</h1>
            <p className="text-sm" style={{ color: styles.lightOrange }}>Parking Provider</p>
          </div>
          
          {isCollapsed && <Layout className="h-6 w-6" style={{ opacity: isCollapsed ? 1 : 0, transition: 'opacity 0.3s ease', color: styles.textLight }} />}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-full transition-colors duration-300"
            style={{ 
              backgroundColor: styles.mediumBlue,
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease'
            }}
          >
            <ChevronRight className="h-5 w-5" style={{ color: styles.textLight }} />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          {[
            { id: 'parking', label: 'Parking Management', Icon: Car },
            { id: 'query', label: 'Raise Query', Icon: MessageSquare },
            { id: 'spaces', label: 'My Space Details', Icon: Map },
            { id: 'help', label: 'Help', Icon: HelpCircle }
          ].map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-6 py-4 text-left transition-all duration-300 ease-in-out`}
              style={{ 
                backgroundColor: activeTab === item.id ? styles.mediumBlue : 'transparent',
                borderLeft: activeTab === item.id ? `4px solid ${styles.orange}` : 'none',
                animationDelay: `${index * 0.1}s`,
                animation: pageLoaded ? 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
              }}
              onClick={() => handleTabClick(item.id)}
            >
              <item.Icon 
                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
                style={{ 
                  color: styles.textLight,
                  transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(activeTab === item.id && { 
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))'
                  })
                }}
              />
              <span 
                className={`whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                style={{ 
                  color: styles.textLight,
                  transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div 
          className={`px-6 py-4 border-t border-blue-800 w-full ${isCollapsed ? 'flex justify-center' : ''}`}
          style={{ borderColor: styles.mediumBlue }}
        >
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full`}
          >
            <div className="flex items-center overflow-hidden">
              <div 
                className="min-w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  backgroundColor: styles.lightBlue,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ color: styles.textLight, fontWeight: 'bold' }}>{currentUser.initials}</span>
              </div>
              
              <div 
                className={`ml-3 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} truncate max-w-32`}
                style={{ 
                  transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden' 
                }}
              >
                <p className="font-medium truncate" style={{ color: styles.textLight }}>{currentUser.fullName}</p>
                <p className="text-xs truncate" style={{ color: styles.lightOrange }}>{currentUser.email}</p>
              </div>
            </div>
            
            {!isCollapsed && (
              <button 
                className="flex-shrink-0 ml-2"
                style={{ 
                  color: styles.lightOrange,
                  transition: 'color 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(12deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
                onClick={handleLogoutPopup}
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shadow-md px-6 py-4 flex items-center justify-between"
                style={{ backgroundColor: 'white' }}>
          <div className="flex items-center space-x-4 flex-1">
            <h2 className="text-xl font-semibold" style={{ color: styles.textDark }}>
              {activeTab === 'parking' ? 'Parking Management' : 
               activeTab === 'query' ? 'Raise Query' : 
               activeTab === 'spaces' ? 'My Space Details' : 'Help & Support'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" style={{ color: styles.mediumBlue }} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: styles.orange }}></span>
            </button>
            <div className="px-3" style={{ borderLeft: '1px solid #eee' }}>
              <p className="text-sm font-medium" style={{ color: styles.textDark }}>
                Welcome back, {currentUser.fullName.split(' ')[0]}
              </p>
              <p className="text-xs" style={{ color: styles.lightBlue }}>Last login: {lastLogin}</p>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: styles.background }}>
          <div 
            className={`transition-all duration-500 ease-in-out ${contentAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
          >
            {activeTab === 'parking' ? (
              <ListerDashboard />
            ) : activeTab === 'query' ? (
              <ListerQueryComponent activeTab={activeTab} />
            ) : activeTab === 'spaces' ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: styles.darkBlue }}>
                  My Parking Spaces
                </h2>
                
                {/* Render parking spaces data */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 border-4 border-t-4 rounded-full animate-spin mb-4"
                         style={{ 
                           borderColor: `${styles.background}`, 
                           borderTopColor: `${styles.orange}`
                         }}></div>
                    <p style={{ color: styles.mediumBlue }}>Loading your parking spaces...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                         style={{ backgroundColor: '#FEE2E2' }}>
                      <AlertTriangle size={32} style={{ color: '#EF4444' }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#EF4444' }}>
                      Error Loading Data
                    </h3>
                    <p className="text-gray-600 max-w-md mb-4">{error}</p>
                    <button 
                      onClick={fetchParkingSpaces}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      Try Again
                    </button>
                  </div>
                ) : parkingSpaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 mb-6 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: styles.background }}>
                      <Map size={48} style={{ color: styles.orange }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: styles.mediumBlue }}>
                      No Parking Spaces Found
                    </h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      You haven't added any parking spaces yet or your parking space requests are still pending approval.
                    </p>
                    <button 
                      className="px-6 py-3 rounded-lg text-white font-bold transition-all duration-200"
                      style={{ backgroundColor: styles.orange }}
                      onClick={() => handleTabClick('parking')}
                    >
                      Add New Parking Space
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Showing {parkingSpaces.length} parking space{parkingSpaces.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {parkingSpaces.map(space => (
                        <div 
                          key={space.id} 
                          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                          style={{ 
                            animation: 'fadeInUp 0.6s ease-out',
                            animationDelay: `${parkingSpaces.indexOf(space) * 0.1}s`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className="h-40 bg-gray-200 relative">
                            <div 
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ backgroundColor: styles.lightBlue }}
                            >
                              <Car size={48} style={{ color: styles.textLight }} />
                            </div>
                            <div 
                              className="absolute bottom-0 left-0 right-0 p-3"
                              style={{ 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                color: styles.textLight
                              }}
                            >
                              <h3 className="font-bold text-lg truncate">{space.name}</h3>
                              <p className="text-sm truncate">{space.location}</p>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: space.isActive ? '#DCF5DC' : '#FEE2E2',
                                  color: space.isActive ? '#166534' : '#B91C1C'
                                }}
                              >
                                {space.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="font-bold" style={{ color: styles.orange }}>
                                ₹{space.price}
                              </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-start">
                                <span className="text-gray-500 text-sm w-24">Availability:</span>
                                <span className="text-gray-700 text-sm flex-1">{space.availability}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-gray-500 text-sm w-24">Contact:</span>
                                <span className="text-gray-700 text-sm flex-1">{space.contact}</span>
                              </div>
                            </div>
                            
                            <div className="border-t pt-3 flex justify-center">
                              <button 
                                className="px-4 py-1 rounded flex items-center text-sm"
                                style={{ color: styles.mediumBlue }}
                                onClick={() => openLocationInGoogleMaps(space.lat, space.lng)}
                              >
                                <Navigation size={16} className="mr-1" />
                                View Location
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: styles.darkBlue }}>Help & Support</h2>
                <p className="text-gray-600 mb-6">Our support team is available Monday to Friday, 9:00 AM to 6:00 PM.</p>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <button 
                    className="px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{ 
                      backgroundColor: styles.darkBlue,
                      color: styles.textLight
                    }}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Contact Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-out {
          animation: fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        /* Ensure transitions feel smooth */
        * {
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default ListerMainDashboard;