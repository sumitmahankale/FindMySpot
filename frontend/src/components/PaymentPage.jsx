import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api.js';
import { useLocation, useNavigate } from 'react-router-dom';

import { 
  CheckCircle, 
  X, 
  ArrowLeft,
  Wallet,
  CreditCard
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Custom card brand SVG components for more realistic icons
const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="w-8 h-6">
    <rect width="48" height="32" rx="4" fill="#2566AF" />
    <path d="M18.5 21.9H15.5L17.4 10.1H20.4L18.5 21.9Z" fill="white" />
    <path d="M28.5 10.4C27.8 10.2 26.8 10 25.6 10C22.7 10 20.6 11.5 20.6 13.6C20.6 15.2 22.1 16 23.2 16.5C24.3 17 24.7 17.3 24.7 17.8C24.7 18.5 23.8 18.8 23 18.8C21.9 18.8 21.3 18.6 20.3 18.2L19.9 18L19.5 20.6C20.3 20.9 21.6 21.2 23 21.2C26.1 21.2 28.2 19.7 28.2 17.5C28.2 16.2 27.3 15.2 25.6 14.5C24.6 14 24 13.7 24 13.2C24 12.8 24.5 12.3 25.6 12.3C26.5 12.3 27.2 12.5 27.7 12.7L28 12.8L28.5 10.4Z" fill="white" />
    <path d="M32.5 16.8L33.6 14C33.6 14 33.9 13.1 34.1 12.6H34.2C34.3 13.1 34.7 16.4 34.7 16.4L35.5 21.9H32.3L29.5 10.1H32.7L35.3 16.8H32.5Z" fill="white" />
    <path d="M13.3 10.1L10.4 18.1L10.1 16.8C9.5 15 8 13 6.3 12L9 21.9H12.2L17 10.1H13.3Z" fill="white" />
    <path d="M8.4 10.1H3.6L3.5 10.4C7.3 11.3 9.7 13.8 10.5 16.8L9.5 11.2C9.3 10.4 8.9 10.1 8.4 10.1Z" fill="#F9A533" />
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="w-8 h-6">
    <rect width="48" height="32" rx="4" fill="#F7F7F7" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="29" cy="16" r="8" fill="#F79E1B" />
    <path fillRule="evenodd" clipRule="evenodd" d="M24 21.9C26.1 20.3 27.5 17.6 27.5 14.6C27.5 11.6 26.1 8.9 24 7.3C21.9 8.9 20.5 11.6 20.5 14.6C20.5 17.6 21.9 20.3 24 21.9Z" fill="#FF5F00" />
  </svg>
);

const AmexIcon = () => (
  <svg viewBox="0 0 48 32" className="w-8 h-6">
    <rect width="48" height="32" rx="4" fill="#2E77BC" />
    <path d="M9 16.8L7 12H3V20H6V15.1L8 20H10L12 15.1V20H15V12H11L9 16.8Z" fill="white" />
    <path d="M16 12V20H23V18H19V17H23V15H19V14H23V12H16Z" fill="white" />
    <path d="M37 12L35 14L33 12H26V20H33L35 18L37 20H40L37 16L40 12H37Z" fill="white" />
    <path d="M26 14H32L34 16L32 18H26" fill="#2E77BC" />
    <path d="M27 15H31L32 16L31 17H27V15Z" fill="white" />
  </svg>
);

const RazorpayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <rect width="24" height="24" rx="4" fill="#072654" />
    <path d="M6 7H18L13 17H7L12 7H6Z" fill="#3395FF" />
  </svg>
);

const UpiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <rect width="24" height="24" rx="4" fill="#FFFFFF" />
    <path d="M12.3 5L5.5 18.2H9.7L16.5 5H12.3Z" fill="#097939" />
    <path d="M15.5 10.4L12.5 18.2H16.7L19.7 10.4H15.5Z" fill="#ED752E" />
  </svg>
);

