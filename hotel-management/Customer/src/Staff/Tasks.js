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
  Plus
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/staff/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const markComplete = async (taskId) => {
    try {
      await fetch(`/api/staff/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTasks(); 
    } catch (err) {
      alert("Failed to update task");
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.priority === filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/staff/panel" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Operations Tasks</h2>
            <p className="text-sm text-slate-500">{tasks.length} active assignments</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
          <Plus size={18} /> Create Task
        </button>
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
                     <Clock size={12} className="text-slate-300" /> Room {task.location}
                   </p>
                   <p className="text-xs text-slate-400 flex items-center gap-1 italic">
                     Assigned: {task.assignedTo}
                   </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => markComplete(task._id)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all w-full md:w-auto justify-center"
            >
              <CheckCircle2 size={18} />
              Mark Complete
            </button>
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