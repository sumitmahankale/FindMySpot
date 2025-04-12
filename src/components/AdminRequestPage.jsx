import React, { useState, useEffect } from 'react';
import { Check, X, Info, RefreshCw } from 'lucide-react';
import axios from 'axios';
import './CSS/ListerDashboard.css'; // Reusing the same CSS file

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Fetch parking space requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/parking-requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/parking-requests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh the list after approval
      fetchRequests();
      if (showDetails) setShowDetails(false);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };
  
  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/parking-requests/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh the list after rejection
      fetchRequests();
      if (showDetails) setShowDetails(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };
  
  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };
  
  const closeDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header - Matched with ListerDashboard */}
        <div className="bg-blue-900 text-white p-6">
          <h1 className="text-2xl font-bold">Parking Space Requests</h1>
          <p className="text-blue-100">Review and approve parking space listings</p>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{requests.length}</span> pending requests
            </div>
            <button 
              onClick={fetchRequests}
              className="flex items-center text-blue-900 hover:text-blue-700 px-3 py-1 rounded border border-blue-300 hover:border-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">No pending parking space requests</p>
              <p className="text-sm text-gray-600">New requests will appear here when listers submit them</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{request.location}</h3>
                      <p className="text-gray-600 text-sm">
                        Submitted by: <span className="font-medium">{request.listerName}</span>
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewDetails(request)}
                        className="px-3 py-1 text-blue-900 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1 text-green-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1 text-red-600 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {request.price}
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs ml-2">
                      {request.availability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Request Detail Modal - Styled consistently with ListerDashboard modals */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-60">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedRequest.location}</h2>
              <button onClick={closeDetails}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Lister Information</h3>
                <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedRequest.listerName}</p>
                <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedRequest.listerEmail}</p>
                <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedRequest.contact}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Space Details</h3>
                <p className="text-sm"><span className="text-gray-500">Location:</span> {selectedRequest.location}</p>
                <p className="text-sm"><span className="text-gray-500">Price:</span> {selectedRequest.price}</p>
                <p className="text-sm"><span className="text-gray-500">Availability:</span> {selectedRequest.availability}</p>
                <p className="text-sm"><span className="text-gray-500">Coordinates:</span> {selectedRequest.lat}, {selectedRequest.lng}</p>
              </div>
              
              {selectedRequest.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={closeDetails}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  Reject
                </button>
                <button 
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700"
                  onClick={() => handleApprove(selectedRequest.id)}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;