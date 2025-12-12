import vidofile from "../images/Middle.jpg";
import "../Componentcss/Middle.css";

function Middle() {
  return (
    <section className="service-banner">

      <img src={vidofile} alt="Hotel" className="banner-image" />

      <div className="content-box">
        <p className="services-tag">SERVICES</p>
        <h2 className="services-title">
          Strive Only For The <br /> Best.
        </h2>

        <ul className="services-list">
          <li><span className="icon blue">🛡️</span> High Class Security</li>
          <li><span className="icon pink">⏱️</span> 24 Hours Room Service</li>
          <li><span className="icon purple">🎧</span> Conference Room</li>
          <li><span className="icon red">📍</span> Tourist Guide Support</li>
        </ul>
      </div>

    </section>
  );
}

export default Middle;
