import { Routes, Route, Navigate } from "react-router-dom";

/* ========== AUTH ========== */
import Register from "./comp/Registration";
import Login from "./comp/Login";
import SLogin from "./Staff/Slogin";

/* ========== LANDING ========== */
import Herosection from "./comp/index";
import AboutUs from "./comp/About";
import Middle from "./comp/Middle";
import Footer from "./comp/footer";
import Rooms from "./comp/staticroom";
import Small from "./comp/small";
import OffersHero from "./comp/Offer";
import LoyaltyHero from "./comp/Offer";
import Events from "./comp/Event";
import AboutPage from "./comp/Aboutpage";
import Contact from "./comp/Contact";
import EXPO from "./comp/expo";
import Services from "./comp/services";
//import Offerpage from "./comp/Offerpage";

/* ========== BOOKING ========== */
import Bookingpage from "./comp/Bookingpage";
import Bookformpage from "./comp/BookForm";

/* ========== ADMIN ========== */
import Dashboard from "./Admin/admin_dashboard";
import ManageBookings from "./Admin/Manage_Booking";
import ManageRoom from "./Admin/Manage_Room";
import ManageUser from "./Admin/Manage_User";
import PaymentReports from "./Admin/Payment_Report";
import DashboardStats from "./Admin/Dash_stats";
     
import ManageStaff from "./Admin/Manage_Staff";

/* ========== STAFF ========== */
import StaffLayout from "./Staff/StaffLayout";
import StaffDashboard from "./Staff/StaffDashboard";
import Bookings from "./Staff/Bookings";
import Guests from "./Staff/Guests";
import RoomStatus from "./Staff/RoomStatus";
import Tasks from "./Staff/Tasks";
import Report from "./Staff/Reports";

/* ========== PROTECTED ROUTES ========== */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StaffRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || user?.role !== "staff") {
    return <Navigate to="/login/staff" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>

      {/* ===== PUBLIC LANDING PAGE ===== */}
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
           <LoyaltyHero/>
            <Footer />
          </>
        }
      />

      <Route path="/contact" element={<Contact />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/explore" element={<EXPO />} />
      <Route path="/services" element={<Services />} />
      {/* <Route path="/offerpage" element={<Offerpage />} /> */}

      {/* ===== BOOKING ===== */}
      <Route path="/bookingpage" element={<Bookingpage />} />
      <Route path="/bookingformpage" element={<Bookformpage />} />

      {/* ===== AUTH ===== */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/staff" element={<SLogin />} />

      {/* ===== ADMIN ROUTES ===== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route path="/admin/manage-booking" element={<ManageBookings />} />
      <Route path="/admin/manage-room" element={<ManageRoom />} />
      <Route path="/admin/manage-user" element={<ManageUser />} />
      <Route path="/admin/manage-payment" element={<PaymentReports />} />
      <Route path="/admin/dashboard-stats" element={<DashboardStats />} />
       <Route path="/admin/manage-staff" element={<ManageStaff />} />


      {/* ===== STAFF ROUTES ===== */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/bookings" element={<Bookings />} />
        <Route path="/staff/guests" element={<Guests />} />
        <Route path="/staff/rooms" element={<RoomStatus />} />
        <Route path="/staff/tasks" element={<Tasks />} />
        <Route path="/staff/reports" element={<Report />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
