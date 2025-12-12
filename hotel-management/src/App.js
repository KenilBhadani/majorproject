
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Admin/admin_dashboard";
import ManageRoom from "./Admin/Manage_Room";
import ManageBookings from "./Admin/Manage_Booking";
import ManageUser from "./Admin/Manage_User";
import PaymentReports from "./Admin/Payment_Report";
import DashboardStats from "./Admin/Dash_stats";
import Dash from './Admin/admin_dashboard';
function App() {
return(
  <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Dash />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/manageroom" element={<ManageRoom />} />
        <Route path="/managebookings" element={<ManageBookings />} />
        <Route path="/manageuser" element={<ManageUser />} />
        <Route path="/paymentreports" element={<PaymentReports />} />
        <Route path="/dashboardstats" element={<DashboardStats />} />
      </Routes>
    </BrowserRouter>

);
}

export default App;
