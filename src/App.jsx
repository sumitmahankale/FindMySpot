import React from 'react';
import LandingPage from './components/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ParkingApp from './components/ParkingApp';
import SignUp from './components/SignupPage';
import About from './components/About';

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

]);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;