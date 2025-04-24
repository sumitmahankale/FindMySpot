import React, { useState, useEffect, useRef } from 'react';
import { Car, Bell, LogOut, ChevronRight, Layout, Calendar, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import ParkingFinderPage from './ParkingFinderPage';
import UserBookingsPage from './UserMyBookingPage';
import UserQueryComponent from './UserQueryComponent';

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

// Animation keyframes
const keyframes = `
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
`;

const UserMainDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    fullName: '',
    initials: '',
    email: '',
    userId: null
  });
  const [lastLogin, setLastLogin] = useState('Today, 10:30 AM');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [activeTab, setActiveTab] = useState('find-parking');
  
  const sidebarRef = useRef(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Add the global styles to the document once when the component mounts
    const styleElement = document.createElement('style');
    styleElement.innerHTML = keyframes;
    document.head.appendChild(styleElement);
    
    setPageLoaded(true);
    
    // Get user data from localStorage (set during login)
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const username = localStorage.getItem('username'); // Email/username
    const lastLoginTime = localStorage.getItem('lastLogin');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Set user data
    const nameInitials = fullName 
      ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
      : username ? username[0].toUpperCase() : 'U';
      
    setCurrentUser({
      fullName: fullName || 'User',
      initials: nameInitials,
      email: username || '',
      userId: userId
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
    
    // Clean up
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      document.head.removeChild(styleElement);
    };
  }, [navigate, hoverTimeout]);

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCollapsed(true);
    }, 400);
    setHoverTimeout(timeout);
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
        localStorage.removeItem('userId');
        localStorage.removeItem('isAuthenticated');
        
        document.body.classList.add('fade-out');
        setTimeout(() => {
          navigate('/login');
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
            <h1 className="text-xl font-bold" style={{ color: styles.textLight }}>User Dashboard</h1>
            <p className="text-sm" style={{ color: styles.lightOrange }}>Find & Manage Parking</p>
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
          {/* Find Parking Nav Button */}
          <button
            onClick={() => setActiveTab('find-parking')}
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-300 ease-in-out ${activeTab === 'find-parking' ? 'border-l-4' : 'border-l-0'}`}
            style={{ 
              backgroundColor: activeTab === 'find-parking' ? styles.mediumBlue : 'transparent',
              borderColor: styles.orange,
              animation: pageLoaded ? 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
            }}
          >
            <Car 
              className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
              style={{ 
                color: styles.textLight,
                transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: activeTab === 'find-parking' ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))' : 'none'
              }}
            />
            <span 
              className={`whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
              style={{ 
                color: styles.textLight,
                transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              Find Parking
            </span>
          </button>

          {/* My Bookings Nav Button */}
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-300 ease-in-out ${activeTab === 'my-bookings' ? 'border-l-4' : 'border-l-0'}`}
            style={{ 
              backgroundColor: activeTab === 'my-bookings' ? styles.mediumBlue : 'transparent',
              borderColor: styles.orange,
              animation: pageLoaded ? 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
            }}
          >
            <Calendar 
              className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
              style={{ 
                color: styles.textLight,
                transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: activeTab === 'my-bookings' ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))' : 'none'
              }}
            />
            <span 
              className={`whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
              style={{ 
                color: styles.textLight,
                transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              My Bookings
            </span>
          </button>

          {/* Queries Nav Button */}
          <button
            onClick={() => setActiveTab('queries')}
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-300 ease-in-out ${activeTab === 'queries' ? 'border-l-4' : 'border-l-0'}`}
            style={{ 
              backgroundColor: activeTab === 'queries' ? styles.mediumBlue : 'transparent',
              borderColor: styles.orange,
              animation: pageLoaded ? 'slideIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
            }}
          >
            <HelpCircle 
              className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
              style={{ 
                color: styles.textLight,
                transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: activeTab === 'queries' ? 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))' : 'none'
              }}
            />
            <span 
              className={`whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
              style={{ 
                color: styles.textLight,
                transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              Queries
            </span>
          </button>
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
              {activeTab === 'find-parking' ? 'Find Parking' : 
               activeTab === 'my-bookings' ? 'My Bookings' : 'Queries'}
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
          <div className="transition-all duration-500 ease-in-out">
            {activeTab === 'find-parking' ? <ParkingFinderPage /> : 
             activeTab === 'my-bookings' ? <UserBookingsPage /> : <UserQueryComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMainDashboard;