import { useLocation, Navigate } from "react-router-dom";
import BookingSteps from "./Bookingstep";
import BookingForm from "./Bookingcus";
import Header2 from "./Header2";

function Bookformpage() {
  const location = useLocation();
  
  // Access the room data passed from RoomCard
  const roomData = location.state?.room;
  const searchParams = location.state?.searchParams;

  // SAFETY: If there is no room data, redirect back to the rooms list
  if (!roomData) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header2 />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Step indicator: 2 usually means "Customer Info" */}
        <BookingSteps activeStep={2} />
        
        <div className="mt-8">
          {/* Pass the roomData to the form so it can show 
            the summary (Price, Title) and save it to the DB 
          */}
          <BookingForm selectedRoom={roomData} dates={searchParams} />
        </div>
      </div>
    </div>
  );
}

export default Bookformpage;