import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, Briefcase, HelpCircle, Activity, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../config/api.js';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    listers: 0,
    parkingSpaces: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    newUsersThisMonth: 0,
    newListersThisMonth: 0,
    bookingsThisMonth: 0,
    revenueThisMonth: 0,
    userGrowth: [],
    bookingTrends: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Use the correct API URL
  const apiOrigin = getApiUrl('').replace(/\/$/, '');
  console.log('Fetching dashboard data from:', `${apiOrigin}/admin/dashboard`);
        
        try {
          const response = await axios.get(getApiUrl('admin/dashboard'), {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
            console.log('Dashboard data received:', response.data);
            setStats(response.data);
            setLastUpdated(new Date());
            setUseMockData(false);
          } else {
            console.error('Invalid response format:', response.data);
            setError('Using mock data - server returned invalid data format');
            setUseMockData(true);
          }
        } catch (apiError) {
          console.error("API request failed:", apiError);
          setError('Using mock data - API request failed');
          setUseMockData(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        setError('Failed to load dashboard data. Using mock data.');
        setUseMockData(true);
        setLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Set up interval to refresh data every 30 seconds
    const refreshInterval = setInterval(fetchDashboardStats, 30000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Mock data for development/testing purposes
  const mockStats = {
    users: 1250,
    listers: 325,
    parkingSpaces: 512,
    activeListings: 490,
    totalBookings: 5842,
    pendingBookings: 42,
    newUsersThisMonth: 78,
    newListersThisMonth: 15,
    bookingsThisMonth: 387,
    revenueThisMonth: 12580,
    userGrowth: [
      { month: 'Jan', users: 980, listers: 270 },
      { month: 'Feb', users: 1050, listers: 285 },
      { month: 'Mar', users: 1120, listers: 295 },
      { month: 'Apr', users: 1200, listers: 310 },
      { month: 'May', users: 1250, listers: 325 }
    ],
    bookingTrends: [
      { day: 'Mon', bookings: 45 },
      { day: 'Tue', bookings: 52 },
      { day: 'Wed', bookings: 49 },
      { day: 'Thu', bookings: 60 },
      { day: 'Fri', bookings: 72 },
      { day: 'Sat', bookings: 58 },
      { day: 'Sun', bookings: 51 }
    ]
  };
  
  // Use either real data or mock data
  const displayStats = useMockData ? mockStats : stats;

  // Data for charts
  const userTypeData = [
    { name: 'Users', value: displayStats.users },
    { name: 'Listers', value: displayStats.listers }
  ];

  const listingStatusData = [
    { name: 'Active', value: displayStats.activeListings },
    { name: 'Inactive', value: displayStats.parkingSpaces - displayStats.activeListings }
  ];
  
  const bookingStatusData = [
    { name: 'Pending', value: displayStats.pendingBookings },
    { name: 'Completed', value: displayStats.totalBookings - displayStats.pendingBookings }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading && !displayStats.users) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrator Dashboard</h1>
        {lastUpdated && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">Notice</p>
          <p>{error}</p>
          {useMockData && <p className="mt-2 text-sm">Showing mock data for demonstration purposes.</p>}
        </div>
      )}
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{displayStats.users}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p className="text-green-500 text-xs mt-2">+{displayStats.newUsersThisMonth} this month</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Listers</p>
              <p className="text-2xl font-bold text-gray-800">{displayStats.listers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className="text-green-500 text-xs mt-2">+{displayStats.newListersThisMonth} this month</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Parking Spaces</p>
              <p className="text-2xl font-bold text-gray-800">{displayStats.parkingSpaces}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HelpCircle className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <p className="text-purple-500 text-xs mt-2">{displayStats.activeListings} active listings</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{displayStats.totalBookings}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-yellow-500 text-xs mt-2">{displayStats.pendingBookings} pending now</p>
        </div>
      </div>
      
      {/* Revenue Overview */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue Overview</h2>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-green-100 p-4 rounded-full mr-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-800">${displayStats.revenueThisMonth.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-blue-100 p-4 rounded-full mr-4">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Monthly Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{displayStats.bookingsThisMonth}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User distribution chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">User Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Booking trends chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Booking Trends (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayStats.bookingTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip />
                <Legend />
                <Bar name="Daily Bookings" dataKey="bookings" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Listings Status chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Listing Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={listingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {listingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00C49F' : '#FF8042'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* User Growth Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">User Growth (Last 5 Months)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayStats.userGrowth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <Tooltip />
                <Legend />
                <Bar name="Users" dataKey="users" fill="#0088FE" />
                <Bar name="Listers" dataKey="listers" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Booking Status */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Booking Status</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#FFBB28' : '#00C49F'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="bg-yellow-200 p-2 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <span className="ml-3 font-medium">Pending Bookings</span>
                </div>
                <span className="font-bold">{displayStats.pendingBookings}</span>
              </div>
              
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="bg-green-200 p-2 rounded-md">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="ml-3 font-medium">Completed Bookings</span>
                </div>
                <span className="font-bold">{displayStats.totalBookings - displayStats.pendingBookings}</span>
              </div>
              
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <div className="bg-blue-200 p-2 rounded-md">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="ml-3 font-medium">Completion Rate</span>
                </div>
                <span className="font-bold">
                  {displayStats.totalBookings > 0 
                    ? ((displayStats.totalBookings - displayStats.pendingBookings) / displayStats.totalBookings * 100).toFixed(0) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;