import { useState } from "react";
import { Link } from "react-router-dom";

function Header2() {

  const [hoverItem, setHoverItem] = useState(null);
  const [hoverBtn, setHoverBtn] = useState(false);

  const headerstyle = {
    display: "flex",
    alignItems: "center",
    padding: "16px 40px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e8e8e8",
  };

  const brand = {
    fontSize: "30px",
    fontWeight: "750",
    color: "#333",
    marginLeft: "6rem",
  };

  const ulStyle = {
    display: "flex",
    listStyleType: "none",
    gap: "30px",
    padding: "0",
    marginLeft: "auto",
    marginRight: "40px",
    fontSize: "20px",
    fontWeight: "700",
    marginTop: "0",
    marginBottom: "0",
  };

  // 👇 LI hover style
  const listyle = (isHover) => ({
    margin: "0",
    padding: "0",
    cursor: "pointer",
    color: isHover ? "#01eaacff" : "#555",
    transition: "color 0.3s ease",
   
  });

  // 👇 Button hover style
  const btnstyle = {
    padding: "10px 20px",
    backgroundColor: hoverBtn ? "#1f4773ff" : "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "550",
    transition: "background-color 0.3s ease",
    marginRight: "30px",
  };

  return (
    <section style={headerstyle} className="header2">
      <div style={brand}>RoyalPark</div>

      <ul style={ulStyle}>
        {["Home", "Rooms"].map((item) => (
          <li
            key={item}
            style={listyle(hoverItem === item)}
            onMouseEnter={() => setHoverItem(item)}
            onMouseLeave={() => setHoverItem(null)}
          >
             <Link
              to={item === "Home" ? "/" : "/rooms"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>

      <button
        style={btnstyle}
        onMouseEnter={() => setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
      >
        My Booking
      </button>
    </section>
  );
}

export default Header2;
