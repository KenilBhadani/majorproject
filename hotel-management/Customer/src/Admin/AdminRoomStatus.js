import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bed, CheckCircle2, Brush, ChevronLeft, Wrench, Shield, User } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminRoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchRooms();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API}/api/admin/staff`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const allStaff = Array.isArray(data) ? data : data.staff || [];
        setStaffList(allStaff.filter(s => ['Housekeeping', 'Maintenance'].includes(s.role) && s.isActive));
      }
    } catch (err) {
      console.error("Failed to load staff", err);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/staff/rooms/instances`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    if (filter === "All") return rooms;
    if (filter === "Available") return rooms.filter(room => room.status === "FREE");
    if (filter === "Occupied") return rooms.filter(room => room.status === "STAY");
    if (filter === "Cleaning") return rooms.filter(room => room.status === "CLEANING");
    if (filter === "Clean") return rooms.filter(room => room.status === "CLEAN");
    if (filter === "Maintenance") return rooms.filter(room => room.status === "MAINTENANCE");
    if (filter === "Review") return rooms.filter(room => room.status === "REVIEW"); // New filter for admin review
    return rooms;
  }, [rooms, filter]);

  const handleAssign = async () => {
    if (!selectedRoomId || !selectedStaffId) return;

    try {
      const res = await fetch(`${API}/api/staff/rooms/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ roomId: selectedRoomId, staffId: selectedStaffId })
      });

      if (res.ok) {
        alert("Staff assigned successfully!");
        setAssignModalOpen(false);
        setSelectedRoomId(null);
        setSelectedStaffId('');
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || "Assignment failed");
      }
    } catch (err) {
      console.error("Assign error", err);
      alert("Assignment failed");
    }
  };

  const updateStatus = async (roomId, status) => {
    try {
      const res = await fetch(`${API}/api/staff/rooms/instance/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || "Status update failed");
      }
    } catch {
      alert("Status update failed");
    }
  };

  const openAssignModal = (roomId) => {
    setSelectedRoomId(roomId);
    setAssignModalOpen(true);
  };

  const statusBadge = (status) => {
    switch (status) {
      case "FREE": return "bg-emerald-100 text-emerald-700";
      case "STAY": return "bg-rose-100 text-rose-700";
      case "CLEANING": return "bg-amber-100 text-amber-700";
      case "CLEAN": return "bg-blue-100 text-blue-700";
      case "MAINTENANCE": return "bg-orange-100 text-orange-700";
      case "READY": return "bg-green-100 text-green-700";
      case "REVIEW": return "bg-purple-100 text-purple-700"; // Added Review status color
      case "DIRTY": return "bg-slate-200 text-slate-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const statusIcon = (status) => {
    if (status === "FREE") return <CheckCircle2 size={22} />;
    if (status === "STAY") return <Bed size={22} />;
    if (status === "CLEAN" || status === "READY") return <CheckCircle2 size={22} />;
    if (status === "MAINTENANCE") return <Wrench size={22} />;
    if (status === "REVIEW") return <Shield size={22} />; // Added Review icon
    return <Brush size={22} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 relative p-6">
      
      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Assign Staff</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff Member</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <option value="">-- Choose Staff --</option>
                <optgroup label="Housekeeping">
                  {staffList.filter(s => s.role === 'Housekeeping').map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.shift})</option>
                  ))}
                </optgroup>
                <optgroup label="Maintenance">
                  {staffList.filter(s => s.role === 'Maintenance').map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.shift})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold text-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssign}
                disabled={!selectedStaffId}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-slate-200 rounded-full">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Room Status Control</h2>
            <p className="text-sm text-slate-500">
              Manage room availability, maintenance, and staff assignments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-white border rounded-xl p-1 shadow-sm">
          {["All", "Available", "Occupied", "Cleaning", "Maintenance", "Review"].map(f => (
            <Filter key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Rooms</p>
              <h3 className="text-2xl font-black text-slate-800">{rooms.length}</h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Bed size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Needs Attention</p>
              <h3 className="text-2xl font-black text-rose-600">
                {rooms.filter(r => ['DIRTY', 'MAINTENANCE'].includes(r.status)).length}
              </h3>
            </div>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <Wrench size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">In Progress</p>
              <h3 className="text-2xl font-black text-amber-600">
                {rooms.filter(r => r.status === 'CLEANING').length}
              </h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Brush size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Ready for Review</p>
              <h3 className="text-2xl font-black text-purple-600">
                {rooms.filter(r => r.status === 'REVIEW').length}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Shield size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map(room => (
            <div key={room._id} className="bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between h-full">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-bold mb-1">Room</p>
                    <h3 className="text-4xl font-black text-slate-800">
                      {room.roomNumber || room._id.slice(-4)}
                    </h3>
                    <p className="text-xs font-bold uppercase text-slate-500 mt-1">
                      {room.roomListing?.title || room.roomListing?.roomType || "—"}
                    </p>
                  </div>
                  <div className={`flex flex-col items-end gap-2`}>
                    <div className={`p-3 rounded-2xl ${statusBadge(room.status)}`}>
                      {statusIcon(room.status)}
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                   <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-slate-400"/>
                      <span className="text-xs font-bold text-slate-500 uppercase">Assigned Staff</span>
                   </div>
                   {room.assignedTo ? (
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-blue-700">
                         {staffList.find(s => s._id === room.assignedTo)?.name || "Unknown Staff"}
                       </span>
                       <button 
                         onClick={() => openAssignModal(room._id)}
                         className="text-xs text-slate-400 hover:text-blue-600 underline"
                       >
                         Change
                       </button>
                     </div>
                   ) : (
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-slate-400 italic">Unassigned</span>
                       <button 
                         onClick={() => openAssignModal(room._id)}
                         className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase"
                       >
                         + Assign
                       </button>
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                {/* Admin Override Controls */}
                <ActionButton 
                  label="Make Available" 
                  active={room.status === "FREE"} 
                  onClick={() => updateStatus(room._id, "FREE")} 
                  activeClass="bg-emerald-100 text-emerald-700 border-emerald-200"
                />
                <ActionButton 
                  label="Stay" 
                  active={room.status === "STAY"} 
                  onClick={() => updateStatus(room._id, "STAY")} 
                  activeClass="bg-rose-100 text-rose-700 border-rose-200"
                />
                <ActionButton 
                  label="Maint" 
                  active={room.status === "MAINTENANCE"} 
                  onClick={() => updateStatus(room._id, "MAINTENANCE")} 
                  activeClass="bg-orange-100 text-orange-700 border-orange-200"
                />
                <ActionButton 
                  label="Dirty" 
                  active={room.status === "DIRTY"} 
                  onClick={() => updateStatus(room._id, "DIRTY")} 
                  activeClass="bg-slate-200 text-slate-700 border-slate-300"
                />
              </div>

            </div>
          ))}
        </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No rooms match this filter.</p>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ label, active, onClick, activeClass, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg transition border
      ${active ? activeClass : "border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600 bg-white"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    {label}
  </button>
);

const Filter = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition
      ${active ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}
    `}
  >
    {label}
  </button>
);

export default AdminRoomStatus;