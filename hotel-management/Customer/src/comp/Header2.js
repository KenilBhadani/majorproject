import React from 'react';
import { Link, useLocation } from "react-router-dom";

function Header2() {
  const location = useLocation();

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      
      {/* --- BRAND / LOGO --- */}
      <div className="flex items-center gap-2 ml-4 md:ml-10">
        <span className="text-2xl md:text-3xl">👑</span>
        <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          RoyalPark
        </span>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <ul className="hidden md:flex items-center gap-8 ml-auto mr-8">
        <li>
          <Link 
            to="/" 
            className={`text-lg font-semibold transition-colors duration-300 ${
              isActive('/') ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            to="/rooms" 
            className={`text-lg font-semibold transition-colors duration-300 ${
              isActive('/rooms') ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
            }`}
          >
            Rooms
          </Link>
        </li>
      </ul>

      {/* --- ACTION BUTTON --- */}
      <div className="mr-4 md:mr-10">
        <Link to="/BookingFrompage">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow transition-all duration-300 transform hover:-translate-y-0.5">
            My Booking
          </button>
        </Link>
      </div>

    </nav>
  );
}

export default Header2;