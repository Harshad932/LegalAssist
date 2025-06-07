import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import Header from './Header';
import '../assets/styles/LlamaChat.css';

function LlamaChat3D() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! I'm your Legal Assistant AI. How may I help you with your legal questions today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const mainContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      // Auto resize textarea based on content
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    // Better browser compatibility check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configure speech recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setInput(current => current + finalTranscript + ' ');
      }
    };
    
    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          setIsListening(false);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, []);

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Failed to stop speech recognition:', error);
        }
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          setMessages(prev => [...prev, { 
            role: "bot", 
            text: "Sorry, there was an issue starting voice recognition. Please check your microphone permissions and try again."
          }]);
        }
      }
    }
  };

  // 3D effect for mouse movement - reduced intensity for clarity
  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      container.style.transform = `
        perspective(1500px)
        rotateY(${x * 1.5}deg)
        rotateX(${y * -1.5}deg)
        translateZ(0)
      `;
    };
    
    const handleMouseLeave = () => {
      container.style.transform = `
        perspective(1500px)
        rotateY(0)
        rotateX(0)
        translateZ(0)
      `;
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { 
      role: "user", 
      text: input
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send message to backend
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await res.json();
      
      const botReply = { 
        role: "bot", 
        text: data.reply
      };
      
      setMessages([...newMessages, botReply]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages([
        ...newMessages, 
        { 
          role: "bot", 
          text: "Error processing request. Please try again or contact our support team for assistance."
        }
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="legal-page">
      <Header />
      
      <div className="legal-page-content">
        <div className="legal-page-header">
          <h1>Legal<span className="accent">Assistant</span> AI</h1>
          <p>Get instant answers to your legal questions from our advanced AI assistant</p>
        </div>
        
        <div className="legal-chatbot-container">
          <div className="legal-chatbot-main" ref={mainContainerRef}>
            <div className="legal-chatbot-header">
              <h2 className="legal-chatbot-title">
                <span className="legal-logo">⚖️</span> Legal Assistant
              </h2>
              <div className="legal-controls">
                <div className="legal-current-date">{formatDate()}</div>
              </div>
            </div>

            <div className="legal-chatbot-messages-area">
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`legal-chatbot-message ${msg.role === "user" ? "legal-message-user" : "legal-message-bot"}`}
                >
                  <div className="legal-message-avatar">
                    {msg.role === "user" ? 
                      <div className="user-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div> : 
                      <div className="bot-avatar">⚖️</div>
                    }
                  </div>
                  <div className="legal-message-content">
                    <div className="message-sender">
                      {msg.role === "user" ? "You" : "Legal Assistant"}
                    </div>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="legal-chatbot-message legal-message-bot">
                  <div className="legal-message-avatar">
                    <div className="bot-avatar">⚖️</div>
                  </div>
                  <div className="legal-message-typing">
                    <div className="legal-typing-dot"></div>
                    <div className="legal-typing-dot"></div>
                    <div className="legal-typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} className="legal-chatbot-end-anchor"></div>
            </div>

            <div className="legal-chatbot-input-container">
              <div className="legal-chatbot-input-wrapper">
                <textarea
                  ref={textAreaRef}
                  className="legal-chatbot-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your legal question..."
                  disabled={loading}
                  rows="1"
                />
                <div className="legal-button-container">
                  <button
                    onClick={toggleListening}
                    className={`legal-voice-button ${isListening ? 'active' : ''}`}
                    aria-label={isListening ? "Stop Voice" : "Start Voice"}
                    title={isListening ? "Stop Voice" : "Start Voice"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="legal-send-button"
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="legal-footer-text">
                LegalAssist AI provides general information and not legal advice. Always consult with a qualified attorney for specific legal matters.
              </div>
            </div>
          </div>
{/*           
          <div className="legal-chatbot-features">
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Case Lookup</h3>
              <p>Find relevant case law and legal precedents related to your situation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Form Assistance</h3>
              <p>Get help filling out common legal forms and understanding requirements</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default LlamaChat3D;