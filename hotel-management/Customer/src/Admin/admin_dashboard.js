import React, { useState, useCallback , useEffect } from "react";
import { Link } from "react-router-dom";
import "../Admin/admin_dashboard.css";
import { ResponsiveContainer, LineChart, Line } from "recharts";
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

/* ================= COMPONENT ================= */

export function DashboardHome() {
  
  const token = localStorage.getItem("token");

  const months = getLastNMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);

  const [overview, setOverview] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!token) return; // routing will handle redirect
    fetchOverview(selectedMonth);
    fetchRecentBookings();
  }, [selectedMonth, fetchOverview, fetchRecentBookings, token]);

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

        <Link to="/admin" className="active">Dashboard</Link>
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
