import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Users, ShieldCheck, Info, ArrowRight } from "lucide-react";
import Header2 from "./Header2";
import Footer from "./footer";
import BookingSteps from "./Bookingstep";
import FloatingInput from "./FloatingInput"; // Custom input component

export default function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();

  // Backend API URL from .env
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

  const stripe = useStripe();
  const elements = useElements();

  // Selected room & search params (we only read these, don't need setters)
  const [room] = useState(() => {
    const saved = sessionStorage.getItem("selectedRoom");
    return location.state?.room || (saved ? JSON.parse(saved) : null);
  });

  const [searchParams] = useState(() => {
    const saved = sessionStorage.getItem("searchParams");
    return location.state?.searchParams || (saved ? JSON.parse(saved) : null);
  });

  useEffect(() => {
    if (!room || !searchParams) {
      navigate("/rooms"); // Redirect if no room or search
    } else {
      sessionStorage.setItem("selectedRoom", JSON.stringify(room));
      sessionStorage.setItem("searchParams", JSON.stringify(searchParams));
    }
  }, [room, searchParams, navigate]);

  // Calculate check-in, check-out, nights
  const { checkInDate, checkOutDate, nights } = useMemo(() => {
    const inD = new Date(searchParams.checkIn);
    const outD = new Date(searchParams.checkOut);
    const diff = Math.max(1, Math.ceil((outD - inD) / 86400000));
    return { checkInDate: inD, checkOutDate: outD, nights: diff };
  }, [searchParams]);

  // Pricing calculation
  const rate = Number(room?.pricing?.standardRate || 0);
  const subtotal = rate * nights;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const imageUrl = room?.images?.[0]
    ? `${API_URL}/${room.images[0].replace(/^\//, "")}`
    : "https://via.placeholder.com/400x250";

  // Form state
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form validation
  const valid =
    form.title &&
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.agree;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid || !stripe || !elements) return;

    setLoading(true);
    setError("");

    const card = elements.getElement(CardElement);

    try {
      // 1️⃣ Create PaymentIntent on server
      const res = await fetch(`${API_URL}/api/bookings/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, bookingData: form }),
      });

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      // 2️⃣ Confirm payment on client
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // 3️⃣ Save booking to backend with all details
        const saveRes = await fetch(`${API_URL}/api/bookings/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingData: form,
            paymentIntentId: paymentIntent.id,
            roomId: room._id,
            roomTitle: room.title,
            ratePerNight: rate,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            nights: nights,
            subtotal: subtotal,
            gst: gst,
            amount: total,
          }),
        });

        const saveData = await saveRes.json();

        if (!saveRes.ok) {
          throw new Error(saveData.error || "Failed to save booking");
        }

        alert("Booking Successful!");
        navigate("/booking-success");
      } else {
        setError("Payment was not successful. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "Payment failed. Try again.");
      setLoading(false);
    }
  }

  if (!room) return null; // Prevent rendering if no room selected

  return (
    <>
      <Header2 />
      <BookingSteps activeStep={2} />

      <div className="bg-[#fcfcfd] min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900">Complete Your Reservation</h1>
            <p className="text-slate-500 mt-2">
              Please provide your details to secure this booking.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT FORM */}
            <div className="lg:col-span-8">
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Users className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold">Guest Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-4 gap-6">
                    <select
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="h-[58px] pt-4 px-4 border-b-2 border-slate-200 bg-slate-50 rounded-t-lg"
                    >
                      <option value="">Title</option>
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                    </select>

                    <FloatingInput
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FloatingInput
                      id="email"
                      name="email"
                      type="email"
                      label="Email"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                    <FloatingInput
                      id="phone"
                      name="phone"
                      label="Mobile"
                      required
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <FloatingInput
                    id="gst"
                    name="gst"
                    label="GST (Optional)"
                    value={form.gst}
                    onChange={handleChange}
                  />

                  <textarea
                    name="requests"
                    placeholder="Special requests"
                    rows="3"
                    className="w-full border rounded-2xl p-4"
                    value={form.requests}
                    onChange={handleChange}
                  />

                  {/* Stripe Card Element */}
                  <div className="mt-6">
                    <label className="block mb-2 font-medium">Card Details</label>
                    <div className="border rounded-xl p-3">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#111",
                              "::placeholder": { color: "#888" },
                            },
                            invalid: { color: "#e53e3e" },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 mt-2">{error}</p>}

                  <label className="flex gap-3 mt-4">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                    />
                    <span>I agree to the terms and policies</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!valid || loading || !stripe || !elements}
                    className={`w-full py-5 rounded-2xl font-black text-lg mt-4
                      ${valid ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"}`}
                  >
                    {loading ? "Processing..." : `Pay ₹ ${total.toLocaleString("en-IN")}`}{" "}
                    <ArrowRight className="inline ml-2" />
                  </button>
                </form>
              </section>
            </div>

            {/* RIGHT SUMMARY */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-24">
                <img src={imageUrl} alt={room.title} className="h-44 w-full object-cover" />
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">{room.title}</h3>
                  <div className="flex justify-between text-sm">
                    <span>Check-In</span>
                    <span>{checkInDate.toDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Check-Out</span>
                    <span>{checkOutDate.toDateString()}</span>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹ {subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹ {gst}</span>
                    </div>
                    <div className="flex justify-between font-black text-lg">
                      <span>Total</span>
                      <span className="text-amber-600">₹ {total}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl flex gap-2 text-xs">
                    <Info /> Free cancellation before 48 hrs
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 text-xs text-slate-400 flex justify-center gap-2">
                <ShieldCheck size={14} /> Secure Payment
              </div>
            </aside>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
