import '../Componentcss/About.css';
import Hero from '../images/Hero.jpg';   // <-- IMPORT IMAGE

function AboutUs() {
  return (
    <section className="about-container">
      <div className="about-left">
        <img src={Hero} className="about-img" alt="About" />
      </div>

      <div className="about-right">
        <p className="about-tag">ABOUT US <span></span></p>
        <h2 className="about-title">The Best Holidays Start Here!</h2>

        <p className="about-desc">
          With a focus on quality accommodations, personalized experiences,
          and seamless booking, our platform is dedicated to ensuring that
          every traveler embarks on their dream holiday with confidence and
          excitement.
        </p>

        <button className="about-btn">Read More</button>
      </div>
    </section>
  );
}

export default AboutUs;
