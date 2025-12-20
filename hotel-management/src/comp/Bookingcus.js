import React, { useState, useMemo } from "react";
import "../Componentcss/bookingform.css";


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
  const [showDetails, setShowDetails] = useState(false);

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
    alert("Booking submitted — check console (or replace with API).");
    console.log("Booking payload:", payload);
  }

  return (
    <div className="bf-page">
      <main className="booking-layout">
        {/* LEFT: Form */}
        <section className="form-card">
          <header className="form-header">
            <h2>Primary Guest Details</h2>
            <p className="muted">Complete the required fields to continue to payment.</p>
          </header>

          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            <div className="row">
              {/* Title select */}
              <div className="field select-field">
                <select
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  onFocus={() => handleFocus("title")}
                  onBlur={() => handleBlur("title")}
                  aria-required="true"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
                <label
                  htmlFor="title"
                  className={form.title || focus.title ? "floating active" : "floating"}
                >
                  Title *
                </label>
              </div>

              {/* First name */}
              <div className="field">
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("firstName")}
                  onBlur={() => handleBlur("firstName")}
                  required
                />
                <label
                  htmlFor="firstName"
                  className={form.firstName || focus.firstName ? "floating active" : "floating"}
                >
                  First Name *
                </label>
              </div>

              {/* Last name */}
              <div className="field">
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("lastName")}
                  onBlur={() => handleBlur("lastName")}
                  required
                />
                <label
                  htmlFor="lastName"
                  className={form.lastName || focus.lastName ? "floating active" : "floating"}
                >
                  Last Name *
                </label>
              </div>
            </div>

            {/* Email and Phone */}
            <div className="row">
              <div className="field">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  required
                />
                <label
                  htmlFor="email"
                  className={form.email || focus.email ? "floating active" : "floating"}
                >
                  Email Address *
                </label>
              </div>

              <div className="field mobile">
                <div className="country-code" aria-hidden="true">
                  🇮🇳 +91
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onFocus={() => handleFocus("phone")}
                  onBlur={() => handleBlur("phone")}
                  required
                />
                <label
                  htmlFor="phone"
                  className={form.phone || focus.phone ? "floating active" : "floating"}
                >
                  Mobile Number *
                </label>
              </div>
            </div>

            {/* GST */}
            <div className="row">
              <div className="field full">
                <input
                  id="gst"
                  name="gst"
                  value={form.gst}
                  onChange={handleChange}
                  onFocus={() => handleFocus("gst")}
                  onBlur={() => handleBlur("gst")}
                />
                <label htmlFor="gst" className={form.gst || focus.gst ? "floating active" : "floating"}>
                  GST Number (optional)
                </label>
              </div>
            </div>

            {/* Special Requests */}
            <div className="row">
              <div className="field full">
                <textarea
                  id="requests"
                  name="requests"
                  value={form.requests}
                  onChange={(e) => setForm((s) => ({ ...s, requests: e.target.value.slice(0, 400) }))}
                  onFocus={() => handleFocus("requests")}
                  onBlur={() => handleBlur("requests")}
                  maxLength={400}
                />
                <label
                  htmlFor="requests"
                  className={form.requests || focus.requests ? "floating active" : "floating"}
                >
                  Special Requests (optional)
                </label>
                <div className="counter">{form.requests.length} / 400</div>
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <div className="checkbox-row">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                aria-required="true"
              />
              <label htmlFor="agree" className="agree-label">
                I agree to the
                <a href="/" className="link">
                  {" "}
                  Privacy Policy
                </a>{" "}
                and
                <a href="/" className="link">
                  {" "}
                  Terms & Conditions
                </a>
              </label>
            </div>

            <div className="actions">
              <button type="submit" className="btn-primary" disabled={!requiredValid} aria-disabled={!requiredValid}>
                Continue • ₹ {total.toLocaleString("en-IN")}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() =>
                  setForm({
                    title: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    gst: "",
                    requests: "",
                    agree: false,
                  })
                }
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: Summary */}
        <aside className="summary-column">
          <div className="summary-card">
            <div className="summary-head">
              <h3>Your Stay</h3>
              <button type="button" className="details-toggle" onClick={() => setShowDetails((s) => !s)} aria-expanded={showDetails}>
                {showDetails ? "Hide" : "Details"}
              </button>
            </div>

            <div className="room-info">
              <div className="line">
                <div className="title">Deluxe Room — King Bed</div>
                <div className="meta">Room 1 · 1 Adult</div>
              </div>

              <div className={`price-details ${showDetails ? "open" : ""}`}>
                <div className="price-line">
                  <span>Price</span>
                  <span>₹ {basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="price-line muted">
                  <span>Taxes & Fees (18%)</span>
                  <span>₹ {taxes.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <hr />

              <div className="total-line">
                <div>
                  <div className="small muted">Total Amount</div>
                  <div className="small muted">Payable at Hotel</div>
                </div>
                <div className="total-amount">₹ {total.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>

          <div className="policy-card">
            <h4>Cancellation Policy</h4>
            <p className="muted">
              Free cancellation until 2PM — 3 days prior to arrival. After that, 1 night penalty + taxes.
            </p>
          </div>
        </aside>
      </main>
    </div>
    
  );
}
