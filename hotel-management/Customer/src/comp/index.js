import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Componentcss/index.css';
import { toast } from 'react-toastify';
import LoginButton from './LoginButton'; // Make sure the path is correct

function Horosection() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    roomType: 'deluxe',
    guests: 1
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Check if logged in before searching
    if (!localStorage.getItem('token')) {
      try {
        sessionStorage.setItem('pendingSearch', JSON.stringify(bookingData));
      } catch (err) {}
      toast.warning('Please login to check availability');
      navigate('/login');
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);

    if (checkInDate >= checkOutDate) {
      toast.error("Check-out date must be after Check-in date"); // <-- replaced alert with toast
      return;
    }

    navigate('/booking', { state: { searchParams: bookingData } });
  };

  return (
    <div className="h-hero-container">
      <header className="h-header">
        {/* ===== NAVBAR ===== */}
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
              <li className="h-nav-item"><Link to="/" onClick={closeMenu}>Home</Link></li>
              <li className="h-nav-item"><Link to="/aboutpage" onClick={closeMenu}>About</Link></li>
              <li className="h-nav-item"><Link to="/services" onClick={closeMenu}>Services</Link></li>
              <li className="h-nav-item"><Link to="/explore" onClick={closeMenu}>Explore</Link></li>
              <li className="h-nav-item"><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
              <li className="h-nav-item"><Link to="/booking" onClick={closeMenu}>Bookings</Link></li>

              {/* MOBILE LOGIN BUTTON */}
              <li className="h-nav-item h-mobile-only">
                <div className="h-mobile-login-section">
                  <LoginButton isMobile={true} closeMenu={closeMenu} />
                </div>
              </li>
            </ul>

            {/* DESKTOP LOGIN BUTTON */}
            <LoginButton isMobile={false} />
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className="h-hero-wrapper">
          <div className="h-hero-text h-fade-in-up">
            <p className="h-hero-tagline">WELCOME TO ROYALPARK</p>
            <h1 className="h-hero-title">
              A Place Where Comfort Feels Like <span className="h-highlight">Home.</span>
            </h1>
            <p className="h-hero-desc">
              Experience luxury accommodation redefined. Enjoy a seamless stay tailored to your needs.
            </p>
          </div>
        </div>

        {/* SEARCH FORM */}
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
