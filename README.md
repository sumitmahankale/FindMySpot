# FindMySpot: Real-Time Parking Locator

FindMySpot is a real-time parking locator web application designed to help users find and list available parking spots on a map. The application provides an interface for users to sign up, log in, and view available parking spots on a real-time map using Leaflet.js. Listers can add parking locations, which are then visible to all users on the map.

## Project Structure

```
FindMySpot/
├── frontend/              # React + Vite frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/               # Node.js + Express backend API
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   └── README.md
└── README.md             # This file
```

## Features

### For Users
- User authentication (Sign Up & Login)
- Real-time map view of available parking spots using Leaflet.js
- Search and filter parking spaces
- Book parking spaces with time slots
- Manage bookings and payment status
- Submit support queries

### For Listers
- Lister registration and authentication
- Add and manage parking spaces
- View and manage bookings
- Track revenue and analytics
- Handle customer queries

### For Admins
- User and lister management
- Approve/reject parking space requests
- Handle support queries
- System analytics and monitoring

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Leaflet.js  
**Backend:** Node.js, Express.js, Sequelize ORM  
**Database:** MySQL (Railway for production)  
**Authentication:** JWT-based with role support  
**Deployment:** Frontend (Static hosting), Backend (Render)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL database (local or Railway)

### Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/findmyspot.git
cd findmyspot
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and JWT settings
npm run db:migrate
npm run dev
```

3. **Setup Frontend (new terminal):**
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL=http://localhost:4000/api
npm run dev
```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api
   - Health check: http://localhost:4000/api/health

## Production Deployment

### Backend (Render + Railway MySQL)

1. **Railway Database:**
   - Create MySQL database on Railway
   - Note the connection details/URL

2. **Render Web Service:**
   - Connect GitHub repository
   - Set root directory to `backend`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add environment variables (see backend/.env.example)

3. **Environment Variables:**
```env
NODE_ENV=production
PORT=10000
MYSQL_URL=your-railway-mysql-url
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (Static Hosting)

1. **Build:**
```bash
cd frontend
npm run build
```

2. **Deploy `dist/` folder to:**
   - Netlify
   - Vercel
   - Render Static Site
   - Any static hosting service

3. **Environment Variables:**
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## API Documentation

### Health Check
- `GET /api/health` - Service status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/lister/register` - Lister registration
- `POST /api/auth/lister/login` - Lister login

### Core Features
- `/api/parking-spaces` - Parking space CRUD
- `/api/bookings` - Booking management
- `/api/user-queries` - Support system
- `/api/admin/*` - Admin operations

## Database Schema

The application uses Sequelize migrations for schema management:

### Main Tables
- **Users** - Application users
- **Listers** - Parking space owners
- **ParkingSpaces** - Available parking locations
- **Bookings** - Parking reservations
- **UserQueries/ListerQueries** - Support tickets
- **ParkingRequests** - Space approval workflow

### Running Migrations
```bash
cd backend
npm run db:migrate          # Apply migrations
npm run db:migrate:undo     # Rollback last migration
```

## Security Features

- JWT authentication with role-based access control
- Rate limiting (120 requests/minute per IP)
- CORS protection
- Input validation and sanitization
- SQL injection prevention via ORM
- Password hashing with bcrypt

## Development Guidelines

### Adding Features
1. Backend: Create routes in `backend/src/routes/`
2. Frontend: Add components in `frontend/src/components/`
3. Database: Generate migrations for schema changes
4. Test locally before deployment

### Code Organization
- **Backend**: Modular Express structure with separated concerns
- **Frontend**: Component-based React with CSS modules
- **Database**: Migration-driven schema management

## Screenshots

![Screenshot 2025-04-20 211506](https://github.com/user-attachments/assets/a6882685-da48-4e62-b7c5-3793b9230fac)

![Screenshot 2025-04-20 212035](https://github.com/user-attachments/assets/5f8dd9d1-53f2-4a13-87e7-0922774ede2b)
![Screenshot 2025-04-20 212216](https://github.com/user-attachments/assets/81485a3c-2204-448e-b1d6-48420507167c)
![Screenshot 2025-04-21 174722](https://github.com/user-attachments/assets/4bd31ecf-2e8b-47ca-bb71-d4108f4cd751)
![Screenshot 2025-04-21 175027](https://github.com/user-attachments/assets/e828e6c1-6b4b-4d93-9b58-0f902e0e123c)
![Screenshot 2025-04-20 213852](https://github.com/user-attachments/assets/e1f22ba8-4849-4de9-b6a8-5f86dc17d20f)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following existing patterns
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create GitHub issues for bugs
- Check existing documentation
- Review API endpoints in backend README
