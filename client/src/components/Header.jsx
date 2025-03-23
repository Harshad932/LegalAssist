import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to handle scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu after clicking
    setMobileMenuOpen(false);
  };

  return (
    <header>
      <div className="home-container">
        <nav>
          <Link to="/" className="logo">
            Legal<span>Assist</span>
          </Link>
          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            {/* Replace Link components with buttons for same-page navigation */}
            <button 
              onClick={() => scrollToSection('features')} 
              className="nav-button"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="nav-button"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('track-case')} 
              className="nav-button"
            >
              Track Case
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="nav-button"
            >
              Testimonials
            </button>
          </div>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
          <Link to="/chatbot" className="home-btn">
            AI Assistant
          </Link>
          <Link to="/admin-login" className="home-btn">
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;