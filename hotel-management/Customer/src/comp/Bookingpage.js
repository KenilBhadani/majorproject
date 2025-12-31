import { useLocation } from "react-router-dom";
import Header2 from "./Header2";
import BookingSteps from "./Bookingstep";
import RoomListing from "./roombooking";
import Footer from "./footer";

function Bookingpage() {
  const location = useLocation();

  // This contains checkIn, checkOut, roomType, guests
  const searchParams = location.state?.searchParams;

  return (
    <>
      <Header2 />
      <BookingSteps activeStep={1} />

      {/* Pass searchParams to RoomListing */}
      <RoomListing searchParams={searchParams} />

      <Footer />
    </>
  );
}

export default Bookingpage;
