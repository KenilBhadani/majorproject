import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = "http://localhost:5000";

function PaymentReports() {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
    // eslint-disable-next-line
  }, [month]);

  async function fetchSummary() {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/admin/payments/summary?month=${month}`
      );
      const data = await res.json();
      setSummary(data);
      setError("");
    } catch {
      setError("Failed to load payment summary");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/transactions`
      );
      const data = await res.json();
      setTransactions(data);
    } catch {
      setTransactions([]);
    }
  }

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/manageroom">Manage Room</Link>
        <Link to="/managebookings">Manage Bookings</Link>
        <Link to="/manageuser">Manage User</Link>
        <Link to="/paymentreports" className="active">
          Payment & Reports
        </Link>
        <Link to="/dashboardstats">Dashboard Stats</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Payment & Reports</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <label>Month</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
            <button className="logout-btn">Logout</button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* ===== SUMMARY CARDS ===== */}
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
