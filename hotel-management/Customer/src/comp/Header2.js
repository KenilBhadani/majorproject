import { Link, useLocation } from "react-router-dom";

function Header2() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      
      {/* LOGO */}
      <div className="flex items-center gap-2 ml-4 md:ml-10">
        <span className="text-2xl md:text-3xl">👑</span>
        <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
          RoyalPark
        </span>
      </div>

      {/* LINKS */}
      <ul className="hidden md:flex items-center gap-8 ml-auto mr-8">
        <li>
          <Link
            to="/"
            className={`text-lg font-semibold ${
              isActive("/") ? "text-amber-500" : "text-gray-600 hover:text-amber-500"
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/rooms"
            className={`text-lg font-semibold ${
              isActive("/rooms") ? "text-amber-500" : "text-gray-600 hover:text-amber-500"
            }`}
          >
            Rooms
          </Link>
        </li>
      </ul>

      {/* MY BOOKING */}
      <div className="mr-4 md:mr-10">
        <Link to="/bookings">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow">
            My Booking
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Header2;
