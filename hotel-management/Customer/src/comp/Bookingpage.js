import Header2 from "./Header2";
import BookingSteps from "./Bookingstep";
import RoomListing from "./roombooking";
import Footer from "./footer";

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