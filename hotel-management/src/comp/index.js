import React, { useState } from 'react';
import '../Componentcss/index.css';
import { Link } from 'react-router-dom';

function Horosection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <header className="header">
        {/* ===== NAVBAR (Unchanged from previous version) ===== */}
        <div className="nav-container">
          <div className="nav-bar">
            <div className="navbarlogo">RoyalPark</div>

            <div className="hamburger" onClick={toggleMenu}>
              <span className={isMenuOpen ? "bar active" : "bar"}></span>
              <span className={isMenuOpen ? "bar active" : "bar"}></span>
              <span className={isMenuOpen ? "bar active" : "bar"}></span>
            </div>

            <ul className={`header-ul ${isMenuOpen ? "active" : ""}`}>
              <li className="headerlabel">Home</li>
              <li className="headerlabel">About</li>
              <li className="headerlabel">Services</li>
              <li className="headerlabel">Explore</li>
              <li className="headerlabel">Contact</li>
              <li className="headerlabel">
                <Link to="/login" className="headerlink">Login</Link>
              </li>
            </ul>
             {/* Optional: Hide this top button on desktop since we added big ones below */}
            <button className="headerbtn desktop-only">Book Now</button>
          </div>
        </div>

        {/* ===== IMPROVED HERO SECTION ===== */}
        <div className="hero-content-wrapper">
            <div className="herosection fade-in-up">
            {/* 1. Changed firstp to a tagline style */}
            <p className="hero-tagline">WELCOME TO ROYALPARK</p>

            {/* 2. Main Headline */}
            <h1 className="hero-title">
                A Place Where Comfort Feels Like <span className="Herop">Home.</span>
            </h1>

            {/* 3. New Description Paragraph */}
            <p className="hero-description">
                Experience luxury accommodation redefined. Whether you're travelling for business or leisure, enjoy a seamless stay tailored to your needs in the heart of the city.
            </p>

            {/* 4. New CTA Buttons */}
            <div className="hero-btns">
                <button className="btn-primary">Book Your Stay</button>
                <button className="btn-secondary">Take A Tour</button>
            </div>
            </div>
        </div>
      </header>
    </div>
  );
}

export default Horosection;