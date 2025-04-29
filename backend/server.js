require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sunita@8208',
  database: process.env.DB_NAME || 'FindMySpot',
  logging: false // set to console.log to see SQL queries
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-default-jwt-secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define Lister model
const Lister = sequelize.define('Lister', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define ParkingSpace model
const ParkingSpace = sequelize.define('ParkingSpace', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.STRING,
    defaultValue: 'Not specified'
  },
  availability: {
    type: DataTypes.STRING,
    defaultValue: 'Not specified'
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: 'No description provided'
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  listerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Listers',
      key: 'id'
    }
  }
});

// Define ParkingRequest model
const ParkingRequest = sequelize.define('ParkingRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  listerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  listerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  listerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Listers',
      key: 'id'
    }
  }
});

// Define relationships
Lister.hasMany(ParkingSpace, { foreignKey: 'listerId' });
ParkingSpace.belongsTo(Lister, { foreignKey: 'listerId' });

Lister.hasMany(ParkingRequest, { foreignKey: 'listerId' });
ParkingRequest.belongsTo(Lister, { foreignKey: 'listerId' });

// User Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    // Log what we're receiving
    console.log('Registration attempt:', { email, fullName, passwordLength: password?.length });
    
    // Check if we have all required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      fullName,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-default-jwt-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      username: user.email,
      fullName: user.fullName
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: 'Failed to register user', details: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-default-jwt-secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      token,
      username: user.email,
      fullName: user.fullName
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

// Lister Registration endpoint
app.post('/api/auth/lister/register', async (req, res) => {
  try {
    const { email, password, fullName, businessName, phone, address } = req.body;
    
    // Log what we're receiving
    console.log('Lister Registration attempt:', { email, fullName, businessName, phone, address, passwordLength: password?.length });
    
    // Check if we have all required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if lister already exists
    const existingLister = await Lister.findOne({ where: { email } });
    if (existingLister) {
      return res.status(400).json({ error: 'Lister with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create lister
    const lister = await Lister.create({
      email,
      fullName,
      businessName,
      phone,
      address,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: lister.id, email: lister.email, role: 'lister' },
      process.env.JWT_SECRET || 'your-default-jwt-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      username: lister.email,
      fullName: lister.fullName,
      businessName: lister.businessName,
      listerId: lister.id,  // Include lister ID in response
      role: 'lister'
    });
  } catch (error) {
    console.error('Error registering lister:', error);
    res.status(400).json({ error: 'Failed to register lister', details: error.message });
  }
});

// Lister Login endpoint
app.post('/api/auth/lister/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find lister
    const lister = await Lister.findOne({ where: { email } });
    if (!lister) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, lister.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: lister.id, email: lister.email, role: 'lister' },
      process.env.JWT_SECRET || 'your-default-jwt-secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      token,
      username: lister.email,
      fullName: lister.fullName,
      businessName: lister.businessName,
      listerId: lister.id,  // Include lister ID in response
      role: 'lister'
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

// Get all parking spaces
app.get('/api/parking-spaces', async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Error fetching parking spaces:', error);
    res.status(500).json({ error: 'Failed to fetch parking spaces' });
  }
});

// Get a specific parking space
app.get('/api/parking-spaces/:id', async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findByPk(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    res.json(parkingSpace);
  } catch (error) {
    console.error('Error fetching parking space:', error);
    res.status(500).json({ error: 'Failed to fetch parking space' });
  }
});

