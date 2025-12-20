import React from 'react';
import '../Componentcss/Staticroom.css';

const roomsData = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop', // Replace with your image
    title: 'Deluxe Ocean View',
    description: 'Bask in luxury with breathtaking ocean views from your private suite.',
    price: '$299',
    buttonText: 'Book Now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop', // Replace with your image
    title: 'Executive Cityscape Room',
    description: 'Experience urban elegance and modern comfort in the heart of the city.',
    price: '$199',
    buttonText: 'Book Now'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop', // Replace with your image
    title: 'Family Garden Retreat',
    description: 'Spacious and inviting, perfect for creating cherished memories with loved ones.',
    price: '$249',
    buttonText: 'Book Now'
  }
];

const RoomListing = () => {
  return (
    <section className="room-section">
      {/* Header Section */}
      <div className="section-header">
        <div className="subtitle-wrapper">
          <span className="subtitle">OUR LIVING ROOM</span>
          <span className="line"></span>
        </div>
        <h2 className="main-title">The Most Memorable Rest <br /> Time Starts Here.</h2>
      </div>

      {/* Grid of Cards */}
      <div className="room-grid">
        {roomsData.map((room) => (
          <div className="room-card" key={room.id}>
            
            {/* Image Container with Floating Icons */}
            <div className="image-container">
              <img src={room.image} alt={room.title} />
              <div className="icon-overlay">
                <span className="icon-circle">❤</span>
                <span className="icon-circle">☀</span>
                <span className="icon-circle">★</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
              <h3>{room.title}</h3>
              <p className="description">{room.description}</p>
              <p className="price">Starting from <strong>{room.price}/night</strong></p>
              <button className="book-btn">{room.buttonText}</button>
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
};

export default RoomListing;