const PaymentPage = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('card');

  // Get booking data from location state or localStorage
  const bookingData = location.state?.bookingData || JSON.parse(localStorage.getItem('pendingBookingData'));

  // Form state for payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Card type detection state
  const [cardType, setCardType] = useState(null);
  
  // Razorpay modal state
  const [showRazorpay, setShowRazorpay] = useState(false);

  useEffect(() => {
    // Check if booking data exists
    if (!bookingData) {
      navigate('/userdashboard');
    }

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [bookingData, navigate]);

  // Detect card type based on number
  useEffect(() => {
    if (!cardNumber) {
      setCardType(null);
      return;
    }

    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    // Visa cards start with 4
    if (/^4/.test(cleanNumber)) {
      setCardType('visa');
    }
    // Mastercard starts with 51-55 or 2221-2720
    else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01])/.test(cleanNumber)) {
      setCardType('mastercard');
    }
    // Amex starts with 34 or 37
    else if (/^3[47]/.test(cleanNumber)) {
      setCardType('amex');
    }
    else {
      setCardType(null);
    }
  }, [cardNumber]);

  const validateCardForm = () => {
    const errors = {};
    
    if (!cardNumber.trim() || cardNumber.trim().length < 16) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!cardName.trim()) {
      errors.cardName = 'Please enter the name on card';
    }
    
    if (!expiryDate.trim() || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      errors.expiryDate = 'Please enter expiry date (MM/YY)';
    }
    
    if (!cvv.trim() || cvv.length < 3) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpiForm = () => {
    const errors = {};
    
    if (!upiId.trim() || !upiId.includes('@')) {
      errors.upiId = 'Please enter a valid UPI ID (e.g., name@upi)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    if (cleanValue.length <= 2) return cleanValue;
    
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
  };

  const handleCvvChange = (e) => {
    // Only allow digits and limit to 4 characters
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(value);
  };

  const processPayment = async () => {
    // Validate form based on active tab
    let isValid = false;
    
    if (activeTab === 'card') {
      isValid = validateCardForm();
    } else if (activeTab === 'upi') {
      isValid = validateUpiForm();
    } else if (activeTab === 'razorpay') {
      isValid = true; // No validation needed for Razorpay
      openRazorpayModal();
      return;
    }
    
    if (!isValid) return;
    
    setIsLoading(true);
    
    // Simulate payment processing with a delay
    setTimeout(() => {
      setIsLoading(false);
      setPaymentComplete(true);
      
      // After successful payment, create the booking
      createBooking();
    }, 2000);
  };

  // Open dummy Razorpay modal
  const openRazorpayModal = () => {
    setShowRazorpay(true);
  };

  // Close dummy Razorpay modal and process payment
  const handleRazorpaySuccess = () => {
    setShowRazorpay(false);
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setPaymentComplete(true);
      
      // Create booking after payment
      createBooking();
    }, 1500);
  };

  const createBooking = async () => {
    setProcessingBooking(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Add payment status to booking data
      const bookingPayload = {
        ...bookingData,
        paymentStatus: 'paid',
      };
      
      // Create the booking
  await axios.post(getApiUrl('bookings'), bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProcessingBooking(false);
      
      // Show success message
      Swal.fire({
        title: 'Booking Successful!',
        text: 'Your parking slot has been booked and payment processed',
        icon: 'success',
        confirmButtonText: 'View My Bookings',
        confirmButtonColor: 'var(--medium-blue)',
        showCancelButton: true,
        cancelButtonText: 'Close'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/userdashboard');
        } else {
          navigate('/userdashboard');
        }
      });
    } catch (error) {
      setProcessingBooking(false);
      
      let errorMessage = 'Failed to create booking';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      Swal.fire({
        title: 'Booking Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: 'var(--medium-blue)'
      });
    }
  };

  // Show loading state if no booking data
  if (!bookingData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  // Render card type icon based on detected card
  const renderCardIcon = () => {
    switch(cardType) {
      case 'visa':
        return <VisaIcon />;
      case 'mastercard':
        return <MastercardIcon />;
      case 'amex':
        return <AmexIcon />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-14">
      {/* Header */}
      <div className="flex items-center mb-14">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-blue-800">Complete Payment</h1>
          <p className="text-gray-600">Secure payment for your parking reservation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Form - 2 Columns */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
          {/* Payment Status */}
          {paymentComplete ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-700 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
              
              {processingBooking ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-gray-600">Creating your booking...</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
              )}
            </div>
          ) : (
            <>
              {/* Payment Method Tabs */}
              <div className="flex flex-wrap border-b mb-6">
                <button
                  onClick={() => setActiveTab('card')}
                  className={`pb-2 px-4 font-medium flex items-center ${
                    activeTab === 'card'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit/Debit Card
                </button>
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`pb-2 px-4 font-medium flex items-center ${
                    activeTab === 'upi'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <UpiIcon />
                  <span className="ml-2">UPI</span>
                </button>
                <button
                  onClick={() => setActiveTab('razorpay')}
                  className={`pb-2 px-4 font-medium flex items-center ${
                    activeTab === 'razorpay'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <RazorpayIcon />
                  <span className="ml-2">Razorpay</span>
                </button>
              </div>

              {/* Card Payment Form */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Enter Card Details</h3>
                    <div className="flex space-x-2">
                      {/* Realistic payment card icons */}
                      <div className="rounded">
                        <VisaIcon />
                      </div>
                      <div className="rounded">
                        <MastercardIcon />
                      </div>
                      <div className="rounded">
                        <AmexIcon />
                      </div>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="form-group">
                    <label className="block text-gray-700 text-sm mb-1">Card Number</label>
                    <div className={`flex items-center border rounded-lg overflow-hidden ${
                      formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <div className="bg-gray-50 px-3 py-3 border-r border-gray-300">
                        {renderCardIcon()}
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full p-3 focus:outline-none"
                      />
                    </div>
                    {formErrors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  {/* Card Name */}
                  <div className="form-group">
                    <label className="block text-gray-700 text-sm mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full p-3 border rounded-lg focus:outline-none ${
                        formErrors.cardName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.cardName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cardName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div className="form-group">
                      <label className="block text-gray-700 text-sm mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryDateChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full p-3 border rounded-lg focus:outline-none ${
                          formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.expiryDate && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                      )}
                    </div>

                    {/* CVV */}
                    <div className="form-group">
                      <label className="block text-gray-700 text-sm mb-1">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full p-3 border rounded-lg focus:outline-none ${
                          formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.cvv && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <UpiIcon />
                      <h3 className="font-medium text-gray-700 ml-2">UPI Payment</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Make payment directly from your bank account using UPI
                    </p>
                    
                    <div className="form-group">
                      <label className="block text-gray-700 text-sm mb-1">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@upi"
                        className={`w-full p-3 border rounded-lg focus:outline-none ${
                          formErrors.upiId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.upiId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.upiId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="text-gray-600">
                      A payment request will be sent to your UPI app. Please complete the payment there.
                    </p>
                  </div>
                </div>
              )}

              {/* Razorpay Payment Option */}
              {activeTab === 'razorpay' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-4">
                      <RazorpayIcon />
                      <h3 className="font-medium text-gray-700 ml-2">Pay with Razorpay</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Pay securely using Razorpay - India's most trusted payment gateway. Use credit/debit cards, UPI, netbanking and more.
                    </p>
                    
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-600">
                        Click on the "Pay Now" button below to open the Razorpay payment window.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-6">
                <button
                  onClick={processPayment}
                  disabled={isLoading}
                  className={`w-full py-3 ${
                    isLoading
                      ? 'bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-lg font-medium flex items-center justify-center transition-colors duration-200`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ₹${bookingData.totalAmount.toFixed(2)}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Booking Summary - 1 Column */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 p-4 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-800">{bookingData.parkingDetails.location}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Date</span>
                <span className="font-medium text-gray-800">{bookingData.bookingDate}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Time</span>
                <span className="font-medium text-gray-800">{bookingData.startTime} - {bookingData.endTime}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-800">{bookingData.duration} hours</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium text-gray-800">{bookingData.vehicleInfo}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700 font-medium">Total Amount</span>
                <span className="font-bold text-blue-700 text-xl">₹{bookingData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dummy Razorpay Modal */}
      {showRazorpay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {/* Replace Razorpay placeholder with styled text */}
                <div className="flex items-center">
                <RazorpayIcon />
                  <span className="font-bold text-blue-600">Razorpay</span>
                </div>
              </div>
              <button 
                onClick={() => setShowRazorpay(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="font-bold text-gray-800">Complete your payment</h3>
              <p className="text-sm text-gray-500">ParkEasy - Booking Payment</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">₹{bookingData.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="text-gray-800">ORD_PK{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-500">This is a simulated Razorpay payment window.</p>
              <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                Click "Pay Now" to simulate a successful payment.
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRazorpay(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRazorpaySuccess}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;