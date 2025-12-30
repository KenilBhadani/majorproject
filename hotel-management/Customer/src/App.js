// import { Routes, Route, Navigate } from "react-router-dom";

// // Admin Dashboard components (YOUR PART)
// import ManageBookings from "./Admin/Manage_Booking";
// import Dashboard from "./Admin/admin_dashboard";
// import ManageRoom from "./Admin/Manage_Room";
// import ManageUser from "./Admin/Manage_User";
// import PaymentReports from "./Admin/Payment_Report";
// import DashboardStats from "./Admin/Dash_stats";

// import Bookingpage from "./comp/Bookingpage";
// import Bookformpage from "./comp/BookForm";

// // Auth pages (YOUR PART)
// import Register from "./comp/Registration";
// import Login from "./comp/Login";

// // Landing page components (FRIEND'S PART)
// import Herosection from "./comp/index";
// import AboutUs from "./comp/About";
// import Middle from "./comp/Middle";
// import Footer from "./comp/footer";
// import Rooms from "./comp/staticroom"
// import Small from "./comp/small";
// //import Header2 from "./comp/Header2"; 
// import OffersHero from "./comp/Offer";
// import Events from "./comp/Event";
// import AboutPage from "./comp/Aboutpage";
// import Contact from "./comp/Contact";
// import EXPO from "./comp/expo";
// import Services from "./comp/services";
// //import { MdAirlineSeatLegroomExtra } from "react-icons/md";


// function App() {
//   return (
//     <Routes>
//       {/* ===== Landing Page (Friend's Work) ===== */}
//       <Route
//         path="/"
//         element={
//           <>
//           <Herosection />
//             <AboutUs />
//             <Rooms />
//             <Middle />
//             <Small />
//             <Events />
//             <OffersHero />
//             <Footer />
//           </>
//         }
//       />

//       {/* Header link of hero section */}
//       <Route path="/contact" element={<Contact />} />
//       <Route path="/aboutpage" element={<AboutPage />} />
//       <Route path="/explore" element={<EXPO />} />
//       <Route path="/services" element={<Services />} />

//       {/* Adminside routes */}
//      {/* <Route
//       path="/admin"
//        element={
//        localStorage.getItem("token")
//          ? <Dashboard />
//          : <Navigate to="/login" />
//         }
//       /> */}
//       <Route path="/admin/dashboard" element={<Dashboard />} />
//       <Route path="/admin/Managebooking" element={<ManageBookings />} />
//       <Route path="/admin/ManageRoom" element ={<ManageRoom />} />
//       <Route path="/admin/ManageUser" element ={<ManageUser />} />
//       <Route path="/admin/ManagePayment" element ={<PaymentReports />} />
//       <Route path="/admin/DashboardStats" element ={<DashboardStats />} />


//        <Route path="/BookingFrompage" element={<Bookformpage />} />
//       {/* ====Booking page ===== */}
//        <Route path="/bookingpage" element={<Bookingpage />} />

//       {/* ===== Auth Pages (Your Work) ===== */}
//       <Route path="/register" element={<Register />} />
//       <Route path="/login" element={<Login />} />

//       {/* ===== Safety Redirect ===== */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffLayout from './Staff/StaffLayout';
import StaffDashboard from './Staff/StaffDashboard';
import RoomStatus from './Staff/RoomStatus';
import Bookings from './Staff/Bookings';
import Guests from './Staff/Guests';
import Tasks from './Staff/Tasks';
import Reports from './Staff/Reports';
import SLogin from './Staff/Slogin';

// 1. Protection Logic
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  // If no token or not staff, kick back to login
  if (!token || user?.role !== 'staff') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<SLogin />} />

      {/* Parent Route */}
      <Route 
        path="/staff" 
        element={
          <PrivateRoute>
            <StaffLayout />
          </PrivateRoute>
        }
      >
        {/* CORRECTED CHILD ROUTES: Use relative paths (no leading /) */}
        <Route index element={<Navigate to="dashboard" replace />} /> 
        
        {/* 'dashboard' becomes /staff/dashboard automatically */}
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="rooms" element={<RoomStatus />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="guests" element={<Guests />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Default Redirects */}
      <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
    </Routes>
  );
}

export default App;