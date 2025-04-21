import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, User, CreditCard, Car, Edit, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const parkingSpace = location.state?.parkingSpace;
  const [bookingDate, setBookingDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflictCount, setConflictCount] = useState(0);
  const [listerInfo, setListerInfo] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: '/booking', parkingSpace: JSON.stringify(parkingSpace) } });
      return;
    }

    // Check if parking space info is available
    if (!parkingSpace) {
      navigate('/userdashboard');
      return;
    }

    // Fetch lister information
    const fetchListerInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/listers/${parkingSpace.listerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setListerInfo(response.data);
      } catch (error) {
        console.error('Error fetching lister information:', error);
      }
    };

    fetchListerInfo();
    calculateTotalAmount();
  }, [parkingSpace, navigate]);

  // Calculate booking duration in hours
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    // Calculate difference in minutes and handle negative values (next day booking)
    let diffMinutes = endTotalMinutes - startTotalMinutes;
    if (diffMinutes <= 0) {
      // Assuming the booking extends to the next day
      diffMinutes += 24 * 60;
    }
    
    // Convert back to hours (as a decimal)
    return diffMinutes / 60;
  };

  // Calculate total amount based on duration and price per hour
  const calculateTotalAmount = () => {
    if (!parkingSpace) return;
    
    const duration = calculateDuration();
    
    // Extract numeric price from parkingSpace.price (assuming format like "₹50/hour")
    const priceMatch = parkingSpace.price.match(/(\d+)/);
    const pricePerHour = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    const amount = pricePerHour * duration;
    setTotalAmount(amount);
  };

  // Handle time changes
  useEffect(() => {
    calculateTotalAmount();
    checkAvailability();
  }, [startTime, endTime, bookingDate]);

  // Format date for API requests
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if the selected time slot is available
  const checkAvailability = async () => {
    if (!parkingSpace) return;
    
    try {
      // Format date properly for the API request
      const formattedDate = formatDate(bookingDate);
      
      const response = await axios.get(`http://localhost:5000/api/parking-spaces/${parkingSpace.id}/availability`, {
        params: {
          date: formattedDate,
          startTime,
          endTime
        }
      });
      
      setIsAvailable(response.data.available);
      setConflictCount(response.data.conflictCount || 0);
    } catch (error) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!bookingDate) {
      errors.bookingDate = 'Booking date is required';
    }
    
    if (!startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!endTime) {
      errors.endTime = 'End time is required';
    }
    
    const duration = calculateDuration();
    if (duration <= 0 || startTime === endTime) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (!vehicleInfo.trim()) {
      errors.vehicleInfo = 'Vehicle information is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - redirect to payment page instead of directly creating a booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!isAvailable) {
      Swal.fire({
        title: 'Time Slot Not Available',
        text: 'Please select a different time slot',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--medium-blue)'
      });
      return;
    }
    
    setIsLoading(true);
    
    // Create a booking data object to pass to payment page
    const bookingData = {
      parkingSpaceId: parkingSpace.id,
      bookingDate: formatDate(bookingDate),
      startTime,
      endTime,
      totalAmount,
      vehicleInfo,
      notes,
      parkingDetails: {
        location: parkingSpace.location,
        price: parkingSpace.price,
      },
      duration: calculateDuration().toFixed(1)
    };
    
    // Store booking data in localStorage to be used on payment page
    localStorage.setItem('pendingBookingData', JSON.stringify(bookingData));
    
    setIsLoading(false);
    
    // Redirect to payment page
    navigate('/payment', { 
      state: { 
        bookingData,
        parkingSpace
      } 
    });
  };

  if (!parkingSpace) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  return (
    // Centering container
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-white shadow-xl rounded-xl">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Book Parking Space</h1>
          <p className="text-gray-600">Complete the form below to reserve your spot</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Parking Space Info - 2 Columns */}
          <div className="md:col-span-2 bg-blue-50 p-5 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-800">Parking Details</h2>
              <button 
                onClick={() => navigate('/userdashboard')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Location
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{parkingSpace.location}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <Clock className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Availability</div>
                  <div className="font-medium">{parkingSpace.availability}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                <CreditCard className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Price</div>
                  <div className="font-medium">{parkingSpace.price}</div>
                </div>
              </div>

              {listerInfo && (
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Lister</div>
                    <div className="font-medium">
                      {listerInfo.businessName || listerInfo.fullName}
                    </div>
                  </div>
                </div>
              )}

              {/* Calculations */}
              <div className="mt-6 p-3 bg-blue-100 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-800">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div className="text-gray-600">Duration:</div>
                  <div className="text-right font-medium">
                    {calculateDuration().toFixed(1)} hours
                  </div>
                  <div className="text-gray-600">Rate:</div>
                  <div className="text-right font-medium">{parkingSpace.price}</div>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <div className="font-medium text-gray-700">Total Amount:</div>
                  <div className="text-xl font-bold text-blue-800">₹{totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form - 3 Columns */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    Booking Date
                  </label>
                  <DatePicker
                    selected={bookingDate}
                    onChange={(date) => setBookingDate(date)}
                    minDate={new Date()}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.bookingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    dateFormat="yyyy-MM-dd"
                  />
                  {formErrors.bookingDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.bookingDate}</p>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2">
                    <Car className="w-4 h-4 inline-block mr-1" />
                    Vehicle Information
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    placeholder="E.g., Honda Civic - MH12AB1234"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.vehicleInfo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.vehicleInfo && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.vehicleInfo}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.startTime}</p>
                  )}
                </div>

                {/* End Time */}
                <div className="form-group">
                  <label className="block text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="block text-gray-700 mb-2">
                  <Edit className="w-4 h-4 inline-block mr-1" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or information for the parking owner"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-20"
                  rows={3}
                ></textarea>
              </div>

              {/* Availability Status */}
              {!isAvailable && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                  <div className="flex-shrink-0 mr-2">⚠️</div>
                  <div>
                    <p className="font-medium">This time slot is not available</p>
                    <p className="text-sm">
                      There {conflictCount === 1 ? 'is' : 'are'} {conflictCount} existing booking{conflictCount !== 1 ? 's' : ''} during this time period.
                      Please select a different time.
                    </p>
                  </div>
                </div>
              )}

              {isAvailable && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <p className="font-medium">This time slot is available for booking</p>
                </div>
              )}

              {/* Submit Button - Changed to proceed to payment */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/userdashboard')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isAvailable}
                  className={`px-6 py-3 ${
                    isAvailable
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400'
                  } text-white rounded-lg font-medium flex items-center transition-colors duration-200`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>Proceed to Payment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;