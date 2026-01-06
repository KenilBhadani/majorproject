import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Hotel, // ✅ Fixed import
} from "lucide-react";

const API_URL = "http://localhost:5000";

/* =========================
   ROOM CARD COMPONENT
========================= */
const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const images = room.images || [];
  const amenities = room.amenities?.map((a) => (typeof a === "string" ? a : a.name)) || [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x300?text=No+Image";
    return imagePath.startsWith("http")
      ? imagePath
      : `${API_URL}/${imagePath.replace(/^\//, "")}`;
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="group relative bg-white rounded-[2rem] p-3 border border-slate-200/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-700 ease-out">
      {/* Visual Canvas */}
      <div className="relative h-64 rounded-[1.6rem] overflow-hidden">
        <img
          src={getImageUrl(images[imageIndex])}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

        {/* Floating Utility Bar */}
        <div className="absolute inset-x-4 top-4 flex justify-between items-center z-10">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-1.5 shadow-xl">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-white">{room.rating || "4.8"}</span>
            </div>
            {room.isPopular && (
              <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30">
                Premium
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isFavorite ? "bg-rose-500 text-white scale-110" : "bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white hover:text-rose-500"}`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
            <button onClick={prevImage} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextImage} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Minimal Progress Bar */}
        <div className="absolute bottom-4 inset-x-12 flex gap-1.5 justify-center">
          {images.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === imageIndex ? "w-8 bg-white" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* Narrative Section */}
      <div className="px-4 py-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors duration-300 mb-1">
              {room.title}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-slate-900 font-extrabold text-2xl block leading-none tracking-tighter">
              ₹{room.pricing?.standardRate?.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              /nightly
            </span>
          </div>
        </div>

        {/* Dynamic Description Fetching */}
        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[3rem]">
          {room.description || "Indulge in a curated sanctuary where architectural elegance meets world-class comfort."}
        </p>

        {/* Curated Amenities */}
        <div className="flex flex-wrap gap-2 mb-6">
          {amenities.slice(0, 3).map((item, index) => (
            <div key={index} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg border border-slate-100 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-indigo-300" /> {item}
            </div>
          ))}
        </div>

        {/* Footer Integration */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
               Verified Stay
             </span>
          </div>

          <button
            onClick={() => navigate("/booking", { state: { selectedRoom: room } })}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-500 shadow-xl shadow-slate-200 active:scale-95 group/btn"
          >
            Reserve Now
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN ROOM LISTING
========================= */
const RoomListing = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/rooms/available");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error("Error fetching rooms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const availableRooms = rooms.filter(r => r.status === "active" && (r.availableCount ?? r.availableRooms) > 0);
  const visibleRooms = availableRooms.slice(0, 3); // only show 3 rooms

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} strokeWidth={1.5} />
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">Curating Experience</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Star size={12} fill="currentColor" /> The Elite Collection
            </div>
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
               Experience the <span className="text-indigo-600 italic">Signature</span> Collection.
            </h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">
              Curated architectural masterpieces designed for those who seek more than just a room.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 border-l border-slate-100 pl-8 hidden md:flex text-right">
             <span className="text-4xl font-bold text-slate-900">{visibleRooms.length.toString().padStart(2, '0')}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suites Available</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleRooms.map((room) => <RoomCard key={room._id} room={room} />)}
        </div>

        {/* Empty State */}
        {availableRooms.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Hotel size={40} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Fully Reserved</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">Our exclusive suites are currently occupied. Please refresh or check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomListing;
