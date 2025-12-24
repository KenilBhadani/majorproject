import '../Componentcss/AboutusPage.css';
import '../Componentcss/About.css'; // Make sure this matches your file path

function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "James Anderson",
      role: "General Manager",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Head Chef",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Guest Relations",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="about-page-container">
      
      {/* --- HERO BANNER --- */}
      <div className="abt-hero">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury Hotel Lobby" 
          className="abt-hero-img"
        />
        <div className="abt-hero-overlay">
          <h1 className="abt-hero-title">About Us</h1>
        </div>
      </div>

      {/* --- OUR HERITAGE SECTION --- */}
      <div className="abt-heritage-section">
        <div className="abt-grid">
          
          {/* Text Content */}
          <div className="abt-text-content">
            <p className="abt-tag">SINCE 1998</p>
            <h2 className="abt-heading">
              Redefining Luxury & <br/> <span className="abt-gold-text">Hospitality.</span>
            </h2>
            <p className="abt-desc">
              RoyalPark began with a simple vision: to create a sanctuary where comfort meets elegance. Over the last two decades, we have evolved into a landmark of luxury, hosting world leaders, celebrities, and travelers seeking the extraordinary.
            </p>
            <p className="abt-desc">
              We believe that a hotel is more than just a place to sleep—it is a place to dream, to connect, and to be inspired.
            </p>
          </div>

          {/* Image Grid */}
          <div className="abt-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Hotel Interior" 
              className="abt-interior-img"
            />
            <div className="abt-stat-box">
              <p className="abt-stat-number">25+</p>
              <p className="abt-stat-label">Years of Excellence</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- TEAM SECTION --- */}
      <div className="abt-team-section">
        <div className="abt-container">
          <h2 className="abt-section-title">Meet The Team</h2>
          
          <div className="abt-team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="abt-team-card">
                <div className="abt-team-img-box">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="abt-team-img"
                  />
                </div>
                <div className="abt-team-info">
                  <h3 className="abt-member-name">{member.name}</h3>
                  <p className="abt-member-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default AboutPage;