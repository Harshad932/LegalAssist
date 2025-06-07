import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/lawyer/LawyerHeader.css';

const LawyerHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="lawyer-header">
      <div className="lawyer-header-container">
        <div className="lawyer-header-logo">
          <Link to="/">
            <div className="lawyer-header-logo-wrapper">
              <div className="lawyer-header-logo-symbol">⚖️</div>
              <div className="lawyer-header-title-container">
                <span className="lawyer-header-logo-text">Legal<span className="lawyer-header-logo-accent">Assist</span></span>
                <span className="lawyer-header-tagline">Justice Made Simple</span>
              </div>
            </div>
          </Link>
        </div>
        
        <button 
          className="lawyer-header-mobile-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="lawyer-header-mobile-line"></span>
          <span className="lawyer-header-mobile-line"></span>
          <span className="lawyer-header-mobile-line"></span>
        </button>
        
        <nav className={`lawyer-header-nav ${mobileMenuOpen ? 'lawyer-header-nav-active' : ''}`}>
          <ul className="lawyer-header-menu">
            <li className="lawyer-header-menu-item">
              <Link to="/" className="lawyer-header-link lawyer-header-link-active">
                <span className="lawyer-header-link-highlight"></span>
                Home
              </Link>
            </li>
            <li className="lawyer-header-menu-item">
              <Link to="/chatbot" className="lawyer-header-link">
                <span className="lawyer-header-link-highlight"></span>
                AI Assistant
              </Link>
            </li>
            <li className="lawyer-header-menu-item">
              <Link to="/#track-case" className="lawyer-header-link">
                <span className="lawyer-header-link-highlight"></span>
                Track Case
              </Link>
            </li>
          </ul>
          
          <div className="lawyer-header-auth">
            <Link to="/user/login" className="lawyer-header-auth-link lawyer-header-login">Sign In</Link>
            <Link to="/user/registration" className="lawyer-header-auth-link lawyer-header-register">
              Get Started
              <span className="lawyer-header-register-arrow">→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LawyerHeader;