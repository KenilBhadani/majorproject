import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function LoginButton({ isMobile = false, closeMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  /* ✅ Detect login immediately after Google redirect */
  useEffect(() => {
    const check = () => !!(localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('staffToken'));
    setIsLoggedIn(check());
  }, [location.pathname]);

  /* ✅ Multi-tab sync */
  useEffect(() => {
    const check = () => !!(localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('staffToken'));
    const sync = () => setIsLoggedIn(check());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  /* ✅ Close dropdown outside */
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const logout = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/logout`, { credentials: 'include' });
    } catch (e) {
      // ignore network errors
    }
    localStorage.clear();
    setIsLoggedIn(false);
    setOpen(false);
    closeMenu?.();
    navigate("/");
  };

  /* ================= MOBILE ================= */
  if (isMobile) {
    return isLoggedIn ? (
      <button onClick={logout} className="h-mobile-logout-btn">
        Logout
      </button>
    ) : (
      <>
        <p className="h-mobile-label">Login as:</p>
        <div className="h-mobile-options">
          <Link to="/login" onClick={closeMenu}>Customer</Link>
          <Link to="/login/staff" onClick={closeMenu}>Staff</Link>
        </div>
      </>
    );
  }

  /* ================= DESKTOP ================= */
  return (
    <div className="h-nav-actions h-desktop-only" ref={dropdownRef}>
      {isLoggedIn ? (
        <button onClick={logout} className="h-login-btn">
          Logout
        </button>
      ) : (
        <>
          <button onClick={() => setOpen(!open)} className="h-login-btn">
            Login ▾
          </button>
          {open && (
            <div className="h-login-dropdown-menu">
              <Link to="/login" className="h-dropdown-item">Customer Login</Link>
              <Link to="/login/staff" className="h-dropdown-item">Staff Login</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LoginButton;
