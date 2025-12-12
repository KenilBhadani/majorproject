import React from 'react';
import {Link } from "react-router-dom";
import '../Admin/navbar.css';
 function ManageRoom() {         // <- named export
  return(
        <div className="admin-container">
        <div className="sidebar">
           <h1>Admin Panel</h1>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/manageroom">Manage Room</Link>
            <Link to="/managebookings">Manage Bookings</Link>
            <Link to="/manageuser">Manage User</Link>
            <Link to="/paymentreports">Payment & Reports</Link>
            <Link to="/dashboardstats">Dashboard Stats</Link>
        </div>
        <div className="main">
          <div class="top-bar">
            <h2>Welcome, Admin 👋</h2>
            <button class="logout-btn">Logout</button>
        </div>

        </div>
        
     </div>
  ) ;
}
export default ManageRoom;
