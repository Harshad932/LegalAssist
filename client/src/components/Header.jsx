import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Header.css';
import GoogleTranslate from './GoogleTranslate';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-main">
        <div className="header-container">
          <div className="header-logo">
            <Link to="/" className="logo-link">
              <div className="logo-icon">⚖️</div>
              <div className="logo-text">
                <span className="logo-name">Legal<span className="logo-accent">Assist</span></span>
                <span className="logo-tagline">Justice Made Simple</span>
              </div>
            </Link>
          </div>

          <div className="header-translate-desktop">
            <GoogleTranslate />
          </div>

          <button 
            className={`header-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="mobile-toggle-line"></span>
            <span className="mobile-toggle-line"></span>
            <span className="mobile-toggle-line"></span>
          </button>

          <nav className={`header-nav ${mobileMenuOpen ? 'nav-active' : ''}`}>
            <div className="nav-links">
              <button onClick={() => scrollToSection('features')} className="nav-button">
                <span className="nav-text">Features</span>
                <span className="nav-highlight"></span>
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="nav-button">
                <span className="nav-text">How It Works</span>
                <span className="nav-highlight"></span>
              </button>
              <button onClick={() => scrollToSection('track-case')} className="nav-button">
                <span className="nav-text">Track Case</span>
                <span className="nav-highlight"></span>
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="nav-button">
                <span className="nav-text">Testimonials</span>
                <span className="nav-highlight"></span>
              </button>
            </div>
            
            <div className="header-translate-mobile">
              <GoogleTranslate />
            </div>
            
            <div className="header-actions">
              <Link to="/chatbot" className="header-btn header-btn-secondary">
                <span className="btn-icon">🤖</span> AI Assistant
              </Link>
              <Link to="/admin-login" className="header-btn header-btn-primary">
                Admin Login <span className="btn-arrow">→</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;