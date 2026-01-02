import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomRow({ searchParams }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000";

  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image";
    return `${API}${path.startsWith("/") ? path : "/" + path}`;
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);

      let url = `${API}/api/rooms`;

      if (searchParams?.checkIn && searchParams?.checkOut) {
        const query = new URLSearchParams({
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          roomType: searchParams.roomType || "",
          guests: searchParams.guests || "",
        }).toString();

        url = `${API}/api/rooms/available?${query}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleBookNow = (room) => {
    navigate("/bookingformpage", { state: { room, searchParams } });
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-xl mx-auto max-w-7xl mt-6 border border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">
          No rooms available for the selected dates.
        </p>
      </div>
    );
  }

  /* ================= ROOM LIST ================= */

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {rooms.map((room) => {
        const available =
          room.availableCount !== undefined
            ? room.availableCount
            : room.availableRooms;

        return (
          <div
            key={room._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_300px]">
              
              {/* IMAGE */}
              <div className="relative group bg-gray-100 overflow-hidden">
                <img
                  src={getImageUrl(room.images?.[0])}
                  alt={room.title}
                  className="w-full h-full min-h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                  📷 {room.images?.length || 0} Photos
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-8 border-r flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-serif uppercase mb-2">
                    {room.title}
                  </h2>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">
                      🛏 {room.bedType || "Standard Bed"}
                    </span>

                    {available <= 2 && (
                      <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded animate-pulse">
                        Only {available} Left
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(room.amenities || []).slice(0, 5).map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-gray-100 px-2 py-1 rounded uppercase"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="p-8 bg-gray-50 flex flex-col justify-center text-center">
                <p className="text-3xl font-bold text-amber-800">
                  ₹ {(room.pricing?.standardRate || 0).toLocaleString("en-IN")}
                  <span className="text-xs text-gray-500"> / night</span>
                </p>

                <button
                  onClick={() => handleBookNow(room)}
                  className="w-full mt-6 bg-amber-800 text-white py-4 rounded-lg text-xs font-bold uppercase hover:bg-black transition"
                >
                  Select & Reserve
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
