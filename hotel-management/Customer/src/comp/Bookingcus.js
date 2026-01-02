import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ================= FLOATING INPUT COMPONENT ================= */
const FloatingInput = ({ id, label, value, required = false, type = "text", onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = value || isFocused;

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={onChange}
        className={`peer w-full border rounded-lg px-4 py-3 bg-white text-slate-800 outline-none transition-all
          ${isActive ? "border-amber-600 ring-1 ring-amber-600" : "border-slate-300"}
        `}
        required={required}
      />
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white
          ${isActive ? "-top-2.5 text-xs text-amber-600 font-bold" : "top-3.5 text-slate-500"}
        `}
      >
        {label} {required && "*"}
      </label>
    </div>
  );
};

/* ================= MAIN BOOKING FORM ================= */
export default function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data passed from RoomRow Select button via state
  const room = location.state?.room;
  const searchParams = location.state?.searchParams;

  // Debugging log: remove this after you see the Standard Rate working
  console.log("Room Data Received:", room);

  useEffect(() => {
    if (!room) navigate("/"); 
  }, [room, navigate]);

  /* ---------------- DATE & NIGHT CALCULATION ---------------- */
  const { checkInDate, checkOutDate, totalNights } = useMemo(() => {
    const start = searchParams?.checkIn ? new Date(searchParams.checkIn) : new Date();
    const end = searchParams?.checkOut ? new Date(searchParams.checkOut) : new Date(new Date().getTime() + 86400000);
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    return { checkInDate: start, checkOutDate: end, totalNights: diffDays };
  }, [searchParams]);

  /* ---------------- PRICE LOGIC ---------------- */
  // Matches room.pricing.standardRate structure from your RoomRow component
  const pricePerNight = useMemo(() => {
    return Number(room?.pricing?.standardRate || 0);
  }, [room]);

  const subtotal = pricePerNight * totalNights;
  const taxRate = 0.18;
  const taxes = Math.round(subtotal * taxRate);
  const totalPayable = subtotal + taxes;

  const [form, setForm] = useState({
    title: "", firstName: "", lastName: "", email: "", phone: "", gst: "", requests: "", agree: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requiredValid = form.title && form.firstName && form.lastName && form.email && form.phone && form.agree;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((s) => ({ ...s, phone: digits }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requiredValid) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      mobileNo: form.phone,
      gstNo: form.gst || null,
      specialRequest: form.requests || null,
      room: room?._id,
      roomType: room?.title,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      pricePerNight,
      totalNights,
      totalAmount: totalPayable,
    };

    try {
      const res = await fetch("http://localhost:5000/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Booking Confirmed Successfully!");
        navigate("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Booking failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* GUEST FORM */}
        <section className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select name="title" value={form.title} onChange={handleChange} className="border border-slate-300 px-3 py-3 rounded-lg bg-white outline-none focus:border-amber-600" required>
                <option value="">Title *</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
              <FloatingInput id="firstName" label="First Name" required value={form.firstName} onChange={handleChange} />
              <FloatingInput id="lastName" label="Last Name" required value={form.lastName} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput id="email" type="email" label="Email Address" required value={form.email} onChange={handleChange} />
              <input type="tel" placeholder="Mobile Number *" value={form.phone} onChange={handlePhoneChange} className="border border-slate-300 px-4 py-3 rounded-lg outline-none focus:border-amber-600" required />
            </div>

            <FloatingInput id="gst" label="GST Number (Optional)" value={form.gst} onChange={handleChange} />
            <textarea name="requests" rows="3" placeholder="Special Requests..." value={form.requests} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-amber-600" />

            {error && <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</p>}

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-5 h-5 accent-amber-600 cursor-pointer" />
              <span className="text-sm text-slate-600">I agree to the Terms & Policy</span>
            </label>

            <button type="submit" disabled={!requiredValid || loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${requiredValid && !loading ? "bg-slate-900 hover:bg-black active:scale-95" : "bg-slate-300 cursor-not-allowed"}`}>
              {loading ? "Processing..." : `Confirm Booking • ₹ ${totalPayable.toLocaleString("en-IN")}`}
            </button>
          </form>
        </section>

        {/* SUMMARY SIDEBAR */}
        <aside className="h-fit sticky top-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Booking Summary</h3>
            
            <img 
              src={room.images?.[0] ? `http://localhost:5000${room.images[0].startsWith('/') ? '' : '/'}${room.images[0]}` : "https://via.placeholder.com/400x250"} 
              alt={room.title} 
              className="rounded-xl mb-4 w-full h-44 object-cover" 
            />

            <div className="mb-4">
              <h4 className="font-bold text-lg uppercase tracking-wide">{room.title}</h4>
              <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-1">
                 <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Stay Duration</p>
                 <p className="text-sm text-slate-700">
                   {checkInDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {checkOutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                 </p>
                 <p className="text-sm font-bold text-indigo-700">{totalNights} Night(s)</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Standard Rate / Night</span>
                <span className="font-bold text-slate-800">
                  {pricePerNight > 0 ? `₹ ${pricePerNight.toLocaleString("en-IN")}` : "Not Set"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm italic">
                <span>Room Subtotal</span>
                <span>₹ {subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>GST (18%)</span>
                <span>₹ {taxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-dashed border-slate-200 mt-2">
                <span className="text-slate-900">Total Payable</span>
                <span className="text-amber-600 font-extrabold">₹ {totalPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}