// Get parking spaces by lister ID
app.get('/api/lister/:listerId/parking-spaces', authenticateToken, async (req, res) => {
  try {
    const { listerId } = req.params;
    
    // Verify that the authenticated user is the lister or an admin
    if (req.user.id !== parseInt(listerId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access to lister parking spaces' });
    }
    
    const parkingSpaces = await ParkingSpace.findAll({
      where: { 
        listerId: listerId,
        isActive: true 
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Error fetching lister parking spaces:', error);
    res.status(500).json({ error: 'Failed to fetch lister parking spaces' });
  }
});

// Create a new parking space
app.post('/api/parking-spaces', async (req, res) => {
  try {
    const newSpace = await ParkingSpace.create(req.body);
    res.status(201).json(newSpace);
  } catch (error) {
    console.error('Error creating parking space:', error);
    res.status(400).json({ error: 'Failed to create parking space', details: error.message });
  }
});

/// Update a parking space - No auth required
app.put('/api/parking-spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Update attempt for parking space ID: ${id}`);
    
    const parkingSpace = await ParkingSpace.findByPk(id);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    
    console.log('Found parking space:', { id: parkingSpace.id, listerId: parkingSpace.listerId });
    console.log('Updating parking space with data:', req.body);
    
    // Update the parking space - no auth check
    await parkingSpace.update(req.body);
    
    console.log('Update successful');
    res.json(parkingSpace);
  } catch (error) {
    console.error('Error updating parking space:', error);
    res.status(400).json({ error: 'Failed to update parking space', details: error.message });
  }
});

// Delete a parking space - No auth required
app.delete('/api/parking-spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Delete attempt for parking space ID: ${id}`);
    
    const parkingSpace = await ParkingSpace.findByPk(id);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    
    console.log('Found parking space:', { id: parkingSpace.id, listerId: parkingSpace.listerId });
    console.log('Deleting parking space');
    
    // Delete the parking space - no auth check
    await parkingSpace.destroy();
    
    console.log('Delete successful');
    res.json({ message: 'Parking space successfully deleted' });
  } catch (error) {
    console.error('Error deleting parking space:', error);
    res.status(500).json({ error: 'Failed to delete parking space' });
  }
});

// Create a new parking space request
app.post('/api/parking-requests', authenticateToken, async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add the lister ID from the authenticated user to the request
    const requestData = {
      ...req.body,
      listerId: req.user.id
    };
    
    const newRequest = await ParkingRequest.create(requestData);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating parking request:', error);
    res.status(400).json({ error: 'Failed to create parking request', details: error.message });
  }
});

// Get all parking requests (admin only)
app.get('/api/parking-requests', authenticateToken, async (req, res) => {
  try {
    // In a real app, check if user is admin
    // For now, we'll return all pending requests
    const requests = await ParkingRequest.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Lister,
        attributes: ['id', 'email', 'fullName', 'businessName', 'phone']
      }]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching parking requests:', error);
    res.status(500).json({ error: 'Failed to fetch parking requests' });
  }
});

