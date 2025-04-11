import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
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

  const API_URL = 'http://localhost:4000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.title = `Case ${caseToken} | Legal Assist`;
    
    const token = localStorage.getItem('lawyerToken');
    if (!token) {
      setError('Lawyer authentication required');
      setLoading(false);
      return;
    }

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

  if (loading) return (
    <div className="lawyer-messages-loading">
      <div className="animate-spin"></div>
      <p>Loading conversation...</p>
    </div>
  );
  
  if (error) return (
    <div className="lawyer-messages-error">
      <p>{error}</p>
      <button onClick={() => navigate('/login')}>
        Return to Login
      </button>
    </div>
  );

  return (
    <div className="lawyer-messages-container">
      <div className="lawyer-messages-wrapper">
        <div className="lawyer-messages-header">
          <div>
            <h1>Case: {caseToken}</h1>
            <p>Secure communication channel</p>
          </div>
          <button 
            onClick={() => navigate('/lawyer/cases')}
            className="lawyer-messages-back-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Cases
          </button>
        </div>

        <div className="lawyer-messages-chat-container">
          <div className="lawyer-messages-list">
            {messages.length === 0 ? (
              <div className="lawyer-messages-empty">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet</p>
                <p className="description">Your conversation with your client will appear here</p>
              </div>
            ) : (
              <div className="lawyer-messages-timeline">
                {messages.map((message, index) => {
                  const isLawyer = message.senderType === 'lawyer';
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showDateHeader = index === 0 || 
                    new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
                  
                  return (
                    <div key={index}>
                      {showDateHeader && (
                        <div className="lawyer-messages-date-header">
                          <span>
                            {new Date(message.createdAt).toLocaleDateString(undefined, {
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div className={`lawyer-messages-bubble ${isLawyer ? 'justify-end' : 'justify-start'}`}>
                        <div className={isLawyer ? 'lawyer-messages-sent' : 'lawyer-messages-received'}>
                          <div className="font-medium">
                            {isLawyer ? 'You' : 'Client'}
                          </div>
                          <div className="message-content">{message.content}</div>
                          <div className="text-xs">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="lawyer-messages-composer">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="lawyer-messages-input"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="lawyer-messages-send"
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
          <p className="lawyer-messages-security-note">
            All communications are encrypted and protected by attorney-client privilege
          </p>
        </div>
      </div>
    </div>
  );
};

export default LawyerMessagesPage;