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
import ListerDashboardd from './components/NewListerDashboardPage.jsx';
import ForgotPassword from './components/ForgetPassword.jsx';
import Animation from './components/UniqueLoginAnimation.jsx';
import ListerSignup from './components/ListerSignup.jsx';
import ListerLogin from './components/ListerLogin.jsx';
import ListerForgetPass from './components/ListerForgetPassword.jsx';
import TermsAndConditions from './components/UserTerms.jsx';
import ListerTermsAndConditions from './components/ListerTermsAndConditions.jsx';
import AdminLogin from './components/AdminLogin.jsx'
import AdminDashboard from './components/AdminDashboard.jsx';
import ListerQueryComponent from './components/ListerQuery.jsx';
import AdminQueryManagement from './components/AdminQueryManagement.jsx';
import UserMainDashboard from './components/UserDashboard.jsx';
import UserBookingPage from './components/UserBookingPage.jsx'
import ListerBookingManagement from './components/ListerBookingManagement.jsx';
import PaymentPage from './components/PaymentPage.jsx';
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
    element : <AdminDashboard/>,
  },
  {
    path : "listerforgetpass",
    element : <ListerForgetPass/>,
  },
  {
    path : "terms",
    element : <TermsAndConditions/>,
  },
  {
    path : "listerterms",
    element : <ListerTermsAndConditions/>,
  },
  {
    path : "adminlogin",
    element : <AdminLogin/>,
  },
  {
    path : "listerquery",
    element : <ListerQueryComponent/>,
  },
  {
    path : "adminquery",
    element : <AdminQueryManagement/>,
  },
  {
    path : "userdashboard",
    element : <UserMainDashboard/>,
  },
  {
    path : "userbookings",
    element : <UserBookingPage/>,
  },
  {
    path : "listerbookingmanagement",
    element : <ListerBookingManagement/>,
  },
  {
    path : "payment",
    element : <PaymentPage/>,
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