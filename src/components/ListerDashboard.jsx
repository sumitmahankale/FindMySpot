// ListerDashboard.jsx - Complete dashboard for parking space listers
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Edit, Trash2, AlertCircle, X, MapPin, CalendarRange } from 'lucide-react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BookingManagement from './BookingManagement';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ListerDashboard = () => {
  const [userSpaces, setUserSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    location: '',
    price: '',
    availability: '',
    description: '',
    contact: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch user's spaces
  useEffect(() => {
    const fetchUserSpaces = async () => {
      try {
        // In a real app, this would filter by the logged-in user ID
        const response = await axios.get('http://localhost:5000/api/parking-spaces');
        // For demo, let's pretend all spaces belong to the current user
        setUserSpaces(response.data);
      } catch (error) {
        console.error('Error fetching your parking spaces:', error);
        showNotification('Failed to load your parking spaces', 'error');
      }
    };
    
    fetchUserSpaces();
  }, []);
  
  const handleSpaceSelect = (space) => {
    setSelectedSpace(space);
    setEditFormData({
      location: space.location,
      price: space.price || '',
      availability: space.availability || '',
      description: space.description || '',
      contact: space.contact
    });
    setActiveTab('details'); // Reset to details tab when selecting a new space
  };
  
  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUpdateSpace = async () => {
    if (!selectedSpace) return;
    
    try {
      await axios.put(`http://localhost:5000/api/parking-spaces/${selectedSpace.id}`, {
        ...editFormData
      });
      
      // Update local state
      const updatedSpaces = userSpaces.map(space => 
        space.id === selectedSpace.id ? { ...space, ...editFormData } : space
      );
      
      setUserSpaces(updatedSpaces);
      setSelectedSpace({ ...selectedSpace, ...editFormData });
      setIsEditModalOpen(false);
      showNotification('Parking space updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating parking space:', error);
      showNotification('Failed to update parking space', 'error');
    }
  };
  
  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/parking-spaces/${selectedSpace.id}`);
      
      // Update local state
      const updatedSpaces = userSpaces.filter(space => space.id !== selectedSpace.id);
      setUserSpaces(updatedSpaces);
      setSelectedSpace(null);
      setIsDeleteModalOpen(false);
      showNotification('Parking space removed successfully!', 'success');
    } catch (error) {
      console.error('Error deleting parking space:', error);
      showNotification('Failed to delete parking space', 'error');
    }
  };
  
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 text-white p-6">
          <h1 className="text-2xl font-bold">My Parking Spaces</h1>
          <p className="text-blue-100">Manage your listed parking spaces</p>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`p-4 ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} flex justify-between items-center`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
              <X size={18} />
            </button>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex flex-col md:flex-row">
          {/* Left side - list of spaces */}
          <div className="w-full md:w-1/3 border-r border-gray-200">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Your Listed Spaces</h2>
            </div>
            
            {userSpaces.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>You haven't listed any parking spaces yet.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-screen">
                {userSpaces.map(space => (
                  <div 
                    key={space.id} 
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${selectedSpace?.id === space.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSpaceSelect(space)}
                  >
                    <h3 className="font-medium text-blue-800">{space.location}</h3>
                    <p className="text-sm text-gray-600">{space.price}</p>
                    <p className="text-xs text-gray-500">{space.availability}</p>
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
                    <button 
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit size={16} className="mr-1" /> Edit
                    </button>
                    <button 
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 size={16} className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="border-b">
                  <nav className="flex">
                    <button
                      className={`py-3 px-6 font-medium border-b-2 ${
                        activeTab === 'details' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('details')}
                    >
                      <MapPin size={16} className="inline mr-2" />
                      Space Details
                    </button>
                    <button
                      className={`py-3 px-6 font-medium border-b-2 ${
                        activeTab === 'bookings' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('bookings')}
                    >
                      <CalendarRange size={16} className="inline mr-2" />
                      Bookings
                    </button>
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'details' ? (
                    <div>
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
                  ) : (
                    <BookingManagement parkingSpaceId={selectedSpace.id} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-6">
                <AlertCircle size={48} className="text-gray-400 mb-4" />
                <p className="text-gray-500">Select a parking space to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-60">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Parking Space</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
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
                  value={editFormData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="text" 
                  name="price"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={editFormData.price}
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
                  value={editFormData.availability}
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
                  value={editFormData.contact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your parking space..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-60">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Remove Parking Space</h2>
              <button onClick={() => setIsDeleteModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <p className="mb-4">Are you sure you want to remove this parking space? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setIsDeleteModalOpen(false)}
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

export default ListerDashboard;