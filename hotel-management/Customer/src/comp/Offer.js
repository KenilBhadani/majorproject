import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoyaltyHero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef(null);

  // Backend API URL
  const API_URL =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5000";

  // Simple email validation
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.info("You are already a Privilege Club member 🎉");
          return;
        }
        throw new Error(data?.message || "Subscription failed");
      }

      // Save email locally
      localStorage.setItem("loyaltyEmail", trimmedEmail);

      toast.success("Welcome to the Privilege Club! 🎉", {
        autoClose: 1500,
      });

      setEmail("");

      // Redirect after toast
      redirectTimer.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup redirect timer
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-right" />

      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        {/* BACKGROUND VIDEO */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
            className="w-full h-full object-cover"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-luxury-hotel-lobby-and-reception-area-10025-large.mp4"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-0 bg-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/20 to-transparent" />
        </div>

        {/* CONTENT CARD */}
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-xl bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-2xl">
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              Privilege Club
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
              Travel Better with <br />
              <span className="text-amber-600 italic">
                Member Benefits.
              </span>
            </h1>

            <p className="text-slate-600 text-lg mb-8">
              Join the RoyalPark Privilege Club to unlock instant 15%
              discounts, early check-ins, and curated local experiences.
            </p>

            {/* SUBSCRIPTION FORM */}
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 bg-slate-100 p-2 rounded-2xl border mb-8"
            >
              <input
                type="email"
                required
                disabled={loading}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 outline-none disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-60"
              >
                {loading ? "Joining..." : "Join Free"}
              </button>
            </form>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4">
              <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase">
                <span>✨ Room Upgrades</span>
                <span>✨ Free Spa</span>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="text-amber-600 text-sm font-bold underline hover:text-amber-700"
              >
                Member Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
