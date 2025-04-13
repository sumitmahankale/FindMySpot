import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Check, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CSS/ListerParking.css';
import Swal from 'sweetalert2';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Click Handler
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

const ParkingListerPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Default: Pune
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    availability: '',
    description: '',
    contact: '',
    name: '',
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });
  const navigate = useNavigate();
  
  // Check auth & load user data
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('role');
    
    if (!auth || role !== 'lister') {
      navigate('/listerlogin');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Prefill form fields
    setFormData(prev => ({ 
      ...prev, 
      name: localStorage.getItem('fullName') || '',
      contact: localStorage.getItem('phone') || ''
    }));
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setMapCenter([position.coords.latitude, position.coords.longitude]),
        (error) => console.error("Error getting location:", error)
      );
    }
    
    // Fetch existing spaces
    fetchParkingSpaces();
  }, [navigate]);
  
  // Fetch existing parking spaces
  const fetchParkingSpaces = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/parking-spaces');
      setSpaces(data);
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load existing parking spaces'
      });
    }
  };
  
  // Handle map click
  const handleMapClick = ({ lat, lng }) => {
    setSelectedPoint({ lat, lng });
    setShowForm(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit parking space request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPoint) {
      setStatus({ loading: false, success: false, error: 'Please select a location on the map first' });
      return;
    }
    
    setStatus({ loading: true, success: false, error: '' });
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const requestData = {
        location: formData.location,
        price: formData.price,
        availability: formData.availability,
        description: formData.description || 'No description provided',
        contact: formData.contact,
        listerName: formData.name || localStorage.getItem('fullName'),
        listerEmail: localStorage.getItem('email') || localStorage.getItem('username'),
        businessName: localStorage.getItem('businessName') || '',
        lat: selectedPoint.lat,
        lng: selectedPoint.lng,
        listerId: userId
      };
      
      await axios.post('http://localhost:5000/api/parking-requests', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatus({ loading: false, success: true, error: '' });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          location: '',
          price: '',
          availability: '',
          description: ''
        }));
        setSelectedPoint(null);
        setShowForm(false);
      }, 3000);
      
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to submit request'
      });
    }
  };
  
  // Custom marker icon
  const selectedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'selected-marker'
  });

  if (!isAuthenticated) return null;

  const fullName = localStorage.getItem('fullName') || 'Lister';
  const businessName = localStorage.getItem('businessName');

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Lister Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {businessName ? `${businessName} (${fullName})` : fullName}!
          List your available parking spaces below.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {status.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">Request Submitted Successfully!</h3>
            <p className="text-green-600">Your parking space listing has been submitted for review.</p>
            <button 
              onClick={() => setStatus({ loading: false, success: false, error: '' })}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              List Another Space
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Map Section */}
            <div className="w-full md:w-3/5">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2 text-blue-700">Select Location</h2>
                <p className="text-sm text-gray-600 mb-3">Click on the map to place your parking spot</p>
                
                <div className="h-96 rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
                  <MapContainer 
                    center={mapCenter} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    
                    {/* Existing spots */}
                    {spaces.map(spot => (
                      <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                        <Popup>
                          <div className="text-sm">
                            <div className="font-bold">{spot.location}</div>
                            <div>{spot.price}</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    
                    {/* Selected point */}
                    {selectedPoint && (
                      <Marker position={[selectedPoint.lat, selectedPoint.lng]} icon={selectedIcon}>
                        <Popup>New parking location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                
                {selectedPoint && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                    Location selected at {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
                  </div>
                )}
                
                {!selectedPoint && !showForm && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center mx-auto"
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      List Without Map Selection
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Form Section */}
            {showForm && (
              <div className="w-full md:w-2/5">
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-blue-800">Parking Space Details</h2>
                  
                  {status.error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                      {status.error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="location"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Pune Secure Parking"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="name"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="contact"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="e.g. 555-1234"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="price"
                          className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="e.g. ₹150/hour"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="availability"
                          className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                          value={formData.availability}
                          onChange={handleChange}
                          placeholder="e.g. 24/7"
                          required
                        />
                      </div>
                    </div>
                    
                    {!selectedPoint && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                          <input 
                            type="number"
                            name="lat" 
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={selectedPoint ? selectedPoint.lat : ""}
                            onChange={(e) => setSelectedPoint(prev => ({...prev || {}, lat: parseFloat(e.target.value)}))}
                            placeholder="e.g. 18.5204"
                            step="any"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                          <input 
                            type="number"
                            name="lng"
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={selectedPoint ? selectedPoint.lng : ""}
                            onChange={(e) => setSelectedPoint(prev => ({...prev || {}, lng: parseFloat(e.target.value)}))}
                            placeholder="e.g. 73.8567"
                            step="any"
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        name="description"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your parking space..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit"
                        className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                          status.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                        disabled={status.loading}
                      >
                        {status.loading ? 'Submitting...' : 'List My Parking Space'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingListerPage;