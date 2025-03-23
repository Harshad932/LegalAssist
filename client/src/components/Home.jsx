import React, { useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import '../assets/styles/Home.css';
import Header from './Header';
import Footer from './Footer';
import axios from "axios";

const Home = () => {

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a valid case token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:4000/case/${token}`);
      setIsLoading(false);
      
      // Navigate to case details page with the data
      navigate('/case-details', { state: { caseData: response.data } });
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Case not found. Please check your token and try again.');
    }
  };

  return (
    <div className='home-all'>
      <div className='home-body'>
    <Header/>
    <main>
      <section className="home-hero">
        <div className="home-container">
          <h1>Simplifying Legal Access for Everyone</h1>
          <p>Get help navigating legal processes, track your cases, and find answers to your legal questions with our AI-powered platform.</p>
          <div className="home-hero-buttons">
            <Link to="/chatbot" className="btn btn-accent">Chat with Legal AI</Link>
            <a href="#track-case" className="btn">Track Your Case</a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="home-container">
          <h2 className="home-section-title">How We Can Help You</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>AI Legal Assistant</h3>
              <p>Our AI chatbot provides instant answers to your legal questions, explains complex laws in simple terms, and guides you through legal processes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Case Tracking</h3>
              <p>Stay updated with the progress of your case. Track status changes, upcoming hearings, and required documents using your unique token.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Legal Resources</h3>
              <p>Access a comprehensive library of legal documents, templates, and guides to help you understand your rights and options.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="track-case" className="track-case">
        <div className="home-container">
          <h2 className="home-section-title">Track Your Case Status</h2>
          <div className="track-form">
            <form id="case-tracking-form" onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="case-token">Case Token</label>
                <input 
                  type="text" 
                  id="case-token" 
                  placeholder="Enter your unique case token" 
                  required 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="home-btn home-btn-accent" 
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Track Now'}
              </button>
            </form>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <div className="home-container">
          <h2 className="home-section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Ask Questions</h3>
              <p>Use our AI chatbot to get answers to your legal questions or understand your rights.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>File Your Case</h3>
              <p>Get guidance on filing your case and receive a unique tracking token.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track Progress</h3>
              <p>Use your token to track case status and receive updates on next steps.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <div className="home-container">
          <h2 className="home-section-title">What People Say</h2>
          <div className="testimonial">
            <p className="testimonial-text">"I had no idea how to navigate the legal system for my property dispute. LegalAssist guided me through the entire process and helped me track my case easily."</p>
            <p className="testimonial-author">- Rohit S., Delhi</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="home-container">
          <h2>Ready to Resolve Your Legal Issues?</h2>
          <p>Our AI-powered platform is here to help you navigate the complex legal landscape.</p>
          <Link to="/chatbot" className="home-btn home-btn-accent">Get Started Now</Link>
        </div>
      </section>
    </main>
    <Footer/>
    </div>
    </div>
  );
};

export default Home;