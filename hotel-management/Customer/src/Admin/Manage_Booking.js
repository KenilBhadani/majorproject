import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const listRef = useRef(null);

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

  // debounced live search (300ms)
  useEffect(() => {
    const id = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  function handleSearch() {
    setQuery(search);
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function clearSearch() {
    setSearch('');
    setQuery('');
  }

  function highlight(text = "", q = "") {
    if (!q) return text;
    const idx = (text || "").toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <span style={{ background: '#fde68a', padding: '0 4px', borderRadius: 4 }}>{match}</span>
        {after}
      </>
    );
  }

  const filteredBookings = bookings.filter(b => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return true;
    const fullName = `${b.firstName || ''} ${b.lastName || ''}`;
    return (
      fullName.toLowerCase().includes(q) ||
      (b.mobileNo || '').toLowerCase().includes(q) ||
      (b.roomId?.roomType || '').toLowerCase().includes(q) ||
      (b.roomTitle || '').toLowerCase().includes(q) ||
      (b.bookingStatus || '').toLowerCase().includes(q) ||
      (b.paymentStatus || '').toLowerCase().includes(q)
    );
  });

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

          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }} ref={listRef}>
            <div className="search-wrapper">
              <span className="search-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#9CAAF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>

              <input
                className="search-input"
                placeholder="Search guest, phone, room type, status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />

              {search && (
                <button
                  className="clear-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button onClick={handleSearch} className="secondary-btn">Search</button>
            <button onClick={clearSearch} className="secondary-btn">Clear</button>

            <div style={{ marginLeft: 8, color: '#6b7280' }}>{filteredBookings.length} result{filteredBookings.length !== 1 ? 's' : ''}</div>
          </div>

          {loading ? (
            <p>Loading bookings...</p>
          ) : filteredBookings.length === 0 ? (
            <p>{query ? `No bookings found matching "${query}"` : "No bookings found"}</p>
          ) : (
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
                {filteredBookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      {highlight(`${b.firstName || ''} ${b.lastName || ''}`, query)}
                      <br />
                      <small>{b.mobileNo}</small>
                    </td>

                    <td>{highlight(b.roomId?.roomType || b.roomTitle || '—', query)}</td>
                    <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td>
                      {(() => {
                        const amt = b.totalAmount ?? b.amount ?? null;
                        return amt ? `₹${Number(amt).toLocaleString('en-IN')}` : '—';
                      })()}
                      {b.paymentStatus && (
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{b.paymentStatus}</div>
                      )}
                    </td>
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
