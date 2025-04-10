import React, { useState, useEffect } from 'react';
import { Check, X, Info, RefreshCw } from 'lucide-react';
import axios from 'axios';

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
    <div className="max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard - Parking Requests</h1>
        <p className="text-gray-600">Review and approve parking space listings</p>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{requests.length}</span> pending requests
        </div>
        <button 
          onClick={fetchRequests}
          className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-200 hover:border-blue-400"
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
          <p className="text-gray-500 mb-2">No pending parking space requests</p>
          <p className="text-sm text-gray-400">New requests will appear here when listers submit them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(request => (
            <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{request.location}</h3>
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
                    className="px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleApprove(request.id)}
                    className="px-3 py-1 text-green-600 border border-green-200 rounded hover:bg-green-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleReject(request.id)}
                    className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {request.price}
                </span>
                <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs ml-2">
                  {request.availability}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Request Detail Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-blue-800">{selectedRequest.location}</h2>
              <button 
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Lister Information</h3>
                <p className="text-gray-600">Name: {selectedRequest.listerName}</p>
                <p className="text-gray-600">Email: {selectedRequest.listerEmail}</p>
                <p className="text-gray-600">Phone: {selectedRequest.contact}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Space Details</h3>
                <p className="text-gray-600">Location: {selectedRequest.location}</p>
                <p className="text-gray-600">Price: {selectedRequest.price}</p>
                <p className="text-gray-600">Availability: {selectedRequest.availability}</p>
                <p className="text-gray-600">Coordinates: {selectedRequest.lat}, {selectedRequest.lng}</p>
              </div>
              
              {selectedRequest.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>
              )}
              
              <div className="pt-4 border-t flex justify-end space-x-3">
                <button 
                  onClick={() => handleReject(selectedRequest.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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