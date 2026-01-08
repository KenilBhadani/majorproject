import { useEffect, useState } from "react";
import Header2 from "./Header2";
import Footer from "./footer";
import { ShieldCheck } from "lucide-react";

export default function MyBookingPage() {
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH MY BOOKINGS
  ========================= */
  useEffect(() => {
    async function fetchBookings() {
      try {
        const token = localStorage.getItem("token");
        let url = `${API_URL}/api/bookings/my`;
        let options = {};

        // Guest booking (email-based)
        if (!token) {
          const guestEmail = localStorage.getItem("guestEmail");
          if (!guestEmail) {
            setBookings([]);
            setLoading(false);
            return;
          }

          url = `${API_URL}/api/bookings/search?email=${guestEmail}`;
        } else {
          options.headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        const res = await fetch(url, options);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch bookings");
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [API_URL]);

  /* =========================
     UI STATES
  ========================= */
  if (loading) {
    return (
      <>
        <Header2 />
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          Loading your bookings…
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header2 />
        <div className="min-h-screen flex items-center justify-center text-red-500">
          {error}
        </div>
        <Footer />
      </>
    );
  }

  if (bookings.length === 0) {
    return (
      <>
        <Header2 />
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          No bookings found
        </div>
        <Footer />
      </>
    );
  }

  /* =========================
     MAIN RENDER
  ========================= */
  return (
    <>
      <Header2 />

      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black mb-8">My Bookings</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map(b => {
              const imageUrl = b.roomImage
                ? `${API_URL}/${b.roomImage.replace(/^\/+/, "")}`
                : "/no-room.jpg";

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-3xl overflow-hidden border shadow-sm"
                >
                  {/* IMAGE (SAME AS BookingForm.js) */}
                  <img
                    src={imageUrl}
                    alt={b.roomTitle}
                    className="w-full h-48 object-cover"
                    onError={e => (e.target.src = "/no-room.jpg")}
                  />

                  <div className="p-6">
                    <h2 className="text-xl font-black">
                      {b.roomTitle || "Room"}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(b.checkIn).toDateString()} →{" "}
                      {new Date(b.checkOut).toDateString()}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nights</span>
                        <span>{b.nights}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Total Amount</span>
                        <span className="font-bold">₹{b.amount}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Status</span>
                        <span
                          className={`font-bold ${
                            b.status === "Cancelled"
                              ? "text-red-500"
                              : "text-emerald-600"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs">
                      <ShieldCheck size={14} />
                      Secure booking
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
