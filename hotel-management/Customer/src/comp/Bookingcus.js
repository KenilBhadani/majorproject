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
        setForm((prev) => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
        }));
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
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

      const bookingPayload = {
        bookingData: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          gst: form.gst,
          requests: form.requests || "",
          roomTitle: room.title,
          ratePerNight: rate,
        },
        roomId: room._id,
        nights,
        subtotal,
        gstAmount,
        amount: total,
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        paymentMethod,
        paymentStatus: paymentMethod === "CARD" ? "PAID" : "PENDING",
      };

      /* ===== CASH BOOKING ===== */
      if (paymentMethod === "CASH") {
        const saveRes = await fetch(`${API_URL}/api/bookings/save`, {
          method: "POST",
          headers,
          body: JSON.stringify(bookingPayload),
        });
        if (!saveRes.ok) {
          const errData = await saveRes.json();
          throw new Error(errData.error || "Failed to save cash booking");
        }
        toast.success("Booking successful! See you at the hotel.");
        setTimeout(() => navigate("/booking-success"), 1500);
        return;
      }

      /* ===== CARD PAYMENT ===== */
      const amountInPaise = Math.round(total * 100);
      const intentRes = await fetch(`${API_URL}/api/bookings/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise, bookingData: bookingPayload }),
      });
      const { clientSecret } = await intentRes.json();
      if (!clientSecret) throw new Error("Payment Intent creation failed");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card information missing");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: `${form.firstName} ${form.lastName}`, email: form.email },
        },
      });

      if (result.error) throw new Error(result.error.message || "Payment failed");

      bookingPayload.paymentIntentId = result.paymentIntent.id;

      const saveRes = await fetch(`${API_URL}/api/bookings/save`, {
        method: "POST",
        headers,
        body: JSON.stringify(bookingPayload),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || "Failed to save card booking");
      }

      toast.success("Payment successful! Your booking is confirmed.");
      setTimeout(() => navigate("/booking-success"), 1500);
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
