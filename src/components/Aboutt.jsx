import React, { useEffect } from "react";
import "./About.css";

const About = () => {
  useEffect(() => {
    const content = document.querySelector(".about-content");

    const handleScroll = () => {
      const top = content.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (top < windowHeight - 100) {
        content.classList.add("visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // trigger on initial load

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-page">
      <img
        className="about-banner"
        src="/images/parking-banner.jpg" // Make sure this path matches your actual image
        alt="FindMySpot Parking Banner"
      />

      <div className="about-content">
        <h1 className="about-title">About FindMySpot</h1>
        <p className="about-text">
          <span className="highlight">FindMySpot</span> is a real-time parking locator platform designed to help drivers
          quickly find available parking spaces. Whether you're in a rush, unfamiliar with the area, or just tired of
          circling the block, <span className="highlight">FindMySpot</span> connects you with nearby listers sharing
          their free spots on a live map.
          <br /><br />
          We are on a mission to simplify urban mobility, save time, reduce emissions, and make your life easier — one
          parking spot at a time.
        </p>
      </div>
    </div>
  );
};

export default About;
