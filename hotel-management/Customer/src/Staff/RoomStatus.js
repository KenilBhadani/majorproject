import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, CheckCircle2, Waves, Brush, ChevronLeft, Search, Filter } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RoomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Authorization guard: Housekeeping and Manager allowed
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };
  if (!['Housekeeping','Manager'].includes(user.role)) {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  const fetchRooms = async () => {
    try {
      // Use aggregated panel endpoint which returns a rooms array
      const res = await fetch(`${API}/api/staff/panel`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch panel');
      const data = await res.json();
      setRooms(Array.isArray(data.rooms) ? data.rooms : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (roomId, newStatus) => {
    try {
      await fetch(`${API}/api/staff/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('staffToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchRooms(); // Refresh the list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500 text-white shadow-emerald-200';
      case 'occupied': return 'bg-rose-500 text-white shadow-rose-200';
      case 'cleaning': return 'bg-amber-500 text-white shadow-amber-200';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/panel" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Room Inventory</h2>
            <p className="text-sm text-slate-500">Manage {rooms.length} total units</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-800">All</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600">Available</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-600">Occupied</button>
           </div>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map(room => {
            const displayStatus = room.roomStatus || room.status;
            return (
            <div key={room._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              {/* Card Header: Room Number & Icon */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Room</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">{room.number || room.title || room._id.slice(-4)}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${getStatusColor(displayStatus)}`}>
                    {displayStatus === 'available' && <CheckCircle2 size={24} />}
                    {displayStatus === 'occupied' && <Bed size={24} />}
                    {displayStatus === 'cleaning' && <Brush size={24} />}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase">
                    {room.roomType || room.type || room.title || '—'}
                  </span>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Set Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <StatusButton 
                      label="Free" 
                      active={displayStatus === 'available'} 
                      onClick={() => updateStatus(room._id, 'available')}
                      activeClass="bg-emerald-50 text-emerald-600 border-emerald-200"
                    />
                    <StatusButton 
                      label="Stay" 
                      active={displayStatus === 'occupied'} 
                      onClick={() => updateStatus(room._id, 'occupied')}
                      activeClass="bg-rose-50 text-rose-600 border-rose-200"
                    />
                    <StatusButton 
                      label="Clean" 
                      active={displayStatus === 'cleaning'} 
                      onClick={() => updateStatus(room._id, 'cleaning')}
                      activeClass="bg-amber-50 text-amber-600 border-amber-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {rooms.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-medium">No rooms found in database.</p>
        </div>
      )}
    </div>
  );
};

// Sub-component for the status toggles
const StatusButton = ({ label, active, onClick, activeClass }) => (
  <button 
    onClick={onClick}
    className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
      active 
      ? activeClass 
      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

export default RoomStatus;