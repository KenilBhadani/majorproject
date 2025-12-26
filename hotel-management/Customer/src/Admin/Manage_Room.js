import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = "http://localhost:5000";

function ManageRoom() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔍 Search
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const didFetch = useRef(false);

  // 🧾 FORM STATE
  const [form, setForm] = useState({
    title: "",
    description: "",
    roomType: "",
    pricePerNight: "",
    capacity: "",
    stock: "",
    amenities: "",
    image: "" // existing image path (for edit)
  });

  // 🖼️ FILE STATE
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/api/admin/rooms`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSearch() {
    setQuery(search);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function startEdit(room) {
    setEditingId(room._id);
    setForm({
      title: room.title,
      description: room.description || "",
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      stock: room.stock,
      amenities: room.amenities?.join(", ") || "",
      image: room.image || ""
    });
    setImageFile(null);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setImageFile(null);
    setForm({
      title: "",
      description: "",
      roomType: "",
      pricePerNight: "",
      capacity: "",
      stock: "",
      amenities: "",
      image: ""
    });
  }

  // 📤 SUBMIT WITH IMAGE
  async function handleSubmit(e) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("roomType", form.roomType);
    fd.append("pricePerNight", form.pricePerNight);
    fd.append("capacity", form.capacity);
    fd.append("stock", form.stock);
    fd.append("amenities", form.amenities);

    if (imageFile) {
      fd.append("image", imageFile);
    }

    const url = editingId
      ? `${API}/api/admin/rooms/${editingId}`
      : `${API}/api/admin/rooms`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: fd
    });

    resetForm();
    setShowForm(false);
    fetchRooms();
  }

  async function deleteRoom(id) {
    if (!window.confirm("Disable this room?")) return;
    await fetch(`${API}/api/admin/rooms/${id}`, { method: "DELETE" });
    fetchRooms();
  }

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h1>Admin Panel</h1>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/ManageRoom" className="active">Manage Room</Link>
        <Link to="/admin/ManageBooking">Manage Bookings</Link>
        <Link to="/admin/ManageUser">Manage User</Link>
        <Link to="/admin/ManagePayment">Payment & Reports</Link>
        <Link to="/admin/DashboardStats">Dashboard Stats</Link>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Manage Rooms</h2>
          <button className="logout-btn">Logout</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* FORM */}
        {showForm ? (
          <div className="card">
            <h3 className="card-title">
              {editingId ? "Update Room" : "Add New Room"}
            </h3>

            <form className="room-form modern-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Room Title</label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Room Type</label>
                  <select name="roomType" value={form.roomType} onChange={handleChange} required>
  <option value="">Select Room Type</option>
  <option value="Single">Single</option>
  <option value="Double">Double</option>
  <option value="Suite">Suite</option>
  <option value="Deluxe">Deluxe</option>
</select>
                  </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price / Night</label>
                  <input type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Amenities</label>
                  <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="AC, WiFi, TV" />
                </div>
              </div>

              {/* IMAGE */}
              <div className="form-group full">
                <label>Room Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                />

                {editingId && form.image && !imageFile && (
                  <img
                    src={`${API}${form.image}`}
                    alt="Room"
                    style={{ width: "120px", marginTop: "10px", borderRadius: "8px" }}
                  />
                )}
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {editingId ? "Update Room" : "Add Room"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <button
              className="primary-btn"
              style={{ marginBottom: "16px" }}
              onClick={openAddForm}
            >
              + Add New Room
            </button>

            <div className="card">
              <h3 className="card-title">Rooms List</h3>

              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <input
                  placeholder="Search room by title..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={clearSearch}>Clear</button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="room-table">
                  <tbody>
                    {filteredRooms.map(room => (
                      <tr key={room._id}>
                        <td>
                          {room.image && (
                            <img
                              src={`${API}${room.image}`}
                              alt=""
                              style={{ width: "60px", borderRadius: "6px" }}
                            />
                          )}
                        </td>
                        <td>{room.title}</td>
                        <td>{room.roomType}</td>
                        <td>₹{room.pricePerNight}</td>
                        <td>
                          <button onClick={() => startEdit(room)}>Edit</button>
                          <button onClick={() => deleteRoom(room._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageRoom;
