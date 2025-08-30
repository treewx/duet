'use client';

import { useState, useEffect } from 'react';
import ProfileSetup from './components/ProfileSetup';
import ViewCouples from './components/ViewCouples';
import MyMatches from './components/MyMatches';
import ChatsList from './components/ChatsList';
import Authentication from './components/Authentication';
import { UserManager, User } from './utils/userManager';

type TabType = 'profile' | 'couples' | 'matches' | 'chats';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = UserManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    UserManager.setCurrentUser(user);
  };

  const handleLogout = () => {
    UserManager.logout();
    setCurrentUser(null);
    setActiveTab('profile');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Authentication onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
    { id: 'couples' as TabType, label: 'View Couples', icon: '💑' },
    { id: 'matches' as TabType, label: 'My Matches', icon: '❤️' },
    { id: 'chats' as TabType, label: 'Chats', icon: '💬' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSetup />;
      case 'couples':
        return <ViewCouples />;
      case 'matches':
        return <MyMatches />;
      case 'chats':
        return <ChatsList />;
      default:
        return <ProfileSetup />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <h1 className="text-xl sm:text-2xl font-bold">Duet</h1>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm hidden xs:block">Hi, {currentUser.name}!</span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm bg-red-600 hover:bg-red-700 px-2 sm:px-3 py-1 rounded-lg transition-colors touch-target"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 sm:px-4 py-2 safe-area-bottom">
        <div className="flex justify-around max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-colors touch-target min-w-0 flex-1 ${
                activeTab === tab.id ? 'tab-active' : 'tab-inactive'
              }`}
            >
              <span className="text-lg sm:text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}