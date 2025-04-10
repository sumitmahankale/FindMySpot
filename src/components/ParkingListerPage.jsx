// ParkingListerPage.jsx - For owners to list their parking spaces
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin } from 'lucide-react';
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
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [newListing, setNewListing] = useState({ 
    name: "", 
    contact: "", 
    location: "",
    price: "",
    availability: "",
    description: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune default
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    
    
    if (fullName) {
      setNewListing(prev => ({ ...prev, name: fullName }));
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
  
  // Handle map click to place new listing
  const handleMapClick = (coords) => {
    setSelectedPoint(coords);
  };

  // Add new listing
  const handleAddListing = async () => {
    if (!selectedPoint || !newListing.name || !newListing.contact || !newListing.location) {
      alert("Please fill in all required fields and select a location on the map");
      return;
    }

    const listing = {
      name: newListing.name,
      contact: newListing.contact,
      location: newListing.location,
      price: newListing.price || "Not specified",
      availability: newListing.availability || "Not specified",
      description: newListing.description || "No description provided",
      lat: selectedPoint.lat,
      lng: selectedPoint.lng,
      listerId: localStorage.getItem('userId') // Add lister ID for tracking ownership
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/parking-spaces', listing, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setSpaces([...spaces, { ...listing, id: Date.now() }]); // Temporary ID until we refresh
      setSelectedPoint(null);
      setNewListing(prev => ({ 
        ...prev,
        location: "",
        price: "",
        availability: "",
        description: ""
        // Keep the name and contact as they are from the user profile
      }));
      
      setSuccessMessage("Your parking space has been successfully listed!");
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error('Error adding parking space:', error);
      alert('Failed to add parking space. Please try again.');
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

  // Custom marker icon for selected point
  const selectedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'selected-marker' // Can be used for custom styling
  });

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Parking Space Lister Portal</h1>
        <p className="text-gray-600">Welcome, {localStorage.getItem('fullName')}! List your available parking spaces for others to find</p>
        
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

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
                Location selected at {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}! Now fill in your details to list this space.
              </div>
            )}
          </div>
        </div>
        
        {/* Form Section */}
        <div className="w-full md:w-2/5">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Parking Space Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="e.g. Pune Secure Parking"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.name}
                  onChange={(e) => setNewListing({...newListing, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.contact}
                  onChange={(e) => setNewListing({...newListing, contact: e.target.value})}
                  placeholder="e.g. 555-1234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.price}
                  onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  placeholder="e.g. ₹150/hour or ₹5000/month"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <input 
                  type="text" 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.availability}
                  onChange={(e) => setNewListing({...newListing, availability: e.target.value})}
                  placeholder="e.g. 24/7 or Weekdays 9-5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  placeholder="Describe your parking space..."
                  rows={3}
                />
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handleAddListing}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                    selectedPoint 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedPoint}
                >
                  List My Parking Space
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingListerPage;