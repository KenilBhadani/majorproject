import React, { useState } from 'react';
import '../Componentcss/Contact.css'; // Make sure to create this file
import '../Componentcss/Contact.css'; // Reuse styles if needed
function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! We have received your message.");
  };

  return (
    <div className="contact-page-wrapper">
      
      {/* --- HEADER BANNER --- */}
      <div className="contact-hero">
        <p className="contact-tag">GET IN TOUCH</p>
        <h1 className="contact-title">Contact Us</h1>
      </div>

      <div className="contact-container">
        <div className="contact-grid">
          
          {/* --- LEFT: CONTACT FORM --- */}
          <div className="contact-form-section">
            <h2 className="contact-heading">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              
              <div className="contact-row">
                <div className="contact-input-group">
                  <label>Your Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="contact-input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="contact-input-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-input"
                  placeholder="Booking Inquiry"
                />
              </div>

              <div className="contact-input-group">
                <label>Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="contact-input contact-textarea"
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                Send Message
              </button>
            </form>
          </div>

          {/* --- RIGHT: INFO & MAP --- */}
          <div className="contact-info-section">
            
            {/* Contact Details */}
            <div className="contact-details-box">
              <h2 className="contact-heading">Contact Info</h2>
              
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h3 className="contact-label">Address</h3>
                    <p className="contact-text">123 Royal Avenue, Palace District, Mumbai, India</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h3 className="contact-label">Phone</h3>
                    <p className="contact-text">+91 987 654 3210</p>
                    <p className="contact-text">+91 123 456 7890</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <h3 className="contact-label">Email</h3>
                    <p className="contact-text">reservations@royalpark.com</p>
                    <p className="contact-text">info@royalpark.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="contact-map-wrapper">
                <iframe 
                    title="Hotel Location"
                    // Placeholder map link
                    src="https://maps.google.com/maps?q=Mumbai&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen="" 
                    loading="lazy">
                </iframe>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default Contact;