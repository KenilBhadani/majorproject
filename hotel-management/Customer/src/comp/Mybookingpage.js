import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

  // Review States
  const [reviewingId, setReviewingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // ==================== FETCH BOOKINGS ====================
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("guestEmail");
      const url = token
        ? `${API_URL}/api/bookings/my`
        : `${API_URL}/api/bookings/search?email=${email}`;

      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ==================== FILTER BOOKINGS ====================
  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const status = b.status?.toLowerCase();
      const checkout = new Date(b.checkOut);
      if (activeTab === "current") return (status === "confirmed" || status === "paid") && checkout >= now;
      return status === "cancelled" || checkout < now;
    });
  }, [bookings, activeTab]);

  // ==================== CANCEL BOOKING ====================
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
      if (!res.ok) throw new Error("Failed to cancel booking");
      await fetchBookings();
      setActiveTab("history");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  // ==================== SUBMIT REVIEW ====================
  const submitReview = async (id) => {
    try {
      if (!comment.trim()) return alert("Please write a comment");
      const res = await fetch(`${API_URL}/api/rooms/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, rating, comment }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
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

  // ==================== STATUS STYLES ====================
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "cancelled": return "bg-red-600 text-white";
      case "paid":
      case "confirmed": return "bg-green-600 text-white";
      default: return "bg-blue-600 text-white";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header2 />
      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-14">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight">My Stays</h1>
            <p className="flex items-center gap-2 text-slate-500 mt-2">
              <Info size={16} className="text-blue-500" />
              Viewing your {activeTab} bookings
            </p>
          </div>

          <div className="inline-flex bg-slate-200 rounded-full p-1 h-fit">
            {["current", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition flex items-center gap-2 ${activeTab === tab ? "bg-white text-blue-600 shadow" : "text-slate-600"}`}
              >
                {tab === "current" ? <Clock size={14} /> : <CheckCircle2 size={14} />} {tab}
              </button>
            ))}
          </div>
        </div>

        {/* BOOKINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredBookings.length === 0 && (
            <div className="bg-white rounded-3xl py-32 text-center border border-dashed col-span-full">
              <Calendar className="mx-auto text-slate-300 mb-4" size={56} />
              <h3 className="text-lg font-bold uppercase">No {activeTab} bookings</h3>
            </div>
          )}

          {filteredBookings.map((b) => {
            const status = b.status?.toLowerCase();
            const canCancel = (status === "confirmed" || status === "paid") && new Date(b.checkOut) >= new Date();

            return (
              <div key={b._id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-xl transition">
                
                {/* IMAGE */}
                <div className="relative h-60">
                  <img
                    src={b.roomImage ? `${API_URL}/${b.roomImage.replace(/^\/+/, "")}` : "/no-room.jpg"}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => (e.target.src = "/no-room.jpg")}
                  />
                  <span className={`absolute top-6 right-6 px-4 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="p-8 flex-grow">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{b.roomTitle}</h3>
                  <p className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase mb-4"><MapPin size={12} /> RoyalPark</p>

                  <div className="bg-slate-50 p-5 rounded-3xl mb-6 grid grid-cols-2 text-center border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Check In</p>
                      <p className="text-sm font-black">{new Date(b.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div className="border-l">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Check Out</p>
                      <p className="text-sm font-black">{new Date(b.checkOut).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end border-t border-dashed pt-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Amount</p>
                        <p className="text-2xl font-black text-slate-900">₹{b.amount}</p>
                      </div>

                      {activeTab === "current" && canCancel ? (
                        <button
                          onClick={() => { setBookingToCancel(b._id); setShowCancelModal(true); }}
                          disabled={cancellingId === b._id}
                          className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {cancellingId === b._id ? "..." : "Cancel"}
                        </button>
                      ) : activeTab === "history" ? (
                        <button
                          onClick={() => setReviewingId(b._id)}
                          className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                          <Star size={14} /> Review Stay
                        </button>
                      ) : null}
                    </div>

                    {/* REVIEW FORM */}
                    {reviewingId === b._id && (
                      <div className="bg-blue-50 p-6 rounded-3xl mt-4 border border-blue-100">
                        <p className="text-xs font-black uppercase mb-3 text-blue-800">Rate your experience</p>
                        <div className="flex gap-2 mb-4">
                          {[1,2,3,4,5].map((s) => (
                            <Star
                              key={s}
                              size={20}
                              className={`cursor-pointer transition ${rating >= s ? "fill-blue-600 text-blue-600" : "text-slate-300"}`}
                              onClick={() => setRating(s)}
                            />
                          ))}
                        </div>
                        <textarea
                          className="w-full rounded-2xl p-3 text-sm border-none focus:ring-2 focus:ring-blue-500 mb-3"
                          rows="3"
                          placeholder="Tell us about your stay..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => submitReview(b._id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-xs">Submit</button>
                          <button onClick={() => setReviewingId(null)} className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl font-bold text-xs">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Cancel Booking</h3>
            <p className="mb-6">Are you sure you want to cancel this booking?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold"
                onClick={() => { setShowCancelModal(false); setBookingToCancel(null); }}
              >
                No
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold"
                onClick={async () => {
                  if (!bookingToCancel) return;
                  setShowCancelModal(false);
                  await handleCancel(bookingToCancel);
                  setBookingToCancel(null);
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
