import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, User, Phone } from 'lucide-react';
import Swal from 'sweetalert2';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
     
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:5000/api/user/bookings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.error || 'Failed to fetch bookings');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  // Filter bookings based on status
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: 'Cancel Booking',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        setLoading(true);
        
        try {
          await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Update bookings in state
          setBookings(prevBookings => 
            prevBookings.map(booking => 
              booking.id === bookingId 
                ? { ...booking, status: 'cancelled', paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'pending' }
                : booking
            )
          );
          
          Swal.fire(
            'Cancelled!',
            'Your booking has been cancelled successfully.',
            'success'
          );
        } catch (err) {
          console.error('Error cancelling booking:', err);
          Swal.fire(
            'Error',
            err.response?.data?.error || 'Failed to cancel booking',
            'error'
          );
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    // Handle if timeString is just a time (like "14:30:00") or a full datetime string
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4 mr-1" /> };
      case 'confirmed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4 mr-1" /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <AlertCircle className="w-4 h-4 mr-1" /> };
    }
  };

  // Get payment status badge style
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'refunded':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      case 'pending':
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white shadow-xl rounded-xl animate-fadeIn">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-800">My Bookings</h1>
        <p className="text-gray-600">Manage your parking reservations</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle className="inline-block w-5 h-5 mr-2 mb-1" />
          {error}
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'confirmed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-gray-600">No bookings found</h3>
              <p className="text-gray-500 mt-1">
                {filter === 'all' 
                  ? "You haven't made any bookings yet" 
                  : `You don't have any ${filter} bookings`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => {
                const statusBadge = getStatusBadge(booking.status);
                const paymentBadge = getPaymentBadge(booking.paymentStatus);
                
                return (
                  <div 
                    key={booking.id} 
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-blue-800">
                            {booking.ParkingSpace?.location || 'Unknown Location'}
                          </h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs flex items-center ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.icon}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="text-sm space-y-1 text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                          {booking.ParkingSpace && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>
                                {booking.ParkingSpace.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-lg font-semibold text-green-700">₹{booking.totalAmount}</div>
                        <div className={`mt-1 px-2 py-1 rounded text-xs ${paymentBadge.bg} ${paymentBadge.text}`}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          <button 
                            onClick={() => handleViewDetails(booking)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Details
                          </button>
                          
                          {booking.status === 'pending' || booking.status === 'confirmed' ? (
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-800">Booking Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Status */}
              <div className="mb-6">
                {selectedBooking.status === 'pending' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <p className="font-medium text-yellow-800">Pending Confirmation</p>
                        <p className="text-sm text-yellow-700">Your booking is waiting for the owner's confirmation.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedBooking.status === 'confirmed' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-2" />
                      <div>
                        <p className="font-medium text-blue-800">Booking Confirmed</p>
                        <p className="text-sm text-blue-700">Your parking space is reserved for the selected date and time.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedBooking.status === 'completed' && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <div>
                        <p className="font-medium text-green-800">Booking Completed</p>
                        <p className="text-sm text-green-700">This booking has been successfully completed.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedBooking.status === 'cancelled' && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                      <XCircle className="h-5 w-5 text-red-400 mr-2" />
                      <div>
                        <p className="font-medium text-red-800">Booking Cancelled</p>
                        <p className="text-sm text-red-700">This booking has been cancelled.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-blue-800">Booking Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium">{selectedBooking.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.bookingDate)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Payment</p>
                      <div className="flex items-center">
                        <p className="font-medium mr-2">₹{selectedBooking.totalAmount}</p>
                        <span className={`px-2 py-1 rounded text-xs ${getPaymentBadge(selectedBooking.paymentStatus).bg} ${getPaymentBadge(selectedBooking.paymentStatus).text}`}>
                          {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {selectedBooking.vehicleInfo && (
                      <div>
                        <p className="text-sm text-gray-500">Vehicle Information</p>
                        <p className="font-medium">{selectedBooking.vehicleInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Parking Space Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-blue-800">Parking Space Details</h3>
                  
                  {selectedBooking.ParkingSpace ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedBooking.ParkingSpace.location}</p>
                      </div>
                      
                      {selectedBooking.ParkingSpace.lat && selectedBooking.ParkingSpace.lng && (
                        <div>
                          <p className="text-sm text-gray-500">Coordinates</p>
                          <p className="font-medium">
                            {selectedBooking.ParkingSpace.lat.toFixed(4)}, {selectedBooking.ParkingSpace.lng.toFixed(4)}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-500">Price per hour</p>
                        <p className="font-medium">₹{selectedBooking.ParkingSpace.price}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Parking space details not available</p>
                  )}
                </div>
              </div>
              
              {/* Owner Information */}
              {selectedBooking.Lister && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3 text-blue-800">Owner Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <p className="font-medium">{selectedBooking.Lister.fullName}</p>
                      </div>
                    </div>
                    
                    {selectedBooking.Lister.businessName && (
                      <div>
                        <p className="text-sm text-gray-500">Business</p>
                        <p className="font-medium">{selectedBooking.Lister.businessName}</p>
                      </div>
                    )}
                    
                    {selectedBooking.Lister.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-medium">{selectedBooking.Lister.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes (if any) */}
              {selectedBooking.notes && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 text-blue-800">Notes</h3>
                  <p className="text-gray-700">{selectedBooking.notes}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                  <button 
                    onClick={() => {
                      closeModal();
                      handleCancelBooking(selectedBooking.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UserBookingsPage;