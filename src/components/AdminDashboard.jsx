import React, { useState, useEffect, useRef } from 'react';
import { Users, Map, Layout, ChevronRight, LogOut, Settings, MessageSquare, Database, HelpCircle } from 'lucide-react';
import AdminRequestsPage from './AdminRequestPage';
import ListerDashboard from './AdminListerDashboard';
import AdminQueryManagement from './AdminQueryManagement';
import AdminData from './AdminData'; 
import AdminUserQuery from './AdminUserQuery'; // Import the new component
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const [pageLoaded, setPageLoaded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [contentAnimating, setContentAnimating] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setPageLoaded(true);
    
    // Clean up any timeout when component unmounts
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const navigate = useNavigate();

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

  const handleLogoutPopup = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
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
        document.body.classList.add('fade-out');
        setTimeout(() => {
          navigate('/adminlogin');
        }, 400);
      }
    });
  };

  return (
    <div 
      className={`flex h-screen bg-gray-100 overflow-hidden ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} 
      style={{ transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Side Navigation */}
      <div 
        ref={sidebarRef}
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-blue-900 text-white shadow-xl flex flex-col z-10`}
        style={{ transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`p-6 border-b border-blue-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div 
            className={`overflow-hidden ${isCollapsed ? 'w-0' : 'w-full'}`}
            style={{ transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap' }}
          >
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-200 text-sm">Parking Management</p>
          </div>
          
          {isCollapsed && <Layout className="h-6 w-6" style={{ opacity: isCollapsed ? 1 : 0, transition: 'opacity 0.3s ease' }} />}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-800 hover:bg-blue-700 transition-colors duration-300"
            style={{ 
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease'
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          {[
            { id: 'requests', label: 'Lister Requests', Icon: Users },
            { id: 'spaces', label: 'Space Management', Icon: Map },
            { id: 'queries', label: 'Lister Queries', Icon: MessageSquare },
            { id: 'userqueries', label: 'User Queries', Icon: HelpCircle }, // New user queries option
            { id: 'data', label: 'Data', Icon: Database },
            { id: 'settings', label: 'Settings', Icon: Settings }
          ].map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center w-full px-6 py-4 text-left transition-all duration-300 ease-in-out
                ${activeTab === item.id ? 'bg-blue-800 border-l-4 border-white' : 'hover:bg-blue-800 hover:border-l-4 hover:border-blue-400'}`}
              onClick={() => handleTabClick(item.id)}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: pageLoaded ? 'slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none'
              }}
            >
              <item.Icon 
                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`}
                style={{ 
                  transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(activeTab === item.id && { 
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.5))'
                  })
                }}
              />
              <span 
                className={`whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                style={{ transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className={`px-6 py-4 border-t border-blue-800 w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div 
            className={`flex items-center justify-between w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}
          >
            <div className="flex items-center overflow-hidden">
              <div 
                className="min-w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center shadow-lg"
                style={{ transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span className="text-white font-bold">SM</span>
              </div>
              
              <div 
                className={`ml-3 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                style={{ transition: 'opacity 0.4s ease, width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <p className="font-medium">Sumit Mahankale</p>
                <p className="text-xs text-blue-300">System Administrator</p>
              </div>
            </div>
            
            {!isCollapsed && (
              <button 
                className="text-blue-300 hover:text-white"
                style={{ transition: 'color 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
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
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Header content */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div 
            className={`transition-all duration-500 ease-in-out ${contentAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
          >
            {activeTab === 'requests' ? (
              <AdminRequestsPage />
            ) : activeTab === 'spaces' ? (
              <ListerDashboard />
            ) : activeTab === 'queries' ? (
              <AdminQueryManagement />
            ) : activeTab === 'userqueries' ? (
              <AdminUserQuery /> // Added reference to the new component
            ) : activeTab === 'data' ? (
              <AdminData />
            ) : (
              <div 
                className="bg-white rounded-lg shadow-md p-6"
                style={{ transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}
              >
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-gray-600">System settings and configuration options will appear here.</p>
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

export default AdminDashboard;