import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BedDouble, 
  CalendarCheck, 
  Users, 
  ClipboardList, 
  ChevronLeft,
  Clock,
  LayoutGrid
} from 'lucide-react';

const StaffDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Available', value: '12', icon: <BedDouble size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Check-ins', value: '08', icon: <CalendarCheck size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Guests', value: '45', icon: <Users size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Tasks', value: '03', icon: <ClipboardList size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          {/* THE BUTTON TO GO BACK TO PANEL */}
          <Link 
            to="/staff/panel" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold text-sm group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Panel
          </Link>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-800">Main Dashboard</h1>
          </div>
        </div>

        {/* Live Clock Widget */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-md">
          <Clock size={18} className="text-blue-400" />
          <span className="text-sm font-mono font-medium tracking-wider">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Welcome back, {user?.name || 'Staff'}!</h2>
          <p className="text-blue-100 mt-2 max-w-md">
            The hotel is currently at 82% occupancy. You have 3 urgent maintenance tasks pending for this shift.
          </p>
        </div>
        {/* Decorative Background Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MenuCard 
          to="/staff/rooms" 
          title="Room Management" 
          desc="Monitor room cleaning, occupancy, and status." 
          icon={<BedDouble size={32} />}
          color="blue"
        />
        <MenuCard 
          to="/staff/bookings" 
          title="Reservation Desk" 
          desc="Manage guest check-ins, check-outs, and new bookings." 
          icon={<LayoutGrid size={32} />}
          color="indigo"
        />
      </div>
    </div>
  );
};

// Reusable Menu Card Component
const MenuCard = ({ to, title, desc, icon, color }) => (
  <Link to={to} className="group p-1 bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-2xl transition-all duration-300">
    <div className="bg-white p-6 rounded-[14px] h-full transition-all group-hover:bg-white/90">
      <div className={`mb-4 text-${color}-600`}>{icon}</div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm mt-2">{desc}</p>
    </div>
  </Link>
);

export default StaffDashboard;