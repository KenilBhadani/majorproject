// ===== REACT & ROUTER =====
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ===== AUTH =====
const Register = lazy(() => import("./comp/Registration"));
const Login = lazy(() => import("./comp/Login"));
const SLogin = lazy(() => import("./Staff/Slogin"));
const OAuthSuccess = lazy(() => import("./comp/OAuthSuccess"));
const ResetPassword = lazy(() => import("./comp/ResetPassword"));

// ===== BOOKING =====
const BookingForm = lazy(() => import("./comp/Bookingcus"));
const RoomBooking = lazy(() => import("./comp/roombooking"));
const Mybooking = lazy(() => import("./comp/Mybookingpage"));

// ===== LANDING =====
const Herosection = lazy(() => import("./comp/index"));
const AboutUs = lazy(() => import("./comp/About"));
const Rooms = lazy(() => import("./comp/staticroom"));
const Middle = lazy(() => import("./comp/Middle"));
const Small = lazy(() => import("./comp/small"));
const Footer = lazy(() => import("./comp/footer"));
const Events = lazy(() => import("./comp/Event"));
const LoyaltyHero = lazy(() => import("./comp/Offer"));
const AboutPage = lazy(() => import("./comp/Aboutpage"));
const Contact = lazy(() => import("./comp/Contact"));
const EXPO = lazy(() => import("./comp/expo"));
const Services = lazy(() => import("./comp/services"));

// ===== ADMIN =====
const Dashboard = lazy(() => import("./Admin/admin_dashboard"));
const DashboardHome = lazy(() =>
  import("./Admin/admin_dashboard").then((module) => ({ default: module.DashboardHome }))
);
const ManageBookings = lazy(() => import("./Admin/Manage_Booking"));
const ManageRoom = lazy(() => import("./Admin/Manage_Room"));
const ManageUser = lazy(() => import("./Admin/Manage_User"));
const PaymentReports = lazy(() => import("./Admin/Payment_Report"));
const DashboardStats = lazy(() => import("./Admin/Dash_stats"));
const AdminStaff = lazy(() => import("./Admin/AdminStaff"));
const AdminRoomStatus = lazy(() => import("./Admin/AdminRoomStatus"));

// ===== STAFF =====
const StaffLayout = lazy(() => import("./Staff/StaffLayout"));
const StaffDashboard = lazy(() => import("./Staff/StaffDashboard"));
const Guests = lazy(() => import("./Staff/Guests"));
const RoomStatus = lazy(() => import("./Staff/RoomStatus"));
const HousekeepingPanel = lazy(() => import("./Staff/HousekeepingPanel"));
const MaintenancePanel = lazy(() => import("./Staff/MaintenancePanel"));
const Tasks = lazy(() => import("./Staff/Tasks"));
const Reports = lazy(() => import("./Staff/Reports"));
const ReceptionistDashboard = lazy(() => import("./Staff/ReceptionistDashboard"));
const BookingManagement = lazy(() => import("./Staff/BookingManagement"));
const CheckInOut = lazy(() => import("./Staff/CheckInOut"));
const NewBooking = lazy(() => import("./Staff/NewBooking"));
const SystemStatus = lazy(() => import("./Staff/SystemStatus"));

// ===== STRIPE =====
const stripePromise = loadStripe(
  "pk_test_51SkMIsFLOpfc1j4ILaTZdWkcAX35xQ8TKC9EG6EA7bOpjgqFfth7ifBBfyE93qC9gWTydziuqABvUgrVQVHPIPk700VHDRWx5M"
);

const AppLoader = () => (
  <div
    style={{
      minHeight: "40vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      color: "#334155",
    }}
  >
    Loading...
  </div>
);

// ===== PROTECTED ROUTES =====

