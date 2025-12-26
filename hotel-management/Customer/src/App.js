import { Routes, Route, Navigate } from "react-router-dom";

// Admin Dashboard components (YOUR PART)
import ManageBookings from "./Admin/Manage_Booking";
import Dashboard from "./Admin/admin_dashboard";
import ManageRoom from "./Admin/Manage_Room";
import ManageUser from "./Admin/Manage_User";
import PaymentReports from "./Admin/Payment_Report";
import DashboardStats from "./Admin/Dash_stats";

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
import { MdAirlineSeatLegroomExtra } from "react-icons/md";


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

      {/* Adminside routes */}
     {/* <Route
      path="/admin"
       element={
       localStorage.getItem("token")
         ? <Dashboard />
         : <Navigate to="/login" />
        }
      /> */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/Managebooking" element={<ManageBookings />} />
      <Route path="/admin/ManageRoom" element ={<ManageRoom />} />
      <Route path="/admin/ManageUser" element ={<ManageUser />} />
      <Route path="/admin/ManagePayment" element ={<PaymentReports />} />
      <Route path="/admin/DashboardStats" element ={<DashboardStats />} />


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