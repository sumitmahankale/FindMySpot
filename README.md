
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


![Screenshot 2025-04-20 211506](https://github.com/user-attachments/assets/a6882685-da48-4e62-b7c5-3793b9230fac)
![Screenshot 2025-04-20 211651](https://github.com/user-attachments/assets/4ec64a53-5c6b-4317-9777-e2bf3ef9ddca)
![Screenshot 2025-04-20 212035](https://github.com/user-attachments/assets/5f8dd9d1-53f2-4a13-87e7-0922774ede2b)
![Screenshot 2025-04-20 212216](https://github.com/user-attachments/assets/81485a3c-2204-448e-b1d6-48420507167c)
![Screenshot 2025-04-21 174722](https://github.com/user-attachments/assets/4bd31ecf-2e8b-47ca-bb71-d4108f4cd751)

![Screenshot 2025-04-21 175027](https://github.com/user-attachments/assets/e828e6c1-6b4b-4d93-9b58-0f902e0e123c)
![Screenshot 2025-04-20 213852](https://github.com/user-attachments/assets/e1f22ba8-4849-4de9-b6a8-5f86dc17d20f)





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

