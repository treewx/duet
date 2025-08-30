'use client';

import { useState, useEffect } from 'react';
import Chat from './Chat';

const defaultAvatar = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face';

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = defaultAvatar;
};
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

interface Rating {
  coupleId: string;
  rating: 'yes' | 'no' | number;
  timestamp: number;
}

interface Match extends Person {
  matchScore: number;
  mutualConnections: number;
}

const MyMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Match | null>(null);

  // Mock people data (same as ViewCouples)
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
    const loadData = () => {
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

          // Load ratings
          const ratings = UserManager.getUserRatings(currentUser.id);

          // Calculate matches based on ratings and preferences
          const potentialMatches = calculateMatches(profile, ratings, mockPeople);
          setMatches(potentialMatches);
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  const calculateMatches = (userProfile: Profile, ratings: Rating[], people: Person[]): Match[] => {
    // Filter people based on user's preference
    const preferredGender = userProfile.preference === 'Looking for a Man' ? 'Man' : 'Woman';
    const eligiblePeople = people.filter(person => person.gender === preferredGender);

    // Calculate match scores based on positive ratings
    const matches: Match[] = eligiblePeople.map(person => {
      let matchScore = 0;
      let mutualConnections = 0;

      // Look through ratings to find positive ratings for couples containing this person
      ratings.forEach(rating => {
        if (rating.rating === 'yes') {
          const coupleIds = rating.coupleId.split('-');
          if (coupleIds.includes(person.id)) {
            matchScore += 10;
            mutualConnections += 1;
          }
        }
      });

      // Add some randomness to make it interesting
      matchScore += Math.floor(Math.random() * 30);

      return {
        ...person,
        matchScore,
        mutualConnections,
      };
    });

    // Sort by match score (descending) and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your matches...</p>
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
            You need to set up your profile first to see potential matches.
          </p>
          <div className="text-6xl mb-4">👤</div>
          <p className="text-sm text-gray-500">
            Go to the Profile tab to get started!
          </p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Matches Yet</h2>
          <p className="text-gray-600 mb-4">
            Start rating couples to discover your potential matches!
          </p>
          <div className="text-6xl mb-4">💑</div>
          <p className="text-sm text-gray-500">
            The more couples you rate, the better we can find matches for you.
          </p>
        </div>
      </div>
    );
  }

  const getMatchPercentage = (score: number) => {
    return Math.min(95, Math.max(60, score));
  };

  const handleConnect = (match: Match) => {
    setActiveChat(match);
  };

  const handleBackFromChat = () => {
    setActiveChat(null);
  };

  // Create a mock current user from profile and auth user
  const authUser = UserManager.getCurrentUser();
  const currentUser: Person | null = profile && authUser ? {
    id: authUser.id,
    name: profile.name,
    age: 25, // Default age since we don't store it in profile
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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Your Matches</h2>
        <p className="text-gray-600 text-center mt-2">
          Based on your couple ratings, here are your top matches!
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match, index) => (
          <div key={match.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-primary'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src={match.photo || defaultAvatar}
                  alt={match.name}
                  onError={handleImageError}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-800">{match.name}</h3>
                  <span className="text-gray-600 text-sm">{match.age}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{match.bio}</p>
                
                {/* Match Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <span>💖</span>
                    <span>{getMatchPercentage(match.matchScore)}% match</span>
                  </span>
                  {match.mutualConnections > 0 && (
                    <span className="flex items-center space-x-1">
                      <span>🔗</span>
                      <span>{match.mutualConnections} mutual connections</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <button 
                  onClick={() => handleConnect(match)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>

            {/* Match Score Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(getMatchPercentage(match.matchScore) / 100) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Keep rating couples to discover more matches!
          </p>
        </div>
      )}
    </div>
  );
};

export default MyMatches;