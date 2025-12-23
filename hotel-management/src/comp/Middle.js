import React from "react";
import vidofile from "../images/Middle.jpg"; // Ensure this path is correct
import "../Componentcss/Middle.css";
import { Ri24HoursLine } from "react-icons/ri";
import { IoMdBook } from "react-icons/io";
import { GiHeadphones } from "react-icons/gi";
import { PiSecurityCameraFill } from "react-icons/pi";

function Middle() {
  return (
    <section className="service-banner">
      {/* Background Image */}
      <img src={vidofile} alt="Hotel Services" className="banner-image" />

      {/* Content Box */}
      <div className="content-box">
        <p className="services-tag">SERVICES</p>
        <h2 className="services-title">
          Strive Only For The <br /> Best.
        </h2>

        <ul className="services-list">
          <li>
            <span className="icon blue">
              <PiSecurityCameraFill id="iconss1" />
            </span>
            High Class Security
          </li>
          <li>
            <span className="icon pink">
              <Ri24HoursLine id="icons2" />
            </span>
            24 Hours Room Service
          </li>
          <li>
            <span className="icon purple">
              <GiHeadphones id="iconss3" />
            </span>
            Conference Room
          </li>
          <li>
            <span className="icon red">
              <IoMdBook id="iconss4" />
            </span>
            Tourist Guide Support
          </li>
        </ul>
      </div>
    </section>
  );
}

export default Middle;