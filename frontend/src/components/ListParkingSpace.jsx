import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api.js';
import { MapPin, Check } from 'lucide-react';
import axios from 'axios';

const ListParkingSpaceForm = () => {
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    availability: '',
    description: '',
    lat: '',
    lng: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });
  
  const [userPosition, setUserPosition] = useState(null);
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Pre-fill the coordinates
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({
      loading: true,
      success: false,
      error: ''
    });
    
    try {
      // Get user info from localStorage
      const token = localStorage.getItem('token');
      const fullName = localStorage.getItem('fullName');
      const email = localStorage.getItem('username');
      const businessName = localStorage.getItem('businessName');
      
      if (!token) {
        throw new Error('You must be logged in to list a parking space');
      }
      
      // Submit parking space request
  await axios.post(getApiUrl('parking-requests'), {
        ...formData,
        listerName: fullName || 'Unknown',
        listerEmail: email || 'Unknown',
        businessName: businessName || '',
        contact: formData.contact || localStorage.getItem('phone') || ''
      }, {
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
          lat: userPosition?.lat || '',
          lng: userPosition?.lng || '',
          contact: ''
        });
      }, 3000);
      
    } catch (error) {
      setSubmitStatus({
        loading: false,
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to submit request'
      });
    }
  };
  
  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-blue-800">List Your Parking Space</h2>
        <p className="text-gray-600">Submit your space for review by admin</p>
      </div>
      
      {submitStatus.success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">Request Submitted Successfully!</h3>
          <p className="text-green-600">Your parking space listing has been submitted for review. An admin will approve it shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitStatus.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
              {submitStatus.error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="location" className="block text-gray-700 mb-1">Location Name*</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="e.g. Central Mall Parking, Koregaon Park"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="price" className="block text-gray-700 mb-1">Price*</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="e.g. ₹50/hour, ₹200/day"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="availability" className="block text-gray-700 mb-1">Availability*</label>
              <input
                type="text"
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="e.g. 24/7, Mon-Fri 9AM-6PM"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="contact" className="block text-gray-700 mb-1">Contact Number*</label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Your contact number for parkers"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="lat" className="block text-gray-700 mb-1">Latitude*</label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.lat}
                onChange={handleChange}
                step="any"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lng" className="block text-gray-700 mb-1">Longitude*</label>
              <input
                type="number"
                id="lng"
                name="lng"
                value={formData.lng}
                onChange={handleChange}
                step="any"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
          </div>
          
          {userPosition && (
            <div className="text-sm text-blue-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Using your current location. Adjust if needed.
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="description" className="block text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Describe your parking space, any special features, etc."
            ></textarea>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              disabled={submitStatus.loading}
            >
              {submitStatus.loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ListParkingSpaceForm;