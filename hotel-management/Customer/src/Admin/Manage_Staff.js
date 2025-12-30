import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Staff.css";

const API = "http://localhost:5000";

function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Receptionist",
    shift: "Morning",
    password: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    const res = await fetch(`${API}/api/admin/staff`);
    const data = await res.json();
    setStaff(data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch(`${API}/api/admin/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Receptionist",
      shift: "Morning",
      password: ""
    });

    setShowForm(false);
    fetchStaff();
  }

  async function disableStaff(id) {
    if (!window.confirm("Disable staff?")) return;
    await fetch(`${API}/api/admin/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/manage-room">Manage Room</Link>
        <Link to="/admin/manage-booking">Manage Bookings</Link>
        <Link to="/admin/manage-user">Manage User</Link>
        <Link to="/admin/manage-payment">Payment & Reports</Link>
        <Link to="/admin/dashboard-stats">Dashboard Stats</Link>
        <Link to="/admin/manage-staff" className="active">Manage Staff</Link>
      </div>

      <div className="main">
        <div className="top-bar">
          <h2>Manage Staff</h2>
          <button onClick={() => setShowForm(true)}>+ Add Staff</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card">
            <input name="name" placeholder="Name" onChange={handleChange} required />
            <input name="email" placeholder="Email" onChange={handleChange} required />
            <input name="phone" placeholder="Phone" onChange={handleChange} required />
            <input name="password" placeholder="Password" onChange={handleChange} required />

            <select name="role" onChange={handleChange}>
              <option>Receptionist</option>
              <option>Housekeeping</option>
              <option>Maintenance</option>
              <option>Manager</option>
              <option>AdminStaff</option>
            </select>

            <select name="shift" onChange={handleChange}>
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>

            <button type="submit">Create Staff</button>
          </form>
        )}

        <table className="room-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {staff.map(s => (
              <tr key={s._id}>
                <td>{s.staffId}</td>
                <td>{s.name}</td>
                <td>{s.role}</td>
                <td>{s.shift}</td>
                <td>{s.isActive ? "Active" : "Disabled"}</td>
                <td>
                  <button onClick={() => disableStaff(s._id)}>Disable</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default ManageStaff;
