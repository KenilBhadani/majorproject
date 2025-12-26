import React, { useState } from 'react';
import '../Componentcss/Mybooking.css'; // Import the external CSS file

// --- Sample Data ---
const SAMPLE_BOOKINGS = [
    {
        id: 1,
        hotelName: "Grand Luxury Palace",
        location: "Mumbai, India",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        checkIn: "2025-12-25",
        checkOut: "2025-12-28",
        guests: "2 Adults, 1 Room",
        price: "₹15,400",
        status: "Confirmed",
        type: "upcoming"
    },
    {
        id: 2,
        hotelName: "Seaside Resort & Spa",
        location: "Goa, India",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        checkIn: "2026-01-10",
        checkOut: "2026-01-15",
        guests: "4 Adults, 2 Rooms",
        price: "₹42,000",
        status: "Pending",
        type: "upcoming"
    },
    {
        id: 3,
        hotelName: "City Business Inn",
        location: "Bangalore, India",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        checkIn: "2024-11-10",
        checkOut: "2024-11-12",
        guests: "1 Adult, 1 Room",
        price: "₹4,500",
        status: "Completed",
        type: "history"
    },
    {
        id: 4,
        hotelName: "Mountain View Cottage",
        location: "Manali, India",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        checkIn: "2024-08-01",
        checkOut: "2024-08-05",
        guests: "2 Adults, 1 Room",
        price: "₹12,000",
        status: "Cancelled",
        type: "history"
    }
];

function Mybooking() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filteredBookings = SAMPLE_BOOKINGS.filter(booking => booking.type === activeTab);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Confirmed': return 'status-confirmed';
            case 'Pending': return 'status-pending';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    return (
        <div className="page-wrapper">
            
            {/* --- 1. HEADER / NAVBAR --- */}
            <header className="app-header">
                <div className="header-container">
                    <div className="logo">
                        <span className="logo-icon">🏨</span>
                        <span className="logo-text">StayEase</span>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <a href="/" className="nav-link">Home</a>
                        <a href="/hotels" className="nav-link">Hotels</a>
                        <a href="/bookings" className="nav-link active">My Bookings</a>
                        <a href="/contact" className="nav-link">Contact</a>
                    </nav>

                    {/* User Profile / Login */}
                    <div className="user-actions">
                        <button className="btn-profile">
                            <span className="user-avatar">JD</span>
                            <span className="user-name">John Doe</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        ☰
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="mobile-nav">
                        <a href="/">Home</a>
                        <a href="/hotels">Hotels</a>
                        <a href="/bookings" className="active">My Bookings</a>
                        <a href="/contact">Contact</a>
                    </div>
                )}
            </header>

            {/* --- 2. MAIN CONTENT SECTION --- */}
            <main className="main-content">
                <div className="mybooking-container">
                    
                    {/* Page Title & Breadcrumbs */}
                    <div className="mybooking-header">
                        <div className="breadcrumbs">Home / My Bookings</div>
                        <h1 className="header-title">My Bookings</h1>
                        <p className="header-subtitle">View and manage your current and past trips.</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button
                            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="bookings-grid">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="booking-card">
                                    <div className="card-image-wrapper">
                                        <img src={booking.image} alt={booking.hotelName} className="card-img" />
                                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="card-content">
                                        <div className="card-info-top">
                                            <h3 className="hotel-name">{booking.hotelName}</h3>
                                            <p className="hotel-location">📍 {booking.location}</p>
                                        </div>

                                        <div className="booking-details">
                                            <div className="detail-row">
                                                <span>Check-in</span>
                                                <span className="detail-value">{booking.checkIn}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span>Check-out</span>
                                                <span className="detail-value">{booking.checkOut}</span>
                                            </div>
                                            <div className="detail-footer">
                                                <span className="guest-info">{booking.guests}</span>
                                                <span className="price-tag">{booking.price}</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button className="btn btn-details">Details</button>
                                            {activeTab === 'upcoming' ? (
                                                <button className="btn btn-primary">Manage</button>
                                            ) : (
                                                <button className="btn btn-dark">Book Again</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <h3>No bookings found</h3>
                                <p>You don't have any {activeTab} bookings.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- 3. FOOTER --- */}
            <footer className="app-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>StayEase</h3>
                        <p>Making your travel dreams a reality with the best hotels across India.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Hotels</a></li>
                            <li><a href="#">Offers</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Cancellation Policy</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p>Email: support@stayease.com</p>
                        <p>Phone: +91 123 456 7890</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 StayEase Hotel Management. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Mybooking;