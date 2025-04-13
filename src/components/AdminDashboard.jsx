import React, { useState, useEffect } from 'react';
import { Users, Map, Layout, ChevronRight, LogOut, Settings } from 'lucide-react';
import AdminRequestsPage from './AdminRequestPage';
import ListerDashboard from './AdminListerDashboard';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 💡 Import SweetAlert2
import 'sweetalert2/dist/sweetalert2.min.css'; // Optional for styling

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const navigate = useNavigate();

  const handleLogoutPopup = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      background: '#f9fafb'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/adminlogin');
      }
    });
  };

  return (
    <div className={`flex h-screen bg-gray-100 overflow-hidden ${pageLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transition: 'opacity 0.5s ease-in-out' }}>
      {/* Side Navigation */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-blue-900 text-white shadow-xl transition-all duration-300 ease-in-out flex flex-col`}>
        <div className={`p-6 border-b border-blue-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-200 text-sm">Parking Management</p>
            </div>
          )}
          {isCollapsed && <Layout className="h-6 w-6" />}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-800 hover:bg-blue-700 transition-colors duration-200"
          >
            <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200 ${activeTab === 'requests' ? 'bg-blue-800 border-l-4 border-white' : 'hover:bg-blue-800 hover:border-l-4 hover:border-blue-400'}`}
            onClick={() => setActiveTab('requests')}
          >
            <Users className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && <span className="transition-opacity duration-200">Lister Requests</span>}
          </button>

          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200 ${activeTab === 'spaces' ? 'bg-blue-800 border-l-4 border-white' : 'hover:bg-blue-800 hover:border-l-4 hover:border-blue-400'}`}
            onClick={() => setActiveTab('spaces')}
          >
            <Map className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && <span className="transition-opacity duration-200">Space Management</span>}
          </button>

          <button
            className={`flex items-center w-full px-6 py-4 text-left transition-all duration-200 ${activeTab === 'settings' ? 'bg-blue-800 border-l-4 border-white' : 'hover:bg-blue-800 hover:border-l-4 hover:border-blue-400'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
            {!isCollapsed && <span className="transition-opacity duration-200">Settings</span>}
          </button>
        </nav>

        <div className={`px-6 py-4 border-t border-blue-800 w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
              <span className="text-white font-bold">SM</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <p className="font-medium">Sumit Mahankale</p>
                  <p className="text-xs text-blue-300">System Administrator</p>
                </div>
              </div>
              <button className="text-blue-300 hover:text-white transition-colors" onClick={handleLogoutPopup}>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Header Left (empty for now) */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="transition-all duration-300 ease-in-out" style={{ opacity: pageLoaded ? 1 : 0, transform: pageLoaded ? 'translateY(0)' : 'translateY(10px)' }}>
            {activeTab === 'requests' ? (
              <AdminRequestsPage />
            ) : activeTab === 'spaces' ? (
              <ListerDashboard />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-gray-600">System settings and configuration options will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
