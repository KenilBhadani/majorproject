import BookingSteps from "./Bookingstep";
import BookingForm from "./Bookingcus";
import Header2 from "./Header2";

function Bookformpage() {
  return (
    <div>
      <Header2 />
      <BookingSteps activeStep={2} />
      <BookingForm />
    </div>
  );
}
export default Bookformpage;