// Get parking requests by lister ID
app.get('/api/lister/:listerId/parking-requests', authenticateToken, async (req, res) => {
  try {
    const { listerId } = req.params;
    
    // Verify that the authenticated user is the lister or an admin
    if (req.user.id !== parseInt(listerId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access to lister parking requests' });
    }
    
    const requests = await ParkingRequest.findAll({
      where: { listerId: listerId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching lister parking requests:', error);
    res.status(500).json({ error: 'Failed to fetch lister parking requests' });
  }
});

// Approve a parking request (admin only)
app.put('/api/parking-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const request = await ParkingRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update request status
    await request.update({ status: 'approved' });
    
    // Create the parking space from the request, including the lister ID
    await ParkingSpace.create({
      name: request.listerName,
      contact: request.contact,
      location: request.location,
      price: request.price,
      availability: request.availability,
      description: request.description,
      lat: request.lat,
      lng: request.lng,
      isActive: true,
      listerId: request.listerId // Associate space with lister
    });
    
    res.json({ message: 'Parking request approved and space created successfully' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request', details: error.message });
  }
});

// Reject a parking request (admin only)
app.put('/api/parking-requests/:id/reject', authenticateToken, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const request = await ParkingRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update request status
    await request.update({ status: 'rejected' });
    
    res.json({ message: 'Parking request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request', details: error.message });
  }
});

// Search parking spaces by location name or coordinates
app.get('/api/search-parking', async (req, res) => {
  try {
    const { query, lat, lng, radius } = req.query;
    let whereClause = { isActive: true };
    
    if (query) {
      whereClause.location = {
        [Sequelize.Op.like]: `%${query}%`
      };
    }
    
    // If coordinates are provided, find spaces within the radius
    if (lat && lng && radius) {
      // This is a simplified distance calculation
      // For production, consider using a proper geospatial query
      const spaces = await ParkingSpace.findAll({
        where: whereClause,
        include: [{
          model: Lister,
          attributes: ['id', 'fullName', 'businessName', 'phone']
        }]
      });
      
      // Filter spaces by distance (Haversine formula)
      const filteredSpaces = spaces.filter(space => {
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          space.lat, 
          space.lng
        );
        return distance <= parseFloat(radius);
      });
      
      return res.json(filteredSpaces);
    }
    
    const parkingSpaces = await ParkingSpace.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Lister,
        attributes: ['id', 'fullName', 'businessName', 'phone']
      }]
    });
    
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Error searching parking spaces:', error);
    res.status(500).json({ error: 'Failed to search parking spaces' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword, userType } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    console.log('Password reset attempt for:', email);
    
    let user;
    
    // Check user type if provided, otherwise try both models
    if (userType === 'lister') {
      user = await Lister.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'No lister account found with this email' });
      }
    } else if (userType === 'user') {
      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'No user account found with this email' });
      }
    } else {
      // Try both models if userType is not specified
      user = await User.findOne({ where: { email } });
      
      if (!user) {
        user = await Lister.findOne({ where: { email } });
        if (!user) {
          return res.status(404).json({ error: 'No account found with this email' });
        }
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password
    await user.update({ password: hashedPassword });
    
    console.log(`Password reset successful for email:`, email);
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Initialize database and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
// Add this to your existing server.js file

// Define ListerQuery model
const ListerQuery = sequelize.define('ListerQuery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  listerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Listers',
      key: 'id'
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Define relationships
Lister.hasMany(ListerQuery, { foreignKey: 'listerId' });
ListerQuery.belongsTo(Lister, { foreignKey: 'listerId' });

// Create a new query
app.post('/api/lister/queries', authenticateToken, async (req, res) => {
  try {
    const { subject, category, description, attachmentUrl } = req.body;
    const listerId = req.user.id;
    
    // Validate required fields
    if (!subject || !category || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create the query
    const newQuery = await ListerQuery.create({
      subject,
      category,
      description,
      attachmentUrl,
      listerId
    });
    
    res.status(201).json(newQuery);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ error: 'Failed to create query', details: error.message });
  }
});

// Get all queries for a specific lister
app.get('/api/lister/:listerId/queries', authenticateToken, async (req, res) => {
  try {
    const { listerId } = req.params;
    
    // Ensure the requesting user is authorized
    if (req.user.id !== parseInt(listerId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const queries = await ListerQuery.findAll({
      where: { listerId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching lister queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries', details: error.message });
  }
});

// Get all queries (admin only)
app.get('/api/admin/queries', authenticateToken, async (req, res) => {
  try {
    // In a real app, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Unauthorized access' });
    // }
    
    const queries = await ListerQuery.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Lister,
        attributes: ['id', 'fullName', 'businessName', 'email', 'phone']
      }]
    });
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching all queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries', details: error.message });
  }
});

// Update query status and add admin response (admin only)
app.put('/api/admin/queries/:queryId', authenticateToken, async (req, res) => {
  try {
    const { queryId } = req.params;
    const { status, adminResponse } = req.body;
    
    // In a real app, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Unauthorized access' });
    // }
    
    const query = await ListerQuery.findByPk(queryId);
    
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    // Update query
    await query.update({ 
      status, 
      adminResponse 
    });
    
    res.json({ 
      message: 'Query updated successfully',
      query
    });
  } catch (error) {
    console.error('Error updating query:', error);
    res.status(500).json({ error: 'Failed to update query', details: error.message });
  }
});
// Location suggestions endpoint
app.get('/api/location-suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    // Search for locations that match the query
    const spaces = await ParkingSpace.findAll({
      where: {
        location: {
          [Sequelize.Op.like]: `%${query}%`
        },
        isActive: true
      },
      attributes: ['id', 'location', 'lat', 'lng'],
      limit: 8, // Limit the number of suggestions
      order: [
        [Sequelize.literal(`CASE WHEN location LIKE '${query}%' THEN 1 ELSE 2 END`), 'ASC'], // Prioritize matches at the start
        ['location', 'ASC']
      ]
    });
    
    // Create unique locations (to avoid duplicates)
    const uniqueLocations = [];
    const seen = new Set();
    
    spaces.forEach(space => {
      // Create a key based on location name to ensure uniqueness
      const key = space.location.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLocations.push({
          id: space.id,
          location: space.location,
          lat: space.lat,
          lng: space.lng
        });
      }
    });
    
    res.json(uniqueLocations);
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch location suggestions' });
  }
});
// Define Booking model
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  vehicleInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  parkingSpaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ParkingSpaces',
      key: 'id'
    }
  },
  listerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Listers',
      key: 'id'
    }
  }
});

// Define relationships
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

ParkingSpace.hasMany(Booking, { foreignKey: 'parkingSpaceId' });
Booking.belongsTo(ParkingSpace, { foreignKey: 'parkingSpaceId' });

Lister.hasMany(Booking, { foreignKey: 'listerId' });
Booking.belongsTo(Lister, { foreignKey: 'listerId' });

// Create a new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { 
      parkingSpaceId, 
      bookingDate, 
      startTime, 
      endTime, 
      totalAmount, 
      vehicleInfo, 
      notes 
    } = req.body;
    
    // Get the authenticated user ID
    const userId = req.user.id;
    
    // Find the parking space to get the lister ID
    const parkingSpace = await ParkingSpace.findByPk(parkingSpaceId);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    
    // Create booking with all three IDs: user, parking space, and lister
    const booking = await Booking.create({
      bookingDate,
      startTime,
      endTime,
      totalAmount,
      vehicleInfo,
      notes,
      userId,
      parkingSpaceId,
      listerId: parkingSpace.listerId
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// Get bookings for a user
app.get('/api/user/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'location', 'price', 'lat', 'lng']
        },
        {
          model: Lister,
          attributes: ['id', 'fullName', 'businessName', 'phone', 'email']
        }
      ],
      order: [['bookingDate', 'DESC']]
    });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings for a lister
app.get('/api/lister/bookings', authenticateToken, async (req, res) => {
  try {
    const listerId = req.user.id;
    
    // Verify the user is a lister
    if (req.user.role !== 'lister') {
      return res.status(403).json({ error: 'Unauthorized access to lister bookings' });
    }
    
    const bookings = await Booking.findAll({
      where: { listerId },
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: ParkingSpace,
          attributes: ['id', 'location', 'price']
        }
      ],
      order: [['bookingDate', 'DESC']]
    });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching lister bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (for lister or admin)
app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Find the booking
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify the user is authorized (lister of this booking or admin)
    if (req.user.id !== booking.listerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this booking' });
    }
    
    // Update booking status
    await booking.update({ status });
    
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel a booking (for user)
app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the booking
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify the user is authorized (user who made this booking)
    if (req.user.id !== booking.userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }
    
    // Check if booking is already completed
    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed booking' });
    }
    
    // Update booking status to cancelled
    await booking.update({ 
      status: 'cancelled',
      paymentStatus: booking.paymentStatus === 'paid' ? 'refunded' : 'pending'
    });
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Check parking space availability for a given date and time range
app.get('/api/parking-spaces/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }
    
    // Find conflicting bookings
    const conflictingBookings = await Booking.findAll({
      where: {
        parkingSpaceId: id,
        bookingDate: date,
        status: {
          [Sequelize.Op.notIn]: ['cancelled']
        },
        [Sequelize.Op.or]: [
          {
            // New booking starts during an existing booking
            [Sequelize.Op.and]: [
              { startTime: { [Sequelize.Op.lte]: endTime } },
              { endTime: { [Sequelize.Op.gt]: startTime } }
            ]
          },
          {
            // New booking ends during an existing booking
            [Sequelize.Op.and]: [
              { startTime: { [Sequelize.Op.lt]: endTime } },
              { endTime: { [Sequelize.Op.gte]: startTime } }
            ]
          }
        ]
      }
    });
    
    
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});
// Check parking space availability for a given date and time range
app.get('/api/parking-spaces/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }
    
    // Find conflicting bookings
    const conflictingBookings = await Booking.findAll({
      where: {
        parkingSpaceId: id,
        bookingDate: date,
        status: {
          [Sequelize.Op.notIn]: ['cancelled']
        },
        [Sequelize.Op.or]: [
          // Case 1: New booking completely contains an existing booking
          {
            startTime: { [Sequelize.Op.gte]: startTime },
            endTime: { [Sequelize.Op.lte]: endTime }
          },
          // Case 2: New booking starts during an existing booking
          {
            startTime: { [Sequelize.Op.lt]: startTime },
            endTime: { [Sequelize.Op.gt]: startTime }
          },
          // Case 3: New booking ends during an existing booking
          {
            startTime: { [Sequelize.Op.lt]: endTime },
            endTime: { [Sequelize.Op.gt]: endTime }
          },
          // Case 4: New booking is completely contained within an existing booking
          {
            startTime: { [Sequelize.Op.lte]: startTime },
            endTime: { [Sequelize.Op.gte]: endTime }
          }
        ]
      }
    });
    
    const available = conflictingBookings.length === 0;
    
    res.json({ 
      available, 
      conflictCount: conflictingBookings.length 
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});
// Add this endpoint to your Express app where the other booking routes are defined
// Update booking payment status (for lister or admin)
app.put('/api/bookings/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    // Find the booking
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Verify the user is authorized (lister of this booking or admin)
    if (req.user.id !== booking.listerId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update payment status' });
    }
    
    // Validate payment status
    if (!['pending', 'paid', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    // Update booking payment status
    await booking.update({ paymentStatus });
    
    res.json({ message: 'Payment status updated successfully', booking });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});
// Add this to your server.js file (near the other admin endpoints)
// Add these endpoints to your existing server.js file

// Admin Dashboard stats endpoint
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    // Get current date for calculating monthly stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Previous month
    const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);
    
    // Get user counts
    const totalUsers = await User.count();
    const totalListers = await Lister.count();
    
    // Get new users/listers this month
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: firstDayOfMonth
        }
      }
    });
    
    const newListersThisMonth = await Lister.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: firstDayOfMonth
        }
      }
    });
    
    // Get parking space stats
    const totalParkingSpaces = await ParkingSpace.count();
    const activeListings = await ParkingSpace.count({
      where: { isActive: true }
    });
    
    // Get booking stats
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({
      where: { status: 'pending' }
    });
    
    const bookingsThisMonth = await Booking.count({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: firstDayOfMonth
        }
      }
    });
    
    // Get revenue this month (sum of totalAmount for confirmed/completed bookings)
    const revenueResult = await Booking.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'total']
      ],
      where: {
        createdAt: {
          [Sequelize.Op.gte]: firstDayOfMonth
        },
        status: {
          [Sequelize.Op.in]: ['confirmed', 'completed']
        }
      },
      raw: true
    });
    
    const revenueThisMonth = revenueResult.total ? parseFloat(revenueResult.total) : 0;
    
    // Get user growth over last 5 months
    const userGrowth = [];
    for (let i = 4; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);
      
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      const userCount = await User.count({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: monthEnd
          }
        }
      });
      
      const listerCount = await Lister.count({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: monthEnd
          }
        }
      });
      
      userGrowth.push({
        month: monthName,
        users: userCount,
        listers: listerCount
      });
    }
    
    // Calculate booking trends for last 7 days
    const bookingTrends = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayBookings = await Booking.count({
        where: {
          createdAt: {
            [Sequelize.Op.gte]: date,
            [Sequelize.Op.lt]: nextDay
          }
        }
      });
      
      const dayIndex = date.getDay();
      
      bookingTrends.push({
        day: dayNames[dayIndex],
        bookings: dayBookings
      });
    }
    
    // Create response object
    const dashboardStats = {
      users: totalUsers,
      listers: totalListers,
      parkingSpaces: totalParkingSpaces,
      activeListings: activeListings,
      totalBookings: totalBookings,
      pendingBookings: pendingBookings,
      newUsersThisMonth: newUsersThisMonth,
      newListersThisMonth: newListersThisMonth,
      bookingsThisMonth: bookingsThisMonth,
      revenueThisMonth: revenueThisMonth,
      userGrowth: userGrowth,
      bookingTrends: bookingTrends
    };
    
    res.json(dashboardStats);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics', details: error.message });
  }
});

// Get recent bookings for admin dashboard
app.get('/api/admin/recent-bookings', async (req, res) => {
  try {
    const recentBookings = await Booking.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: ParkingSpace,
          attributes: ['id', 'location', 'price']
        },
        {
          model: Lister,
          attributes: ['id', 'fullName', 'businessName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json(recentBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Get recent users for admin dashboard
app.get('/api/admin/recent-users', async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json(recentUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ error: 'Failed to fetch recent users' });
  }
});

// Get recent listers for admin dashboard
app.get('/api/admin/recent-listers', async (req, res) => {
  try {
    const recentListers = await Lister.findAll({
      attributes: ['id', 'fullName', 'email', 'businessName', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json(recentListers);
  } catch (error) {
    console.error('Error fetching recent listers:', error);
    res.status(500).json({ error: 'Failed to fetch recent listers' });
  }
});

// Get recent parking spaces for admin dashboard
app.get('/api/admin/recent-spaces', async (req, res) => {
  try {
    const recentSpaces = await ParkingSpace.findAll({
      include: [{
        model: Lister,
        attributes: ['id', 'fullName', 'businessName']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json(recentSpaces);
  } catch (error) {
    console.error('Error fetching recent spaces:', error);
    res.status(500).json({ error: 'Failed to fetch recent parking spaces' });
  }
});
  // Define UserQuery model
  // User Query Model Definition - keep this unchanged
const UserQuery = sequelize.define('UserQuery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Define relationships
User.hasMany(UserQuery, { foreignKey: 'userId' });
UserQuery.belongsTo(User, { foreignKey: 'userId' });

// Improved authentication middleware
const authenticateTokenn = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }
  
  try {
    // Verify token and extract user info
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Create a new query - Updated with better error handling
app.post('/api/user/queries', authenticateTokenn, async (req, res) => {
  try {
    const { subject, category, description, attachmentUrl } = req.body;
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate required fields
    if (!subject || !category || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create the query
    const newQuery = await UserQuery.create({
      subject,
      category,
      description,
      attachmentUrl,
      userId
    });
    
    res.status(201).json(newQuery);
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ error: 'Failed to create query', details: error.message });
  }
});

// Get all queries for a specific user - UPDATED route
app.get('/api/user/queries', authenticateTokenn, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const queries = await UserQuery.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries', details: error.message });
  }
});

// Keep the old route for backward compatibility, but improved
app.get('/api/user/:userId/queries', authenticateToken, async (req, res) => {
  try {
    const paramUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.id;
    
    // Handle undefined userId in params
    if (isNaN(paramUserId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    // Ensure the requesting user is authorized
    if (authenticatedUserId !== paramUserId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const queries = await UserQuery.findAll({
      where: { userId: paramUserId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching user queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries', details: error.message });
  }
});

// Get a specific query by ID
app.get('/api/user/queries/:queryId', authenticateToken, async (req, res) => {
  try {
    const { queryId } = req.params;
    const userId = req.user.id;
    
    const query = await UserQuery.findOne({
      where: { 
        id: queryId,
        userId // Ensure the query belongs to requesting user
      }
    });
    
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    res.json(query);
  } catch (error) {
    console.error('Error fetching query details:', error);
    res.status(500).json({ error: 'Failed to fetch query details', details: error.message });
  }
});

// Get all user queries (admin only)
app.get('/api/admin/user-queries', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const queries = await UserQuery.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email']
      }]
    });
    
    res.json(queries);
  } catch (error) {
    console.error('Error fetching all user queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries', details: error.message });
  }
});

// Update user query status and add admin response (admin only)
app.put('/api/admin/user-queries/:queryId', authenticateTokenn, async (req, res) => {
  try {
    const { queryId } = req.params;
    const { status, adminResponse } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const query = await UserQuery.findByPk(queryId);
    
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    // Update query
    await query.update({ 
      status, 
      adminResponse 
    });
    
    res.json({ 
      message: 'Query updated successfully',
      query
    });
  } catch (error) {
    console.error('Error updating query:', error);
    res.status(500).json({ error: 'Failed to update query', details: error.message });
  }
});