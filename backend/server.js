



// server.js - Main entry point for the backend server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: './database.sqlite', // SQLite file-based database
  // If you want to use MySQL/PostgreSQL instead, use these settings:
  
  dialect: 'mysql', // or 'postgres', 'mariadb'
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sunita@8208',
  database: process.env.DB_NAME || 'FindMySpot',
  
  logging: false // set to console.log to see SQL queries
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
  }
});

// API Routes

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

// Update a parking space
app.put('/api/parking-spaces/:id', async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findByPk(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    await parkingSpace.update(req.body);
    res.json(parkingSpace);
  } catch (error) {
    console.error('Error updating parking space:', error);
    res.status(400).json({ error: 'Failed to update parking space', details: error.message });
  }
});

// Delete a parking space (soft delete - just mark as inactive)
app.delete('/api/parking-spaces/:id', async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findByPk(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    await parkingSpace.update({ isActive: false });
    res.json({ message: 'Parking space successfully deactivated' });
  } catch (error) {
    console.error('Error deleting parking space:', error);
    res.status(500).json({ error: 'Failed to delete parking space' });
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
        where: whereClause
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
      order: [['createdAt', 'DESC']]
    });
    
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Error searching parking spaces:', error);
    res.status(500).json({ error: 'Failed to search parking spaces' });
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
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();