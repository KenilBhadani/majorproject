import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

/* ================= FLOATING INPUT ================= */
const FloatingInput = ({ id, label, value, isFocused, required = false, type = "text", ...props }) => {
  const isActive = value || isFocused;

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        className={`peer w-full border rounded-lg px-4 py-3 bg-white text-slate-800 outline-none transition-all
          ${isActive ? "border-amber-600 ring-1 ring-amber-600" : "border-slate-300"}
        `}
        {...props}
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

/* ================= MAIN COMPONENT ================= */
export default function BookingForm() {
  const location = useLocation();
  const room = location.state?.room; // ✅ selected room

  /* ---------------- FORM STATE ---------------- */
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

  const [focus, setFocus] = useState({});
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  /* ---------------- PRICE LOGIC ---------------- */
  const basePrice = room?.rates?.price || 13750;
  const taxRate = 0.18;

  const taxes = useMemo(() => Math.round(basePrice * taxRate), [basePrice]);
  const total = useMemo(() => basePrice + taxes, [basePrice, taxes]);

  const requiredValid =
    form.title &&
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.agree;

  /* ---------------- HANDLERS ---------------- */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  function handlePhoneChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((s) => ({ ...s, phone: digits }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!requiredValid) {
      setError("Please fill required fields");
      return;
    }

    const payload = {
      guest: form,
      roomId: room?._id,
      totalAmount: total,
    };

    console.log("BOOKING DATA:", payload);
    alert("Booking Submitted!");
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ================= LEFT FORM ================= */}
        <section className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Guest Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select
                name="title"
                value={form.title}
                onChange={handleChange}
                className="border px-3 py-3 rounded-lg"
              >
                <option value="">Title *</option>
                <option>Mr</option>
                <option>Mrs</option>
                <option>Ms</option>
              </select>

              <FloatingInput id="firstName" label="First Name" required value={form.firstName}
                onChange={handleChange} />

              <FloatingInput id="lastName" label="Last Name" required value={form.lastName}
                onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput id="email" type="email" label="Email" required value={form.email}
                onChange={handleChange} />

              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.phone}
                onChange={handlePhoneChange}
                className="border px-4 py-3 rounded-lg"
              />
            </div>

            <FloatingInput id="gst" label="GST Number (Optional)" value={form.gst}
              onChange={handleChange} />

            <textarea
              name="requests"
              rows="3"
              placeholder="Special Requests"
              value={form.requests}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

            {error && <p className="text-red-600">{error}</p>}

            <label className="flex items-center gap-2">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              I agree to terms & policy
            </label>

            <button
              type="submit"
              disabled={!requiredValid}
              className="w-full bg-slate-900 text-white py-3 rounded-lg"
            >
              Continue to Payment • ₹ {total.toLocaleString("en-IN")}
            </button>
          </form>
        </section>

        {/* ================= RIGHT SUMMARY ================= */}
        <aside className="bg-white p-6 rounded-2xl shadow-lg sticky top-6">
          <h3 className="text-xl font-bold mb-4">Your Stay</h3>

          {room ? (
            <>
              <img
                src={room.images?.[0]}
                alt={room.title}
                className="rounded-lg mb-4"
              />

              <h4 className="font-bold">{room.title}</h4>
              <p className="text-sm text-slate-500">
                {room.capacity} Guests · {room.bedType}
              </p>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Room Price</span>
                  <span>₹ {basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (18%)</span>
                  <span>₹ {taxes.toLocaleString("en-IN")}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹ {total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </>
          ) : (
            <p>No room selected</p>
          )}
        </aside>
      </div>
    </div>
  );
}
