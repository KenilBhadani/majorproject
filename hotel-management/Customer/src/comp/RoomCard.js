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

const BASE_URL = "http://localhost:5000";

const RoomCard = ({ room, onSelect }) => {
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

  const isAvailable = availableRooms > 0;

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-6 group w-full max-w-5xl mx-auto md:h-[340px] transition-all hover:shadow-xl hover:border-amber-200">
      {/* IMAGE */}
      <div className="w-full md:w-[380px] h-[240px] md:h-full relative bg-slate-100 flex-shrink-0 overflow-hidden border-r border-slate-100">
        <img
          src={getImageUrl(images[currentImgIndex])}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* AVAILABLE ROOMS BADGE */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow">
              {availableRooms} Rooms Left
            </span>
          ) : (
            <span className="bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 flex flex-col h-full bg-white">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {roomType}
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-600">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold uppercase">
                {rates?.planName || "Breakfast Included"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-black text-slate-900 leading-none">
              {pricing?.currency}{" "}
              {pricing?.standardRate?.toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 block tracking-widest">
              Per Night
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-xs mt-3 line-clamp-2 italic">
          {description || "Luxury room with premium amenities."}
        </p>

        <div className="mt-4 flex-grow grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <ShieldCheck size={12} /> Amenities
            </p>
            <div className="flex flex-wrap gap-1">
              {amenities?.slice(0, 4).map((amt, idx) => (
                <span
                  key={idx}
                  className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold"
                >
                  {amt}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 h-fit">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Info size={14} />
              <p className="text-[10px] font-bold uppercase">Policy</p>
            </div>
            <p className="text-[11px] text-slate-700 font-semibold leading-tight line-clamp-2">
              {rates?.depositPolicy || "Standard Policy"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex gap-4 text-slate-700">
            <div className="flex flex-col items-center">
              <Users size={16} className="text-slate-300" />
              <span className="text-[11px] font-bold">
                {capacity} Guest
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-100 pl-4">
              <BedDouble size={16} className="text-slate-300" />
              <span className="text-[11px] font-bold">{bedType}</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(room)}
            disabled={!isAvailable}
            className={`px-10 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95
              ${
                isAvailable
                  ? "bg-slate-900 hover:bg-amber-600 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
          >
            {isAvailable ? "Select Room" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
