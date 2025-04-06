import React, { useState, useEffect, createContext, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPin, Phone, User, Calendar, DollarSign, Info, X, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
// This addresses a common issue with Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create context for global state management
const ParkingContext = createContext();

// Initial parking spaces data with Pune coordinates
const initialSpaces = [
  { 
    id: 1, 
    name: "Yash Ahirrao", 
    contact: "555-1234", 
    lat: 18.5204, 
    lng: 73.8567, 
    location: "Pune Central Parking",
    price: "150/hour",
    availability: "24/7",
    description: "Secure, well-lit parking space in the heart of Pune."
  },
  { 
    id: 2, 
    name: "Piyush Yadav", 
    contact: "555-5678", 
    lat: 18.5300, 
    lng: 73.8500, 
    location: "Koregaon Park Covered Spot",
    price: "200/hour",
    availability: "Weekdays 9-5",
    description: "Covered parking garage with security cameras and attendant."
  }
];

// Provider component for global state
const ParkingProvider = ({ children }) => {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [lastAdded, setLastAdded] = useState(null);

  const addSpace = (space) => {
    const newSpace = {
      ...space,
      id: Date.now() // Use timestamp as unique ID
    };
    setSpaces(prevSpaces => [...prevSpaces, newSpace]);
    setLastAdded(newSpace);
  };

  // For debugging
  useEffect(() => {
    console.log("Current spaces:", spaces);
  }, [spaces]);

  return (
    <ParkingContext.Provider value={{ spaces, addSpace, lastAdded }}>
      {children}
    </ParkingContext.Provider>
  );
};

// Custom hook to use the parking context
const useParkingContext = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingContext must be used within a ParkingProvider');
  }
  return context;
};

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

// Lister Component
const ParkingSpaceLister = () => {
  const { spaces, addSpace } = useParkingContext();
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
  
  // Handle map click to place new listing
  const handleMapClick = (coords) => {
    setSelectedPoint(coords);
  };

  // Add new listing
  const handleAddListing = () => {
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
      lng: selectedPoint.lng
    };

    addSpace(listing);
    setSelectedPoint(null);
    setNewListing({ 
      name: "", 
      contact: "", 
      location: "",
      price: "",
      availability: "",
      description: ""
    });
    
    setSuccessMessage("Your parking space has been successfully listed!");
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // Try to get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
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
  }, []);

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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Parking Space Lister Portal</h1>
        <p className="text-gray-600">List your available parking spaces for others to find</p>
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

