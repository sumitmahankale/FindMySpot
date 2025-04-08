import React from 'react';
import LandingPage from './components/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ParkingApp from './components/ParkingApp';
import SignUp from './components/SignupPage';
import About from './components/About';
import ListerPage from './components/ParkingListerPage';
import ParkingPage from './components/ParkingFinderPage';
import ListerDashboard from './components/AdminListerDashboard.jsx';
import ListerDashboardd from './components/ListerDashboard.jsx';

const router=createBrowserRouter([
  {
    path : "/Login",
    element : <LoginPage/>,
  },
  {
    path: "/",
    element : <LandingPage/>,
  },
  {
    path: "main",
    element : <ParkingApp/>,
  },
  {
    path: "signup",
    element : <SignUp/>,
  },
  {
    path: "about",
    element : <About/>,
  },
  {
    path: "lister",
    element : <ListerPage/>,
  },
  {
    path: "parking",
    element : <ParkingPage/>,
  },
  {
    path : "dash",
    element : <ListerDashboard/>,
  },
  {
    path : "listerdashboard",
    element : <ListerDashboardd/>,
  },
]);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;