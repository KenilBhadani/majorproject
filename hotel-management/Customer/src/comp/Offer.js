import '../Componentcss/OffersHero.css';
import { Link } from 'react-router-dom';

function OffersHero() {
    return (
        <section className="offers-hero-section">
            {/* 1. The Background Image Container */}
            <div className="hero-image-container">
                <img 
                    // Using a high-quality Unsplash image of a luxury resort
                    src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Luxury hotel pool at sunset" 
                    className="hero-bg-img"
                />
                {/* A subtle overlay to ensure the image isn't too bright */}
                <div className="hero-overlay"></div>
            </div>

            {/* 2. The Floating Content Card */}
            <div className="hero-content-wrapper">
                <div className="hero-text-card">
                    {/* A small tag above the headline */}
                    <span className="offer-tag">✨ Limited-Time Deals</span>
                    
                    <h1 className="hero-headline">
                        Unlock Your Next <span className="highlight-text">Dream Stay</span> for Less.
                    </h1>
                    
                    <p className="hero-subtext">
                        Experience world-class luxury without the world-class price tag. 
                        Save up to 30% on suites and get complimentary breakfast on select packages.
                    </p>
                    
                    <div className="hero-actions">
                        <button className="btn-hero-primary"><Link to="/offerpage">View All Offers</Link></button>
                        <button className="btn-hero-secondary">Subscribe for Alerts</button>
                    </div>

                    {/* Optional subtle footer inside the card */}
                    <p className="offer-disclaimer">Offers end October 31st. T&Cs apply.</p>
                </div>
            </div>
        </section>
    );
}

export default OffersHero;