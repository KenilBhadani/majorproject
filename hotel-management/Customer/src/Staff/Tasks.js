import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Brush, 
  Wrench, 
  Clock,
  Plus,
  Trash2
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  // Create Task modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', category: 'Housekeeping', assignedTo: '', roomId: '', location: '', dueDate: '', tags: '' });
  const [staffList, setStaffList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch staff list when the create modal is opened
  useEffect(() => {
    const fetchStaffAndRooms = async () => {
      try {
        const [staffRes, roomsRes] = await Promise.all([
          fetch(`${API}/api/staff/tasks/staff`, { headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` } }),
          fetch(`${API}/api/staff/rooms`, { headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` } })
        ]);
        
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          const list = Array.isArray(staffData) ? staffData : (staffData.staff || []);
          setStaffList(list);
        }

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRoomList(Array.isArray(roomsData) ? roomsData : []);
        }

        // If current user is housekeeping, auto-select them and disable assignment to others
        const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || {};
        if (user.role === 'Housekeeping') {
          setForm(f => ({ ...f, assignedTo: user._id || user.id }));
        }
      } catch (err) {
        console.error('Failed to load staff/rooms list', err);
      }
    };
    if (showCreate) fetchStaffAndRooms();
  }, [showCreate]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API}/api/staff/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : (Array.isArray(data) ? data : (data.tasks || [])));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const markComplete = async (taskId) => {
    try {
      const res = await fetch(`${API}/api/staff/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks(); 
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`${API}/api/staff/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` }
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks(); // Refresh the list
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.priority === filter);

  // Authorization guard: allow only Housekeeping & Receptionist
  const user = JSON.parse(localStorage.getItem('staffUser') || 'null') || { role: '' };
  if (!['Housekeeping','Receptionist'].includes(user.role)) {
    return <div className="p-10 text-center">You are not authorized to view this page.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Operations Tasks</h2>
            <p className="text-sm text-slate-500">{tasks.length} active assignments</p>
          </div>
        </div>

        {user.role !== 'Housekeeping' && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Plus size={18} /> Create Task
          </button>
        )}

        {/* Create Task Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Create Task</h3>
                <button onClick={() => setShowCreate(false)} className="text-sm text-slate-500">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-xs font-bold">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                    <option>Housekeeping</option>
                    <option>Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mt-1 p-2 border rounded-md" rows={3} />
                </div>

                <div>
                  <label className="text-xs font-bold">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold">Assigned To</label>
                  <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full mt-1 p-2 border rounded-md" disabled={user.role === 'Housekeeping'}>
                    {user.role === 'Housekeeping' ? (
                      <>
                        <option value={user._id || user.id}>{user.name} — {user.role}</option>
                      </>
                    ) : (
                      <>
                        <option value="">(Unassigned)</option>
                        {staffList.map(s => (
                          <option key={s._id} value={s._id}>{s.name} — {s.role}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold">Room</label>
                  <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                    <option value="">Select Room (Optional)</option>
                    {roomList.map(room => (
                      <option key={room._id} value={room._id}>{room.title} ({room.roomType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold">Custom Location</label>
                  <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                    <option value="">Select Room ID (Optional)</option>
                    {Object.entries(
                      roomList.reduce((acc, room) => {
                        if (!acc[room.roomType]) acc[room.roomType] = [];
                        acc[room.roomType].push(room);
                        return acc;
                      }, {})
                    ).map(([type, rooms]) => (
                      <optgroup key={type} label={`${type} Rooms`}>
                        {rooms.map(room => (
                          <option key={room._id} value={room._id.slice(-4)}>
                            {room.title} - ID: {room._id.slice(-4)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold">Due Date</label>
                  <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" className="w-full mt-1 p-2 border rounded-md" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
              </div>

              {createError && <div className="text-sm text-red-600 mt-3">{createError}</div>}

              <div className="flex items-center gap-3 justify-end mt-4">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button disabled={creating} onClick={async () => {
                  setCreateError('');
                  if (!form.title.trim()) { setCreateError('Title is required'); return; }
                  setCreating(true);
                  try {
                    const res = await fetch(`${API}/api/staff/tasks`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('staffToken')}` },
                      body: JSON.stringify({ ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to create task');
                    setShowCreate(false);
                    setForm({ title: '', description: '', priority: 'Medium', category: 'Housekeeping', assignedTo: '', roomId: '', location: '', dueDate: '', tags: '' });
                    fetchTasks();
                  } catch (err) {
                    setCreateError(err.message || 'Failed to create');
                  } finally { setCreating(false); }
                }} className="px-4 py-2 rounded-md bg-emerald-600 text-white font-bold">{creating ? 'Creating...' : 'Create Task'}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        {['All', 'High', 'Medium', 'Low'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              filter === type 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Task List Container */}
      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <div key={task._id} className="group bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all border-l-[6px] border-l-transparent"
               style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}>
            
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                task.category === 'Maintenance' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {task.category === 'Maintenance' ? <Wrench size={20} /> : <Brush size={20} />}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800">{task.title}</h3>
                  {task.priority === 'High' && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
                      <AlertCircle size={10} /> Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                     <Clock size={12} className="text-slate-300" /> {task.roomId ? `${task.roomId.title || 'Room'} ${task.roomId.number || task.roomId._id?.slice(-4) || ''}`.trim() : (task.location || 'No location')}
                   </p>
                   <p className="text-xs text-slate-400 flex items-center gap-1 italic">
                     Assigned: {task.assignedTo ? (typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo.name || String(task.assignedTo._id || '—'))) : '—'}
                   </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : task.status === 'In Progress' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                  {task.status}
                </span>
              </div>

              {task.status !== 'Completed' && (() => {
                const assignedId = task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo) : null;
                return assignedId === (user._id || user.id) || user.role === 'Manager';
              })() && (
                <button 
                  onClick={() => markComplete(task._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all w-full md:w-auto justify-center"
                >
                  <CheckCircle2 size={18} />
                  Mark Complete
                </button>
              )}

              {user.role === 'Receptionist' && (
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all w-full md:w-auto justify-center"
                >
                  <Trash2 size={18} />
                  Delete Task
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck size={40} />
             </div>
             <h3 className="text-slate-800 font-bold text-xl">Operational Clear!</h3>
             <p className="text-slate-500 mt-2 max-w-xs mx-auto">No pending {filter.toLowerCase()} priority tasks found for your department.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;