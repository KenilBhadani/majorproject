import React, { useState, useEffect, useRef } from 'react';
import '../Componentcss/index.css'; 
import { Link } from 'react-router-dom';

function Horosection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for the Login Dropdown
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    roomType: 'deluxe',
    guests: 1
  });

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLoginDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleLoginDropdown = (e) => {
    e.preventDefault();
    setIsLoginDropdownOpen(!isLoginDropdownOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching availability for:", bookingData);
  };

  return (
    <div className="h-hero-container">
      <header className="h-header">
        
        <div className="h-nav-container">
          <div className="h-nav-bar">
            <div className="h-navbar-logo">
                <span className="h-logo-icon">👑</span> RoyalPark
            </div>

            <div className="h-hamburger" onClick={toggleMenu}>
              <span className={isMenuOpen ? "h-bar active" : "h-bar"}></span>
              <span className={isMenuOpen ? "h-bar active" : "h-bar"}></span>
              <span className={isMenuOpen ? "h-bar active" : "h-bar"}></span>
            </div>

            <ul className={`h-nav-menu ${isMenuOpen ? "active" : ""}`}>
              <li className="h-nav-item"><Link to="/">Home</Link></li>
              <li className="h-nav-item"><Link to="/aboutpage">About</Link></li>
              <li className="h-nav-item"><Link to="/services">Services</Link></li>
              <li className="h-nav-item"><Link to="/bookingpage">Explore</Link></li>
              <li className="h-nav-item"><Link to="/contact">Contact</Link></li>
              
              {/* Mobile Mobile Dropdown Logic */}
              <li className="h-nav-item h-mobile-only">
                <div className="h-mobile-login-section">
                   <p className="h-mobile-label">Login as:</p>
                   <div className="h-mobile-options">
                      <Link to="/login">Customer</Link>
                      <Link to="/login/staff">Staff</Link>
                   </div>
                </div>
              </li>
            </ul>
            
            {/* ===== UPDATED LOGIN DROPDOWN (Desktop) ===== */}
            <div className="h-nav-actions h-desktop-only" ref={dropdownRef}>
                <button 
                  onClick={toggleLoginDropdown} 
                  className="h-login-btn"
                  aria-haspopup="true"
                  aria-expanded={isLoginDropdownOpen}
                >
                    Login ▾
                </button>
                
                {isLoginDropdownOpen && (
                  <div className="h-login-dropdown-menu">
                    <Link to="/login" className="h-dropdown-item" onClick={() => setIsLoginDropdownOpen(false)}>
                      Customer Login
                    </Link>
                    <Link to="/login/staff" className="h-dropdown-item" onClick={() => setIsLoginDropdownOpen(false)}>
                      Staff Login
                    </Link>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ... Rest of your Hero Content and Search Form ... */}
        <div className="h-hero-wrapper">
          <div className="h-hero-text h-fade-in-up">
            <p className="h-hero-tagline">WELCOME TO ROYALPARK</p>
            <h1 className="h-hero-title">
              A Place Where Comfort Feels Like <span className="h-highlight">Home.</span>
            </h1>
            <p className="h-hero-desc">
              Experience luxury accommodation redefined. Whether you're travelling for business or leisure, enjoy a seamless stay tailored to your needs.
            </p>
          </div>
        </div>

        <div className="h-booking-container h-fade-in-up h-delay-200">
            <form className="h-booking-form" onSubmit={handleSearch}>
                <div className="h-input-group">
                    <label htmlFor="checkIn">Check In</label>
                    <input type="date" id="checkIn" name="checkIn" value={bookingData.checkIn} onChange={handleInputChange} required />
                </div>
                <div className="h-input-group">
                    <label htmlFor="checkOut">Check Out</label>
                    <input type="date" id="checkOut" name="checkOut" value={bookingData.checkOut} onChange={handleInputChange} required />
                </div>
                <div className="h-input-group">
                    <label htmlFor="roomType">Room Type</label>
                    <select id="roomType" name="roomType" value={bookingData.roomType} onChange={handleInputChange}>
                        <option value="deluxe">Deluxe Room</option>
                        <option value="suite">Royal Suite</option>
                        <option value="family">Family Room</option>
                        <option value="standard">Standard Room</option>
                    </select>
                </div>
                <div className="h-input-group h-small-group">
                    <label htmlFor="guests">Members</label>
                    <input type="number" id="guests" name="guests" min="1" max="10" value={bookingData.guests} onChange={handleInputChange} />
                </div>
                <button type="submit" className="h-search-btn">Check Availability</button>
            </form>
        </div>
      </header>
    </div>
  );
}

export default Horosection;