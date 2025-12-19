import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = "http://localhost:5000";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/bookings`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, action) {
    if (!window.confirm(`Confirm ${action}?`)) return;

    await fetch(`${API}/api/admin/bookings/${id}/${action}`, {
      method: "PUT"
    });

    fetchBookings();
  }

  function statusBadge(status) {
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "600",
          background:
            status === "Upcoming"
              ? "#e0e7ff"
              : status === "Checked-in"
              ? "#dcfce7"
              : status === "Checked-out"
              ? "#f3f4f6"
              : "#fee2e2",
          color:
            status === "Upcoming"
              ? "#3730a3"
              : status === "Checked-in"
              ? "#166534"
              : status === "Checked-out"
              ? "#374151"
              : "#991b1b"
        }}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/manageroom">Manage Room</Link>
        <Link to="/managebookings" className="active">
          Manage Bookings
        </Link>
        <Link to="/manageuser">Manage User</Link>
        <Link to="/paymentreports">Payment & Reports</Link>
        <Link to="/dashboardstats">Dashboard Stats</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Manage Bookings</h2>
          <button className="logout-btn">Logout</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="card">
          <h3 className="card-title">Bookings List</h3>

          {loading && <p>Loading bookings...</p>}

          {!loading && bookings.length === 0 && (
            <p>No bookings found</p>
          )}

          {!loading && bookings.length > 0 && (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room Type</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      {b.title} {b.firstName} {b.lastName}
                      <br />
                      <small>{b.mobileNo}</small>
                    </td>

                    <td>{b.roomType}</td>

                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOut).toLocaleDateString()}</td>

                    <td>₹{b.totalAmount}</td>

                    <td>{statusBadge(b.bookingStatus)}</td>

                    <td>
                      {b.bookingStatus === "Upcoming" && (
                        <>
                          <button
                            onClick={() => updateStatus(b._id, "checkin")}
                          >
                            Check-in
                          </button>
                          <button
                            onClick={() => updateStatus(b._id, "cancel")}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {b.bookingStatus === "Checked-in" && (
                        <button
                          onClick={() => updateStatus(b._id, "checkout")}
                        >
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageBookings;
