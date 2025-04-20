// ParkingFinderPage.jsx - For users to find parking
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, User, Calendar, Info, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AutocompleteSearch from './AutoCompleteSearch'; // Import the AutocompleteSearch component

// Fix for Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ParkingFinderPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [newListingNotification, setNewListingNotification] = useState(false);
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); // Pune default
  const [lastAdded, setLastAdded] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  
  // Fetch parking spaces from the backend
  const fetchParkingSpaces = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parking-spaces');
      setSpaces(response.data);
      
      // Check for new listings since last fetch
      if (spaces.length > 0 && response.data.length > spaces.length) {
        const newSpace = response.data[response.data.length - 1];
        setLastAdded(newSpace);
        setNewListingNotification(true);
        setTimeout(() => {
          setNewListingNotification(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
    }
  };
  
  // Initial fetch and setup polling for updates
  useEffect(() => {
    fetchParkingSpaces();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchParkingSpaces, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
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
    if (mapRef.current) {
      mapRef.current.flyTo([listing.lat, listing.lng], 15, {
        duration: 1.5
      });
    }
  };

  // Handle location selection from AutocompleteSearch
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    
    if (location && location.lat && location.lng) {
      // Update map center to the selected location
      setMapCenter([location.lat, location.lng]);
      
      // If map reference is available, fly to the location
      if (mapRef.current) {
        mapRef.current.flyTo([location.lat, location.lng], 15, {
          duration: 1.5
        });
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!selectedLocation) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use coordinates from selected location for search with a fixed radius
      const response = await axios.get(`http://localhost:5000/api/search-parking`, {
        params: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          radius: 5 // Fixed radius of 5km
        }
      });
      
      setSearchResults(response.data);
      
      // If results found, update the displayed spaces
      if (response.data.length > 0) {
        // Center map on first result
        if (mapRef.current) {
          mapRef.current.flyTo([response.data[0].lat, response.data[0].lng], 14, {
            duration: 1.5
          });
        }
      }
    } catch (error) {
      console.error('Error searching parking spaces:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically search when location changes
  useEffect(() => {
    if (selectedLocation) {
      handleSearch();
    }
  }, [selectedLocation]);
  
  // Reset search
  const resetSearch = () => {
    setSelectedLocation(null);
    setSearchResults(null);
    fetchParkingSpaces();
  };

  // Handle booking button click
  const handleBooking = (parkingSpace) => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: '/booking', parkingSpace: JSON.stringify(parkingSpace) } });
    } else {
      // User is logged in, redirect to booking page with parking space info
      navigate('/booking', { state: { parkingSpace } });
    }
    
    // Close the details modal
    setShowDetails(false);
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

  // Determine which spaces to display
  const displayedSpaces = searchResults || spaces;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Find Available Parking</h1>
        <p className="text-gray-600">Discover parking spaces in Pune</p>
      </div>

      {/* Search Form with Autocomplete - Z-index fixed */}
      <div className="mb-6 relative" style={{ zIndex: 1000 }}>
        <AutocompleteSearch onLocationSelect={handleLocationSelect} />
        
        {searchResults && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={resetSearch}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      {newListingNotification && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg animate-pulse">
          New parking space added: {lastAdded?.location}
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
          <span>Searching for parking spaces...</span>
        </div>
      )}

      {searchResults && !isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
          Found {searchResults.length} parking spaces near "{selectedLocation?.location}"
        </div>
      )}

      <div className="relative">
        {/* Map Display - Z-index fixed */}
        <div className="mb-6 relative" style={{ zIndex: 1 }}>
          <div className="h-96 rounded-lg overflow-hidden shadow-md border-2 border-blue-200">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Current search location marker */}
              {selectedLocation && (
                <Marker 
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={new L.Icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                    className: 'search-location-marker' // For custom styling
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold">Search Location</div>
                      <div>{selectedLocation.location}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Parking spot markers */}
              {displayedSpaces.map(spot => (
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
            Available Parking Spaces {isLoading ? 
              <span className="text-sm font-normal text-blue-600">(Loading...)</span> : 
              `(${displayedSpaces.length})`
            }
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSpaces.map(space => (
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
                        <div className="w-4 h-4 mr-1 flex items-center justify-center text-green-600">
                          <span className="text-green-600 font-semibold">₹</span>
                        </div>
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
              
              {displayedSpaces.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {searchResults ? 'No results found. Try a different location.' : 'No parking spaces available yet.'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Detail Modal - Fixed z-index issue */}
      {showDetails && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center" style={{ zIndex: 9999 }}>
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
                <div className="w-5 h-5 mr-3 flex items-center justify-center text-green-600">
                  <span className="text-green-600 text-lg font-semibold">₹</span>
                </div>
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
              
              <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.lat},${selectedListing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center flex items-center justify-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Directions
                </a>
                <button 
  className="text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
  style={{ 
    backgroundColor: 'rgb(255, 98, 0)', 
    ":hover": { backgroundColor: 'rgb(204, 78, 0)' } 
  }}
  onClick={() => handleBooking(selectedListing)}
>
  <Calendar className="w-4 h-4 mr-1" />
  Book
</button>
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

export default ParkingFinderPage;