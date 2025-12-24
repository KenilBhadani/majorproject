import Header2 from "./Header2";
import Footer from "./footer";
import RoomListing from "./roombooking";
import BookingSteps from "./Bookingstep";

function Bookingpage() {
    return (
        <>
            <Header2 /> 
            <BookingSteps activeStep={1} />
            <RoomListing />
            <Footer />
        </>
    );
}
export default Bookingpage;