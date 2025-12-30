import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoyaltyHero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Welcome to the Club! Check ${email} for your digital membership card.`);
    setEmail("");
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center overflow-hidden">
      
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          // FIXED: The 'poster' attribute shows this image while video loads or if video fails
          poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
          className="w-full h-full object-cover"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-luxury-hotel-lobby-and-reception-area-10025-large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Overlay for Contrast */}
        <div className="absolute inset-0 bg-slate-900/40"></div>
        
        {/* Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/20 to-transparent"></div>
      </div>

      {/* 2. Content Card */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-xl bg-white/95 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-2xl transition-all duration-1000">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            Privilege Club
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
            Travel Better with <br />
            <span className="text-amber-600 italic">Member Benefits.</span>
          </h1>

          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            Join the RoyalPark Privilege Club to unlock instant 15% discounts, 
            early check-ins, and curated local experiences designed just for you.
          </p>

          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 mb-8">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-800 placeholder:text-slate-400"
            />
            <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 hover:text-slate-900 transition-all active:scale-95 shadow-lg">
              Join Free
            </button>
          </form>

          {/* Footer Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-6 gap-4">
            <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">
              <span className="flex items-center gap-1">✨ Room Upgrades</span>
              <span className="flex items-center gap-1">✨ Free Spa</span>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-amber-600 text-sm font-bold underline hover:text-amber-700 transition-colors"
            >
              Member Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}