// User Component
const ParkingSpaceUser = () => {
  const { spaces, lastAdded } = useParkingContext();
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [newListingNotification, setNewListingNotification] = useState(false);
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune default
  const [mapRef, setMapRef] = useState(null);
  
  // Show notification when new space is added
  useEffect(() => {
    if (lastAdded) {
      setNewListingNotification(true);
      setTimeout(() => {
        setNewListingNotification(false);
      }, 5000);
    }
  }, [lastAdded]);
  
  // Try to get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
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
  }, []);
  
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
    setShowDetails(true);
    
    // Center map on the selected listing if map reference is available
    if (mapRef) {
      mapRef.flyTo([listing.lat, listing.lng], 15, {
        duration: 1.5
      });
    }
  };
  
  // Custom icons for regular and selected markers
  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  const highlightedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 46], // Slightly larger
    iconAnchor: [15, 46],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'highlighted-marker' // Can be used for custom styling
  });
  
  const closeDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Find Available Parking</h1>
        <p className="text-gray-600">Discover parking spaces in Pune</p>
      </div>

      {newListingNotification && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg animate-pulse">
          New parking space added: {lastAdded?.location}
        </div>
      )}

      <div className="relative">
        {/* Map Display */}
        <div className="mb-6 relative">
          <div className="h-96 rounded-lg overflow-hidden shadow-md border-2 border-blue-200">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              whenCreated={setMapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Parking spot markers */}
              {spaces.map(spot => (
                <Marker 
                  key={spot.id}
                  position={[spot.lat, spot.lng]}
                  icon={selectedListing && selectedListing.id === spot.id ? highlightedIcon : defaultIcon}
                  eventHandlers={{
                    click: () => {
                      handleMarkerClick(spot);
                    }
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">{spot.location}</div>
                      <div>{spot.price}</div>
                      <div>{spot.availability}</div>
                      <button 
                        className="text-blue-600 text-xs mt-1 hover:text-blue-800"
                        onClick={() => handleMarkerClick(spot)}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Click on any marker to view parking space details
          </p>
        </div>
        
        {/* Available Spaces List */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Available Parking Spaces ({spaces.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map(space => (
              <div 
                key={space.id} 
                className={`bg-white p-4 rounded-lg shadow transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  selectedListing && selectedListing.id === space.id ? 'ring-2 ring-blue-500' : ''
                } ${lastAdded && lastAdded.id === space.id ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => handleMarkerClick(space)}
              >
                <h3 className="font-semibold text-lg text-blue-700">{space.location}</h3>
                {lastAdded && lastAdded.id === space.id && (
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block mb-2">
                    New
                  </div>
                )}
                
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span>{space.price}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1 text-orange-500" />
                    <span>{space.availability}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                    <span>
                      {space.lat.toFixed(4)}, {space.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <button 
                  className="mt-3 text-blue-600 text-sm flex items-center hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkerClick(space);
                  }}
                >
                  <Info className="w-4 h-4 mr-1" />
                  View Details
                </button>
              </div>
            ))}
          </div>
          
          {spaces.length === 0 && (
            <p className="text-gray-500 text-center py-4">No parking spaces available yet.</p>
          )}
        </div>
      </div>
      
      {/* Detail Modal - Fixed z-index issue */}
      {showDetails && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4 shadow-2xl transform transition-all duration-300 ease-in-out scale-100" style={{ position: 'relative' }}>
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-blue-800">{selectedListing.location}</h2>
              <button 
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-800 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {lastAdded && lastAdded.id === selectedListing.id && (
              <div className="mt-2 mb-3 text-sm bg-green-100 text-green-700 px-3 py-1 rounded inline-block">
                New Listing
              </div>
            )}
            
            <div className="mt-4 space-y-4">
              <div className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <User className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="font-medium">{selectedListing.name}</div>
                </div>
              </div>
              
              <div className="flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors duration-200">
                <Phone className="w-5 h-5 mr-3 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="font-medium">{selectedListing.contact}</div>
                </div>
              </div>
              
              <div className="flex items-center p-2 hover:bg-green-50 rounded-lg transition-colors duration-200">
            <div className="w-5 h-5 mr-3 text-green-600 text-lg font-semibold">₹</div>
            <div>
              <div className="text-sm text-gray-500">Price</div>
              <div className="font-medium">{selectedListing.price}</div>
            </div>
          </div>

              
              <div className="flex items-center p-2 hover:bg-orange-50 rounded-lg transition-colors duration-200">
                <Calendar className="w-5 h-5 mr-3 text-orange-500" />
                <div>
                  <div className="text-sm text-gray-500">Availability</div>
                  <div className="font-medium">{selectedListing.availability}</div>
                </div>
              </div>
              
              <div className="flex items-center p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Coordinates</div>
                  <div className="font-medium">
                    {selectedListing.lat.toFixed(6)}, {selectedListing.lng.toFixed(6)}
                  </div>
                </div>
              </div>
              
              {selectedListing.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Description</div>
                  <p className="text-gray-800">{selectedListing.description}</p>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.lat},${selectedListing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center flex items-center justify-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Get Directions
                </a>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App with Tab Switching
const ParkingApp = () => {
  const [activeTab, setActiveTab] = useState('user');
  
  return (
    <ParkingProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg mb-8">
          <div className="flex border-b">
            <button 
              className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'user' 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('user')}
            >
              Find Parking
            </button>
            <button 
              className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'lister' 
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('lister')}
            >
              List Your Space
            </button>
          </div>
        </div>
        
        {activeTab === 'user' ? <ParkingSpaceUser /> : <ParkingSpaceLister />}
      </div>
    </ParkingProvider>
  );
};

export default ParkingApp;