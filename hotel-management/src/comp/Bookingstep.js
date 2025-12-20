import '../Componentcss/Bookingsteps.css';

function BookingSteps({ activeStep = 1 }) {
  return (
    <div className="steps-wrapper">
      <h2 className="steps-title">
        <span className="line"></span>
        PLAN YOUR STAY
        <span className="line"></span>
      </h2>

      <div className="steps">
        <div className={`step ${activeStep >= 1 ? "active" : ""}`}>
          <span className="circle">1</span>
          <p>Select Room</p>
        </div>

        <div className={`step ${activeStep >= 2 ? "active" : ""}`}>
          <span className="circle">2</span>
          <p>Personal Details</p>
        </div>

        <div className={`step ${activeStep >= 3 ? "active" : ""}`}>
          <span className="circle">3</span>
          <p>Payment Confirmation</p>
        </div>
      </div>
    </div>
  );
}

export default BookingSteps;
