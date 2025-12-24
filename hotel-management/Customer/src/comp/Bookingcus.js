import { useState, useMemo } from "react";

// --- FIX: Moved FloatingInput OUTSIDE the main component ---
const FloatingInput = ({ id, label, value, isFocused, required = false, type = "text", ...props }) => {
  // Logic: The label floats if there is a value OR if the input is currently focused
  const isActive = value || isFocused;

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        className={`peer w-full border rounded-lg px-4 py-3 bg-white text-slate-800 outline-none transition-all duration-200
          ${isActive ? "border-amber-600 ring-1 ring-amber-600" : "border-slate-300 hover:border-slate-400"}
        `}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white
          ${isActive 
            ? "-top-2.5 text-xs text-amber-600 font-bold" 
            : "top-3.5 text-slate-500"}
        `}
      >
        {label} {required && "*"}
      </label>
    </div>
  );
};

export default function BookingForm() {
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

  const [focus, setFocus] = useState({
    title: false,
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    gst: false,
    requests: false,
  });

  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  const basePrice = 13750;
  const taxRate = 0.18;
  const taxes = useMemo(() => Math.round(basePrice * taxRate), [basePrice]);
  const total = useMemo(() => basePrice + taxes, [basePrice, taxes]);

  const requiredValid =
    form.title &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.agree;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  function handlePhoneChange(e) {
    // NOTE: This prevents typing letters. Only numbers are allowed.
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((s) => ({ ...s, phone: digits }));
    if (error) setError("");
  }

  function handleFocus(name) {
    setFocus((f) => ({ ...f, [name]: true }));
  }
  function handleBlur(name) {
    setFocus((f) => ({ ...f, [name]: false }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!requiredValid) {
      setError("Please complete required fields and accept the terms.");
      return;
    }

    const payload = {
      title: form.title,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gst: form.gst.trim(),
      requests: form.requests.trim(),
    };
    alert("Booking submitted! Check console.");
    console.log("Booking payload:", payload);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Secure Checkout</h1>
            <p className="text-slate-500 mt-2">Finish your booking to secure your luxury stay.</p>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Form */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-t-4 border-amber-600">
              <header className="mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans">1</span>
                  Guest Details
                </h2>
                <p className="text-slate-500 mt-1 ml-10">Who will be staying with us?</p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-2 relative">
                    <select
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      onFocus={() => handleFocus("title")}
                      onBlur={() => handleBlur("title")}
                      className={`w-full border rounded-lg px-3 py-3 bg-white text-slate-800 outline-none transition-all
                        ${(form.title || focus.title) ? "border-amber-600 ring-1 ring-amber-600" : "border-slate-300"}
                      `}
                    >
                      <option value="" disabled></option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                    <label className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none
                        ${(form.title || focus.title) ? "-top-2.5 text-xs text-amber-600 font-bold" : "top-3.5 text-slate-500"}
                    `}>Title *</label>
                  </div>
                  
                  <div className="md:col-span-5">
                    <FloatingInput 
                        id="firstName" 
                        label="First Name" 
                        value={form.firstName} 
                        isFocused={focus.firstName}
                        required 
                        onChange={handleChange} 
                        onFocus={() => handleFocus("firstName")} 
                        onBlur={() => handleBlur("firstName")}
                    />
                  </div>
                  
                  <div className="md:col-span-5">
                    <FloatingInput 
                        id="lastName" 
                        label="Last Name" 
                        value={form.lastName} 
                        isFocused={focus.lastName}
                        required 
                        onChange={handleChange} 
                        onFocus={() => handleFocus("lastName")} 
                        onBlur={() => handleBlur("lastName")}
                    />
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput 
                        id="email" 
                        label="Email Address" 
                        type="email" 
                        value={form.email} 
                        isFocused={focus.email}
                        required 
                        onChange={handleChange} 
                        onFocus={() => handleFocus("email")} 
                        onBlur={() => handleBlur("email")}
                    />

                    <div className="relative flex">
                        <div className="flex items-center justify-center bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg px-3 text-slate-600 font-medium">
                            🇮🇳 +91
                        </div>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.phone}
                            onChange={handlePhoneChange}
                            onFocus={() => handleFocus("phone")}
                            onBlur={() => handleBlur("phone")}
                            className={`w-full border rounded-r-lg px-4 py-3 bg-white text-slate-800 outline-none transition-all duration-200
                                ${(form.phone || focus.phone) ? "border-amber-600 ring-1 ring-amber-600 z-10" : "border-slate-300"}
                            `}
                        />
                        <label className={`absolute left-16 px-1 bg-white transition-all duration-200 pointer-events-none
                            ${(form.phone || focus.phone) ? "-top-2.5 text-xs text-amber-600 font-bold z-10" : "top-3.5 text-slate-500"}
                        `}>Mobile Number *</label>
                    </div>
                </div>

                {/* GST */}
                <FloatingInput 
                    id="gst" 
                    label="GST Number (Optional)" 
                    value={form.gst} 
                    isFocused={focus.gst}
                    onChange={handleChange} 
                    onFocus={() => handleFocus("gst")} 
                    onBlur={() => handleBlur("gst")}
                />

                {/* Requests */}
                <div className="relative">
                    <textarea
                        id="requests"
                        name="requests"
                        rows="3"
                        maxLength={400}
                        value={form.requests}
                        onChange={(e) => setForm((s) => ({ ...s, requests: e.target.value.slice(0, 400) }))}
                        onFocus={() => handleFocus("requests")}
                        onBlur={() => handleBlur("requests")}
                        className={`w-full border rounded-lg px-4 py-3 bg-white text-slate-800 outline-none transition-all duration-200 resize-none
                            ${(form.requests || focus.requests) ? "border-amber-600 ring-1 ring-amber-600" : "border-slate-300"}
                        `}
                    />
                    <label className={`absolute left-3 px-1 bg-white transition-all duration-200 pointer-events-none
                        ${(form.requests || focus.requests) ? "-top-2.5 text-xs text-amber-600 font-bold" : "top-3.5 text-slate-500"}
                    `}>Special Requests (Optional)</label>
                    <div className="text-right text-xs text-slate-400 mt-1">{form.requests.length} / 400</div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </div>
                )}

                {/* Agreement */}
                <div className="flex items-start gap-3 pt-2">
                  <div className="relative flex items-center">
                    <input
                      id="agree"
                      name="agree"
                      type="checkbox"
                      checked={form.agree}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-amber-600 checked:bg-amber-600 transition-all"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none"><path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <label htmlFor="agree" className="text-sm text-slate-600 mt-0.5 cursor-pointer select-none">
                    I agree to the <a href="/" className="text-amber-600 hover:underline">Privacy Policy</a> and <a href="/" className="text-amber-600 hover:underline">Terms & Conditions</a>.
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setForm({ title: "", firstName: "", lastName: "", email: "", phone: "", gst: "", requests: "", agree: false })}
                    className="px-6 py-3 rounded-lg text-slate-500 font-medium hover:bg-slate-100 transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={!requiredValid}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all
                        ${requiredValid 
                            ? "bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5" 
                            : "bg-slate-300 cursor-not-allowed"}
                    `}
                  >
                    Continue to Payment • ₹ {total.toLocaleString("en-IN")}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* RIGHT COLUMN: Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-slate-100">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-slate-800">Your Stay</h3>
                <button 
                    type="button" 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-amber-600 text-sm font-medium hover:text-amber-700"
                >
                    {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {/* Room Info */}
              <div className="mb-6">
                <div className="flex gap-4">
                    {/* Placeholder Room Image */}
                    <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                         <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=150&q=80" alt="Room" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Deluxe King Room</h4>
                        <p className="text-sm text-slate-500">2 Guests · 1 Night</p>
                        <p className="text-xs text-amber-600 font-medium mt-1">Free Breakfast</p>
                    </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className={`space-y-3 transition-all duration-300 overflow-hidden ${showDetails ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Base Price</span>
                  <span>₹ {basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Taxes & Fees (18%)</span>
                  <span>₹ {taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-end mt-2">
                <div>
                    <div className="text-sm text-slate-500">Total Amount</div>
                    <div className="text-xs text-green-600">Payable at Property</div>
                </div>
                <div className="text-2xl font-serif font-bold text-slate-900">
                    ₹ {total.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cancellation Policy</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Free cancellation until 2 PM, 3 days prior to arrival. Cancellations after this time will incur a 1-night penalty fee plus taxes.
                </p>
              </div>

            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}