import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BedDouble, CalendarCheck, 
  Users, ClipboardList, BarChart3, LogOut, Search, Bell, Menu, X 
} from 'lucide-react';

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get dynamic user data from localStorage (support new key `staffUser` and fallback to old `user`)
  const user = JSON.parse(localStorage.getItem('staffUser') || localStorage.getItem('user') || 'null') || { name: 'Staff Member', role: 'Staff' };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/logout`, { credentials: 'include' });
    } catch (e) {
      // ignore
    }
    // Only clear staff related keys to avoid logging out site-wide apps unintentionally
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    navigate('/');
  };

  // Define all possible menu items and attach allowed roles
  const allMenuItems = [
    { path: '/staff/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> , roles: ['Housekeeping','Receptionist','Manager']},
    { path: '/staff/rooms', name: 'Room Status', icon: <BedDouble size={20} />, roles: ['Housekeeping','Manager'] },
    { path: '/staff/bookings', name: 'Bookings', icon: <CalendarCheck size={20} />, roles: ['Receptionist','Manager'] },
    { path: '/staff/guests', name: 'Guests', icon: <Users size={20} />, roles: ['Receptionist','Manager'] },
    { path: '/staff/tasks', name: 'Tasks', icon: <ClipboardList size={20} />, roles: ['Housekeeping','Manager'] },
    { path: '/staff/reports', name: 'Reports', icon: <BarChart3 size={20} />, roles: ['Manager'] },
  ];

  // Filter menu based on the logged-in staff role
  const menuItems = allMenuItems.filter(item => !item.roles || item.roles.includes(user.role));

  const getPageTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.name : 'Staff Portal';
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BedDouble className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight leading-none">LUXE</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Hotel Pro</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold' 
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'group-hover:text-blue-400 text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
                {isActive && (
                   <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Staff User Card */}
        <div className="p-4 mx-4 mb-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-inner">
           <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full"></div>
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-auto p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
          
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 hidden sm:block">{getPageTitle()}</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Real-time Hotel Sync</p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Search Bar - Hidden on small mobile */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-48 ml-2 outline-none text-slate-600 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 lg:pl-6">
              <button className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white group-hover:animate-ping"></span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content Container */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;