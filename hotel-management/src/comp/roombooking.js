import React, { useMemo, useState } from "react";
import '.'
// Import your images here as you did before
import room1 from "../images/room1.jpg";
import room2 from "../images/room.jpg";
import room3 from "../images/room2.jpg";
import room4 from "../images/room2.jpg";
import room5 from "../images/room1.jpg";
import room6 from "../images/room.jpg";
import room7 from "../images/room.jpg";
import room8 from "../images/room2.jpg";
import room9 from "../images/room1.jpg";
import room10 from "../images/room.jpg";
import "../Componentcss/room.css";

/* --- Icons (Inline SVG) --- */
const IconStar = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const IconWifi = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
);
const IconCoffee = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
);
const IconUsers = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

/* --- Data --- */
const roomsData = [
  { id: 1, title: "Colonial Bungalow with Machaan", image: room1, location: "Heritage Valley", rating: 4.6, price: 250, discountPct: 20, amenities: ["Buffet breakfast", "Wi-Fi", "Housekeeping"] },
  { id: 2, title: "Luxury Suite with Balcony", image: room2, location: "City Center", rating: 4.8, price: 300, discountPct: 0, amenities: ["Breakfast", "High-speed Wi-Fi", "Mini bar"] },
  { id: 3, title: "Ocean View Villa", image: room3, location: "Beachside", rating: 4.9, price: 450, discountPct: 15, amenities: ["Sea view", "Private pool", "Breakfast"] },
  { id: 4, title: "Garden View Cottage", image: room4, location: "Countryside", rating: 4.5, price: 200, discountPct: 0, amenities: ["Garden access", "Breakfast", "Wi-Fi"] },
  { id: 5, title: "Penthouse Suite", image: room5, location: "Downtown", rating: 4.7, price: 500, discountPct: 0, amenities: ["City view", "Private balcony", "Breakfast"] },
  { id: 6, title: "Family Room Deluxe", image: room6, location: "Resort Area", rating: 4.4, price: 350, discountPct: 10, amenities: ["Extra beds", "Breakfast", "Wi-Fi"] },
  { id: 7, title: "Standard Double Room", image: room7, location: "City Center", rating: 4.2, price: 180, discountPct: 0, amenities: ["Wi-Fi", "Breakfast"] },
  { id: 8, title: "Mountain View Cabin", image: room8, location: "Highlands", rating: 4.6, price: 220, discountPct: 0, amenities: ["Hiking access", "Breakfast", "Wi-Fi"] },
  { id: 9, title: "Eco-Friendly Lodge", image: room9, location: "Forest", rating: 4.3, price: 190, discountPct: 5, amenities: ["Sustainable utilities", "Breakfast", "Wi-Fi"] },
  { id: 10, title: "Romantic Suite", image: room10, location: "Seaside", rating: 4.9, price: 400, discountPct: 25, amenities: ["Private balcony", "Sea view", "Breakfast"] },
];

const formatCurrency = (v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function RoomCard({ room }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(diff));
  }, [checkIn, checkOut]);

  const pricePerNight = room.price;
  const discountedPrice = room.discountPct ? Math.round(pricePerNight * (1 - room.discountPct / 100)) : pricePerNight;
  const subtotal = nights > 0 ? nights * discountedPrice : discountedPrice;
  const canBook = checkIn && checkOut && nights > 0 && guests > 0;

  return (
    <article className="room-card">
      {/* --- Image Section --- */}
      <div className="room-image-wrapper">
        {room.discountPct > 0 && <div className="badge-discount">Save {room.discountPct}%</div>}
        <img src={room.image} alt={room.title} loading="lazy" />
        <div className="image-overlay"></div>
      </div>

      {/* --- Details Section --- */}
      <div className="room-details">
        <div className="details-header">
          <div>
            <span className="room-category">{room.location}</span>
            <h3 className="room-title">{room.title}</h3>
          </div>
          <div className="rating-pill">
            <IconStar />
            <span>{room.rating}</span>
          </div>
        </div>

        <div className="room-features">
          <div className="feature">
            <IconWifi /> Free Wifi
          </div>
          <div className="feature">
            <IconCoffee /> Breakfast Included
          </div>
        </div>

        <p className="room-description">
          Experience the ultimate comfort with premium amenities, stunning views, and dedicated service. Perfect for your next getaway.
        </p>

        <div className="amenities-container">
          {room.amenities.map((item, idx) => (
            <span key={idx} className="amenity-tag">{item}</span>
          ))}
        </div>
      </div>

      {/* --- Booking Widget Section --- */}
      <div className="booking-widget">
        <div className="price-display">
          <div className="current-price">
            {formatCurrency(discountedPrice)} <span className="period">/ night</span>
          </div>
          {room.discountPct > 0 && <div className="old-price">{formatCurrency(pricePerNight)}</div>}
        </div>

        <form className="booking-form" onSubmit={(e) => { e.preventDefault(); if(canBook) alert("Booking initiated!"); }}>
          <div className="date-inputs">
            <div className="input-group">
              <label>Check-in</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Check-out</label>
              <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} required />
            </div>
          </div>
          
          <div className="guest-input">
             <label>Guests</label>
             <div className="select-wrapper">
                <IconUsers />
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Guests</option>)}
                </select>
             </div>
          </div>

          <div className="summary-row">
            <span>Total ({nights} nights)</span>
            <strong>{nights > 0 ? formatCurrency(subtotal) : "--"}</strong>
          </div>

          <button type="submit" className="btn-book" disabled={!canBook}>
            {canBook ? "Reserve Now" : "Check Availability"}
          </button>
          
          <p className="cancellation-text">No charge if cancelled today</p>
        </form>
      </div>
    </article>
  );
}

export default function RoomListing() {
  return (
    <div className="page-wrapper">
      <main className="listing-container">
        <div className="page-heading">
          <h1>Find your next stay</h1>
          <p>We have {roomsData.length} properties available for you</p>
        </div>
        <div className="rooms-grid">
          {roomsData.map(room => <RoomCard key={room.id} room={room} />)}
        </div>
      </main>
    
    </div>
  );
}