import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error loading bookings");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, action) {
    if (!window.confirm(`Confirm ${action}?`)) return;

    try {
      const res = await fetch(
        `${API}/api/admin/bookings/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Action failed");
      }

      fetchBookings();
    } catch (err) {
      alert(err.message || "Update failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function statusBadge(status) {
    const styles = {
      Upcoming: { bg: "#e0e7ff", color: "#3730a3" },
      "Checked-in": { bg: "#dcfce7", color: "#166534" },
      "Checked-out": { bg: "#f3f4f6", color: "#374151" },
      Cancelled: { bg: "#fee2e2", color: "#991b1b" }
    };

    const s = styles[status] || styles.Cancelled;

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 600,
          background: s.bg,
          color: s.color
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
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/ManageRoom">Manage Room</Link>
        <Link to="/admin/ManageBooking" className="active">
          Manage Bookings
        </Link>
        <Link to="/admin/ManageUser">Manage User</Link>
        <Link to="/admin/ManagePayment">Payment & Reports</Link>
        <Link to="/admin/DashboardStats">Dashboard Stats</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Manage Bookings</h2>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="card">
          <h3 className="card-title">Bookings List</h3>

          {loading && <p>Loading bookings...</p>}
          {!loading && bookings.length === 0 && <p>No bookings found</p>}

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
                      {b.firstName} {b.lastName}
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
