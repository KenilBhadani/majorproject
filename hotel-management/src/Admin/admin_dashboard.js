import React, { useEffect, useState } from 'react';
import '../Admin/admin_dashboard.css';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

function getLastNMonths(n = 12) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; // "YYYY-MM"
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    months.push({ key, label });
  }
  return months;
}

export default function Dash() {
  const months = getLastNMonths(12);
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);
  const [overview, setOverview] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch overview data from backend
  async function fetchOverview(month) {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token'); // adjust to your auth
      const res = await fetch(`/api/admin/overview?month=${month}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch overview');
      setOverview(json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  // Fetch a small recent bookings list (server should provide /api/admin/recent-bookings)
  async function fetchRecentBookings() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/recent-bookings?limit=6', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch bookings');
      setRecentBookings(json.bookings || json || []);
    } catch (err) {
      // fallback: leave empty
      console.warn('recent bookings fetch failed', err);
      setRecentBookings([]);
    }
  }

  useEffect(() => {
    fetchOverview(selectedMonth);
    fetchRecentBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  function sparklineDataFromDays(daysArray) {
    // backend returns [{day: "YYYY-MM-DD", count: N}, ...]
    if (!Array.isArray(daysArray)) return [];
    return daysArray.map(d => ({ name: d.day, value: d.count }));
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className="admin-container">
      <aside className="sidebar" aria-label="Admin navigation">
        <div className="sidebar-header">
          <h1 className="brand">Admin Panel</h1>
          <p className="brand-sub">Manager Dashboard</p>
        </div>

        <nav className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manageroom" className="nav-link">Manage Room</Link>
          <Link to="/managebookings" className="nav-link">Manage Bookings</Link>
          <Link to="/manageuser" className="nav-link">Manage User</Link>
          <Link to="/paymentreports" className="nav-link">Payment &amp; Reports</Link>
          <Link to="/dashboardstats" className="nav-link">Dashboard Stats</Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main">
        <header className="top-bar">
          <div>
            <h2 className="welcome">Welcome, Admin 👋</h2>
            <p className="welcome-sub">Have a productive day.</p>
          </div>

          <div className="top-actions">
            <label className="month-label">Select month</label>
            <select
              className="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
        </header>

        <section className="content">
          {error && <div className="error-box">Error: {error}</div>}

          <div className="cards-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-title">Total Booking</div>
                  <div className="kpi-value">{loading ? '—' : (overview ? overview.totalBookings.toLocaleString() : '—')}</div>
                </div>
                <div className={`kpi-percent ${overview && overview.percentChangeMonth >= 0 ? 'up' : 'down'}`}>
                  {overview ? (overview.percentChangeMonth >= 0 ? '+' : '') + overview.percentChangeMonth + '%' : ''}
                </div>
              </div>

              <div className="kpi-subrow">
                <div>
                  <div className="kpi-subtitle">THIS MONTH</div>
                  <div className="kpi-subvalue">{overview ? overview.bookingsThisMonth : '—'}</div>
                </div>
                <div>
                  <div className="kpi-subtitle">THIS WEEK</div>
                  <div className="kpi-subvalue">{overview ? overview.bookedItemsThisWeek : '—'}</div>
                </div>
              </div>

              <div className="kpi-spark">
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={sparklineDataFromDays(overview ? overview.sparklineBookings : [])}>
                    <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-title">Rooms Available</div>
                  <div className="kpi-value">{loading ? '—' : (overview ? overview.roomsAvailable : '—')}</div>
                </div>
                <div className="kpi-empty" />
              </div>

              <div className="kpi-subrow">
                <div>
                  <div className="kpi-subtitle">BOOKED (M)</div>
                  <div className="kpi-subvalue">{overview ? overview.bookedItemsThisMonth : '—'}</div>
                </div>
                <div>
                  <div className="kpi-subtitle">BOOKED (W)</div>
                  <div className="kpi-subvalue">{overview ? overview.bookedItemsThisWeek : '—'}</div>
                </div>
              </div>

              <div className="kpi-spark">
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={sparklineDataFromDays(overview ? overview.sparklineBookings : [])}>
                    <Line type="monotone" dataKey="value" stroke="#60A5FA" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="recent-section">
            <h3>Recent Bookings</h3>
            <div className="table-wrap">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr><td colSpan="6" className="muted">No recent bookings</td></tr>
                  ) : recentBookings.map(b => (
                    <tr key={b._id || b.id}>
                      <td>{b._id ?? b.id}</td>
                      <td>{b.guestName ?? b.guest ?? (b.userIdName || '—')}</td>
                      <td>{b.roomName ?? b.room ?? b.roomType ?? '—'}</td>
                      <td>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '—'}</td>
                      <td>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : '—'}</td>
                      <td><span className={`status-pill ${b.status === 'Checked-in' ? 'green' : b.status === 'Upcoming' ? 'yellow' : b.status === 'Cancelled' ? 'red' : ''}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
