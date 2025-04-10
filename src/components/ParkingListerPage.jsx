import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, PlusCircle, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Click Handler Component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
};

const ParkingListerPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [showListingForm, setShowListingForm] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune default
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    availability: '',
    description: '',
    contact: '',
    name: '',
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });
  
  const navigate = useNavigate();
  
  // Check authentication status on load
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('role');
    
    if (!auth || role !== 'lister') {
      navigate('/listerlogin');
      return;
    }
    
    setIsAuthenticated(true);
    
    // Prefill some fields from user data
    const fullName = localStorage.getItem('fullName');
    const contact = localStorage.getItem('phone');
    
    if (fullName) {
      setFormData(prev => ({ 
        ...prev, 
        name: fullName,
        contact: contact || ''
      }));
    }
    
    // Fetch existing spaces
    fetchSpaces();
  }, [navigate]);
  
  // Fetch existing spaces for reference
  const fetchSpaces = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parking-spaces');
      setSpaces(response.data);
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
    }
  };
  
  // Try to get user's current location
  useEffect(() => {
    if (navigator.geolocation && isAuthenticated) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default Pune location
        }
      );
    }
  }, [isAuthenticated]);
  
  // Handle map click to place new listing
  const handleMapClick = (coords) => {
    setSelectedPoint(coords);
    setShowListingForm(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPoint) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: 'Please select a location on the map first'
      });
      return;
    }
    
    setSubmitStatus({
      loading: true,
      success: false,
      error: ''
    });
    
    try {
      const token = localStorage.getItem('token');
      const fullName = localStorage.getItem('fullName');
      const email = localStorage.getItem('username');
      const businessName = localStorage.getItem('businessName');
      
      if (!token) {
        throw new Error('You must be logged in to list a parking space');
      }
      
      const listingData = {
        location: formData.location,
        price: formData.price,
        availability: formData.availability,
        description: formData.description || 'No description provided',
        contact: formData.contact,
        listerName: fullName || formData.name,
        listerEmail: email || 'Unknown',
        businessName: businessName || '',
        lat: selectedPoint.lat,
        lng: selectedPoint.lng,
        listerId: localStorage.getItem('userId')
      };
      
      // Submit parking space request
      await axios.post('http://localhost:5000/api/parking-requests', listingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSubmitStatus({
        loading: false,
        success: true,
        error: ''
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          location: '',
          price: '',
          availability: '',
          description: '',
          contact: formData.contact // Keep the contact
        });
        setSelectedPoint(null);
      }, 3000);
      
    } catch (error) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to submit request'
      });
    }
  };
  
  // Custom marker icon for selected point
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

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  const fullName = localStorage.getItem('fullName') || 'Lister';
  const businessName = localStorage.getItem('businessName');

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Lister Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {businessName ? `${businessName} (${fullName})` : fullName}!
          List your available parking spaces for others to find.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {submitStatus.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800 mb-2">Request Submitted Successfully!</h3>
            <p className="text-green-600">Your parking space listing has been submitted for review. An admin will approve it shortly.</p>
            <button 
              onClick={() => {
                setSubmitStatus({ loading: false, success: false, error: '' });
                setShowListingForm(false);
              }}
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
                <h2 className="text-xl font-semibold mb-2 text-blue-700">
                  Select Location
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Click anywhere on the map to place your parking spot location
                </p>
                
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
                      <Marker 
                        key={spot.id}
                        position={[spot.lat, spot.lng]}
                      >
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
                      <Marker 
                        position={[selectedPoint.lat, selectedPoint.lng]}
                        icon={selectedIcon}
                      >
                        <Popup>New parking location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                
                {selectedPoint && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                    Location selected at {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}! Please fill in your details to list this space.
                  </div>
                )}
                
                {!selectedPoint && !showListingForm && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setShowListingForm(true)}
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
            {showListingForm && (
              <div className="w-full md:w-2/5">
                <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-blue-800">Parking Space Details</h2>
                  
                  {submitStatus.error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                      {submitStatus.error}
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="price"
                        className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="e.g. ₹150/hour or ₹5000/month"
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
                        placeholder="e.g. 24/7 or Weekdays 9-5"
                        required
                      />
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
                            onChange={(e) => setSelectedPoint(prev => ({...prev || {}, lat: e.target.value}))}
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
                            onChange={(e) => setSelectedPoint(prev => ({...prev || {}, lng: e.target.value}))}
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
                          submitStatus.loading 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={submitStatus.loading}
                      >
                        {submitStatus.loading ? 'Submitting...' : 'List My Parking Space'}
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        <span className="text-red-500">*</span> Required fields
                      </p>
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