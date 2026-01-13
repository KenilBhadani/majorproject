import React, { useState } from "react";
import {
  Users,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:5000";

const RoomCard = ({ room, onSelect, checkIn, checkOut }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!room) return null;

  const images = room.images || [];
  const {
    rates,
    pricing,
    title,
    roomType,
    capacity,
    bedType,
    amenities,
    description,
    availableRooms,
  } = room;

  const isAvailable = availableRooms > 0;
  const datesSelected = Boolean(checkIn && checkOut);

  /* =========================
     IMAGE HELPERS
  ========================= */
  const getImageUrl = (imagePath) => {
    if (!imagePath)
      return "https://via.placeholder.com/400x300?text=No+Image";
    return imagePath.startsWith("http")
      ? imagePath
      : `${BASE_URL}/${imagePath.replace(/^\//, "")}`;
  };

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  /* =========================
     HANDLE SELECT ROOM
  ========================= */
  const handleSelectRoom = () => {
    if (!datesSelected) {
      toast.error("Please select check-in and check-out dates first");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    onSelect(room); // ✅ Redirect works now
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-6 group w-full max-w-5xl mx-auto md:h-[340px] transition-all hover:shadow-xl hover:border-amber-200">
      {/* ================= IMAGE ================= */}
      <div className="w-full md:w-[380px] h-[240px] md:h-full relative bg-slate-100 overflow-hidden border-r">
        <img
          src={getImageUrl(images[currentImgIndex])}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
              {availableRooms} Rooms Left
            </span>
          ) : (
            <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between">
          <div>
            <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest">
              {roomType}
            </span>
            <h3 className="text-2xl font-bold mt-1">{title}</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold uppercase">
                {rates?.planName || "Breakfast Included"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black">
              {pricing?.currency}{" "}
              {pricing?.standardRate?.toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Per Night
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-3 line-clamp-2 italic">
          {description || "Luxury room with premium amenities."}
        </p>

        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <Users size={16} />
              <span className="text-xs font-bold">{capacity} Guest</span>
            </div>
            <div className="flex flex-col items-center border-l pl-4">
              <BedDouble size={16} />
              <span className="text-xs font-bold">{bedType}</span>
            </div>
          </div>

          {/* ================= BUTTON ================= */}
          <button
            onClick={handleSelectRoom}
            disabled={!isAvailable || !datesSelected}
            className={`px-8 py-3 rounded-2xl font-bold transition-all
              ${
                isAvailable && datesSelected
                  ? "bg-slate-900 hover:bg-amber-600 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
          >
            {!datesSelected
              ? "Select Dates First"
              : isAvailable
              ? "Select Room"
              : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
