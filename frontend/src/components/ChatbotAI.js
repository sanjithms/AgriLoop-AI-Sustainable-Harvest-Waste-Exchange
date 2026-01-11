import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatbotAI.css';
import chatbotResponses from '../data/chatbotResponses';

// AI Chatbot component for agricultural waste management information
const ChatbotAI = ({ onRequestAnalyzer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Smart Agri AI assistant. How can I help you with agricultural waste management today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Use the imported responses from chatbotResponses.js
  const responses = chatbotResponses;

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages([...messages, userMessage]);
    setInputText('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Generate response after a short delay to simulate thinking
    setTimeout(() => {
      const botResponse = generateResponse(inputText);
      setMessages(prevMessages => [...prevMessages, {
        id: prevMessages.length + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (input) => {
    const lowerInput = input.toLowerCase();

    // Check for greetings
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return "Hello! How can I help you with agricultural waste management today?";
    }

    // Check for thanks
    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      return "You're welcome! Is there anything else you'd like to know about agricultural waste management?";
    }

    // Check for analyzer requests
    if ((lowerInput.includes('analyze') || lowerInput.includes('analyzer') || lowerInput.includes('analysis')) &&
        (lowerInput.includes('waste') || lowerInput.includes('product'))) {
      // If onRequestAnalyzer is provided, call it to open the analyzer
      if (onRequestAnalyzer) {
        setTimeout(() => onRequestAnalyzer(), 1000);
        return "I'm opening the Waste Value Analyzer for you. This tool will help you analyze the market value and potential uses of agricultural waste products.";
      } else {
        return "The Waste Value Analyzer can help you analyze agricultural waste products. Look for the 'Waste Value Analyzer' button at the top of this page.";
      }
    }

    // Check for specific waste types or topics
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }

    // Check for price or value questions
    if (lowerInput.includes('price') || lowerInput.includes('value') || lowerInput.includes('worth') || lowerInput.includes('cost')) {
      return "Agricultural waste prices vary by type and processing level. Raw materials typically fetch ₹1,000-5,000 per ton, while processed materials can reach ₹10,000-80,000 per ton. Could you specify which waste type you're interested in?";
    }

    // Check for how-to questions
    if (lowerInput.includes('how to') || lowerInput.includes('how do i')) {
      if (lowerInput.includes('compost')) {
        return "To start composting agricultural waste: 1) Collect waste materials, 2) Create a mix of 'green' (nitrogen-rich) and 'brown' (carbon-rich) materials in a 1:3 ratio, 3) Keep the pile moist but not wet, 4) Turn regularly to aerate. The compost should be ready in 3-6 months.";
      }
      if (lowerInput.includes('sell') || lowerInput.includes('market')) {
        return "To sell agricultural waste: 1) Sort and clean the waste, 2) Process it if possible to increase value, 3) Contact local recyclers, composting facilities, or specialized buyers, 4) Consider joining a farmer cooperative to increase bargaining power, 5) List your waste products on platforms like this one.";
      }
    }

    // Default response
    return "I don't have specific information about that yet. Would you like to know about composting, biogas production, market prices, or specific waste types like rice straw or coconut shells?";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      {/* Chat toggle button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <>
            <i className="bi bi-robot"></i>
            <span>AI Assistant</span>
          </>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-title">
              <i className="bi bi-robot me-2"></i>
              Smart Agri AI Assistant
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
              >
                {message.sender === 'bot' && (
                  <div className="bot-avatar">
                    <i className="bi bi-robot"></i>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message">
                <div className="bot-avatar">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask about agricultural waste management..."
              value={inputText}
              onChange={handleInputChange}
            />
            <button type="submit" disabled={inputText.trim() === ''}>
              <i className="bi bi-send"></i>
            </button>
          </form>
          
          <div className="chat-footer">
            <div className="quick-suggestions">
              <button onClick={() => setInputText('What can I do with rice straw?')}>
                Rice straw uses
              </button>
              <button onClick={() => setInputText('How to compost agricultural waste?')}>
                Composting tips
              </button>
              <button onClick={() => setInputText('What are current market prices?')}>
                Market prices
              </button>
              <button onClick={() => setInputText('Can you analyze my waste product?')}>
                Analyze waste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotAI;