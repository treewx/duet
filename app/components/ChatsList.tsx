'use client';

import { useState, useEffect } from 'react';
import Chat from './Chat';
import { UserManager } from '../utils/userManager';

interface Person {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  gender: 'Man' | 'Woman';
}

interface Profile {
  gender: 'Man' | 'Woman' | '';
  preference: 'Looking for a Man' | 'Looking for a Woman' | '';
  photo: string;
  summary: string;
  name: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface ChatPreview {
  person: Person;
  lastMessage: Message | null;
  unreadCount: number;
  chatKey: string;
}

const ChatsList = () => {
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeChat, setActiveChat] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock people data (same as other components)
  const mockPeople: Person[] = [
    {
      id: '1',
      name: 'Alex',
      age: 28,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      bio: 'Love hiking and coffee',
      gender: 'Man',
    },
    {
      id: '2',
      name: 'Sam',
      age: 26,
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      bio: 'Artist and book lover',
      gender: 'Woman',
    },
    {
      id: '3',
      name: 'Jordan',
      age: 30,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      bio: 'Musician and traveler',
      gender: 'Man',
    },
    {
      id: '4',
      name: 'Casey',
      age: 25,
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
      bio: 'Yoga instructor and foodie',
      gender: 'Woman',
    },
    {
      id: '5',
      name: 'Taylor',
      age: 27,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
      bio: 'Tech enthusiast',
      gender: 'Man',
    },
    {
      id: '6',
      name: 'Riley',
      age: 24,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      bio: 'Photography and nature lover',
      gender: 'Woman',
    },
  ];

  useEffect(() => {
    const loadChatsData = () => {
      const currentUser = UserManager.getCurrentUser();
      if (currentUser) {
        // Load user profile
        const userProfile = UserManager.getUserProfile(currentUser.id);
        if (userProfile) {
          const profile: Profile = {
            gender: userProfile.gender,
            preference: userProfile.preference,
            photo: userProfile.photo,
            summary: userProfile.summary,
            name: userProfile.name
          };
          setProfile(profile);

          // Find all existing chats by checking localStorage for chat keys
          const chats: ChatPreview[] = [];
          
          mockPeople.forEach(person => {
            const chatKey = `chat-${[currentUser.id, person.id].sort().join('-')}`;
            const savedMessages = localStorage.getItem(chatKey);
          
          if (savedMessages) {
            const messages: Message[] = JSON.parse(savedMessages);
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            const unreadCount = messages.filter(m => m.senderId === person.id && !m.read).length;
            
            chats.push({
              person,
              lastMessage,
              unreadCount,
              chatKey
            });
          }
        });

        // Sort chats by last message timestamp
        chats.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || 0;
          const bTime = b.lastMessage?.timestamp || 0;
          return bTime - aTime;
        });

          setChatPreviews(chats);
        }
      }
      
      setLoading(false);
    };

    loadChatsData();
  }, []);

  const handleChatClick = (person: Person) => {
    setActiveChat(person);
  };

  const handleBackFromChat = () => {
    setActiveChat(null);
    // Reload chats to update last message and unread count
    const loadChatsData = () => {
      const currentUser = UserManager.getCurrentUser();
      if (currentUser) {
        const userProfile = UserManager.getUserProfile(currentUser.id);
        if (userProfile) {
          const chats: ChatPreview[] = [];
          mockPeople.forEach(person => {
            const chatKey = `chat-${[currentUser.id, person.id].sort().join('-')}`;
            const savedMessages = localStorage.getItem(chatKey);
          
            if (savedMessages) {
              const messages: Message[] = JSON.parse(savedMessages);
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
              const unreadCount = messages.filter(m => m.senderId === person.id && !m.read).length;
              
              chats.push({
                person,
                lastMessage,
                unreadCount,
                chatKey
              });
            }
          });

          chats.sort((a, b) => {
            const aTime = a.lastMessage?.timestamp || 0;
            const bTime = b.lastMessage?.timestamp || 0;
            return bTime - aTime;
          });

          setChatPreviews(chats);
        }
      }
    };
    loadChatsData();
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
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Create current user from profile and auth user
  const authUser = UserManager.getCurrentUser();
  const currentUser: Person | null = profile && authUser ? {
    id: authUser.id,
    name: profile.name,
    age: 25,
    photo: profile.photo,
    bio: profile.summary || '',
    gender: profile.gender as 'Man' | 'Woman'
  } : null;

  // If chat is active, show chat component
  if (activeChat && currentUser) {
    return (
      <Chat
        currentUser={currentUser}
        chatPartner={activeChat}
        onBack={handleBackFromChat}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.name) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-4">
            You need to set up your profile first to start chatting.
          </p>
          <div className="text-6xl mb-4">👤</div>
          <p className="text-sm text-gray-500">
            Go to the Profile tab to get started!
          </p>
        </div>
      </div>
    );
  }

  if (chatPreviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Conversations Yet</h2>
          <p className="text-gray-600 mb-4">
            Start connecting with your matches to begin conversations!
          </p>
          <div className="text-6xl mb-4">💬</div>
          <p className="text-sm text-gray-500">
            Go to &quot;My Matches&quot; and click &quot;Connect&quot; to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <p className="text-gray-600 mt-2">
          {chatPreviews.length} conversation{chatPreviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chat List */}
      <div className="space-y-1">
        {chatPreviews.map((chat) => (
          <div
            key={chat.person.id}
            onClick={() => handleChatClick(chat.person)}
            className="flex items-center space-x-4 p-4 hover:bg-white hover:shadow-sm transition-all cursor-pointer mx-4 rounded-lg"
          >
            {/* Profile Photo */}
            <div className="flex-shrink-0 relative">
              <img
                src={chat.person.photo}
                alt={chat.person.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              {chat.unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-800 truncate">{chat.person.name}</h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              
              {chat.lastMessage ? (
                <p className={`text-sm truncate ${
                  chat.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'
                }`}>
                  {authUser && chat.lastMessage.senderId === authUser.id ? 'You: ' : ''}
                  {chat.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Start a conversation</p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatsList;