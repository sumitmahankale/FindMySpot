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