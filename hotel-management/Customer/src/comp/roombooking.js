import React, { useState, useEffect } from "react";

export default function RoomRow() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = "http://localhost:5000";

  // Helper function to get image URL
  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image";
    return `${API}${path.startsWith("/") ? path : "/" + path}`;
  };

  useEffect(() => {
    fetch(`${API}/api/rooms`)
      .then(res => res.json())
      .then(data => setRooms(Array.isArray(data) ? data : [data]))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-6">Loading rooms...</p>;
  if (!rooms.length) return <p className="text-center mt-6">No rooms available</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {rooms.map(room => (
        <div key={room._id} className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-6 p-6">

            {/* LEFT: IMAGE */}
            <div>
              <div className="relative">
                <img
                  src={getImageUrl(room.images?.[0])} // <-- use helper
                  alt={room.title}
                  className="w-full h-56 object-cover rounded"
                />
                <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  📷 {room.images?.length || 0}
                </div>
              </div>

              <div className="flex gap-4 mt-4 text-sm text-gray-600">
                <span>📐 {room.size || "N/A"} sq m</span>
                <span>👥 Up to {room.capacity || "N/A"} guests</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">🛏 {room.bedType || "N/A"}</div>

              <button className="mt-3 text-sm text-amber-700 underline hover:text-amber-900 transition">
                ROOM DETAILS
              </button>
            </div>

            {/* CENTER: DETAILS */}
            <div>
              <h2 className="text-xl font-serif tracking-wide uppercase">{room.title}</h2>

              {room.availableRooms <= 1 && (
                <p className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  ⚠️ Last {room.availableRooms} Room Available
                </p>
              )}

              <div className="border border-gray-200 mt-4 p-4 rounded">
                <h3 className="font-medium mb-3">{room.rates?.planName || "Rate Info Not Available"}</h3>

                <ul className="space-y-2 text-sm text-gray-700">
                  {room.rates?.inclusions?.length
                    ? room.rates.inclusions.map((inc, idx) => <li key={idx}>◆ {inc}</li>)
                    : <li>No inclusions listed</li>
                  }
                </ul>

                <p className="mt-4 text-sm text-gray-600 italic">{room.rates?.depositPolicy || ""}</p>
                <button className="mt-3 text-sm text-amber-700 underline hover:text-amber-900 transition">
                  Rate Details
                </button>
              </div>

              {room.amenities?.length > 0 && (
                <div className="mt-4 text-sm text-gray-700">
                  <h4 className="font-medium mb-1">Amenities:</h4>
                  <ul className="flex flex-wrap gap-2">
                    {room.amenities.map((a, idx) => (
                      <li key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT: PRICING */}
            <div className="border border-gray-200 p-4 flex flex-col justify-between rounded">
              <div>
                <p className="text-sm text-gray-500 text-center">MEMBER RATE</p>
                <p className="text-xl font-semibold text-center mt-1">
                  ₹ {Math.floor((room.pricing?.standardRate || 0) * 0.87)}{" "}
                  <span className="text-sm font-normal">/ Night</span>
                </p>

                <button className="w-full mt-3 bg-amber-700 text-white py-2 text-sm font-semibold hover:bg-amber-800 transition rounded">
                  LOGIN / JOIN
                </button>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="text-sm text-gray-500 text-center">STANDARD RATE</p>
                <p className="text-xl font-semibold text-center mt-1">
                  ₹ {room.pricing?.standardRate || "N/A"} <span className="text-sm font-normal">/ Night</span>
                </p>

                <button className="w-full mt-3 border border-amber-700 text-amber-700 py-2 text-sm font-semibold hover:bg-amber-700 hover:text-white transition rounded">
                  SELECT
                </button>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
