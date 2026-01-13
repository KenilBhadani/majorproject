import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";
import Header2 from "./Header2";
import Footer from "./footer";
import FloatingInput from "./FloatingInput";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();

  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  /* =========================
     LOCAL STATE
  ========================= */
  const [room, setRoom] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [ready, setReady] = useState(false);

  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gst: "",
    requests: "",
    agree: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid =
    form.title &&
    form.firstName &&
    form.lastName &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone &&
    form.agree;

  const formatDate = (d) => d.toISOString().split("T")[0];

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  /* =========================
     RESTORE ROOM & SEARCH DATA
  ========================= */
  useEffect(() => {
    if (location.state?.room && location.state?.searchParams) {
      setRoom(location.state.room);
      setSearchParams(location.state.searchParams);
      setReady(true);
    } else {
      toast.error("Missing room or search data. Redirecting to rooms page.");
      navigate("/rooms", { replace: true });
    }
  }, [location, navigate]);

  /* =========================
     FETCH LOGGED-IN USER INFO
  ========================= */
  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
        }));
      } catch {}
    }
    fetchUser();
  }, [API_URL]);

  /* =========================
     DATE CALCULATION
  ========================= */
  const { nights, checkInDate, checkOutDate } = useMemo(() => {
    if (!searchParams) return { nights: 0, checkInDate: null, checkOutDate: null };
    const inD = new Date(searchParams.checkIn);
    const outD = new Date(searchParams.checkOut);
    if (!inD || !outD || outD <= inD) return { nights: 0, checkInDate: null, checkOutDate: null };
    const diff = Math.ceil((outD - inD) / 86400000);
    return { nights: diff, checkInDate: inD, checkOutDate: outD };
  }, [searchParams]);

  /* =========================
     PRICING
  ========================= */
  const rate = Number(room?.pricing?.standardRate || 0);
  const subtotal = rate * nights;
  const gstAmount = Math.round(subtotal * 0.18);
  const total = subtotal + gstAmount;

  /* =========================
     HANDLE SUBMIT
  ========================= */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return toast.error("Please complete the form");
    if (!checkInDate || !checkOutDate) return toast.error("Please select valid dates");

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      /* ===== CASH ===== */
      if (paymentMethod === "CASH") {
        const saveRes = await fetch(`${API_URL}/api/bookings/save`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            bookingData: form,
            roomId: room._id,
            ratePerNight: rate,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            subtotal,
            gst: gstAmount,
            amount: total,
          }),
        });

        if (!saveRes.ok) throw new Error("Booking save failed");

        if (!token) localStorage.setItem("guestEmail", form.email);
        sessionStorage.clear();

        // ✅ Show toast and redirect
       toast.success("Booking successful! Redirecting to home...", {
                  autoClose: 2000,
                          });

                  setTimeout(() => {
                   navigate("/");
                }, 2100);

        return;
      }

      /* ===== CARD ===== */
      const intentRes = await fetch(`${API_URL}/api/bookings/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!intentRes.ok) throw new Error("Failed to create payment intent");

      const { clientSecret } = await intentRes.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
          },
        },
      });

      if (result.error) throw result.error;

      const saveRes = await fetch(`${API_URL}/api/bookings/save`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          bookingData: form,
          paymentIntentId: result.paymentIntent.id,
          roomId: room._id,
          ratePerNight: rate,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights,
          subtotal,
          gst: gstAmount,
          amount: total,
        }),
      });

      if (!saveRes.ok) throw new Error("Booking save failed");

      const verifyRes = await fetch(`${API_URL}/api/bookings/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntent.id,
        }),
      });

      if (!verifyRes.ok) throw new Error("Payment verification failed");

      if (!token) localStorage.setItem("guestEmail", form.email);
      sessionStorage.clear();

      // ✅ Show toast and redirect
     toast.success("Booking successful! Redirecting to home...", {
  autoClose: 2000,
});

setTimeout(() => {
  navigate("/");
}, 2100);

    } catch (err) {
      console.error(err);
      setError(err.message || "Booking failed");
      toast.error(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     SAFE RENDER
  ========================= */
  if (!ready) {
    return (
      <>
        <Header2 />
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          Restoring your booking…
        </div>
      </>
    );
  }

  const imageUrl =
    room?.images?.length > 0
      ? `${API_URL}/${room.images[0].replace(/^\/+/, "")}`
      : "/no-room.jpg";

  return (
    <>
      <Header2 />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black mb-6">Complete Your Reservation</h1>
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-8 bg-white p-8 rounded-3xl border">
              <h2 className="flex gap-2 font-bold mb-6"><Users /> Guest Details</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <select name="title" value={form.title} onChange={handleChange} className="h-[56px] px-4 border rounded-lg bg-slate-50">
                  <option value="">Title</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                </select>
                <FloatingInput name="firstName" label="First Name" value={form.firstName} onChange={handleChange} />
                <FloatingInput name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} />
              </div>


              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <FloatingInput name="email" label="Email" value={form.email} onChange={handleChange} />
                <FloatingInput name="phone" label="Mobile" value={form.phone} onChange={handleChange} />
                <FloatingInput name="gst" label="GST (optional)" value={form.gst} onChange={handleChange} />
              </div>

              <div className="mt-6 space-y-2">
                <label className="flex gap-2">
                  <input type="radio" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} />
                  Card
                </label>
                <label className="flex gap-2">
                  <input type="radio" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} />
                  Cash at Hotel
                </label>
              </div>

              {paymentMethod === "CARD" && (
                <div className="mt-4 border rounded-xl p-4"><CardElement /></div>
              )}

              <label className="flex gap-2 mt-6">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
                I agree to terms
              </label>

              {error && <p className="text-red-500 mt-3">{error}</p>}

              <button disabled={!valid || loading} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold">
                {loading ? "Processing..." : paymentMethod === "CASH" ? "Confirm Booking" : `Pay ₹${total}`}
                <ArrowRight className="inline ml-2" />
              </button>
            </div>

            {/* RIGHT */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 bg-white rounded-3xl shadow overflow-hidden">
                <img src={imageUrl} alt={room.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-black">{room.title}</h3>
                  <p className="text-sm text-slate-500">
                    {checkInDate?.toDateString()} → {checkOutDate?.toDateString()}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span>₹{rate} × {nights}</span><span>₹{subtotal}</span></div>
                    <div className="flex justify-between"><span>GST (18%)</span><span>₹{gstAmount}</span></div>
                    <div className="border-t pt-3 flex justify-between font-black text-lg"><span>Total</span><span>₹{total}</span></div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs">
                    <ShieldCheck size={14} /> Secure payment
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
