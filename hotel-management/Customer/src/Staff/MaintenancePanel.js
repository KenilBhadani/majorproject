// src/Staff/MaintenancePanel.js
import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MaintenancePanel = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Authorization - Maintenance ONLY
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null');
  const isAuthorized = user && user.role === 'Maintenance';

  useEffect(() => {
    if (isAuthorized) {
      fetchRooms();
    } else setLoading(false);
  }, [isAuthorized]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API}/api/staff/rooms/instances`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (!res.ok) throw new Error("Failed to load rooms");
      const data = await res.json();
      
      // ✅ Filter to show only rooms assigned to this user
      const userId = user._id || user.userId || user.id;
      const assignedRooms = Array.isArray(data) ? data.filter(r => r.assignedTo === userId) : [];
      
      setRooms(assignedRooms);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        alert("Room not found");
        return;
      }

      // ✅ VALIDATION: Only Maintenance can update status via this endpoint
      // MAINTENANCE → REVIEW (mark as fixed, needs admin review)
      // ANY → MAINTENANCE (start repair)
      
      const validTransitions = {
        'MAINTENANCE': 'REVIEW'
      };
      
      // Allow starting maintenance from other statuses
      // Allow any transition if we are just starting maintenance (except from STAY)
      if (status === 'MAINTENANCE') {
         if (room.status === 'STAY') {
            alert("Cannot start maintenance on an occupied room");
            return;
         }
         // OK
      } else {
         const isValid = validTransitions[room.status] === status || (room.status === 'MAINTENANCE' && status === 'READY');
         if (!isValid) {
            alert(`Invalid status transition from ${room.status} to ${status}`);
            return;
         }
      }

      const res = await fetch(`${API}/api/staff/rooms/instance/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchRooms(); // Refresh to show updated status
        alert(`Room status updated to ${status}`);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Room status update failed");
      }
    } catch (err) {
      console.error("Room status update error:", err);
      alert("Room status update failed");
    }
  };

  // 🔴 Render unauthorized
  if (!isAuthorized) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Access Denied: Maintenance role required
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Wrench className="text-orange-600" size={24} />
              Maintenance Panel
            </h2>
            <p className="text-sm text-slate-500">Manage room repairs and issues</p>
          </div>
        </div>
        <button
          onClick={fetchRooms}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          title="Refresh rooms"
        >
          <RefreshCw size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Rooms Maintenance Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={20} />
          Assigned Repairs
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map(room => (
              <div key={room._id} className="bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition">

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs uppercase text-slate-400 font-bold">Room</p>
                    <h3 className="text-3xl font-black">
                      {room.roomNumber || room._id.slice(-4)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    room.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' : 
                    room.status === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <Wrench size={22} />
                  </div>
                </div>

                <p className="text-xs font-bold uppercase text-slate-500 mb-4">
                  {room.roomListing?.title || room.roomListing?.roomType || "—"}
                </p>
                
                <div className="mb-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${
                        room.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-700' :
                        room.status === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                        room.status === 'READY' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {room.status}
                    </span>
                </div>

                {room.status === 'MAINTENANCE' ? (
                    <button
                      onClick={() => updateRoomStatus(room._id, "REVIEW")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all"
                    >
                      <CheckCircle2 size={18} />
                      Mark Fixed (Review)
                    </button>
                ) : room.status === 'REVIEW' || room.status === 'READY' ? (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl text-center text-sm font-bold">
                        Waiting for Approval
                    </div>
                ) : (
                    <button
                      onClick={() => updateRoomStatus(room._id, "MAINTENANCE")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all"
                    >
                      <Wrench size={18} />
                      Start Maintenance
                    </button>
                )}
              </div>
            ))}
          </div>
        )}

        {rooms.length === 0 && !loading && (
          <div className="text-center py-16">
            <CheckCircle2 size={48} className="mx-auto text-emerald-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">No assigned tasks!</h3>
            <p className="text-slate-500">You have no assigned maintenance tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePanel;