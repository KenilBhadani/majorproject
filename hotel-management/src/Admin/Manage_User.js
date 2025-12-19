import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = "http://localhost:5000";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

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

  async function toggleUserStatus(id, isActive) {
    if (!window.confirm("Change user status?")) return;

    await fetch(`${API}/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive })
    });

    fetchUsers();
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
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/manageroom">Manage Room</Link>
        <Link to="/managebookings">Manage Bookings</Link>
        <Link to="/manageuser" className="active">Manage User</Link>
        <Link to="/paymentreports">Payment & Reports</Link>
        <Link to="/dashboardstats">Dashboard Stats</Link>
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
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
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
                        onClick={() =>
                          toggleUserStatus(user._id, user.isActive)
                        }
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
    </div>
  );
}

export default ManageUser;
