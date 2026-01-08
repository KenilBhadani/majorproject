import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/Manage_Room.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PaymentReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [distribution, setDistribution] = useState(null); // { Paid: x, Pending: y }
  const [distributionBy, setDistributionBy] = useState("amount"); // amount | count
  const [trendSeries, setTrendSeries] = useState([]);
  const [trendDays, setTrendDays] = useState(30);

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

  /* ================= FETCH DISTRIBUTION ================= */
  const fetchDistribution = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/status-distribution?month=${month}&by=${distributionBy}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        setDistribution(null);
        return;
      }

      const d = await res.json();
      setDistribution(d);
    } catch (err) {
      console.error(err);
      setDistribution(null);
    }
  }, [month, distributionBy, token]);

  /* ================= FETCH TRENDS ================= */
  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/payments/trends?days=${trendDays}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        setTrendSeries([]);
        return;
      }

      const data = await res.json();
      // normalize series -> [{ date, total }]
      const series = (data.series || []).map(s => ({ date: s._id, total: s.total }));
      setTrendSeries(series);
    } catch (err) {
      console.error(err);
      setTrendSeries([]);
    }
  }, [trendDays, token]);

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

    Promise.all([fetchSummary(), fetchTransactions(), fetchDistribution(), fetchTrends()])
      .finally(() => setLoading(false));
  }, [month, fetchSummary, fetchTransactions, fetchDistribution, fetchTrends, trendDays, distributionBy, token, navigate]);

  /* ================= VERIFY HANDLER ================= */
  async function handleVerify(id) {
    try {
      const res = await fetch(`${API}/api/admin/payments/verify/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Verify failed');
      alert('Verification completed');
      // refresh data
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions(), fetchDistribution(), fetchTrends()]);
    } catch (err) {
      alert(err.message || 'Verify failed');
    } finally {
      setLoading(false);
    }
  }
  /* ================= LOGOUT ================= */

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      {/* <div className="sidebar">
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
      </div> */}

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
          <h3 className="card-title">Payment Overview</h3>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <div>
              <label>Month</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label>Distribution by</label>
              <select value={distributionBy} onChange={e => setDistributionBy(e.target.value)}>
                <option value="amount">Amount</option>
                <option value="count">Count</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label>Trend</label>
              <button onClick={() => setTrendDays(7)} className={trendDays === 7 ? 'active' : ''}>7d</button>
              <button onClick={() => setTrendDays(30)} className={trendDays === 30 ? 'active' : ''}>30d</button>
              <button onClick={() => setTrendDays(90)} className={trendDays === 90 ? 'active' : ''}>90d</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4 style={{ marginBottom: 8 }}>Status Distribution</h4>

              {distribution ? (
                <ResponsiveContainer width={300} height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(distribution).map(([k, v]) => ({ name: k, value: v }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {Object.keys(distribution).map((k, i) => (
                        <Cell key={k} fill={["#10b981", "#f97316", "#ef4444", "#60a5fa"][i % 4]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No distribution data</p>
              )}
            </div>

            <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <h4 style={{ marginBottom: 8 }}>Revenue Trend ({trendDays} days)</h4>

              {trendSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ReTooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No trend data</p>
              )}
            </div>
          </div>
        </div>

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
                  <th></th>
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
                    <td>
                      {t.paymentStatus !== "Paid" && (
                        <button onClick={() => handleVerify(t._id)}>Verify</button>
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

export default PaymentReports;
