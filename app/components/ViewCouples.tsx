'use client';

import { useState, useEffect } from 'react';
import { UserManager } from '../utils/userManager';

interface Person {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  gender: 'Man' | 'Woman';
}

interface Couple {
  id: string;
  person1: Person;
  person2: Person;
}

interface Rating {
  coupleId: string;
  rating: 'yes' | 'no' | number;
  timestamp: number;
}

const ViewCouples = () => {
  const [couples, setCouples] = useState<Couple[]>([]);
  const [currentCoupleIndex, setCurrentCoupleIndex] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for couples
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
    // Generate couples from mock data
    const generatedCouples: Couple[] = [];
    for (let i = 0; i < mockPeople.length; i++) {
      for (let j = i + 1; j < mockPeople.length; j++) {
        if (mockPeople[i].gender !== mockPeople[j].gender) {
          generatedCouples.push({
            id: `${mockPeople[i].id}-${mockPeople[j].id}`,
            person1: mockPeople[i],
            person2: mockPeople[j],
          });
        }
      }
    }
    
    // Shuffle couples
    const shuffled = generatedCouples.sort(() => Math.random() - 0.5);
    setCouples(shuffled);
    
    // Load existing ratings for current user
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      const userRatings = UserManager.getUserRatings(currentUser.id);
      setRatings(userRatings);
    }
    
    setLoading(false);
  }, []);

  const saveRating = (rating: 'yes' | 'no') => {
    const currentCouple = couples[currentCoupleIndex];
    if (!currentCouple) return;

    const newRating: Rating = {
      coupleId: currentCouple.id,
      rating,
      timestamp: Date.now(),
    };

    const updatedRatings = [...ratings.filter(r => r.coupleId !== currentCouple.id), newRating];
    setRatings(updatedRatings);
    
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      UserManager.saveUserRatings(currentUser.id, updatedRatings);
    }
    
    // Move to next couple
    if (currentCoupleIndex < couples.length - 1) {
      setCurrentCoupleIndex(currentCoupleIndex + 1);
    } else {
      // Reset to beginning or show completion message
      setCurrentCoupleIndex(0);
    }
  };

  const getCurrentCouple = () => {
    return couples[currentCoupleIndex];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading couples...</p>
        </div>
      </div>
    );
  }

  if (couples.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No couples available</h2>
          <p className="text-gray-600">Check back later for more couples to rate!</p>
        </div>
      </div>
    );
  }

  const currentCouple = getCurrentCouple();
  const hasRated = ratings.some(r => r.coupleId === currentCouple.id);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate This Couple</h2>
          <p className="text-gray-600">Do you think they make a cute couple?</p>
          <div className="text-sm text-gray-500 mt-2">
            {currentCoupleIndex + 1} of {couples.length}
          </div>
        </div>

        <div className="flex justify-center space-x-8 mb-8">
          {/* Person 1 */}
          <div className="text-center">
            <img
              src={currentCouple.person1.photo}
              alt={currentCouple.person1.name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-3 border-4 border-primary"
            />
            <h3 className="font-bold text-lg text-gray-800">{currentCouple.person1.name}</h3>
            <p className="text-gray-600 text-sm">{currentCouple.person1.age} years old</p>
            <p className="text-gray-500 text-xs mt-1">{currentCouple.person1.bio}</p>
          </div>

          {/* Heart Icon */}
          <div className="flex items-center">
            <div className="text-4xl">💕</div>
          </div>

          {/* Person 2 */}
          <div className="text-center">
            <img
              src={currentCouple.person2.photo}
              alt={currentCouple.person2.name}
              className="w-32 h-32 rounded-full object-cover mx-auto mb-3 border-4 border-secondary"
            />
            <h3 className="font-bold text-lg text-gray-800">{currentCouple.person2.name}</h3>
            <p className="text-gray-600 text-sm">{currentCouple.person2.age} years old</p>
            <p className="text-gray-500 text-xs mt-1">{currentCouple.person2.bio}</p>
          </div>
        </div>

        {hasRated ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">You already rated this couple!</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentCoupleIndex((prev) => (prev + 1) % couples.length)}
                className="btn-primary flex-1"
              >
                Next Couple
              </button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => saveRating('no')}
              className="flex-1 bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>👎</span>
              <span>Not Really</span>
            </button>
            <button
              onClick={() => saveRating('yes')}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <span>💖</span>
              <span>Cute Couple!</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Total ratings: {ratings.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewCouples;