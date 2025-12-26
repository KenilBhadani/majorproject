import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Admin/admin_dashboard";

import Bookingpage from "./comp/Bookingpage";
import Bookformpage from "./comp/BookForm";

// Auth pages (YOUR PART)
import Register from "./comp/Registration";
import Login from "./comp/Login";

// Landing page components (FRIEND'S PART)
import Herosection from "./comp/index";
import AboutUs from "./comp/About";
import Middle from "./comp/Middle";
import Footer from "./comp/footer";
import Rooms from "./comp/staticroom"
import Small from "./comp/small";
//import Header2 from "./comp/Header2"; 
import OffersHero from "./comp/Offer";
import Events from "./comp/Event";
import AboutPage from "./comp/Aboutpage";
import Contact from "./comp/Contact";
import EXPO from "./comp/expo";
import Services from "./comp/services";


function App() {
  return (
    <Routes>
      {/* ===== Landing Page (Friend's Work) ===== */}
      <Route
        path="/"
        element={
          <>
          <Herosection />
            <AboutUs />
            <Rooms />
            <Middle />
            <Small />
            <Events />
            <OffersHero />
            <Footer />
          </>
        }
      />

      {/* Header link of hero section */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/explore" element={<EXPO />} />
      <Route path="/services" element={<Services />} />
      
      
     <Route
      path="/admin"
       element={
       localStorage.getItem("token")
         ? <Dashboard />
         : <Navigate to="/login" />
        }
      />



       <Route path="/BookingFrompage" element={<Bookformpage />} />
      {/* ====Booking page ===== */}
       <Route path="/bookingpage" element={<Bookingpage />} />

      {/* ===== Auth Pages (Your Work) ===== */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* ===== Safety Redirect ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;



// import './App.css';
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./Admin/admin_dashboard";
// import ManageRoom from "./Admin/Manage_Room";
// import ManageBookings from "./Admin/Manage_Booking";
// import ManageUser from "./Admin/Manage_User";
// import PaymentReports from "./Admin/Payment_Report";
// import DashboardStats from "./Admin/Dash_stats";
// import Dash from './Admin/admin_dashboard';
// function App() {
// return(
//   <BrowserRouter>
//       <Routes>
      
//         <Route path="/" element={<Dash />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/manageroom" element={<ManageRoom />} />
//         <Route path="/managebookings" element={<ManageBookings />} />
//         <Route path="/manageuser" element={<ManageUser />} />
//         <Route path="/paymentreports" element={<PaymentReports />} />
//         <Route path="/dashboardstats" element={<DashboardStats />} />
//       </Routes>
//     </BrowserRouter>

// );
// }

// export default App;
