import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, User, Phone, Download, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed', 'completed', 'cancelled'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const modalRef = useRef(null);

  // Fetch user bookings
  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
   
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setRefreshing(true);
      const response = await axios.get('http://localhost:5000/api/user/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBookings(response.data);
      setLoading(false);
      
      // Show success message when refreshing (not on initial load)
      if (refreshing) {
        Swal.fire({
          title: 'Updated!',
          text: 'Booking information refreshed',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.error || 'Failed to fetch bookings');
      setLoading(false);
      
      if (refreshing) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to refresh booking information',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchBookings();
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Add click outside handler for modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

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
          
          // Refresh bookings instead of just updating state
          fetchBookings();
          
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
    setTimeout(() => {
      setSelectedBooking(null);
    }, 300); // Wait for animation to finish
  };

  // Generate ticket data for QR code
  const generateTicketData = (booking) => {
    return JSON.stringify({
      id: booking.id,
      status: booking.status,
      date: formatDate(booking.bookingDate),
      time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
      location: booking.ParkingSpace?.location || 'N/A',
      amount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      vehicle: booking.vehicleInfo || 'N/A',
      owner: booking.Lister ? booking.Lister.fullName : 'N/A',
      contact: booking.Lister?.phone || 'N/A',
      notes: booking.notes || ''
    });
  };

  // Download ticket function with QR code
  const downloadTicket = async (booking) => {
    setGeneratingTicket(true);
    
    try {
      // Generate QR code for ticket data
      const ticketData = generateTicketData(booking);
      const qrCodeDataURL = await QRCode.toDataURL(ticketData, { 
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      
      // Create the ticket content with embedded QR code
      const ticketHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Parking Ticket #${booking.id}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 0 auto;
      padding: 20px;
    }
    .ticket {
      border: 2px solid #000;
      padding: 15px;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .ticket-info {
      display: flex;
      flex-wrap: wrap;
    }
    .info-item {
      width: 50%;
      margin-bottom: 10px;
    }
    .label {
      font-weight: bold;
      font-size: 12px;
      color: #555;
    }
    .value {
      font-size: 16px;
    }
    .qr-section {
      text-align: center;
      margin-top: 20px;
      border-top: 1px solid #ccc;
      padding-top: 15px;
    }
    .qr-note {
      font-size: 12px;
      color: #555;
      margin-top: 8px;
    }
    .status-${booking.status} {
      color: ${
        booking.status === 'pending' ? '#f59e0b' : 
        booking.status === 'confirmed' ? '#3b82f6' : 
        booking.status === 'completed' ? '#10b981' : 
        booking.status === 'cancelled' ? '#ef4444' : '#000'
      };
      font-weight: bold;
    }
    .payment-${booking.paymentStatus} {
      color: ${
        booking.paymentStatus === 'paid' ? '#10b981' : 
        booking.paymentStatus === 'refunded' ? '#8b5cf6' : '#f59e0b'
      };
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <h1>PARKING TICKET</h1>
      <p>Booking ID: ${booking.id}</p>
      <p>Status: <span class="status-${booking.status}">${booking.status.toUpperCase()}</span></p>
    </div>
    
    <div class="ticket-info">
      <div class="info-item">
        <div class="label">DATE</div>
        <div class="value">${formatDate(booking.bookingDate)}</div>
      </div>
      
      <div class="info-item">
        <div class="label">TIME</div>
        <div class="value">${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</div>
      </div>
      
      <div class="info-item">
        <div class="label">LOCATION</div>
        <div class="value">${booking.ParkingSpace?.location || 'N/A'}</div>
      </div>
      
      <div class="info-item">
        <div class="label">AMOUNT PAID</div>
        <div class="value">₹${booking.totalAmount} <span class="payment-${booking.paymentStatus}">(${booking.paymentStatus.toUpperCase()})</span></div>
      </div>
      
      <div class="info-item">
        <div class="label">VEHICLE</div>
        <div class="value">${booking.vehicleInfo || 'N/A'}</div>
      </div>
      
      ${booking.Lister ? `
      <div class="info-item">
        <div class="label">OWNER</div>
        <div class="value">${booking.Lister.fullName}</div>
      </div>
      
      <div class="info-item">
        <div class="label">CONTACT</div>
        <div class="value">${booking.Lister.phone || 'N/A'}</div>
      </div>
      ` : '<div class="info-item">OWNER INFORMATION NOT AVAILABLE</div>'}
      
      ${booking.notes ? `
      <div class="info-item" style="width: 100%">
        <div class="label">NOTES</div>
        <div class="value">${booking.notes}</div>
      </div>
      ` : ''}
    </div>
    
    <div class="qr-section">
      <img src="${qrCodeDataURL}" alt="QR Code" />
      <div class="qr-note">Scan this QR code to view ticket information</div>
    </div>
  </div>
</body>
</html>
      `;
      
      // Convert HTML to Blob
      const blob = new Blob([ticketHtml], { type: 'text/html' });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `parking-ticket-${booking.id}.html`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Ticket with QR code downloaded successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error downloading ticket:', err);
      Swal.fire(
        'Error',
        'Failed to download ticket',
        'error'
      );
    } finally {
      setGeneratingTicket(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
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
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Invalid time';
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
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">My Bookings</h1>
          <p className="text-gray-600">Manage your parking reservations</p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className={`flex items-center px-4 py-2 rounded-lg ${
            refreshing ? 'bg-blue-200' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && !refreshing ? (
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

          {/* Bookings List with Loading Overlay for Refresh */}
          <div className="relative">
            {refreshing && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10 rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            )}
            
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
                            
                            <button 
                              onClick={() => downloadTicket(booking)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                              disabled={generatingTicket}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Ticket
                            </button>
                            
                            {booking.status === 'pending' || booking.status === 'confirmed' ? (
                              <button 
                                onClick={() => handleCancelBooking(booking.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                disabled={loading || refreshing}
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
          </div>
        </>
      )}

      {/* Booking Details Modal - Reduced size */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg w-full max-w-md max-h-[70vh] overflow-y-auto animate-scaleIn"
          >
            <div className="sticky top-0 bg-white p-3 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-800">Booking Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            {selectedBooking && (
              <div className="p-3">
                {/* Status - Made more compact */}
                <div className="mb-4">
                  {selectedBooking.status === 'pending' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
                        <p className="font-medium text-yellow-800 text-sm">Waiting for confirmation</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedBooking.status === 'confirmed' && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-400 mr-2" />
                        <p className="font-medium text-blue-800 text-sm">Space confirmed</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedBooking.status === 'completed' && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-2 mb-3">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <p className="font-medium text-green-800 text-sm">Booking completed</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedBooking.status === 'cancelled' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-2 mb-3">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-400 mr-2" />
                        <p className="font-medium text-red-800 text-sm">Booking cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Booking Information - More compact layout */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-bold text-blue-800 mb-2">Booking Info</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Booking ID</p>
                        <p className="font-medium">{selectedBooking.id}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(selectedBooking.bookingDate)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Payment</p>
                        <div className="flex items-center">
                          <p className="font-medium mr-1">₹{selectedBooking.totalAmount}</p>
                          <span className={`px-1 py-0.5 rounded text-xs ${getPaymentBadge(selectedBooking.paymentStatus).bg} ${getPaymentBadge(selectedBooking.paymentStatus).text}`}>
                            {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedBooking.vehicleInfo && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Vehicle</p>
                          <p className="font-medium">{selectedBooking.vehicleInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Parking Space Information */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-bold text-blue-800 mb-2">Parking Details</h3>
                    
                    {selectedBooking.ParkingSpace ? (
                      <div className="text-sm">
                        <div className="mb-1">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium">{selectedBooking.ParkingSpace.location}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.ParkingSpace.lat && selectedBooking.ParkingSpace.lng && (
                            <div>
                              <p className="text-xs text-gray-500">Coordinates</p>
                              <p className="font-medium">
                                {selectedBooking.ParkingSpace.lat.toFixed(4)}, {selectedBooking.ParkingSpace.lng.toFixed(4)}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-xs text-gray-500">Price/hour</p>
                            <p className="font-medium">₹{selectedBooking.ParkingSpace.price}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Details not available</p>
                    )}
                  </div>
                  
                  {/* Owner Information - More compact */}
                  {selectedBooking.Lister && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-sm font-bold text-blue-800 mb-2">Owner Info</h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1 text-gray-400" />
                            <p className="font-medium">{selectedBooking.Lister.fullName}</p>
                          </div>
                        </div>
                        
                        {selectedBooking.Lister.phone && (
                          <div>
                            <p className="text-xs text-gray-500">Contact</p>
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <p className="font-medium">{selectedBooking.Lister.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedBooking.Lister.businessName && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Business</p>
                            <p className="font-medium">{selectedBooking.Lister.businessName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes (if any) - More compact */}
                  {selectedBooking.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-sm font-bold text-blue-800 mb-1">Notes</h3>
                      <p className="text-gray-700 text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Actions - Made more compact */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => downloadTicket(selectedBooking)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                    disabled={generatingTicket}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {generatingTicket ? 'Generating...' : 'Ticket'}
                  </button>
                  
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <button 
                      onClick={() => {
                        closeModal();
                        handleCancelBooking(selectedBooking.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserBookingsPage;