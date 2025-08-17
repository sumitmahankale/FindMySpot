// BookingManagement.jsx - Extend the dashboard with booking management functionality
import React, { useState, useEffect } from 'react';
import { CalendarRange, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';


const BOOKING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

const BookingManagement = ({ parkingSpaceId }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    userName: '',
    userContact: '',
    startTime: '',
    endTime: '',
    status: BOOKING_STATUS.PENDING
  });

  // Fetch bookings for the selected parking space
  useEffect(() => {
    if (!parkingSpaceId) return;
    
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would use a real endpoint
        // For now, let's use mock data
        // const response = await axios.get(`http://localhost:5000/api/parking-spaces/${parkingSpaceId}/bookings`);
        // setBookings(response.data);
        
        // Mock data
        const mockBookings = [
          {
            id: 1,
            userName: 'John Smith',
            userContact: '555-1234',
            startTime: '2025-04-10T10:00:00',
            endTime: '2025-04-10T14:00:00',
            status: BOOKING_STATUS.PENDING,
            createdAt: '2025-04-08T08:30:00'
          },
          {
            id: 2,
            userName: 'Jane Doe',
            userContact: '555-5678',
            startTime: '2025-04-12T09:00:00',
            endTime: '2025-04-12T12:00:00',
            status: BOOKING_STATUS.APPROVED,
            createdAt: '2025-04-07T14:15:00'
          }
        ];
        setBookings(mockBookings);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [parkingSpaceId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddBooking = async (e) => {
    e.preventDefault();
    
    if (!newBooking.userName || !newBooking.userContact || !newBooking.startTime || !newBooking.endTime) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      // In a real app, you would make a POST request
      // const response = await axios.post('http://localhost:5000/api/bookings', {
      //   parkingSpaceId,
      //   ...newBooking
      // });
      
      // Mock response
      const mockResponse = {
        id: Date.now(),
        parkingSpaceId,
        ...newBooking,
        createdAt: new Date().toISOString()
      };
      
      setBookings(prev => [mockResponse, ...prev]);
      setNewBooking({
        userName: '',
        userContact: '',
        startTime: '',
        endTime: '',
        status: BOOKING_STATUS.PENDING
      });
      setShowAddBookingForm(false);
    } catch (err) {
      console.error('Error adding booking:', err);
      alert('Failed to add booking. Please try again.');
    }
  };
  
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // In a real app, you would make a PUT request
      // await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, {
      //   status: newStatus
      // });
      
      // Update in local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status. Please try again.');
    }
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BOOKING_STATUS.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case BOOKING_STATUS.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case BOOKING_STATUS.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!parkingSpaceId) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a parking space to manage bookings
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          <CalendarRange className="inline mr-2" size={20} />
          Parking Allotment Management
        </h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          onClick={() => setShowAddBookingForm(!showAddBookingForm)}
        >
          {showAddBookingForm ? 'Cancel' : 'Add New Booking'}
        </button>
      </div>
      
      {showAddBookingForm && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 mb-3">New Booking Details</h3>
          <form onSubmit={handleAddBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="userName"
                value={newBooking.userName}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="userContact"
                value={newBooking.userContact}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input 
                type="datetime-local"
                name="startTime"
                value={newBooking.startTime}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input 
                type="datetime-local"
                name="endTime"
                value={newBooking.endTime}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-2">
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center p-4">Loading bookings...</div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center p-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <CalendarRange size={40} className="mx-auto text-gray-400 mb-2" />
          <p>No bookings found for this parking space.</p>
          <p className="text-sm mt-2">Click 'Add New Booking' to create one.</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 border-b">Customer</th>
                  <th className="py-3 px-4 border-b">Booking Time</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">
                      <div className="font-medium">{booking.userName}</div>
                      <div className="text-sm text-gray-600">{booking.userContact}</div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="text-sm">
                        <Clock size={14} className="inline mr-1" /> 
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeClasses(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      {booking.status === BOOKING_STATUS.PENDING && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleStatusChange(booking.id, BOOKING_STATUS.APPROVED)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(booking.id, BOOKING_STATUS.REJECTED)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                      
                      {booking.status === BOOKING_STATUS.APPROVED && (
                        <button 
                          onClick={() => handleStatusChange(booking.id, BOOKING_STATUS.COMPLETED)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Mark as completed"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;