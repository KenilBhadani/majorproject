import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_User.css";

const API = "http://localhost:5000";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // 🔔 Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    setQuery(search);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
  }

  // 👉 Open confirmation modal
  function openConfirm(user) {
    setSelectedUser(user);
    setConfirmOpen(true);
  }

  // ✅ Confirm block / unblock
  async function confirmStatusChange() {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `${API}/api/admin/users/${selectedUser._id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !selectedUser.isActive })
        }
      );

      if (!res.ok) {
        alert("Failed to update status");
        return;
      }

      // 🔄 Update UI immediately
      setUsers(prev =>
        prev.map(u =>
          u._id === selectedUser._id
            ? { ...u, isActive: !selectedUser.isActive }
            : u
        )
      );
    } catch {
      alert("Server error");
    } finally {
      setConfirmOpen(false);
      setSelectedUser(null);
    }
  }

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/ManageRoom">Manage Room</Link>
        <Link to="/admin/ManageBooking">Manage Bookings</Link>
        <Link to="/admin/ManageUser" className="active">Manage User</Link>
        <Link to="/admin/ManagePayment">Payment & Reports</Link>
        <Link to="/admin/DashboardStats">Dashboard Stats</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Manage Users</h2>
          <button className="logout-btn">Logout</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="card">
          <h3 className="card-title">User List</h3>

          {/* SEARCH */}
          <div className="search-bar">
            <input
              placeholder="Search user by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={clearSearch}>Clear</button>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="room-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.mobileNo}</td>
                    <td>
                      <span className={user.isActive ? "available" : "not-available"}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={user.isActive ? "btn-danger" : "btn-success"}
                        onClick={() => openConfirm(user)}
                      >
                        {user.isActive ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      {confirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to{" "}
              <strong>{selectedUser?.isActive ? "block" : "unblock"}</strong>{" "}
              this user?
            </p>

            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className={selectedUser?.isActive ? "btn-danger" : "btn-success"}
                onClick={confirmStatusChange}
              >
                {selectedUser?.isActive ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUser;
