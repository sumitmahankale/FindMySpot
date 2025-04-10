// ListerDashboard.jsx - For parking space owners to manage parking entries
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const ListerDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    id: '',
    name: '',
    inTime: '',
    outTime: '',
    date: '',
    spotNumber: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch existing entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        // Mock data if API fails - for testing purposes
        try {
          const response = await axios.get('http://localhost:5000/api/parking-entries');
          setEntries(response.data);
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
          // Initialize with empty array - in a real app you might use mock data here
          setEntries([]);
        }
      } catch (error) {
        console.error('Error fetching parking entries:', error);
        setErrorMessage('Failed to load parking entries. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, []);
  
  // Add new entry
  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    if (!newEntry.id || !newEntry.name || !newEntry.inTime || !newEntry.date || !newEntry.spotNumber) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Try with API first
      let addedEntry;
      try {
        const response = await axios.post('http://localhost:5000/api/parking-entries', newEntry);
        addedEntry = response.data;
      } catch (apiError) {
        console.warn('API not available, adding entry locally:', apiError);
        // Fallback to local state only (for demo/development)
        addedEntry = {
          ...newEntry,
          _id: Date.now().toString() // Generate temp ID
        };
      }
      
      // Update local state
      setEntries([...entries, addedEntry]);
      
      // Reset form
      setNewEntry({
        id: `PKG${(entries.length + 1).toString().padStart(3, '0')}`,
        name: '',
        inTime: '',
        outTime: '',
        date: new Date().toISOString().split('T')[0],
        spotNumber: ''
      });
      
      setSuccessMessage("Parking entry added successfully!");
      setErrorMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error('Error adding parking entry:', error);
      setErrorMessage('Failed to add parking entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete entry
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setIsLoading(true);
      try {
        // Try API delete first
        try {
          await axios.delete(`http://localhost:5000/api/parking-entries/${entryId}`);
        } catch (apiError) {
          console.warn('API not available, deleting entry locally:', apiError);
          // No action needed here as we'll update local state anyway
        }
        
        // Update local state regardless of API success
        setEntries(entries.filter(entry => entry._id !== entryId));
        setSuccessMessage("Entry deleted successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        console.error('Error deleting parking entry:', error);
        setErrorMessage('Failed to delete entry. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Generate auto-ID when component loads or entries change
  useEffect(() => {
    // Set next ID based on entries length
    const nextId = `PKG${(entries.length + 1).toString().padStart(3, '0')}`;
    setNewEntry(prev => ({...prev, id: nextId}));
  }, [entries.length]);
  
  // Set today's date as default when component loads
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewEntry(prev => ({...prev, date: today}));
  }, []);

  // Function to handle adding a test entry (for debugging)
 

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Parking Entry Dashboard</h1>
        <p className="text-gray-600">Manage entries for your parking spaces</p>
      </div>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Entry Form */}
        <div className="w-full lg:w-1/3">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Add New Parking Entry</h2>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry ID <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.id}
                  onChange={(e) => setNewEntry({...newEntry, id: e.target.value})}
                  placeholder="e.g. PKG001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                  placeholder="e.g. sumit mahankale"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">In Time <span className="text-red-500">*</span></label>
                <input 
                  type="time" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.inTime}
                  onChange={(e) => setNewEntry({...newEntry, inTime: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Out Time</label>
                <input 
                  type="time" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.outTime}
                  onChange={(e) => setNewEntry({...newEntry, outTime: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if vehicle is still parked</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spot Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newEntry.spotNumber}
                  onChange={(e) => setNewEntry({...newEntry, spotNumber: e.target.value})}
                  placeholder="e.g. A-12"
                />
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className={`w-full ${isLoading ? 'bg-blue-900' : 'bg-blue-900 hover:bg-blue-700'} text-white font-bold py-3 px-4 rounded-lg transition-all duration-200`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Entry'}
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </div>
            </form>
            
            {/* Debug button - only show in development */}
           
          </div>
        </div>
        
        {/* Entries List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              Current Parking Entries
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        In/Out
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spot
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entries.length > 0 ? (
                      entries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {entry.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>In: {entry.inTime}</div>
                            {entry.outTime && <div>Out: {entry.outTime}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.spotNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isLoading}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No parking entries found. Add your first entry!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {entries.length > 0 && (
              <div className="mt-4 text-right text-sm text-gray-500">
                Total Entries: {entries.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListerDashboard;