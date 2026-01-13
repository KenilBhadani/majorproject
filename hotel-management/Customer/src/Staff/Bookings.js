import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  ArrowRight 
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  // Action confirmation modal state
  const [actionModal, setActionModal] = useState({ open: false, booking: null, action: '' });

  const openActionModal = (booking, action) => setActionModal({ open: true, booking, action });
  const closeActionModal = () => setActionModal({ open: false, booking: null, action: '' });

  // Inline non-blocking notice (replaces native alerts)
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = 'success', duration = 4000) => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), duration);
  };

  // current logged in staff user (read after hooks to comply with rules-of-hooks)
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };

  // helper to perform status updates (checkin/checkout/cancel) via staff endpoints
  const updateStatus = async (id, action) => {
    setActionInProgress(id);
    try {
      const res = await fetch(`${API}/api/staff/bookings/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (!res.ok) throw new Error((data && data.message) || `Server error (${res.status})`);

      // refresh panel
      const panelRes = await fetch(`${API}/api/staff/panel`, { headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` } });
      if (!panelRes.ok) throw new Error('Failed to refresh');
      const panel = await panelRes.json();
      setBookings(Array.isArray(panel.bookings) ? panel.bookings : []);
      showNotice((data && data.message) || 'Action completed', 'success');
    } catch (err) {
      showNotice(err.message || 'Action failed', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  useEffect(() => {
    const fetchPanel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API}/api/staff/panel`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
        });
        if (!res.ok) throw new Error('Failed to load panel');
        const data = await res.json();
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchPanel();
  }, []);

  // Filter logic (optional UI improvement)
  const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(b => {
    const name = ((b && (b.guestName || `${b.firstName || ''} ${b.lastName || ''}`)) || '').trim();
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Authorization guard: show message if staff role is not allowed
  if (!['Receptionist','Manager'].includes(user.role)) {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {loading && <div className="p-4">Loading bookings...</div>}
      {error && <div className="p-4 text-red-600">{error}</div>}

      {notice && (
        <div className={`max-w-4xl mx-auto p-3 rounded-md ${notice.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {notice.msg}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold">Confirm {actionModal.action === 'checkin' ? 'Check-in' : actionModal.action === 'checkout' ? 'Check-out' : 'Action'}</h3>
            <p className="text-sm text-slate-500 mt-2">You are about to <strong>{actionModal.action}</strong> for:</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-md">
              <p className="font-bold">{actionModal.booking.firstName || actionModal.booking.guestName || 'Guest'}</p>
              <p className="text-xs text-slate-500">Ref: #{String(actionModal.booking._id || '').slice(-6)}</p>
              <p className="text-xs text-slate-500">Stay: {new Date(actionModal.booking.checkIn).toLocaleDateString()} → {new Date(actionModal.booking.checkOut).toLocaleDateString()}</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => closeActionModal()} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={async () => {
                // call the existing updateStatus agent
                await updateStatus(actionModal.booking._id, actionModal.action);
                closeActionModal();
              }} className="px-4 py-2 rounded-md bg-blue-600 text-white font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/panel" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reservations</h2>
            <p className="text-sm text-slate-500">View and manage all guest check-ins</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search guest name..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Bookings Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Guest</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Room</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Stay Dates</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                <th className="p-5 text-[11px] font-black uppercase text-slate-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {(booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`}</p>
                        <p className="text-xs text-slate-500 italic">Reference: #{booking._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                      {booking.roomNumber ? `Room ${booking.roomNumber}` : booking.roomId?.title || booking.roomTitle || '—'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="text-xs">
                        <p className="font-bold">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="opacity-60">{new Date(booking.checkIn).getFullYear()}</p>
                        {booking.actualCheckIn && <p className="text-[11px] text-emerald-600">Checked in: {new Date(booking.actualCheckIn).toLocaleString()}</p>}
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="text-xs">
                        <p className="font-bold">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="opacity-60">{new Date(booking.checkOut).getFullYear()}</p>
                        {booking.actualCheckOut && <p className="text-[11px] text-rose-600">Checked out: {new Date(booking.actualCheckOut).toLocaleString()}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${booking.bookingStatus === 'Checked-in' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : booking.bookingStatus === 'Checked-out' ? 'bg-slate-100 text-slate-700 border border-slate-200' : booking.bookingStatus === 'Cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      {booking.bookingStatus || booking.status || '—'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {/* Actions available to Receptionist / Manager */}
                    {(user.role === 'Receptionist' && ((booking.bookingStatus || booking.status) === 'Upcoming' || (booking.bookingStatus || booking.status) === 'Pending' || (booking.bookingStatus || booking.status) === 'Confirmed')) && (
                      <button disabled={actionInProgress === booking._id} onClick={() => openActionModal(booking, 'checkin')} className="px-3 py-1 mr-2 rounded-lg bg-blue-600 disabled:opacity-60 text-white text-sm font-bold">{actionInProgress === booking._id ? 'Processing...' : 'Check-in'}</button>
                    )}

                    {(user.role === 'Receptionist' && (booking.bookingStatus || booking.status) === 'Checked-in') && (
                      <button disabled={actionInProgress === booking._id} onClick={() => openActionModal(booking, 'checkout')} className="px-3 py-1 mr-2 rounded-lg bg-rose-600 disabled:opacity-60 text-white text-sm font-bold">{actionInProgress === booking._id ? 'Processing...' : 'Check-out'}</button>
                    )}

                    {(['Receptionist','Manager'].includes(user.role)) && (
                      <button onClick={() => updateStatus(booking._id, 'cancel')} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold border">Cancel</button>
                    )}

                    {/* If no privileged actions show a generic menu */}
                    {(!['Receptionist','Manager'].includes(user.role)) && (
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-300" size={32} />
            </div>
            <h3 className="text-slate-800 font-bold">No reservations found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;