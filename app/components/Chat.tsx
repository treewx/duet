'use client';

import { useState, useEffect, useRef } from 'react';

interface Person {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  gender: 'Man' | 'Woman';
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface ChatProps {
  currentUser: Person;
  chatPartner: Person;
  onBack: () => void;
}

const Chat = ({ currentUser, chatPartner, onBack }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatKey = `chat-${[currentUser.id, chatPartner.id].sort().join('-')}`;

  useEffect(() => {
    // Load existing messages
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [chatKey]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Simulate partner typing and responses
    const simulateResponse = () => {
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.senderId === currentUser.id && !isTyping) {
          // Simulate typing indicator
          setIsTyping(true);
          
          setTimeout(() => {
            setIsTyping(false);
            
            // Generate a response
            const responses = [
              "That's really interesting! Tell me more 😊",
              "I love that! What else do you enjoy doing?",
              "Sounds amazing! I'd love to hear more about it",
              "That's so cool! I've always wanted to try that",
              "Haha, you're funny! 😄",
              "I completely agree with you on that!",
              "That sounds like so much fun!",
              "You have great taste! 👍",
              "I'd love to learn more about that",
              "That's one of my favorite things too!"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const responseMessage: Message = {
              id: Date.now().toString(),
              senderId: chatPartner.id,
              receiverId: currentUser.id,
              content: randomResponse,
              timestamp: Date.now(),
              read: false
            };
            
            const updatedMessages = [...messages, responseMessage];
            setMessages(updatedMessages);
            localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
          }, 2000 + Math.random() * 2000); // Random delay 2-4 seconds
        }
      }
    };

    const timer = setTimeout(simulateResponse, 1000);
    return () => clearTimeout(timer);
  }, [messages, currentUser.id, chatPartner.id, chatKey, isTyping]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: chatPartner.id,
      content: newMessage.trim(),
      timestamp: Date.now(),
      read: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3 shadow-sm">
        <button
          onClick={onBack}
          className="text-primary hover:text-red-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <img
          src={chatPartner.photo}
          alt={chatPartner.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-primary"
        />
        
        <div className="flex-grow">
          <h3 className="font-bold text-gray-800">{chatPartner.name}</h3>
          <p className="text-sm text-gray-600">
            {isTyping ? 'Typing...' : 'Active now'}
          </p>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              You matched with {chatPartner.name}!
            </h3>
            <p className="text-gray-600 text-sm">
              Start the conversation and get to know each other better.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200 px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${chatPartner.name}...`}
              className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-32"
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-primary text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;