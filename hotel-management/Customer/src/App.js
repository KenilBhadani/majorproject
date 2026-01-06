// ===== REACT & ROUTER =====
import { Routes, Route, Navigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ===== AUTH =====
import Register from "./comp/Registration";
import Login from "./comp/Login";
import SLogin from "./Staff/Slogin";

// ===== BOOKING =====
import BookingForm from "./comp/Bookingcus";
import RoomBooking from "./comp/roombooking";

// ===== LANDING =====
import Herosection from "./comp/index";
import AboutUs from "./comp/About";
import Rooms from "./comp/staticroom";
import Middle from "./comp/Middle";
import Small from "./comp/small";
import Footer from "./comp/footer";
import Events from "./comp/Event";
import LoyaltyHero from "./comp/Offer";
import AboutPage from "./comp/Aboutpage";
import Contact from "./comp/Contact";
import EXPO from "./comp/expo";
import Services from "./comp/services";

// ===== ADMIN =====
import Dashboard from "./Admin/admin_dashboard";
import ManageBookings from "./Admin/Manage_Booking";
import ManageRoom from "./Admin/Manage_Room";
import ManageUser from "./Admin/Manage_User";
import PaymentReports from "./Admin/Payment_Report";
import DashboardStats from "./Admin/Dash_stats";
import ManageStaff from "./Admin/Manage_Staff";

// ===== STAFF =====
import StaffLayout from "./Staff/StaffLayout";
import StaffDashboard from "./Staff/StaffDashboard";
import Bookings from "./Staff/Bookings";
import Guests from "./Staff/Guests";
import RoomStatus from "./Staff/RoomStatus";
import Tasks from "./Staff/Tasks";
import Reports from "./Staff/Reports";

// ===== STRIPE =====
const stripePromise = loadStripe("pk_test_51SkMIsFLOpfc1j4ILaTZdWkcAX35xQ8TKC9EG6EA7bOpjgqFfth7ifBBfyE93qC9gWTydziuqABvUgrVQVHPIPk700VHDRWx5M");

// ===== PROTECTED ROUTES =====
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

// ===== APP COMPONENT =====
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
            <LoyaltyHero />
            <Footer />
          </>
        }
      />

      <Route path="/contact" element={<Contact />} />
      <Route path="/aboutpage" element={<AboutPage />} />
      <Route path="/explore" element={<EXPO />} />
      <Route path="/services" element={<Services />} />

      {/* ===== BOOKING ===== */}
      <Route path="/booking" element={<RoomBooking />} />
      <Route
        path="/booking/form"
        element={
          <Elements stripe={stripePromise}>
            <BookingForm />
          </Elements>
        }
      />

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
      >
        <Route path="manage-booking" element={<ManageBookings />} />
        <Route path="manage-room" element={<ManageRoom />} />
        <Route path="manage-user" element={<ManageUser />} />
        <Route path="manage-payment" element={<PaymentReports />} />
        <Route path="dashboard-stats" element={<DashboardStats />} />
        <Route path="manage-staff" element={<ManageStaff />} />
      </Route>

      {/* ===== STAFF ROUTES ===== */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route index element={<StaffDashboard />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="guests" element={<Guests />} />
        <Route path="rooms" element={<RoomStatus />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
