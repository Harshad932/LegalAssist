import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const MessagesPage = () => {
  const { caseToken } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const API_URL = `${process.env.REACT_APP_BACKEND_URL}`;

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Try lawyer token first
        const lawyerToken = localStorage.getItem('lawyerToken');
        if (lawyerToken) {
          const response = await axios.get(`${API_URL}/api/lawyers/me`, {
            headers: { Authorization: `Bearer ${lawyerToken}` }
          });
          setCurrentUser({
            type: 'lawyer',
            id: response.data.data._id,
            name: response.data.data.name,
            token: lawyerToken
          });
          return;
        }

        // Try user token if lawyer token doesn't exist
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
          const response = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          setCurrentUser({
            type: 'client',
            id: response.data.data._id,
            name: response.data.data.name,
            token: userToken
          });
          return;
        }

        throw new Error('Not authenticated');
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        if (!currentUser) return;
        
        const response = await axios.get(`${API_URL}/api/messages/${caseToken}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setMessages(response.data.messages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    const setupSocket = () => {
      if (!currentUser) return;
      
      const newSocket = io(API_URL, {
        auth: { token: currentUser.token },
        transports: ['websocket']
      });

      setSocket(newSocket);
      newSocket.emit('joinCase', caseToken);

      newSocket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        newSocket.off('newMessage');
        newSocket.disconnect();
      };
    };

    verifyAuth().then(() => {
      fetchMessages();
      return setupSocket();
    });

  }, [caseToken, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await axios.post(`${API_URL}/api/messages`, {
        caseToken,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });

      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const getSenderName = (message) => {
    if (message.senderId === currentUser?.id) {
      return 'You';
    }
    return message.senderName || (message.senderType === 'lawyer' ? 'Lawyer' : 'Client');
  };
  if (loading) return <div className="text-center py-8">Loading messages...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages for Case: {caseToken}</h1>
        <button 
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 p-3 rounded-lg max-w-xs ${message.senderType === 'lawyer' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
            >
              <div className="font-medium">
                {getSenderName(message)}
              </div>
              <div className="text-gray-800">{message.content}</div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg p-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagesPage;