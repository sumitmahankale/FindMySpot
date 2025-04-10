import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import ListParkingSpaceForm from './ListParkingSpace';

const ListerDashboardPage = () => {
  const [showListingForm, setShowListingForm] = useState(false);
  const fullName = localStorage.getItem('fullName') || 'Lister';
  const businessName = localStorage.getItem('businessName');
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Lister Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {businessName ? `${businessName} (${fullName})` : fullName}
        </p>
      </div>
      
      {!showListingForm ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to list your parking space?</h2>
            <p className="text-gray-600 mb-6">
              List your parking space on FindMySpot and start earning passive income today!
            </p>
            <button 
              onClick={() => setShowListingForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center mx-auto"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              List My Space
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <button 
            onClick={() => setShowListingForm(false)}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <ListParkingSpaceForm />
        </div>
      )}
    </div>
  );
};

export default ListerDashboardPage;