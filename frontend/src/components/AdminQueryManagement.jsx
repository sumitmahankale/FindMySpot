import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, CheckCircle, Clock, AlertCircle, 
  X, MessageSquare, ChevronDown, ChevronRight, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';

// Updated color palette to match AdminRequestsPage
const styles = {
  darkBlue: '#0c2d6b',  // Darker blue for headings
  mediumBlue: '#1e40af', // Medium blue for subheadings
  lightBlue: '#3b82f6',  // Light blue for highlights
  primaryBlue: '#1e3a8a', // Primary blue (blue-900)
  accentBlue: '#2563eb',  // Accent blue for interactive elements
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

const AdminQueryManagement = ({ activeTab }) => {
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'adminQueryManagement') {
      fetchAllQueries();
    }
  }, [activeTab]);

  useEffect(() => {
    filterQueries();
  }, [searchTerm, statusFilter, queries]);

  const fetchAllQueries = async () => {
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/queries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queries');
      }

      const data = await response.json();
      setQueries(data);
      setFilteredQueries(data);
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError(err.message || 'Error fetching queries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterQueries = () => {
    let filtered = [...queries];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(query => query.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(query => 
        query.subject.toLowerCase().includes(lowercasedSearch) ||
        query.description.toLowerCase().includes(lowercasedSearch) ||
        query.Lister?.fullName?.toLowerCase().includes(lowercasedSearch) ||
        query.Lister?.businessName?.toLowerCase().includes(lowercasedSearch) ||
        query.Lister?.email?.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    setFilteredQueries(filtered);
  };

  const handleUpdateQueryStatus = async (e) => {
    e.preventDefault();
    
    if (!selectedQuery) return;
    
    if (!responseText.trim() && (selectedQuery.status === 'pending' || selectedQuery.status === 'in-progress')) {
      Swal.fire({
        title: 'Response Required',
        text: 'Please provide a response before marking as resolved or closed',
        icon: 'warning',
        confirmButtonColor: styles.accentBlue
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/queries/${selectedQuery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedQuery.status,
          adminResponse: responseText || selectedQuery.adminResponse
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update query');
      }

      const updatedQuery = await response.json();
      
      Swal.fire({
        title: 'Success!',
        text: `Query has been updated successfully`,
        icon: 'success',
        confirmButtonColor: styles.accentBlue
      });
      
      // Update the queries state with the updated query
      setQueries(prevQueries => 
        prevQueries.map(q => q.id === selectedQuery.id ? updatedQuery.query : q)
      );
      
      // Update the selected query
      setSelectedQuery(updatedQuery.query);
      
    } catch (err) {
      console.error('Error updating query:', err);
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to update query. Please try again.',
        icon: 'error',
        confirmButtonColor: styles.accentBlue
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedQuery(prev => ({
      ...prev,
      status
    }));
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
    setResponseText(query.adminResponse || '');
  };

  const toggleQueryDetails = (queryId) => {
    if (expandedQueryId === queryId) {
      setExpandedQueryId(null);
    } else {
      setExpandedQueryId(queryId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getQueryCountByStatus = (status) => {
    if (status === 'all') {
      return queries.length;
    }
    return queries.filter(q => q.status === status).length;
  };

  const renderQueryList = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center mb-4 justify-between">
          <h3 className="text-lg font-semibold" style={{ color: styles.primaryBlue }}>
            All Support Queries
          </h3>
          
          <button 
            onClick={fetchAllQueries}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh queries"
          >
            <RefreshCw size={18} style={{ color: styles.accentBlue }} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by subject, description, or lister info..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRing: `2px ${styles.accentBlue}` }}
            />
          </div>
          
          {/* Status filter */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white"
                style={{ minWidth: '200px', focusRing: `2px ${styles.accentBlue}` }}
              >
                <option value="all">All Status ({getQueryCountByStatus('all')})</option>
                <option value="pending">Pending ({getQueryCountByStatus('pending')})</option>
                <option value="in-progress">In Progress ({getQueryCountByStatus('in-progress')})</option>
                <option value="resolved">Resolved ({getQueryCountByStatus('resolved')})</option>
                <option value="closed">Closed ({getQueryCountByStatus('closed')})</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-t-4 border-b-4 rounded-full animate-spin" 
               style={{ borderColor: styles.accentBlue }}></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#EF4444' }} />
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchAllQueries}
            className="px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors"
            style={{ backgroundColor: styles.accentBlue }}
          >
            Try Again
          </button>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <FileText size={48} className="mx-auto mb-4" style={{ color: styles.accentBlue }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: styles.textDark }}>No Queries Found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 
              'No queries match your current filters.' : 
              'There are no queries in the system yet.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-4 px-4 py-2 rounded-md text-white font-medium"
              style={{ backgroundColor: styles.accentBlue }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueries.map(query => (
            <div 
              key={query.id} 
              className="border rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-md"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleQueryDetails(query.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                        style={{ 
                          backgroundColor: statusColors[query.status].bg,
                          color: statusColors[query.status].text
                        }}
                      >
                        {statusColors[query.status].icon}
                        <span className="ml-1 capitalize">{query.status}</span>
                      </span>
                      <h3 
                        className="font-medium text-base truncate" 
                        style={{ color: styles.textDark }}
                      >
                        {query.subject}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mb-2">
                      <span>Category: {query.category}</span>
                      <span className="mx-2">•</span>
                      <span>ID: #{query.id}</span>
                      <span className="mx-2">•</span>
                      <span>Submitted: {formatDate(query.createdAt)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium" style={{ color: styles.primaryBlue }}>
                        {query.Lister?.businessName || 'Unknown Business'}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-600">
                        {query.Lister?.fullName || 'Unknown User'}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-600">
                        {query.Lister?.email || 'No email'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuery(query);
                      }}
                      className="px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 text-white"
                      style={{ backgroundColor: styles.primaryBlue }}
                    >
                      <MessageSquare size={14} className="inline mr-1" />
                      Respond
                    </button>
                    {expandedQueryId === query.id ? (
                      <ChevronDown size={18} style={{ color: styles.accentBlue }} />
                    ) : (
                      <ChevronRight size={18} style={{ color: styles.accentBlue }} />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedQueryId === query.id && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1" style={{ color: styles.primaryBlue }}>Description:</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{query.description}</p>
                  </div>
                  
                  {query.adminResponse && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1" style={{ color: styles.accentBlue }}>Admin Response:</div>
                      <p className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">{query.adminResponse}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuery(query);
                      }}
                      className="text-sm font-medium"
                      style={{ color: styles.accentBlue }}
                    >
                      View & Respond
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

  const renderQueryDetailView = () => {
    if (!selectedQuery) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setSelectedQuery(null)}
            className="flex items-center text-sm font-medium"
            style={{ color: styles.primaryBlue }}
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to List
          </button>
          
          <span className="text-sm text-gray-500">Query ID: #{selectedQuery.id}</span>
        </div>
        
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* Query header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: styles.primaryBlue }}>
                  {selectedQuery.subject}
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <span>Category: {selectedQuery.category}</span>
                  <span className="mx-2">•</span>
                  <span>Submitted: {formatDate(selectedQuery.createdAt)}</span>
                </div>
              </div>
              
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
          </div>
          
          {/* Lister information */}
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-sm font-medium mb-2" style={{ color: styles.primaryBlue }}>Lister Information:</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-gray-500">Business Name</span>
                <p className="font-medium" style={{ color: styles.darkBlue }}>
                  {selectedQuery.Lister?.businessName || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Full Name</span>
                <p className="font-medium" style={{ color: styles.textDark }}>
                  {selectedQuery.Lister?.fullName || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Email</span>
                <p className="font-medium" style={{ color: styles.textDark }}>
                  {selectedQuery.Lister?.email || 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Phone</span>
                <p className="font-medium" style={{ color: styles.textDark }}>
                  {selectedQuery.Lister?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Query content */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2" style={{ color: styles.primaryBlue }}>Query Details:</h3>
              <div className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap">
                {selectedQuery.description}
              </div>
            </div>
            
            {selectedQuery.attachmentUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2" style={{ color: styles.primaryBlue }}>Attachment:</h3>
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
            
            {/* Response form */}
            <form onSubmit={handleUpdateQueryStatus}>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2" style={{ color: styles.accentBlue }}>Admin Response:</h3>
                <textarea 
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 h-32"
                  style={{ focusRing: `2px ${styles.accentBlue}` }}
                  placeholder="Type your response to the lister here..."
                ></textarea>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex flex-wrap justify-between items-center">
                  <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-wrap">
                    <h3 className="text-sm font-medium w-full sm:w-auto flex items-center" style={{ color: styles.primaryBlue }}>
                      Update Status:
                    </h3>
                    {Object.keys(statusColors).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                          selectedQuery.status === status ? 'ring-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: statusColors[status].bg,
                          color: statusColors[status].text,
                          ring: selectedQuery.status === status ? `2px ${statusColors[status].text}` : 'none'
                        }}
                      >
                        {statusColors[status].icon}
                        <span className="ml-1 capitalize">{status}</span>
                      </button>
                    ))}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-2 text-white font-medium rounded-lg disabled:opacity-70"
                    style={{ backgroundColor: styles.primaryBlue }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Updating...
                      </>
                    ) : (
                      'Save Response & Update Status'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-blue-900 text-white p-6">
          <h2 className="text-2xl font-bold">Query Management</h2>
          <p className="text-blue-100">Review and respond to support queries</p>
        </div>
        
        <div className="p-6">
          {selectedQuery ? renderQueryDetailView() : renderQueryList()}
        </div>
      </div>
    </div>
  );
};

// Missing ChevronLeft and Paperclip components
function ChevronLeft({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function Paperclip({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default AdminQueryManagement;