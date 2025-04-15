import React, { useState, useEffect } from 'react';
import { Car, MessageSquare, Map, Layout, ChevronRight, Bell, LogOut, HelpCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import ListerDashboard from './ListerDashboard';
import { useNavigate } from 'react-router-dom';

// Custom CSS variables
const styles = {
  darkBlue: '#1a2b47',
  mediumBlue: '#2d4263',
  lightBlue: '#3e5f8a',
  orange: '#ff7d00',
  lightOrange: '#ff9a40',
  textLight: '#f5f5f5',
  textDark: '#333333',
  background: '#f9f9f9',
};

const ListerMainDashboard = () => {
  const [activeTab, setActiveTab] = useState('parking');
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  
  // Add page transition effect
  const [pageLoaded, setPageLoaded] = useState(false);
  
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
    
  }, [navigate]);

  // New function to fetch parking spaces
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
  
  // Make sure to call this function when the component mounts and when the tab changes
  useEffect(() => {
    if (activeTab === 'spaces') {
      fetchParkingSpaces();
    }
  }, [activeTab]);
  
  // Fetch parking spaces when switching to the spaces tab
  useEffect(() => {
    if (activeTab === 'spaces') {
      fetchParkingSpaces();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('businessName');
    localStorage.removeItem('listerId');
    navigate('/listerlogin');
  };

  return (
    <div className={`flex h-screen overflow-hidden ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} 
         style={{ 
           transition: 'opacity 0.5s ease-in-out',
           backgroundColor: styles.background 
         }}>
      {/* Side Navigation */}
      <div 
        className={`${isCollapsed ? 'w-20' : 'w-64'} text-white shadow-xl transition-all duration-300 ease-in-out flex flex-col`}
        style={{ backgroundColor: styles.darkBlue }}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
             style={{ borderBottom: `1px solid ${styles.mediumBlue}` }}>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold" style={{ color: styles.textLight }}>Lister Dashboard</h1>
              <p className="text-sm" style={{ color: styles.lightOrange }}>Parking Provider</p>
            </div>
          )}
          {isCollapsed && <Layout className="h-6 w-6" style={{ color: styles.textLight }} />}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-full transition-colors duration-200"
            style={{ backgroundColor: styles.mediumBlue }}
          >
            <ChevronRight 
              className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              style={{ color: styles.textLight }}
            />
          </button>
        </div>
        
        <nav className="mt-6 flex-1">
          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200`}
            style={{ 
              backgroundColor: activeTab === 'parking' ? styles.mediumBlue : 'transparent',
              borderLeft: activeTab === 'parking' ? `4px solid ${styles.orange}` : 'none',
            }}
            onClick={() => setActiveTab('parking')}
          >
            <Car className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} style={{ color: styles.textLight }} />
            {!isCollapsed && <span className="transition-opacity duration-200" style={{ color: styles.textLight }}>Parking Management</span>}
          </button>
          
          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200`}
            style={{ 
              backgroundColor: activeTab === 'query' ? styles.mediumBlue : 'transparent',
              borderLeft: activeTab === 'query' ? `4px solid ${styles.orange}` : 'none',
            }}
            onClick={() => setActiveTab('query')}
          >
            <MessageSquare className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} style={{ color: styles.textLight }} />
            {!isCollapsed && <span className="transition-opacity duration-200" style={{ color: styles.textLight }}>Raise Query</span>}
          </button>

          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200`}
            style={{ 
              backgroundColor: activeTab === 'spaces' ? styles.mediumBlue : 'transparent',
              borderLeft: activeTab === 'spaces' ? `4px solid ${styles.orange}` : 'none',
            }}
            onClick={() => setActiveTab('spaces')}
          >
            <Map className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} style={{ color: styles.textLight }} />
            {!isCollapsed && <span className="transition-opacity duration-200" style={{ color: styles.textLight }}>My Space Details</span>}
          </button>

          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200`}
            style={{ 
              backgroundColor: activeTab === 'help' ? styles.mediumBlue : 'transparent',
              borderLeft: activeTab === 'help' ? `4px solid ${styles.orange}` : 'none',
            }}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} style={{ color: styles.textLight }} />
            {!isCollapsed && <span className="transition-opacity duration-200" style={{ color: styles.textLight }}>Help</span>}
          </button>
        </nav>
        
        <div className={`px-6 py-4 w-full ${isCollapsed ? 'flex justify-center' : ''}`}
             style={{ borderTop: `1px solid ${styles.mediumBlue}` }}>
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: styles.lightBlue }}>
              <span style={{ color: styles.textLight, fontWeight: 'bold' }}>{currentUser.initials}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg"
                     style={{ backgroundColor: styles.lightBlue }}>
                  <span style={{ color: styles.textLight, fontWeight: 'bold' }}>{currentUser.initials}</span>
                </div>
                <div>
                  <p className="font-medium" style={{ color: styles.textLight }}>{currentUser.fullName}</p>
                  <p className="text-xs" style={{ color: styles.lightOrange }}>{currentUser.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} style={{ color: styles.lightOrange }}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
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
            className="transition-all duration-300 ease-in-out" 
            style={{ 
              opacity: pageLoaded ? 1 : 0,
              transform: pageLoaded ? 'translateY(0)' : 'translateY(10px)'
            }}
          >
            {activeTab === 'parking' ? (
              <ListerDashboard />
            ) : activeTab === 'query' ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: styles.darkBlue }}>Raise a Query</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
                      Subject <span style={{ color: styles.orange }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
                      Category <span style={{ color: styles.orange }}>*</span>
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm p-2 border">
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
                      Description <span style={{ color: styles.orange }}>*</span>
                    </label>
                    <textarea 
                      className="w-full rounded-md border-gray-300 shadow-sm p-2 border h-40"
                      placeholder="Please provide details about your query..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
                      Attachments
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                      <p className="text-sm text-gray-500">Drag & drop files here, or click to browse</p>
                      <input type="file" className="hidden" />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      className="px-6 py-3 rounded-lg text-white font-bold transition-all duration-200"
                      style={{ backgroundColor: styles.orange }}
                    >
                      Submit Query
                    </button>
                  </div>
                </div>
              </div>
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
                      onClick={() => setActiveTab('parking')}
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
                      <button 
                        className="px-4 py-2 rounded-md text-white flex items-center"
                        style={{ backgroundColor: styles.orange }}
                        onClick={() => setActiveTab('parking')}
                      >
                        <span className="mr-2">+</span> Add New Space
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {parkingSpaces.map(space => (
                        <div 
                          key={space.id} 
                          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                          <div className="h-40 bg-gray-200 relative">
                            {/* Here you could add an image if available */}
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
                                {space.price}
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
                            
                            <div className="border-t pt-3 flex justify-between">
                              <button 
                                className="px-3 py-1 rounded flex items-center text-sm"
                                style={{ color: styles.mediumBlue }}
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </button>
                              <button 
                                className="px-3 py-1 rounded flex items-center text-sm"
                                style={{ color: '#EF4444' }}
                              >
                                <Trash2 size={16} className="mr-1" />
                                Remove
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
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: styles.mediumBlue }}>
                      Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                      {[
                        "How do I update my parking space availability?",
                        "Can I modify my pricing based on demand?",
                        "How do I view my earnings history?",
                        "What happens if a user damages my property?",
                        "How do I handle a dispute with a customer?"
                      ].map((question, idx) => (
                        <div key={idx} className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
                             style={{ backgroundColor: styles.background }}>
                          <div className="flex justify-between items-center">
                            <p className="font-medium" style={{ color: styles.textDark }}>{question}</p>
                            <ChevronRight size={18} style={{ color: styles.orange }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: styles.mediumBlue }}>
                      Contact Support
                    </h3>
                    <p className="mb-4" style={{ color: styles.textDark }}>
                      Need more help? Our support team is available Monday to Friday, 9:00 AM to 6:00 PM.
                    </p>
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                      <button 
                        className="px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ 
                          backgroundColor: styles.darkBlue,
                          color: styles.textLight
                        }}
                      >
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Live Chat
                      </button>
                      <button 
                        className="px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ 
                          backgroundColor: styles.orange,
                          color: styles.textLight
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Support
                      </button>
                      <button 
                        className="px-4 py-3 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ 
                          backgroundColor: styles.lightBlue,
                          color: styles.textLight
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListerMainDashboard;