import React, { useState, useCallback , useEffect } from "react";
import { Link } from "react-router-dom";
import "../Admin/admin_dashboard.css";
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, CartesianGrid, XAxis, YAxis } from "recharts";
import { Outlet } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ================= HELPERS ================= */

function getLastNMonths(n = 12) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    months.push({ key, label });
  }
  return months;
}

function sparklineData(days) {
  if (!Array.isArray(days)) return [];
  return days.map((d) => ({ name: d.day, value: d.count }));
}

function buildTrendSeries(trends, days) {
  if (!trends) return [];
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const bookingsMap = (trends.bookings || []).reduce((acc, b) => { acc[b._id] = b.count; return acc; }, {});
  const revenueMap = (trends.revenue || []).reduce((acc, r) => { acc[r._id] = r.total; return acc; }, {});

  const series = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, bookings: bookingsMap[key] || 0, revenue: revenueMap[key] || 0 });
  }
  return series;
}

/* ================= COMPONENT ================= */

export function DashboardHome() {
  
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

  const months = getLastNMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);

  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendDays, setTrendDays] = useState(30);
  const [bookingDistribution, setBookingDistribution] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH OVERVIEW ================= */

  const fetchOverview = useCallback(
    async (month) => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API}/api/admin/overview?month=${month}`,
          {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to load overview");

        const data = await res.json();
        setOverview(data);
      } catch (err) {
        setError(err.message || "Overview fetch failed");
        setOverview(null);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /* ================= FETCH RECENT BOOKINGS ================= */

  const fetchRecentBookings = useCallback(async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/recent-bookings?limit=6`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setRecentBookings([]);
        return;
      }

      const data = await res.json();
      setRecentBookings(data.bookings || []);
    } catch {
      setRecentBookings([]);
    }
  }, [token]);

  /* ================= STATS & TRENDS FETCHERS ================= */

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load stats');
      const d = await res.json();
      setStats(d);
    } catch (err) {
      console.error(err);
      setStats(null);
    }
  }, [token]);

  const fetchTrends = useCallback(async (days = trendDays) => {
    try {
      setLoadingTrends(true);
      const res = await fetch(`${API}/api/admin/trends?days=${days}`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setTrends(null); return; }
      const d = await res.json();
      setTrends(d);
    } catch (err) {
      console.error(err);
      setTrends(null);
    } finally {
      setLoadingTrends(false);
    }
  }, [token]);

  const fetchBookingStatus = useCallback(async (days = trendDays) => {
    try {
      const res = await fetch(`${API}/api/admin/bookings/status-distribution?days=${days}`, { credentials: 'include', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setBookingDistribution(null); return; }
      const d = await res.json();
      setBookingDistribution(d);
    } catch (err) {
      console.error(err);
      setBookingDistribution(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return; // routing will handle redirect

    fetchOverview(selectedMonth);
    fetchRecentBookings();
    fetchStats();
    fetchTrends(trendDays);
    fetchBookingStatus(trendDays);
  }, [selectedMonth, fetchOverview, fetchRecentBookings, fetchStats, fetchTrends, fetchBookingStatus, token, trendDays]);

  /* ================= UI ================= */

  return (
    <>
      <main className="main">
        <header className="top-bar">
          <div>
            <h2>Welcome, Admin 👋</h2>
            <p>Dashboard overview</p>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </header>

        {error && <div className="error-box">{error}</div>}

        {/* KPI CARDS */}
        <div className="cards-grid">
          <div className="kpi-card">
            <h4>Total Bookings</h4>
            <h2>{loading ? "—" : overview?.totalBookings ?? "—"}</h2>

            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={sparklineData(overview?.sparklineBookings)}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-card">
            <h4>Rooms Available</h4>
            <h2>{loading ? "—" : overview?.roomsAvailable ?? "—"}</h2>

            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={sparklineData(overview?.sparklineBookings)}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-card">
            <h4>Monthly Revenue</h4>
            <h2>{loading ? "—" : stats ? `₹${stats.revenueMonth.toLocaleString()}` : "—"}</h2>
          </div>

          <div className="kpi-card">
            <h4>Occupancy</h4>
            <h2>{loading ? "—" : stats ? `${stats.occupancy}%` : "—"}</h2>
          </div>
        </div>

        {/* TRENDS */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Bookings & Revenue Trends</h3>
            <div>
              <button onClick={() => { setTrendDays(7); fetchTrends(7); fetchBookingStatus(7); }} style={{ marginRight: 8 }} className={trendDays === 7 ? 'active' : ''}>7d</button>
              <button onClick={() => { setTrendDays(30); fetchTrends(30); fetchBookingStatus(30); }} style={{ marginRight: 8 }} className={trendDays === 30 ? 'active' : ''}>30d</button>
              <button onClick={() => { setTrendDays(90); fetchTrends(90); fetchBookingStatus(90); }} className={trendDays === 90 ? 'active' : ''}>90d</button>
            </div>
          </div>

          {loadingTrends ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading trends...</div>
          ) : trends ? (
            <div className="charts-row">
              <div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={buildTrendSeries(trends, trendDays)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="bookings" stroke="#6366F1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
                <h4 style={{ marginBottom: 8 }}>Bookings by Status</h4>
                {bookingDistribution ? (
                  <ResponsiveContainer width={300} height={220}>
                    <PieChart>
                      <Pie
                        data={Object.entries(bookingDistribution).map(([k, v]) => ({ name: k, value: v }))}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={40}
                      >
                        {Object.keys(bookingDistribution).map((k, i) => (
                          <Cell key={k} fill={["#10b981", "#60a5fa", "#f97316", "#ef4444"][i % 4]} />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(v) => v.toLocaleString ? v.toLocaleString() : v} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: '#6b7280' }}>No booking status data</p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No trend data</div>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div className="card">
          <h3>Recent Bookings</h3>

          <table className="room-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6">No recent bookings</td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td>{b._id}</td>
                    <td>{b.guestName || "—"}</td>
                    <td>{b.roomType || "—"}</td>
                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td>{b.bookingStatus}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h1>Admin Panel</h1>

        <Link to="/admin" >Dashboard</Link>
        <Link to="/admin/manage-room">Manage Room</Link>
        <Link to="/admin/manage-booking">Manage Bookings</Link>
        <Link to="/admin/manage-user">Manage User</Link>
        <Link to="/admin/manage-payment">Payment & Reports</Link>
        <Link to="/admin/dashboard-stats">Dashboard Stats</Link>
        <Link to="/admin/manage-staff">Manage Staff</Link>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
