import { Heart, Star, ArrowRight, Wifi, Coffee, Wind } from "lucide-react";
import "../Componentcss/Staticroom.css";

const roomsData = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop",
    title: "Deluxe Ocean View",
    description:
      "Bask in luxury with breathtaking ocean views from your private suite. Features a private balcony and premium amenities.",
    price: "$299",
    rating: 4.9,
    buttonText: "Book Now",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
    title: "Executive Cityscape",
    description:
      "Experience urban elegance and modern comfort in the heart of the city. Perfect for business travelers.",
    price: "$199",
    rating: 4.7,
    buttonText: "Book Now",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop",
    title: "Family Garden Retreat",
    description:
      "Spacious and inviting, perfect for creating cherished memories with loved ones. Direct access to the pool.",
    price: "$249",
    rating: 4.8,
    buttonText: "Book Now",
  },
];

const RoomCard = ({ room }) => {
  return (
    <div className="room-card">
      {/* Image */}
      <div className="image-wrapper">
        <img src={room.image} alt={room.title} className="room-image" />
        <div className="image-overlay"></div>

        {/* Rating */}
        <div className="rating-badge">
          <Star size={14} fill="currentColor" color="#eab308" />
          <span className="rating-text">{room.rating}</span>
        </div>

        {/* Wishlist */}
        <div className="favorite-btn-wrapper">
          <button className="favorite-btn">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="card-main-content">
          <h3 className="room-title">{room.title}</h3>

          <p className="room-description">{room.description}</p>

          {/* Amenities */}
          <div className="amenities-row">
            <div className="amenity-item">
              <Wifi size={16} />
              <span className="amenity-label">Wifi</span>
            </div>
            <div className="amenity-item">
              <Wind size={16} />
              <span className="amenity-label">AC</span>
            </div>
            <div className="amenity-item">
              <Coffee size={16} />
              <span className="amenity-label">Breakfast</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <div className="price-container">
            <span className="price-label">Starting from</span>
            <span className="price-value">
              {room.price}
              <span className="price-unit"> / night</span>
            </span>
          </div>

          <button className="book-btn">
            {room.buttonText}
            <ArrowRight size={16} className="btn-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomListing = () => {
  return (
    <div className="app-container">
      <section className="listing-section">
        {/* Header */}
        <div className="section-header">
          <div className="subtitle-wrapper">
            <span className="header-line"></span>
            <span className="subtitle">Our Living Room</span>
            <span className="header-line"></span>
          </div>

          <h2 className="main-title">
            The Most Memorable Rest <br />
            <span className="gradient-text">Time Starts Here.</span>
          </h2>

          <p className="header-desc">
            Discover a sanctuary of serenity where modern luxury meets timeless
            comfort. Every room is designed to be your personal haven.
          </p>
        </div>

        {/* Grid */}
        <div className="room-grid">
          {roomsData.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default RoomListing;
