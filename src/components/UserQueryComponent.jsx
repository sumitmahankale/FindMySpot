import React, { useState, useEffect } from 'react';
import { Inbox, CheckCircle, Clock, AlertCircle, Send, X, Paperclip, ChevronDown, ChevronRight, RefreshCw, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Custom CSS variables (matching the existing style palette)
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

const statusColors = {
  pending: { bg: '#FEF3C7', text: '#D97706', icon: <Clock size={16} /> },
  'in-progress': { bg: '#DBEAFE', text: '#2563EB', icon: <RefreshCw size={16} /> },
  resolved: { bg: '#D1FAE5', text: '#059669', icon: <CheckCircle size={16} /> },
  closed: { bg: '#E5E7EB', text: '#4B5563', icon: <X size={16} /> }
};

const UserQueryComponent = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical Issue',
    description: '',
    attachmentUrl: null
  });
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('form'); // 'form', 'history', 'detail'
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [file, setFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get authentication data from localStorage
    const storedUserId = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('token');
    
    // Update state with authentication info
    setUserId(storedUserId);
    setToken(storedToken);
    setIsAuthenticated(!!storedUserId && !!storedToken);
  }, []);

  // Only fetch queries when userId and token are available
  useEffect(() => {
    if (userId && token && viewMode === 'history') {
      fetchQueries();
    }
  }, [userId, token, viewMode]);

  const fetchQueries = async () => {
    if (!userId || !token) {
      setError('You must be logged in to view your queries');
      setQueries([]);
      return;
    }
  
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the simpler endpoint that doesn't require userId in path
      const response = await fetch(`http://localhost:5000/api/user/queries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch queries');
      }
  
      const data = await response.json();
      
      if (data.length > 0) {
        setQueries(data);
      } else {
        // Temporary mock data for testing UI
        const mockData = [
          {
            id: 1,
            subject: 'Issue with payment',
            category: 'Payment Issue',
            description: 'I tried to pay for my booking but the transaction failed multiple times.',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            adminResponse: null
          },
          {
            id: 2,
            subject: 'Cannot find my reservation',
            category: 'Booking Problem',
            description: 'I made a booking yesterday but it doesn\'t appear in my list. The confirmation email says booking #BK12345.',
            status: 'in-progress',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            adminResponse: 'We are looking into this issue and will get back to you shortly.'
          },
          {
            id: 3,
            subject: 'Feature request: save favorite spots',
            category: 'Feature Request',
            description: 'It would be great if I could bookmark my favorite parking spots for quick access.',
            status: 'resolved',
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            updatedAt: new Date(Date.now() - 432000000).toISOString(),
            adminResponse: 'Thank you for your suggestion! We\'ve added this to our development roadmap and plan to implement it in our next update.'
          }
        ];
        
        setQueries(mockData);
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError(err.message || 'Error fetching your queries. Please try again.');
      setQueries([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use state values instead of directly accessing localStorage
    if (!userId || !token) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'You must be logged in to submit a query.',
        icon: 'error',
        confirmButtonColor: styles.orange
      });
      navigate('/login');
      return;
    }
  
    if (!formData.subject || !formData.category || !formData.description) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonColor: styles.orange
      });
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      // Handle file upload if needed
      let attachmentUrl = null;
      if (file) {
        // This is a placeholder for file upload logic
        attachmentUrl = 'mock-url-for-file-upload';
      }
  
      const response = await fetch('http://localhost:5000/api/user/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          attachmentUrl,
          userId
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit query');
      }
      
      // Success!
      Swal.fire({
        title: 'Query Submitted!',
        text: 'Your query has been successfully submitted. Our team will respond shortly.',
        icon: 'success',
        confirmButtonColor: styles.orange
      });
  
      // Reset form
      setFormData({
        subject: '',
        category: 'Technical Issue',
        description: '',
        attachmentUrl: null
      });
      setFile(null);
      
      // Switch to history view and refresh queries
      setViewMode('history');
    } catch (err) {
      console.error('Error submitting query:', err);
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to submit your query. Please try again.',
        icon: 'error',
        confirmButtonColor: styles.orange
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setViewMode('detail');
  };

  const toggleQueryDetails = (queryId) => {
    if (expandedQueryId === queryId) {
      setExpandedQueryId(null);
    } else {
      setExpandedQueryId(queryId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderLoginPrompt = () => (
    <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <AlertCircle size={48} className="mx-auto mb-3" style={{ color: styles.orange }} />
      <h3 className="text-lg font-medium mb-1" style={{ color: styles.mediumBlue }}>Authentication Required</h3>
      <p className="text-gray-500 mb-4">You need to be logged in to view or submit support tickets.</p>
      <button 
        onClick={() => navigate('/login')}
        className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
        style={{ backgroundColor: styles.orange }}
      >
        Go to Login
      </button>
    </div>
  );

  const renderQueryForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
          Subject <span style={{ color: styles.orange }}>*</span>
        </label>
        <input 
          type="text" 
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
          placeholder="Brief description of your issue"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
          Category <span style={{ color: styles.orange }}>*</span>
        </label>
        <select 
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
        >
          <option>Technical Issue</option>
          <option>Booking Problem</option>
          <option>Account Help</option>
          <option>Payment Issue</option>
          <option>Feature Request</option>
          <option>Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
          Description <span style={{ color: styles.orange }}>*</span>
        </label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full rounded-md border-gray-300 shadow-sm p-2 border h-40"
          placeholder="Please provide details about your query..."
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: styles.textDark }}>
          Attachments
        </label>
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center relative">
          <input 
            type="file" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
          <div className="flex flex-col items-center justify-center">
            <Paperclip size={24} className="mb-2" style={{ color: styles.mediumBlue }} />
            <p className="text-sm text-gray-500">
              {file ? file.name : "Drag & drop files here, or click to browse"}
            </p>
            {file && (
              <div className="mt-2 flex items-center">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {Math.round(file.size / 1024)} KB
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-2 flex justify-between items-center">
        <button 
          onClick={() => {
            setViewMode('history');
            // fetchQueries will be called by the useEffect when viewMode changes
          }}
          className="px-4 py-2 rounded-lg flex items-center font-medium transition-all duration-200"
          style={{ color: styles.mediumBlue }}
        >
          <Inbox className="mr-2 h-5 w-5" />
          View Previous Queries
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg text-white font-bold flex items-center transition-all duration-200"
          style={{ backgroundColor: styles.orange }}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          Submit Query
        </button>
      </div>
    </div>
  );

  const renderQueryHistory = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setViewMode('form')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <ChevronLeft size={16} className="mr-1" /> New Query
        </button>
        
        <button 
          onClick={fetchQueries} 
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: styles.orange }}></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg">
          <p className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </p>
          {(!userId || !token) && (
            <button 
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          )}
        </div>
      ) : queries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Inbox size={48} className="mx-auto mb-3" style={{ color: styles.lightBlue }} />
          <h3 className="text-lg font-medium mb-1" style={{ color: styles.mediumBlue }}>No queries found</h3>
          <p className="text-gray-500">You haven't submitted any queries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map(query => (
            <div 
              key={query.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleQueryDetails(query.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium mb-1 flex items-center" style={{ color: styles.darkBlue }}>
                      {query.subject}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      <span>
                        {formatDate(query.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        {query.category}
                      </span>
                      <span>•</span>
                      <span className="text-xs">
                        ID: {query.id}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span 
                      className="px-2 py-1 text-xs rounded-full flex items-center mr-2"
                      style={{ 
                        backgroundColor: statusColors[query.status]?.bg,
                        color: statusColors[query.status]?.text
                      }}
                    >
                      {statusColors[query.status]?.icon}
                      <span className="ml-1 capitalize">{query.status}</span>
                    </span>
                    
                    {expandedQueryId === query.id ? 
                      <ChevronDown size={16} className="text-gray-400" /> : 
                      <ChevronRight size={16} className="text-gray-400" />
                    }
                  </div>
                </div>
              </div>
              
              {expandedQueryId === query.id && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2" style={{ color: styles.darkBlue }}>Description:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{query.description}</p>
                  </div>
                  
                  {query.adminResponse && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <h4 className="text-sm font-medium mb-2" style={{ color: styles.orange }}>
                        Response:
                      </h4>
                      <p className="bg-orange-50 p-3 rounded-md text-gray-700 text-sm whitespace-pre-wrap">
                        {query.adminResponse}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleViewQuery(query)}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQueryDetail = () => {
    if (!selectedQuery) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setViewMode('history')}
            className="flex items-center text-sm font-medium"
            style={{ color: styles.mediumBlue }}
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to List
          </button>
          
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium flex items-center"
            style={{ 
              backgroundColor: statusColors[selectedQuery.status].bg,
              color: statusColors[selectedQuery.status].text
            }}
          >
            {statusColors[selectedQuery.status].icon}
            <span className="ml-1 capitalize">{selectedQuery.status}</span>
          </span>
        </div>
        
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: styles.textDark }}>{selectedQuery.subject}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span>Category: {selectedQuery.category}</span>
              <span className="mx-2">•</span>
              <span>Submitted: {formatDate(selectedQuery.createdAt)}</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium mb-2" style={{ color: styles.mediumBlue }}>Your Query:</h3>
            <p className="whitespace-pre-wrap text-gray-700">{selectedQuery.description}</p>
          </div>
          
          {selectedQuery.attachmentUrl && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: styles.mediumBlue }}>Attachment:</h3>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border">
                <Paperclip size={16} className="mr-2 text-gray-500" />
                <a 
                  href={selectedQuery.attachmentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Attachment
                </a>
              </div>
            </div>
          )}
          
          {selectedQuery.adminResponse ? (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2" style={{ color: styles.orange }}>Support Response:</h3>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="whitespace-pre-wrap text-gray-700">{selectedQuery.adminResponse}</p>
                <div className="text-right mt-2 text-xs text-gray-500">
                  {selectedQuery.updatedAt !== selectedQuery.createdAt ? 
                    `Last updated: ${formatDate(selectedQuery.updatedAt)}` : ''}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 text-center py-6">
              <Clock size={32} className="mx-auto mb-2" style={{ color: styles.lightBlue }} />
              <p className="text-gray-500">Awaiting response from support team</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check authentication state for appropriate action
  if (!isAuthenticated && viewMode !== 'form') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: styles.darkBlue }}>
            My Support Tickets
          </h2>
        </div>
        {renderLoginPrompt()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: styles.darkBlue }}>
          {viewMode === 'form' ? 'Contact Support' : 
           viewMode === 'history' ? 'My Support Tickets' : 'Ticket Details'}
        </h2>
        
        {viewMode === 'detail' && selectedQuery && (
          <span className="text-sm text-gray-500">Ticket ID: #{selectedQuery.id}</span>
        )}
      </div>
      
      {viewMode === 'form' && renderQueryForm()}
      {viewMode === 'history' && renderQueryHistory()}
      {viewMode === 'detail' && renderQueryDetail()}
    </div>
  );
};

export default UserQueryComponent;