import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Hotel,
} from "lucide-react";

const API_URL = "http://localhost:5000";

/* =========================
   ROOM CARD COMPONENT
========================= */
const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);

  const images = room.images || [];
  const amenities =
    room.amenities?.map((a) => (typeof a === "string" ? a : a.name)) || [];

  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/400x300?text=No+Image";
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
      {/* IMAGE SECTION */}
      <div className="relative aspect-[4/3] rounded-[1.6rem] overflow-hidden">
        <img
          src={getImageUrl(images[imageIndex])}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />

        {/* TOP BADGES */}
        <div className="absolute inset-x-4 top-4 flex justify-between items-center z-10">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-1.5 shadow-xl">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-white">
                {room.rating || "4.8"}
              </span>
            </div>

            {room.isPopular && (
              <div className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/30">
                Premium
              </div>
            )}
          </div>
        </div>

        {/* IMAGE CONTROLS */}
        {images.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
            <button
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-lg text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* IMAGE PROGRESS */}
        <div className="absolute bottom-4 inset-x-12 flex gap-1.5 justify-center">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === imageIndex ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors duration-300">
            {room.title}
          </h3>

          <div className="text-right">
            <span className="text-slate-900 font-extrabold text-2xl block">
              ₹{room.pricing?.standardRate?.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              /night
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[3rem]">
          {room.description ||
            "Indulge in a curated sanctuary where elegance meets comfort."}
        </p>

        {/* AMENITIES */}
        <div className="flex flex-wrap gap-2 mb-6">
          {amenities.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-lg border border-slate-100 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-indigo-300" />
              {item}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Verified Stay
            </span>
          </div>

          <button
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                try {
                  sessionStorage.setItem(
                    "pendingSelectedRoom",
                    JSON.stringify(room)
                  );
                } catch {}
                toast.warning("Please login to reserve this room");
                navigate("/login");
                return;
              }
              navigate("/booking", { state: { selectedRoom: room } });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-500 shadow-xl active:scale-95"
          >
            Reserve Now
            <ArrowRight size={14} />
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
        const res = await fetch(
          "http://127.0.0.1:5000/api/rooms/available"
        );
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

  const availableRooms = rooms.filter(
    (r) => r.status === "active" && (r.availableCount ?? r.availableRooms) > 0
  );

  const visibleRooms = availableRooms.slice(0, 3);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px]">
          Curating Experience
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleRooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>

        {availableRooms.length === 0 && (
          <div className="text-center py-32">
            <Hotel size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              Fully Reserved
            </h3>
            <p className="text-slate-400">
              Please check back later for availability.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomListing;
