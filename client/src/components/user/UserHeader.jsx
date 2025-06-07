import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/user/UserHeader.css';

const UserHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="user-header">
      <div className="user-header-container">
        <div className="user-header-logo">
          <Link to="/">
            <div className="user-header-logo-wrapper">
              <div className="user-header-logo-symbol">⚖️</div>
              <div className="user-header-title-container">
                <span className="user-header-logo-text">Legal<span className="user-header-logo-accent">Assist</span></span>
                <span className="user-header-tagline">Justice Made Simple</span>
              </div>
            </div>
          </Link>
        </div>
        
        <button 
          className="user-header-mobile-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="user-header-mobile-line"></span>
          <span className="user-header-mobile-line"></span>
          <span className="user-header-mobile-line"></span>
        </button>
        
        <nav className={`user-header-nav ${mobileMenuOpen ? 'user-header-nav-active' : ''}`}>
          <ul className="user-header-menu">
            <li className="user-header-menu-item">
              <Link to="/" className="user-header-link user-header-link-active">
                <span className="user-header-link-highlight"></span>
                Home
              </Link>
            </li>
            <li className="user-header-menu-item">
              <Link to="/chatbot" className="user-header-link">
                <span className="user-header-link-highlight"></span>
                AI Assistant
              </Link>
            </li>
            <li className="user-header-menu-item">
              <Link to="/#track-case" className="user-header-link">
                <span className="user-header-link-highlight"></span>
                Track Case
              </Link>
            </li>
          </ul>
          
          <div className="user-header-auth">
            <Link to="/user/login" className="user-header-auth-link user-header-login">Sign In</Link>
            <Link to="/user/registration" className="user-header-auth-link user-header-register">
              Get Started
              <span className="user-header-register-arrow">→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default UserHeader;