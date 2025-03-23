import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import '../assets/styles/LlamaChat.css';

function LlamaChat3D() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! How can I assist you today?" }
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
    recognition.continuous = true; // Set to true for uninterrupted listening
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
      
      // Update input with final transcript if available, otherwise show interim
      if (finalTranscript) {
        console.log('Final Transcript:', finalTranscript);
        setInput(current => current + finalTranscript + ' ');
      } else if (interimTranscript && isListening) {
        console.log('Interim Transcript:', interimTranscript);
        // Show interim results in real-time (optional)
        // You could add a separate state for interim results if you want to display them differently
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      // Only restart if we're still supposed to be listening
      if (isListening) {
        try {
          recognition.start();
          console.log('Restarted speech recognition');
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          setIsListening(false);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // This is a common error that doesn't need to stop the listening
        console.log('No speech detected, continuing to listen');
      } else {
        // For other errors, we should stop listening
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
  }, []); // Empty dependency array so it only initializes once

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Stopped speech recognition');
        } catch (error) {
          console.error('Failed to stop speech recognition:', error);
        }
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('Started speech recognition');
          setIsListening(true);
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          // Provide user feedback about the error
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
          text: "Error processing request. Please try again."
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
    <div className="llama-chat-container">
      <div className="llama-chat-main" ref={mainContainerRef}>
        <div className="llama-chat-header">
          <h1 className="llama-chat-title">
            <span className="llama-logo">🦙</span> LlamaChat
          </h1>
          <div className="llama-controls">
            <div className="llama-current-date">{formatDate()}</div>
          </div>
        </div>

        <div className="llama-chat-messages-area">
          {messages.map((msg, i) => (
            <div 
              key={i}
              className={`llama-chat-message ${msg.role === "user" ? "llama-message-user" : "llama-message-bot"}`}
            >
              <div className="llama-message-avatar">
                {msg.role === "user" ? "U" : "🦙"}
              </div>
              <div className="llama-message-content">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="llama-chat-message llama-message-bot">
              <div className="llama-message-avatar">🦙</div>
              <div className="llama-message-typing">
                <div className="llama-typing-dot"></div>
                <div className="llama-typing-dot"></div>
                <div className="llama-typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="llama-chat-end-anchor"></div>
        </div>

        <div className="llama-chat-input-container">
          <div className="llama-chat-input-wrapper">
            <textarea
              ref={textAreaRef}
              className="llama-chat-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message LlamaChat..."
              disabled={loading}
              rows="1"
            />
            <div className="llama-button-container">
              <button
                onClick={toggleListening}
                className={`llama-voice-button ${isListening ? 'active' : ''}`}
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
                className="llama-send-button"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="llama-footer-text">
            LlamaChat may produce inaccurate information about people, places, or facts.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LlamaChat3D;