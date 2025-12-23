import { Routes, Route, Navigate } from "react-router-dom";

import Bookingpage from "./comp/Bookingpage";
import Bookformpage from "./comp/BookForm";

// Auth pages (YOUR PART)
import Register from "./comp/Registration";
import Login from "./comp/Login";

// Landing page components (FRIEND'S PART)
import Herosection from "./comp/index";
import AboutUs from "./comp/About";
import Middle from "./comp/Middle";
import Footer from "./comp/footer";
import Rooms from "./comp/staticroom"
import Small from "./comp/small";
//import Header2 from "./comp/Header2";


import Mybooking from "./comp/Mybookingpage";

function App() {
  return (
    <Routes>
      {/* ===== Landing Page (Friend's Work) ===== */}
      <Route
        path="/"
        element={
          <>
          <Herosection />
            <AboutUs />
            <Middle />
            <Rooms />
            <Small />
            <Footer />
            {/* <Mybooking></Mybooking> */}
          </>
        }
      />
{/*  */}
       <Route path="/BookingFrompage" element={<Bookformpage />} />
      {/* ====Booking page ===== */}
       <Route path="/bookingpage" element={<Bookingpage />} />


      {/* ===== Auth Pages (Your Work) ===== */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* ===== Safety Redirect ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
