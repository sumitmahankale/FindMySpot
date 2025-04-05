
# FindMySpot: Real-Time Parking Locator

FindMySpot is a real-time parking locator web application designed to help users find and list available parking spots on a map. The application provides an interface for users to sign up, log in, and view available parking spots on a real-time map using Leaflet.js. Listers can add parking locations, which are then visible to all users on the map.

## Features

- User authentication (Sign Up & Login)
- Real-time map view of available parking spots using Leaflet.js
- Lister module for adding parking spaces with location
- Responsive and animated UI with light/dark theme support
- Secure backend with SQL database for data persistence

## Tech Stack

**Frontend:** React, Tailwind CSS, Leaflet.js, CSS Modules  
**Backend:** Node.js, Express.js  
**Database:** SQL (MySQL/PostgreSQL)  
**Maps:** Leaflet.js with OpenStreetMap integration  
**Authentication:** JWT-based authentication system



## Getting Started

### Prerequisites

- Node.js and npm installed
- SQL database (e.g., MySQL or PostgreSQL) setup

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/findmyspot.git
cd findmyspot
```

2. Install dependencies:

```bash
cd client
npm install
cd ../server
npm install
```

3. Configure environment variables in `.env` file for backend (DB credentials, JWT secret, etc.)

4. Run the development server:

```bash
# In one terminal
cd client
npm start

# In another terminal
cd server
npm run dev
```

5. Open your browser at `http://localhost:3000` to see the app in action.

## License

This project is licensed under the MIT License.