// ===== APP COMPONENT =====
function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Google OAuth login
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: "Google User", role: "user" })
      );

      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  // Restore server-side session (if present) on initial load
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          if (user.role === 'admin') {
            localStorage.setItem('adminUser', JSON.stringify(user));
            localStorage.setItem('adminRole', user.role);
            if (!localStorage.getItem('adminToken')) localStorage.setItem('adminToken', 'session');
          } else {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);
            if (!localStorage.getItem('token')) localStorage.setItem('token', 'session');
          }
        }
      } catch (e) {
        // ignore
      }

      // staff session restore
      if (localStorage.getItem('staffToken') || localStorage.getItem('staffUser')) {
        try {
          const res2 = await fetch(`${process.env.REACT_APP_API_URL}/api/staff/auth/me`, { credentials: 'include' });
          if (res2.ok) {
            const staff = await res2.json();
            localStorage.setItem('staffUser', JSON.stringify(staff));
            if (!localStorage.getItem('staffToken')) localStorage.setItem('staffToken', 'session');
          }
        } catch (e) {}
      }
    })();
  }, []);

  // Prefetch likely-next routes during idle time for smoother navigation.
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    const staffUser = JSON.parse(localStorage.getItem("staffUser") || "null");

    const prefetchPublic = () =>
      Promise.allSettled([
        import("./comp/roombooking"),
        import("./comp/Mybookingpage"),
        import("./comp/Login"),
        import("./comp/Aboutpage"),
        import("./comp/services"),
        import("./comp/Contact"),
      ]);

    const prefetchAdmin = () =>
      Promise.allSettled([
        import("./Admin/admin_dashboard"),
        import("./Admin/Manage_Booking"),
        import("./Admin/Manage_Room"),
      ]);

    const prefetchStaff = () =>
      Promise.allSettled([
        import("./Staff/StaffLayout"),
        import("./Staff/StaffDashboard"),
        import("./Staff/BookingManagement"),
      ]);

    const runPrefetch = () => {
      prefetchPublic();
      if (adminUser?.role === "admin") prefetchAdmin();
      if (staffUser?.role) prefetchStaff();
      if (user?.role === "admin") prefetchAdmin();
    };

    let idleId;
    const timeoutId = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(runPrefetch, { timeout: 2500 });
      } else {
        runPrefetch();
      }
    }, 800);

    return () => {
      clearTimeout(timeoutId);
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

// ===== PROTECTED ROUTES =====
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("adminUser") || localStorage.getItem("user"));

  if ((!token && !user) || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StaffRoute = ({ children }) => {
  const token = localStorage.getItem("staffToken");
  const user = JSON.parse(localStorage.getItem("staffUser") || 'null');

  // Accept any authenticated staff role (Housekeeping / Receptionist / Manager)
  if ((!token && !user) || !user?.role) {
    return <Navigate to="/login/staff" replace />;
  }
  return children;
};

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
      {/* ===== PUBLIC ===== */}
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
            <Elements stripe={stripePromise}>
              <LoyaltyHero />
            </Elements>
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
      <Route path="/bookings" element={<Mybooking />} />
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* ===== ADMIN ===== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="manage-booking" element={<ManageBookings />} />
        <Route path="manage-room" element={<ManageRoom />} />
        <Route path="manage-user" element={<ManageUser />} />
        <Route path="manage-payment" element={<PaymentReports />} />
        <Route path="dashboard-stats" element={<DashboardStats />} />
        <Route path="manage-staff" element={<AdminStaff />} />
        <Route path="room-status" element={<AdminRoomStatus />} />
      </Route>

      {/* ===== STAFF ===== */}
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
        <Route path="panel" element={<StaffDashboard />} />
        <Route path="receptionist" element={<ReceptionistDashboard />} />
        <Route path="system-status" element={<SystemStatus />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="bookings/new" element={<NewBooking />} />
        <Route path="booking-management" element={<BookingManagement />} />
        <Route path="checkinout" element={<CheckInOut />} />
        <Route path="guests" element={<Guests />} />
        <Route path="rooms" element={<RoomStatus />} />
        <Route path="housekeeping" element={<HousekeepingPanel />} />
        <Route path="maintenance" element={<MaintenancePanel />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
