// RoomBooking.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RoomCard from "./RoomCard";
import Header2 from "./Header2";
import BookingSteps from "./Bookingstep";
import Footer from "./footer";
import { LayoutGrid, AlertCircle, Loader2, Search } from "lucide-react";

export default function RoomBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     INITIAL SEARCH PARAMS
  ========================= */
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

  const API_URL = "http://localhost:5000";

  /* =========================
     FETCH ROOMS
  ========================= */
  const fetchAvailableRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/api/rooms/available`;

      if (searchParams.checkIn && searchParams.checkOut) {
        const query = new URLSearchParams(searchParams).toString();
        url += `?${query}`;
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

  /* =========================
     SEARCH CLICK
  ========================= */
  const handleSearch = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }
    fetchAvailableRooms();
  };

  /* =========================
     SELECT ROOM
  ========================= */
  const handleSelectRoom = (room) => {
    navigate("/booking/form", {
      state: { room, searchParams },
    });
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchAvailableRooms();
  }, []); // load once

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <>
        <Header2 />
        <BookingSteps />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-amber-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">
            Finding the best rooms for you...
          </p>
        </div>
      </>
    );
  }

  /* =========================
     ERROR
  ========================= */
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
      <BookingSteps activeStep={1} />

      <div className="bg-slate-50 min-h-screen py-12 px-6">
        <div className="max-w-5xl mx-auto">

          {/* =========================
              SEARCH BAR
          ========================= */}
          <div className="bg-white p-6 rounded-2xl shadow mb-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-500">Check In</label>
                <input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkIn: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Check Out</label>
                <input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, checkOut: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={searchParams.guests}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, guests: e.target.value })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Room Type</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={searchParams.roomType}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, roomType: e.target.value })
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

          {/* =========================
              HEADER
          ========================= */}
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
              Showing {rooms.length} available rooms
            </p>
          </header>

          {/* =========================
              ROOM LIST
          ========================= */}
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
