import { useEffect, useState, useMemo } from "react";
import Header2 from "./Header2";
import Footer from "./footer";
import {
  Calendar,
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  Info,
} from "lucide-react";

export default function MyBookingPage() {
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [cancellingId, setCancellingId] = useState(null);

  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  /* ================= FETCH BOOKINGS ================= */
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("guestEmail");

      const url = token
        ? `${API_URL}/api/bookings/my`
        : `${API_URL}/api/bookings/search?email=${email}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= FILTER BOOKINGS ================= */
  const filteredBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((b) => {
      const status = b.status?.toLowerCase();
      const checkout = new Date(b.checkOut);

      if (activeTab === "current") {
        return (
          ["confirmed", "paid", "pending"].includes(status) &&
          checkout >= now
        );
      }

      return status === "cancelled" || checkout < now;
    });
  }, [bookings, activeTab]);

  /* ================= CANCEL BOOKING ================= */
  const handleCancel = async (id) => {
    setCancellingId(id);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error("Cancel failed");

      await fetchBookings();
      setActiveTab("history");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = async (id) => {
    try {
      if (!comment.trim()) return alert("Please write a comment");

      const res = await fetch(`${API_URL}/api/rooms/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, rating, comment }),
      });

      if (!res.ok) throw new Error("Review failed");

      alert("Thank you for your review!");
      setReviewingId(null);
      setComment("");
      setRating(5);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Review submission failed");
    }
  };

  /* ================= STATUS BADGE ================= */
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "cancelled":
        return "bg-red-600 text-white";
      case "paid":
      case "confirmed":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header2 />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-14">
          <div>
            <h1 className="text-5xl font-black uppercase">My Stays</h1>
            <p className="flex items-center gap-2 text-slate-500 mt-2">
              <Info size={16} className="text-blue-500" />
              Viewing your {activeTab} bookings
            </p>
          </div>

          <div className="inline-flex bg-slate-200 rounded-full p-1">
            {["current", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-600"
                }`}
              >
                {tab === "current" ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* BOOKINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredBookings.length === 0 && (
            <div className="bg-white rounded-3xl py-32 text-center border border-dashed col-span-full">
              <Calendar className="mx-auto text-slate-300 mb-4" size={56} />
              <h3 className="text-lg font-bold uppercase">
                No {activeTab} bookings
              </h3>
            </div>
          )}

          {filteredBookings.map((b) => {
            const status = b.status?.toLowerCase();
            const canCancel =
              ["confirmed", "paid", "pending"].includes(status) &&
              new Date(b.checkOut) >= new Date();

            const roomTitle = b.roomTitle || b.roomId?.title || "Room";
            const roomImage =
              b.roomImage ||
              b.roomId?.images?.[0] ||
              "/no-room.jpg";

            return (
              <div
                key={b._id}
                className="bg-white rounded-[40px] overflow-hidden shadow-sm border hover:shadow-xl transition"
              >
                {/* IMAGE */}
                <div className="relative h-60">
                  <img
                    src={`${API_URL}/${roomImage.replace(/^\/+/, "")}`}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => (e.target.src = "/no-room.jpg")}
                  />
                  <span
                    className={`absolute top-6 right-6 px-4 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-black uppercase mb-4">
                    {roomTitle}
                  </h3>

                  <p className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase mb-4">
                    <MapPin size={12} /> RoyalPark
                  </p>

                  <div className="bg-slate-50 p-5 rounded-3xl mb-6 grid grid-cols-2 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Check In</p>
                      <p className="font-black">
                        {new Date(b.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="border-l">
                      <p className="text-[10px] text-slate-400 uppercase">Check Out</p>
                      <p className="font-black">
                        {new Date(b.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-between items-end border-t pt-4">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">
                        Total Amount
                      </p>
                      <p className="text-2xl font-black">₹{b.amount}</p>
                    </div>

                    {activeTab === "current" && canCancel && (
                      <button
                        onClick={() => {
                          setBookingToCancel(b._id);
                          setShowCancelModal(true);
                        }}
                        disabled={cancellingId === b._id}
                        className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-xs font-black hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}

                    {activeTab === "history" && (
                      <button
                        onClick={() => setReviewingId(b._id)}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-2xl text-xs font-black"
                      >
                        <Star size={14} /> Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
