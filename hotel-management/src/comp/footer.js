import "../Componentcss/footer.css";
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* COLUMN 1 */}
        <div className="footer-col">
          <h2 className="footer-logo">
            <span className="logo-dot"></span>Rayal Park
          </h2>

          <p className="footer-text">
            Discover a world of comfort, luxury, and adventure as you explore
            our curated selection of hotels, making every moment of your
            getaway truly extraordinary.
          </p>

          <button className="footer-btn">Book Now</button>
        </div>

        {/* COLUMN 2 */}
        <div className="footer-col">
          <h3 className="footer-title">QUICK LINKS</h3>
          <ul>
            <li>Browse Destinations</li>
            <li>Special Offers & Packages</li>
            <li>Room Types & Amenities</li>
            <li>Customer Reviews & Ratings</li>
            <li>Travel Tips & Guides</li>
          </ul>
        </div>

        {/* COLUMN 3 */}
        <div className="footer-col">
          <h3 className="footer-title">OUR SERVICES</h3>
          <ul>
            <li>Concierge Assistance</li>
            <li>Flexible Booking Options</li>
            <li>Airport Transfers</li>
            <li>Wellness & Recreation</li>
          </ul>
        </div>

        {/* COLUMN 4 */}
        <div className="footer-col">
          <h3 className="footer-title">CONTACT US</h3>
          <p className="footer-email">rayalpark@info.com</p>

          <div className="footer-social">
            <FaFacebook />
            <FaInstagram />
            <FaYoutube />
            <FaTwitter />
          </div>
        </div>

      </div>

      <p className="footer-bottom">
        Copyright © 2023 Web Design Mastery. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
