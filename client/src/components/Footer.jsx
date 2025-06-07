import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <div className="footer-logo">
                <div className="logo-icon">⚖️</div>
                <div className="logo-text">
                  <span className="logo-name">Legal<span className="logo-accent">Assist</span></span>
                  <span className="logo-tagline">Justice Made Simple</span>
                </div>
              </div>
              <p className="footer-description">
                Empowering citizens with accessible legal solutions through technology and expert guidance.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <span className="social-icon">📱</span>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <span className="social-icon">📢</span>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <span className="social-icon">💼</span>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <span className="social-icon">📷</span>
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-title">Services</h3>
              <ul className="footer-links">
                <li><Link to="/legal-consultation">Legal Consultation</Link></li>
                <li><Link to="/case-management">Case Management</Link></li>
                <li><Link to="/document-assistance">Document Assistance</Link></li>
                <li><Link to="/legal-education">Legal Education</Link></li>
                <li><Link to="/legal-chatbot">AI Legal Assistant</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li><Link to="/legal-guides">Legal Guides</Link></li>
                <li><Link to="/document-templates">Document Templates</Link></li>
                <li><Link to="/faqs">FAQs</Link></li>
                <li><Link to="/blog">Legal Blog</Link></li>
                <li><Link to="/glossary">Legal Glossary</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-title">Contact Us</h3>
              <ul className="footer-contact">
                <li>
                  <span className="contact-icon">📍</span>
                  <span>123 Justice Avenue, Legal District, Delhi 110001</span>
                </li>
                <li>
                  <span className="contact-icon">📞</span>
                  <a href="tel:+1800LEGALASSIST">1-800-LEGAL-ASSIST</a>
                </li>
                <li>
                  <span className="contact-icon">✉️</span>
                  <a href="mailto:info@legalassist.com">info@legalassist.com</a>
                </li>
                <li>
                  <span className="contact-icon">⏰</span>
                  <span>Mon-Fri: 9AM-6PM, Sat: 10AM-2PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} LegalAssist. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;