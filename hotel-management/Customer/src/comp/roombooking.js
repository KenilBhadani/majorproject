import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoomCard from "./RoomCard";
import Header2 from "./Header2";
import Footer from "./footer";
import { LayoutGrid, AlertCircle, Loader2, Search } from "lucide-react";
import { toast } from "react-toastify";

export default function RoomBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initial search params
  const initialSearch = location.state?.searchParams || {
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomType: "",
  };

  const [searchParams, setSearchParams] = useState(initialSearch);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restoredInfo, setRestoredInfo] = useState(null);
  const [needsDates, setNeedsDates] = useState(false);

  const API_URL = "http://localhost:5000";

  // ✅ Fetch rooms (ALL rooms or AVAILABLE rooms)
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url;

      // 🟡 No dates → ALL rooms
      if (!searchParams.checkIn || !searchParams.checkOut) {
        setNeedsDates(true);
        url = `${API_URL}/api/rooms`;
      } else {
        // 🟢 Dates selected → AVAILABLE rooms
        setNeedsDates(false);
        const query = new URLSearchParams(searchParams).toString();
        url = `${API_URL}/api/rooms/available?${query}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch rooms");

      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // 🔄 Load rooms on mount & when search changes
  useEffect(() => {
    fetchRooms();

    // 🔁 Restore previous search / room
    if (location.state?.restored) {
      const payload = location.state.selectedRoom
        ? { type: "room", payload: location.state.selectedRoom }
        : { type: "search", payload: location.state.searchParams };

      setRestoredInfo(payload);

      toast.success(
        payload.type === "room"
          ? "Your selected room has been restored"
          : "Your previous search has been restored"
      );

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [fetchRooms, location.state, navigate]);

  // 🔍 Manual search
  const handleSearch = () => {
    fetchRooms();
  };

  // 🏨 Select room (extra safety check)
  const handleSelectRoom = (room) => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      toast.info("Please select check-in and check-out dates first");
      return;
    }

    navigate("/booking/form", {
      state: { room, searchParams },
    });
  };

  // 🔄 Loading state
  if (loading) {
    return (
      <>
        <Header2 />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-amber-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading rooms...
          </p>
        </div>
      </>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <>
        <Header2 />
        <div className="max-w-5xl mx-auto p-12 text-center">
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border">
            <AlertCircle className="mx-auto mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header2 />

      <div className="bg-slate-50 min-h-screen py-12 px-6">
        <div className="max-w-5xl mx-auto">

          {/* 🔍 SEARCH BAR */}
          <div className="bg-white p-6 rounded-2xl shadow mb-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-500">
                  Check In
                </label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkIn: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Check Out
                </label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      checkOut: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      guests: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Room Type
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={searchParams.roomType}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      roomType: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <button
                onClick={handleSearch}
                className="h-10 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600"
              >
                <Search size={16} /> Search
              </button>
            </div>
          </div>

          {/* 🔔 RESTORED INFO */}
          {restoredInfo && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-6 flex justify-between items-center">
              <div>
                <strong className="block text-amber-900">
                  {restoredInfo.type === "room"
                    ? "Room selection restored"
                    : "Search restored"}
                </strong>
                <p className="text-sm text-amber-700">
                  {restoredInfo.type === "room"
                    ? "We restored the room you were trying to reserve."
                    : "We restored your previous search criteria."}
                </p>
              </div>
              <button
                className="border border-amber-700 text-amber-700 px-3 py-2 rounded"
                onClick={() => setRestoredInfo(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 🏨 HEADER */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <LayoutGrid size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Live Inventory
              </span>
            </div>
            <h2 className="text-4xl font-black text-slate-900">
              Select Your Space
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {needsDates
                ? `Showing ${rooms.length} rooms`
                : `Showing ${rooms.length} available room${
                    rooms.length !== 1 && "s"
                  }`}
            </p>
          </header>

          {/* 🧱 ROOM LIST */}
          <div className="flex flex-col gap-6">
            {rooms.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-dashed">
                <p className="text-slate-400">
                  No rooms found. Try different dates.
                </p>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onSelect={handleSelectRoom}
                  checkIn={searchParams.checkIn}
                  checkOut={searchParams.checkOut}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
