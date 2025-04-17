import React, { useState } from 'react';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  // Color scheme based on your existing styles
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative"
        style={{ borderTop: `4px solid ${styles.orange}` }}
      >
        <div className="p-6">
          <h3 
            className="text-xl font-bold mb-3"
            style={{ color: styles.darkBlue }}
          >
            Confirm Logout
          </h3>
          
          <p className="mb-6 text-gray-600">
            Are you sure you want to logout?
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border font-medium"
              style={{ 
                borderColor: styles.mediumBlue,
                color: styles.mediumBlue
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md font-medium text-white"
              style={{ backgroundColor: styles.orange }}
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example of how to use this component
const Example = () => {
  const [showModal, setShowModal] = useState(true);
  
  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
    setShowModal(false);
  };
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <LogoutConfirmationModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Example;