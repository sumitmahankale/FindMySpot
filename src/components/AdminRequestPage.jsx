import React, { useState, useEffect } from 'react';
import { Check, X, Info, RefreshCw, AlertTriangle, Search, Filter } from 'lucide-react';
import axios from 'axios';
import './CSS/ListerDashboard.css';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
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
      showNotification('Failed to load requests. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);
  
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleApprove = async (id) => {
    try {
      setIsProcessing(true);
      await axios.put(`http://localhost:5000/api/parking-requests/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh the list after approval
      fetchRequests();
      if (showDetails) setShowDetails(false);
      showNotification('Request approved successfully!', 'success');
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Error approving request. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReject = async (id) => {
    try {
      setIsProcessing(true);
      await axios.put(`http://localhost:5000/api/parking-requests/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh the list after rejection
      fetchRequests();
      if (showDetails) setShowDetails(false);
      showNotification('Request rejected successfully.', 'success');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Error rejecting request. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };
  
  const closeDetails = () => {
    setShowDetails(false);
  };

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.listerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.listerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today or yesterday
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
          notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
          'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-2" /> : <Check className="w-5 h-5 mr-2" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header - Matched with ListerDashboard */}
        <div className="bg-blue-900 text-white p-6">
          <h1 className="text-2xl font-bold">Parking Space Requests</h1>
          <p className="text-blue-100">Review and approve parking space listings</p>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by location or lister"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter Dropdown */}
              <div className="flex items-center">
                <div className="mr-2 text-gray-600">
                  <Filter className="h-5 w-5" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="pending">Pending Requests</option>
                  <option value="approved">Approved Requests</option>
                  <option value="rejected">Rejected Requests</option>
                  <option value="all">All Requests</option>
                </select>
              </div>
              
              <button 
                onClick={fetchRequests}
                className="flex items-center justify-center text-blue-900 hover:text-blue-700 px-4 py-2 rounded border border-blue-300 hover:border-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredRequests.length}</span> 
              {filterStatus === 'all' ? 'requests' : `${filterStatus} requests`} found
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">No {filterStatus} parking space requests found</p>
              <p className="text-sm text-gray-600">
                {searchTerm ? 'Try a different search term or filter' : 'New requests will appear here when listers submit them'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map(request => (
                <div 
                  key={request.id} 
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${
                    request.status === 'approved' ? 'border-green-200 bg-green-50' : 
                    request.status === 'rejected' ? 'border-red-200 bg-red-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{request.location}</h3>
                      <p className="text-gray-600 text-sm">
                        Submitted by: <span className="font-medium">{request.listerName}</span>
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewDetails(request)}
                        className="px-3 py-1 text-blue-900 border border-gray-300 rounded hover:bg-gray-50"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1 text-green-600 border border-green-300 rounded hover:bg-green-50"
                            title="Approve Request"
                            disabled={isProcessing}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(request.id)}
                            className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                            title="Reject Request"
                            disabled={isProcessing}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {request.status === 'approved' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Approved
                        </span>
                      )}
                      
                      {request.status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {request.price}
                    </span>
                    <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs ml-2">
                      {request.availability}
                    </span>
                    {request.businessName && (
                      <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs ml-2">
                        {request.businessName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Request Detail Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedRequest.location}</h2>
              <button onClick={closeDetails} className="hover:bg-gray-100 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="mb-4">
                {selectedRequest.status === 'pending' && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                )}
                {selectedRequest.status === 'approved' && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Approved
                  </span>
                )}
                {selectedRequest.status === 'rejected' && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                    Rejected
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Lister Information</h3>
                <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedRequest.listerName}</p>
                <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedRequest.listerEmail}</p>
                <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedRequest.contact}</p>
                {selectedRequest.businessName && (
                  <p className="text-sm"><span className="text-gray-500">Business:</span> {selectedRequest.businessName}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Space Details</h3>
                <p className="text-sm"><span className="text-gray-500">Location:</span> {selectedRequest.location}</p>
                <p className="text-sm"><span className="text-gray-500">Price:</span> {selectedRequest.price}</p>
                <p className="text-sm"><span className="text-gray-500">Availability:</span> {selectedRequest.availability}</p>
                <p className="text-sm"><span className="text-gray-500">Coordinates:</span> {selectedRequest.lat}, {selectedRequest.lng}</p>
                <p className="text-sm"><span className="text-gray-500">Submitted:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
              
              {selectedRequest.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              )}
              
              {/* Map Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-1">Location Preview</h3>
                <div className="h-48 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedRequest.lat},${selectedRequest.lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${selectedRequest.lat},${selectedRequest.lng}&key=YOUR_API_KEY`} 
                    alt="Location Map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Map preview - for reference only</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={closeDetails}
                >
                  Close
                </button>
                
                {selectedRequest.status === 'pending' && (
                  <>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                    <button 
                      className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;