import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Footer.css';

const Footer = () => {
  // Function to handle scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer>
      <div className="home-container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>LegalAssist</h3>
            <p>Simplifying legal access for everyone through technology and innovation.</p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="footer-nav-button"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="footer-nav-button"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('track-case')} 
                  className="footer-nav-button"
                >
                  Track Case
                </button>
              </li>
              <li><Link to="/chatbot">AI Assistant</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/documents">Legal Documents</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li>Email: info@legalassist.com</li>
              <li>Phone: +91 8767260519</li>
              <li>Address: PVG, Pune</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; 2025 LegalAssist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;