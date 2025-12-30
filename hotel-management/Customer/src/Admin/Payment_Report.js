import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PaymentReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH SUMMARY ================= */

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/summary?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to load summary");

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load payment summary");
      setSummary(null);
    }
  }, [month, token]);

  /* ================= FETCH TRANSACTIONS ================= */

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/transactions?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    }
  }, [month, token]);

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([fetchSummary(), fetchTransactions()])
      .finally(() => setLoading(false));
  }, [month, fetchSummary, fetchTransactions, token, navigate]);

  /* ================= LOGOUT ================= */

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/manage-room">Manage Room</Link>
        <Link to="/admin/manage-booking">Manage Bookings</Link>
        <Link to="/admin/manage-user">Manage User</Link>
        <Link to="/admin/manage-payment" className="active">
          Payment & Reports
        </Link>
        <Link to="/admin/dashboard-stats">Dashboard Stats</Link>
        <Link to="/admin/manage-staff">Manage Staff</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Payment & Reports</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>Month</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* ===== SUMMARY ===== */}
        {summary && (
          <div className="card">
            <h3 className="card-title">Monthly Summary</h3>

            <div className="form-row">
              <div>
                <p><b>Total Revenue</b></p>
                <h3>₹ {summary.totalRevenue}</h3>
              </div>
              <div>
                <p><b>Paid Amount</b></p>
                <h3 style={{ color: "#16a34a" }}>
                  ₹ {summary.paidAmount}
                </h3>
              </div>
              <div>
                <p><b>Pending Amount</b></p>
                <h3 style={{ color: "#dc2626" }}>
                  ₹ {summary.pendingAmount}
                </h3>
              </div>
              <div>
                <p><b>Total Bookings</b></p>
                <h3>{summary.totalBookings}</h3>
              </div>
            </div>
          </div>
        )}

        {/* ===== TRANSACTIONS ===== */}
        <div className="card">
          <h3 className="card-title">Recent Transactions</h3>

          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Booking</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>{t.firstName} {t.lastName}</td>
                    <td>₹{t.totalAmount}</td>
                    <td>
                      <span
                        className={
                          t.paymentStatus === "Paid"
                            ? "available"
                            : "not-available"
                        }
                      >
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td>{t.bookingStatus}</td>
                    <td>
                      {new Date(t.createdAt).toLocaleDateString()}
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

export default PaymentReports;
