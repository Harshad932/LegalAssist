import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import LawyerHeader from './LawyerHeader';
import '../../assets/styles/lawyer/LawyerMessages.css';

const LawyerMessagesPage = () => {
  const { caseToken } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = `${process.env.REACT_APP_BACKEND_URL}`;

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial setup
  useEffect(() => {
    document.title = `Case ${caseToken} | Legal Assist`;
    
    const token = localStorage.getItem('lawyerToken');
    if (!token) {
      setError('Lawyer authentication required');
      setLoading(false);
      return;
    }

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages/${caseToken}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data.messages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Setup socket connection
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket']
    });

    setSocket(newSocket);
    newSocket.emit('joinCase', caseToken);

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Connection error. Please refresh the page.');
    });

    return () => {
      newSocket.off('newMessage');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [caseToken]);

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('lawyerToken');
      await axios.post(`${API_URL}/api/messages`, {
        caseToken,
        content: newMessage,
        senderType: 'lawyer'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="app-container">
        <LawyerHeader />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your conversation...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="app-container">
        <LawyerHeader />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Access Case</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Group messages by date for the timeline
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="app-container">
      <LawyerHeader />
      <div className="chat-container">
        <div className="chat-header">
          <div className="case-info">
            <h2>Case: {caseToken}</h2>
            <span className="secure-badge">
              <span className="lock-icon">🔒</span>
              Secure Communication
            </span>
          </div>
          <button onClick={() => navigate('/lawyer/cases')} className="back-btn">
            ← Back to My Cases
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No messages yet</h3>
              <p>Your conversation with your client will appear here</p>
            </div>
          ) : (
            <div className="messages-list">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="date-divider">{date}</div>
                  
                  {dateMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`message ${message.senderType === 'lawyer' ? 'outgoing' : 'incoming'}`}
                    >
                      <div className="message-bubble">
                        <div className="message-sender">
                          {message.senderType === 'lawyer' ? 'You' : 'Client'}
                        </div>
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
          )}
        </div>

        <div className="message-input-container">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <div className="input-wrapper">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="send-btn"
              >
                Send →
              </button>
            </div>
          </form>
          <div className="security-note">
            <span className="shield-icon">🛡️</span>
            All communications are encrypted and protected by attorney-client privilege
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerMessagesPage;