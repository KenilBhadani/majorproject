import React, { useMemo, useState, useEffect } from "react";
// Import a fallback image in case a room has no images uploaded
import placeholderImg from "../uploads/1766486263847-107437298.png";

/* --- Configuration --- */
// Change this URL if your backend runs on a different port or route
const API_URL = "http://localhost:5000/api/rooms"; 

/* --- Icons (Unchanged) --- */
const IconStar = () => (
  <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const IconWifi = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
);
const IconCoffee = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const formatCurrency = (v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/* --- Room Card Component --- */
function RoomCard({ room }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // --- DATA MAPPING (DB Schema -> UI) ---
  // 1. Image: Use first image from DB array, or fallback
  const imageSrc = (room.images && room.images.length > 0) ? room.images[0] : placeholderImg;
  
  // 2. Title & Type
  const title = room.title;
  const category = room.roomType || "Deluxe"; // Mapped from 'roomType' in schema

  // 3. Price (Mapped from 'pricePerNight' in schema)
  const price = room.pricePerNight;
  
  // 4. Rating (Not in schema, defaulting to 4.5 for UI)
  const rating = 4.5; 

  // 5. Amenities
  const amenitiesList = room.amenities || [];

  // --- BOOKING LOGIC ---
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(diff));
  }, [checkIn, checkOut]);

  const subtotal = nights > 0 ? nights * price : price;
  
  // Check capacity from DB schema
  const maxCapacity = room.capacity || 4;
  const canBook = checkIn && checkOut && nights > 0 && guests <= maxCapacity;

  return (
    <article className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      
      {/* --- Image Section --- */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          // If image URL from DB is broken, replace with placeholder
          onError={(e) => {e.target.src = placeholderImg}} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
        
        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
           <IconStar />
           <span className="text-sm font-bold text-slate-800">{rating}</span>
        </div>
        
        {/* Location / Room Type Badge */}
        <div className="absolute bottom-4 left-4 text-white">
            <p className="text-xs font-medium opacity-90 uppercase tracking-wider">{category}</p>
        </div>
      </div>

      {/* --- Details Section --- */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{title}</h3>
        
        {/* Description from DB (truncated) */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {amenitiesList.slice(0, 3).map((item, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
              {item}
            </span>
          ))}
          {amenitiesList.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{amenitiesList.length - 3} more</span>}
        </div>

        {/* Price Display */}
        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
           <div>
              <p className="text-xs text-gray-400 mb-1">Price per night</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{formatCurrency(price)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- Booking Widget --- */}
      <div className="bg-slate-50 p-5 border-t border-gray-100">
        <form onSubmit={(e) => { e.preventDefault(); if(canBook) alert(`Booking Initiated for: ${title}`); }}>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Check-in</label>
              <input 
                type="date" 
                className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Check-out</label>
              <input 
                type="date" 
                className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} required 
              />
            </div>
          </div>
          
          <div className="mb-4">
             <div className="relative">
                <IconUsers />
                <select 
                  className="w-full text-sm pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white appearance-none cursor-pointer"
                  value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {[...Array(maxCapacity).keys()].map(n => (
                    <option key={n + 1} value={n + 1}>{n + 1} Guests</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-600 font-medium">Total ({nights} nights)</span>
            <span className="font-bold text-amber-600 text-lg">{nights > 0 ? formatCurrency(subtotal) : "--"}</span>
          </div>

          <button 
            type="submit" 
            disabled={!canBook}
            className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-300 
              ${canBook ? "bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            {canBook ? "Reserve Now" : "Check Availability"}
          </button>
        </form>
      </div>
    </article>
  );
}

/* --- Main Room Listing Component --- */
export default function RoomListing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH DATA FROM DATABASE ---
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // Using the URL defined at the top
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error('Failed to connect to the server');
        }

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Could not load rooms. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Find Your Next <span className="text-amber-500 italic">Stay</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {!loading && !error && `Explore our curated collection of ${rooms.length} premium properties available for your dates.`}
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500 mb-4"></div>
            <p className="text-gray-500">Loading properties...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 text-center text-red-700 rounded-r-lg max-w-2xl mx-auto">
            <p className="font-bold text-lg mb-2">Unable to Load Rooms</p>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
            <p className="text-2xl font-serif text-slate-900 mb-2">No Rooms Found</p>
            <p className="text-gray-500">There are currently no active room listings available.</p>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {rooms.map((room) => (
            // Using MongoDB _id as the unique key
            <RoomCard key={room._id} room={room} />
          ))}
        </div>

      </main>
    </div>
  );
}