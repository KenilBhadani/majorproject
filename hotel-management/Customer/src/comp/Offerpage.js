// 1. FIXED: Added correct imports for React hooks and Router
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* --- MOCK DATA --- */
const OFFERS_DATA = [
    {
        id: 1,
        category: "Seasonal",
        title: "Winter Escape Package",
        discount: "30% OFF",
        description: "Escape the cold with our exclusive winter retreat.",
        longDescription: "Includes a 30% discount, daily gourmet breakfast for two, and one spa treatment.",
        validUntil: "Jan 31, 2026",
        image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
        amenities: ["Free Spa", "Heated Pool", "Daily Breakfast"]
    },
    {
        id: 2,
        category: "Dining",
        title: "Gourmet Staycation",
        discount: "Free Dinner",
        description: "Book your stay and indulge in a complimentary 4-course dinner.",
        longDescription: "Experience culinary excellence with a full 4-course meal prepared by our Executive Chef.",
        validUntil: "Feb 15, 2026",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
        amenities: ["4-Course Meal", "Rooftop Access", "Welcome Drinks"]
    }
];

/* --- MODAL COMPONENT --- */
const OfferModal = ({ offer, onClose }) => {
    // 2. FIXED: navigate is now defined inside this component
    const navigate = useNavigate();

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleRedeem = () => {
        const discountValue = parseInt(offer.discount) || 0;
        const multiplier = 1 - (discountValue / 100);

        navigate('/bookingpage', { 
            state: { 
                appliedOffer: {
                    name: offer.title,
                    multiplier: multiplier,
                    discountText: offer.discount,
                    code: `ROYAL${offer.id}00`
                }
            } 
        });
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center z-10 text-slate-900 font-bold">✕</button>
                <div className="overflow-y-auto">
                    <img src={offer.image} alt={offer.title} className="h-72 w-full object-cover" />
                    <div className="p-8">
                        <span className="text-amber-600 font-bold text-xs uppercase">{offer.category}</span>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mt-1">{offer.title}</h2>
                        <p className="text-slate-600 my-6">{offer.longDescription}</p>
                        <button 
                            onClick={handleRedeem}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all"
                        >
                            Redeem This Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- MAIN PAGE COMPONENT --- */
function OffersPage() {
    const [filter, setFilter] = useState("All");
    const [selectedOffer, setSelectedOffer] = useState(null);
    const navigate = useNavigate();

    const categories = ["All", "Seasonal", "Dining", "Wellness"];

    const filteredOffers = filter === "All" 
        ? OFFERS_DATA 
        : OFFERS_DATA.filter(o => o.category === filter);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="h-20 bg-white border-b flex items-center px-10">
                <button onClick={() => navigate(-1)} className="text-slate-600 font-medium">← Back</button>
            </div>

            <div className="bg-slate-900 py-16 text-center">
                <h1 className="text-4xl font-serif font-bold text-white mb-4">Exclusive Deals</h1>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {filteredOffers.map(offer => (
                        <div key={offer.id} className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                            <img src={offer.image} alt={offer.title} className="w-full h-64 object-cover" />
                            <div className="p-8">
                                <h3 className="text-2xl font-bold mb-4">{offer.title}</h3>
                                <button 
                                    onClick={() => setSelectedOffer(offer)}
                                    className="bg-slate-100 px-6 py-3 rounded-xl font-bold hover:bg-amber-600 hover:text-white transition-all"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {selectedOffer && (
                <OfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
            )}
        </div>
    );
}

// 3. FIXED: Added the default export so other files can find 'Offerpage'
export default OffersPage;