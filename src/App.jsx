import React from 'react';
import LandingPage from './components/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ParkingApp from './components/ParkingApp';
import SignUp from './components/SignupPage';
import About from './components/About';
import ListerPage from './components/ParkingListerPage.jsx';
import ParkingPage from './components/ParkingFinderPage';
import ListerDashboard from './components/AdminListerDashboard.jsx';
import ListerDashboardd from './components/ListerDashboard.jsx';
import ForgotPassword from './components/ForgetPassword.jsx';
import Animation from './components/UniqueLoginAnimation.jsx';
import ListerSignup from './components/ListerSignup.jsx';
import ListerLogin from './components/ListerLogin.jsx';
import AdminRequest from './components/AdminRequestPage.jsx';

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
  {
    path : "forgetpass",
    element : <ForgotPassword/>,
  },
  {
    path : "animation",
    element : <Animation/>,
  },
  {
    path : "listersignup",
    element : <ListerSignup/>,
  },
  {
    path : "listerlogin",
    element : <ListerLogin/>,
  },
  {
    path : "admin",
    element : <AdminRequest/>,
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