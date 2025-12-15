import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages (YOUR PART)
import Register from "./comp/Registration";
import Login from "./comp/Login";

// Landing page components (FRIEND'S PART)
import Herosection from "./comp/index";
import AboutUs from "./comp/About";
import Middle from "./comp/Middle";
import Footer from "./comp/footer";

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
            <Footer />
          </>
        }
      />

      {/* ===== Auth Pages (Your Work) ===== */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* ===== Safety Redirect ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
