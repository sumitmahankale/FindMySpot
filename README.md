
# FindMySpot: Real-Time Parking Locator

FindMySpot is a full-stack web application built using the MERN stack that helps users locate and reserve real-time parking spots listed by parking space owners ("Listers"). Integrated with the Google Maps API for a visual and interactive experience, it offers a seamless login/signup system with modern styling and responsive design.

## Live Demo

(Coming soon...)

## Screenshots

![Landing Page](./screenshots/landing.png)
![Signup Page](./screenshots/signup.png)
![Map View](./screenshots/map.png)

## Tech Stack

- Frontend: React, React Router, Tailwind CSS / Custom CSS animations
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, Bcrypt
- Maps Integration: Google Maps JavaScript API
- State Management: Context API / Redux (TBD)

## Features

- Authentication System: Login/Signup with separate CSS animations & themes.
- Interactive Google Map: Real-time parking spots appear as markers.
- Lister Module: Add parking spots via a dynamic form and see them live on the map.
- User Dashboard (Upcoming): View, book, or favorite parking spots.
- Responsive Design: Works on mobile and desktop.

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/findmyspot.git
cd findmyspot
```

### 2. Install dependencies

- Backend
  ```bash
  cd backend
  npm install
  ```

- Frontend
  ```bash
  cd ../frontend
  npm install
  ```

### 3. Set up environment variables

Create `.env` files in both `frontend/` and `backend/` folders.

#### For `backend/.env`
```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

#### For `frontend/.env`
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the app

- Backend
  ```bash
  cd backend
  npm run dev
  ```

- Frontend
  ```bash
  cd frontend
  npm start
  ```

The app should be running at http://localhost:3000

## Folder Structure

```
findmyspot/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
```

## Upcoming Features

- Booking system
- User dashboard
- Payment integration
- Notifications
- Admin panel for listers

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## License

This project is licensed under the MIT License.

## Author

FindMySpot by [Your Name](https://github.com/your-username)
