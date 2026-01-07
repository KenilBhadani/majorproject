import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../Admin/Manage_Room.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ManageRoom() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const token = localStorage.getItem("token");
  const didFetch = useRef(false);

  // ✅ Form state matches RoomListing.js schema
  const [form, setForm] = useState({
    title: "",
    description: "",
    roomType: "",
    size: "",
    capacity: "",
    bedType: "",
    availableRooms: "",
    amenities: "",
    planName: "",
    inclusions: "",
    depositPolicy: "",
    standardRate: "",
    currency: "INR",
    images: [] // for edit preview (array of paths)
  });

  const MAX_IMAGES = 5;
  const [imageFiles, setImageFiles] = useState([]); // new files selected by admin
  const [previewUrls, setPreviewUrls] = useState([]); // object URLs for previews
  const fileInputRef = useRef(null); // ref to clear file input programmatically

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`${API}/api/admin/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load rooms: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError(err.message || "Failed to load rooms. Please check your connection and try again.");
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

      size: room.size,
      capacity: room.capacity,
      bedType: room.bedType,
      availableRooms: room.availableRooms,
      amenities: room.amenities?.join(", ") || "",
      planName: room.rates?.planName || "",
      inclusions: room.rates?.inclusions?.join(", ") || "",
      depositPolicy: room.rates?.depositPolicy || "",
      standardRate: room.pricing?.standardRate || "",
      currency: room.pricing?.currency || "INR",
      images: room.images || []
    });
    setImageFiles([]);
    setPreviewUrls([]);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setImageFiles([]);
    setPreviewUrls([]);
    setForm({
      title: "",
      description: "",
      roomType: "",

      size: "",
      capacity: "",
      bedType: "",
      availableRooms: "",
      amenities: "",
      planName: "",
      inclusions: "",
      depositPolicy: "",
      standardRate: "",
      currency: "INR",
      images: []
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError("");

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("roomType", form.roomType);
      fd.append("size", form.size);
      fd.append("capacity", form.capacity);
      fd.append("bedType", form.bedType);
      fd.append("availableRooms", form.availableRooms);
      fd.append("amenities", form.amenities);
      fd.append("planName", form.planName);
      fd.append("inclusions", form.inclusions);
      fd.append("depositPolicy", form.depositPolicy);
      fd.append("standardRate", form.standardRate);
      fd.append("currency", form.currency);

      // validate total images count
      const totalImages = (form.images ? form.images.length : 0) + imageFiles.length;
      if (totalImages > MAX_IMAGES) {
        setError(`You can only save up to ${MAX_IMAGES} images per room. Remove ${totalImages - MAX_IMAGES} image(s) and try again.`);
        setSubmitting(false);
        return;
      }

      // append newly selected files
      imageFiles.forEach(file => fd.append("images", file));

      const url = editingId
        ? `${API}/api/admin/rooms/${editingId}`
        : `${API}/api/admin/rooms`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingId ? 'update' : 'create'} room: ${res.status} ${res.statusText}`);
      }

      resetForm();
      setShowForm(false);
      await fetchRooms();
    } catch (err) {
      console.error("Error submitting room:", err);
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} room. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRoom(id) {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    
    try {
      const res = await fetch(`${API}/api/admin/rooms/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete room");
      }

      await fetchRooms();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert(err.message || "Failed to delete room. Please try again.");
    }
  }

  // cleanup object URLs when previews change / component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  async function removeExistingImage(image) {
    if (!editingId) return;
    if (!window.confirm("Remove this image?")) return;
    try {
      const res = await fetch(`${API}/api/admin/rooms/${editingId}/images`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to remove image");
      }

      // update local form images and refetch list
      setForm(prev => ({ ...prev, images: (prev.images || []).filter(i => i !== image) }));
      await fetchRooms();
    } catch (err) {
      console.error("Error removing image:", err);
      setError(err.message || "Failed to remove image");
    }
  }

  function removeSelectedFile(index) {
    const newFiles = [...imageFiles];
    const newPreviews = [...previewUrls];
    // revoke object URL
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);
  }

  // allow multiple picks across separate file-dlg opens (append behavior)
  function handleFileSelect(e) {
    const raw = Array.from(e.target.files || []);
    if (raw.length === 0) return;

    const existingCount = editingId ? (form.images || []).length : 0;
    const remaining = Math.max(0, MAX_IMAGES - existingCount - imageFiles.length);

    if (remaining <= 0) {
      setError(`You already have ${MAX_IMAGES} images. Remove some to add more.`);
      // clear input so the user can re-open it
      if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    if (raw.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining === 1 ? '' : 's'}`);
    } else {
      setError("");
    }

    const toAdd = raw.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    setPreviewUrls(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);

    // clear input so same files can be re-picked later if needed
    if (fileInputRef && fileInputRef.current) fileInputRef.current.value = null;
  }

  const filteredRooms = rooms.filter(room => {
    if (!query) return true;
    const title = room.title || "";
    return title.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      {/* MAIN */}
      <div className="main">
        <div className="top-bar">
          <h2>Manage Rooms</h2>
          <button className="logout-btn">Logout</button>
        </div>

        {error && (
          <div className="error-box" style={{ 
            background: "#fee2e2", 
            color: "#991b1b", 
            padding: "14px 18px", 
            borderRadius: "14px", 
            fontSize: "14px", 
            marginBottom: "26px",
            border: "1px solid #fecaca"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {showForm ? (
          <div className="card">
            <h3 className="card-title">{editingId ? "Update Room" : "Add New Room"}</h3>

            <form className="room-form modern-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Room Title</label>
                  <input name="title" value={form.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Size (sq.m)</label>
                  <input type="number" name="size" value={form.size} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Capacity</label>
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
                </div>
                <div className="form-group">
  <label>Room Type</label>
  <select
    name="roomType"
    value={form.roomType}
    onChange={handleChange}
    required
  >
    <option value="">Select Room Type</option>
    <option value="Single">Single</option>
    <option value="Double">Double</option>
    <option value="Deluxe">Deluxe</option>
    <option value="Suite">Suite</option>
    <option value="Family">Family</option>
  </select>
</div>

                <div className="form-group">
                  <label>Bed Type</label>
                  <input name="bedType" value={form.bedType} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Available Rooms</label>
                  <input type="number" name="availableRooms" value={form.availableRooms} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group full">
                <label>Amenities (comma separated)</label>
                <input name="amenities" value={form.amenities} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rate Plan Name</label>
                  <input name="planName" value={form.planName} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Inclusions (comma separated)</label>
                  <input name="inclusions" value={form.inclusions} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Deposit Policy</label>
                  <input name="depositPolicy" value={form.depositPolicy} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Standard Rate</label>
                  <input type="number" name="standardRate" value={form.standardRate} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <input name="currency" value={form.currency} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group full">
                <label>Room Images</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} />
                <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
                  {`You can add ${Math.max(0, MAX_IMAGES - ((editingId ? (form.images || []).length : 0) + imageFiles.length))} more image${Math.max(0, MAX_IMAGES - ((editingId ? (form.images || []).length : 0) + imageFiles.length)) === 1 ? '' : 's'} (max ${MAX_IMAGES}).`}
                </div>

                {/* Existing images (already uploaded) */}
                {editingId && form.images && form.images.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    {form.images.map((img, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <img src={`${API}/${img}`} alt={`Room ${idx}`} style={{ width: "120px", borderRadius: "8px" }} />
                        <button type="button" onClick={() => removeExistingImage(img)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Previews of newly selected files */}
                {previewUrls && previewUrls.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    {previewUrls.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={url} alt={`Preview ${i}`} style={{ width: "120px", borderRadius: "8px" }} />
                        <button type="button" onClick={() => removeSelectedFile(i)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} />
              </div>

              {error && (
                <div style={{ 
                  background: "#fee2e2", 
                  color: "#991b1b", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  marginBottom: "16px",
                  fontSize: "14px"
                }}>
                  {error}
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="primary-btn"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Processing..." : editingId ? "Update Room" : "Add Room"}
                </button>
                <button 
                  type="button" 
                  className="secondary-btn" 
                  onClick={() => { setShowForm(false); resetForm(); setError(""); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <button className="primary-btn" style={{ marginBottom: "16px" }} onClick={openAddForm}>
              + Add New Room
            </button>

            <div className="card">
              <h3 className="card-title">Rooms List</h3>

              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <input placeholder="Search room by title..." value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={handleSearch}>Search</button>
                <button onClick={clearSearch}>Clear</button>
              </div>

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <p>Loading rooms...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  <p>{query ? `No rooms found matching "${query}"` : "No rooms found. Click 'Add New Room' to create one."}</p>
                </div>
              ) : (
                <table className="room-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Size</th>
                      <th>Capacity</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map(room => (
                      <tr key={room._id}>
                        <td>
                          {room.images?.[0] ? (
                            <img src={`${API}/${room.images[0]}`} alt={room.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }} />
                          ) : (
                            <div style={{ width: "60px", height: "60px", backgroundColor: "#e5e7eb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "12px" }}>
                              No Image
                            </div>
                          )}
                        </td>
                        <td>{room.title || "Untitled Room"}</td>
                        <td>{room.size ? `${room.size} m²` : "N/A"}</td>
                        <td>{room.capacity ? `${room.capacity} Guests` : "N/A"}</td>
                        <td>₹{room.pricing?.standardRate || room.standardRate || "0"}</td>
                        <td>
                          <button 
                            onClick={() => startEdit(room)}
                            style={{ marginRight: "8px", padding: "6px 12px", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteRoom(room._id)}
                            style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
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
