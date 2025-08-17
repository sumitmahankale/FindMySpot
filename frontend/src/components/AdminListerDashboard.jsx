import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Edit, Trash2, AlertCircle, X, MapPin } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../config/api.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// NOTE: getApiUrl already returns the base including /api; avoid manual concatenation
// This component previously built URLs like `${API_BASE_URL}/api/parking-spaces` producing /api/api/ paths.
// Use getApiUrl('parking-spaces') etc. directly to prevent 404s.

const ParkingSpaceManagement = () => {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    availability: '',
    description: '',
    contact: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);

  // Fetch parking spaces - no auth required
  useEffect(() => {
    const fetchParkingSpaces = async () => {
      setLoading(true);
      try {
        const response = await axios.get(getApiUrl('parking-spaces'));
        console.log('Fetched parking spaces:', response.data);
        setParkingSpaces(response.data);
      } catch (error) {
        console.error('Error fetching parking spaces:', error);
        showNotification('Failed to load parking spaces', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParkingSpaces();
  }, []);

  const handleSpaceSelect = (space) => {
    setSelectedSpace(space);
    setFormData({
      location: space.location,
      price: space.price || '',
      availability: space.availability || '',
      description: space.description || '',
      contact: space.contact
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateSpace = async () => {
    if (!selectedSpace) return;
    
    try {
      console.log('Updating space with ID:', selectedSpace.id);
      console.log('Update data:', formData);
      
      // Modified to remove authentication header
      // Requires lister ownership on backend; admin override not yet implemented
      const response = await axios.put(
        getApiUrl(`parking-spaces/${selectedSpace.id}`), 
        { ...formData },
        { headers: getAuthHeaders() }
      );
      
      console.log('Update response:', response.data);
      
      // Update local state
      const updatedSpaces = parkingSpaces.map(space => 
        space.id === selectedSpace.id ? { ...space, ...formData } : space
      );
      
      setParkingSpaces(updatedSpaces);
      setSelectedSpace({ ...selectedSpace, ...formData });
      setEditModalOpen(false);
      showNotification('Parking space updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating parking space:', error.response || error);
      showNotification(`Failed to update parking space: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    
    try {
      console.log('Deleting space with ID:', selectedSpace.id);
      
      // Modified to remove authentication header
      const response = await axios.delete(
        getApiUrl(`parking-spaces/${selectedSpace.id}`),
        { headers: getAuthHeaders() }
      );
      
      console.log('Delete response:', response.data);
      
      // Update local state
      const updatedSpaces = parkingSpaces.filter(space => space.id !== selectedSpace.id);
      setParkingSpaces(updatedSpaces);
      setSelectedSpace(null);
      setDeleteModalOpen(false);
      showNotification('Parking space removed successfully!', 'success');
    } catch (error) {
      console.error('Error deleting parking space:', error.response || error);
      showNotification(`Failed to delete parking space: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const refreshParkingSpaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(getApiUrl('parking-spaces'));
      console.log('Refreshed parking spaces:', response.data);
      setParkingSpaces(response.data);
      showNotification('Parking spaces refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing parking spaces:', error);
      showNotification('Failed to refresh parking spaces', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manage Parking Spaces</h1>
            <p className="text-blue-100">View, edit and remove parking spaces</p>
          </div>
          <button 
            onClick={refreshParkingSpaces}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white"
          >
            Refresh Spaces
          </button>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`p-4 ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} flex justify-between items-center`}>
            <span className="flex items-center">
              {notification.type === 'error' ? 
                <AlertCircle size={18} className="mr-2" /> : 
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              }
              {notification.message}
            </span>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
              <X size={18} />
            </button>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="p-4 text-center">
            <p className="text-blue-600">Loading parking spaces...</p>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex flex-col md:flex-row">
          {/* Left side - list of spaces */}
          <div className="w-full md:w-1/3 border-r border-gray-200">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-700">All Parking Spaces</h2>
            </div>
            
            {!loading && parkingSpaces.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No parking spaces found.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-screen">
                {parkingSpaces.map(space => (
                  <div 
                    key={space.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${selectedSpace?.id === space.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSpaceSelect(space)}
                  >
                    <h3 className="font-medium text-blue-800">{space.location}</h3>
                    <p className="text-sm text-gray-600">{space.price || 'Price not specified'}</p>
                    <p className="text-xs text-gray-500">{space.availability || 'Availability not specified'}</p>
                    <p className="text-xs text-gray-400">ID: {space.id} · Lister: {space.listerId || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right side - details and map */}
          <div className="w-full md:w-2/3">
            {selectedSpace ? (
              <div>
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">{selectedSpace.location}</h2>
                  <div className="flex space-x-2">
                    {localStorage.getItem('role') === 'lister' && (
                      <>
                        <button 
                          className="flex items-center px-3 py-2 bg-blue-900 text-white rounded hover:bg-blue-700"
                          onClick={() => setEditModalOpen(true)}
                        >
                          <Edit size={16} className="mr-1" /> Edit
                        </button>
                        <button 
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => setDeleteModalOpen(true)}
                        >
                          <Trash2 size={16} className="mr-1" /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Space Details Content */}
                <div className="p-6">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Space Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><span className="text-gray-500">Price:</span> {selectedSpace.price || 'Not specified'}</p>
                        <p className="text-sm"><span className="text-gray-500">Availability:</span> {selectedSpace.availability || 'Not specified'}</p>
                        <p className="text-sm"><span className="text-gray-500">Contact:</span> {selectedSpace.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="text-gray-500">Listed On:</span> {new Date(selectedSpace.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm"><span className="text-gray-500">Last Updated:</span> {new Date(selectedSpace.updatedAt).toLocaleDateString()}</p>
                        <p className="text-sm"><span className="text-gray-500">Lister ID:</span> {selectedSpace.listerId || 'Not assigned'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm"><span className="text-gray-500">Description:</span> {selectedSpace.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div className="h-64 md:h-96 rounded-lg overflow-hidden border-2 border-gray-200 mt-4 relative">
                    <MapContainer 
                      center={[selectedSpace.lat, selectedSpace.lng]} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[selectedSpace.lat, selectedSpace.lng]}>
                        <Popup>{selectedSpace.location}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-6">
                <MapPin size={48} className="text-gray-400 mb-4" />
                <p className="text-gray-500">Select a parking space to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
  {editModalOpen && localStorage.getItem('role') === 'lister' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Parking Space</h2>
              <button onClick={() => setEditModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                <input 
                  type="text" 
                  name="location"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="text" 
                  name="price"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. ₹150/hour or ₹5000/month"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input 
                  type="text" 
                  name="availability"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="e.g. 24/7 or Weekdays 9-5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input 
                  type="text" 
                  name="contact"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={formData.contact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your parking space..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700"
                  onClick={handleUpdateSpace}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
  {deleteModalOpen && localStorage.getItem('role') === 'lister' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Remove Parking Space</h2>
              <button onClick={() => setDeleteModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <AlertCircle size={16} className="inline mr-2" />
                This will permanently remove the parking space with ID: {selectedSpace?.id}
              </p>
            </div>
            
            <p className="mb-4">Are you sure you want to remove this parking space? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteSpace}
              >
                Remove Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingSpaceManagement;