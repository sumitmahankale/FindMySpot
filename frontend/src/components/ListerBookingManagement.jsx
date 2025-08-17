import React, { useState, useEffect } from 'react';
import { Clock, Calendar, User, MapPin, Car, DollarSign, CheckCircle, XCircle, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { IndianRupee } from "lucide-react"

const ListerBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/lister/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load bookings. Please try again later.',
        icon: 'error',
        confirmButtonColor: 'var(--medium-blue)'
      });
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
      
      Swal.fire({
        title: 'Success',
        text: `Booking ${newStatus} successfully`,
        icon: 'success',
        confirmButtonColor: 'var(--medium-blue)'
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update booking status. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--medium-blue)'
      });
    }
  };

  // New function to update payment status
  const updatePaymentStatus = async (bookingId, newPaymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/payment-status`,
        { paymentStatus: newPaymentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, paymentStatus: newPaymentStatus } : booking
      ));
      
      Swal.fire({
        title: 'Success',
        text: `Payment status updated to ${newPaymentStatus}`,
        icon: 'success',
        confirmButtonColor: 'var(--medium-blue)'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to update payment status. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--medium-blue)'
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const toggleExpand = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filterStatus !== 'all' && booking.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term (location, user name, or vehicle info)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesLocation = booking.ParkingSpace?.location?.toLowerCase().includes(searchLower);
      const matchesUser = booking.User?.fullName?.toLowerCase().includes(searchLower);
      const matchesVehicle = booking.vehicleInfo?.toLowerCase().includes(searchLower);
      if (!matchesLocation && !matchesUser && !matchesVehicle) {
        return false;
      }
    }
    
    return true;
  });

  // Sorting logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.bookingDate) - new Date(b.bookingDate);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'amount':
        comparison = parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
        break;
      case 'customer':
        comparison = a.User?.fullName.localeCompare(b.User?.fullName);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4 md:mb-0">Booking Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 border border-gray-300 rounded-lg w-full sm:w-60"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg sm:w-40"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {/* Refresh button */}
          <button
            onClick={fetchBookings}
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">No bookings found</h3>
          <p className="text-gray-500 mt-1">
            {filterStatus !== 'all' || searchTerm ? 
              'Try changing your filters or search term' : 
              'When customers book your parking spaces, they will appear here'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortBy === 'customer' && (
                      sortOrder === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBookings.map(booking => (
                <React.Fragment key={booking.id}>
                  <tr className={`hover:bg-gray-50 ${expandedBooking === booking.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.bookingDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-900">
                          {booking.ParkingSpace?.location || 'Not available'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.User?.fullName || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.User?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium">
                          ₹{parseFloat(booking.totalAmount).toFixed(2)}
                        </span>
                      </div>
                      <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => toggleExpand(booking.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedBooking === booking.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded details row */}
                  {expandedBooking === booking.id && (
                    <tr className="bg-blue-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <Car className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Vehicle Info</div>
                                  <div className="text-sm text-gray-600">
                                    {booking.vehicleInfo || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start">
                                <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Notes</div>
                                  <div className="text-sm text-gray-600">
                                    {booking.notes || 'No notes provided'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start">
                                <Clock className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Booking Created</div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(booking.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Payment Status Section */}
                              <div className="flex items-start">
                                <DollarSign className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Payment Status</div>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <button
                                      onClick={() => updatePaymentStatus(booking.id, 'pending')}
                                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                        booking.paymentStatus === 'pending'
                                          ? 'bg-yellow-200 text-yellow-800 border-yellow-400'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                      }`}
                                    >
                                      Pending
                                    </button>
                                    <button
                                      onClick={() => updatePaymentStatus(booking.id, 'paid')}
                                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                        booking.paymentStatus === 'paid'
                                          ? 'bg-green-200 text-green-800 border-green-400'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                      }`}
                                    >
                                      Paid
                                    </button>
                                    <button
                                      onClick={() => updatePaymentStatus(booking.id, 'refunded')}
                                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                        booking.paymentStatus === 'refunded'
                                          ? 'bg-purple-200 text-purple-800 border-purple-400'
                                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                      }`}
                                    >
                                      Refunded
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Actions</h4>
                            <div className="space-y-2">
                              {booking.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirm Booking
                                  </button>
                                  
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                    className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject Booking
                                  </button>
                                </div>
                              )}
                              
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark as Completed
                                </button>
                              )}
                              
                              {/* Contact customer button - would need to be implemented */}
                              <button
                                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm"
                              >
                                <User className="h-4 w-4 mr-1" />
                                Contact Customer
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListerBookingManagement;