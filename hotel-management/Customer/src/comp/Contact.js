import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import HeaderOfCustomer from "./HeaderOfCustomer"; // adjust path if needed

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent to the RoyalPark concierge.");
  };

  return (
    <div className="bg-white font-sans text-slate-900 antialiased">

      {/* ✅ COMMON HEADER */}
      <HeaderOfCustomer />

      {/* ================= HERO ================= */}
      <section className="relative h-[50vh] flex items-center justify-center bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
          alt="Contact Background"
        />
        <div className="relative text-center px-6">
          <span className="text-amber-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl text-white font-serif tracking-tight">
            Contact Us
          </h1>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto py-24 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* ================= FORM ================= */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-serif text-slate-900 mb-4">
                Send us a Message
              </h2>
              <p className="text-slate-500 font-light">
                Whether you have a question about booking or special requests,
                our concierge is here to help.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border-b border-slate-200 py-3 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-slate-100 bg-slate-50 p-4 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-10 py-4 bg-slate-900 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-500 transition-all duration-300"
              >
                Send Inquiry
              </button>
            </form>
          </div>

          {/* ================= INFO ================= */}
          <div className="space-y-12">
            <div className="bg-slate-50 p-12 space-y-8 border-t-4 border-amber-500">
              <div className="flex gap-6">
                <MapPin className="text-amber-500" />
                <p className="text-slate-500">
                  123 Royal Avenue, Palace District,<br />
                  Mumbai, India
                </p>
              </div>

              <div className="flex gap-6">
                <Phone className="text-amber-500" />
                <p className="text-slate-500">+91 987 654 3210</p>
              </div>

              <div className="flex gap-6">
                <Mail className="text-amber-500" />
                <p className="text-slate-500 italic">
                  reservations@royalpark.com
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="h-[300px] bg-slate-100 overflow-hidden grayscale">
              <iframe
                title="Hotel Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120651.922285!2d72.774904!3d18.966384"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="py-20 border-t text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-400">
          RoyalPark Hotel & Resorts
        </p>
      </footer>
    </div>
  );
}

export default Contact;
