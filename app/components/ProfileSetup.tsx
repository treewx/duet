'use client';

import { useState, useEffect } from 'react';
import { UserManager } from '../utils/userManager';

interface Profile {
  gender: 'Man' | 'Woman' | '';
  preference: 'Looking for a Man' | 'Looking for a Woman' | '';
  photo: string;
  summary: string;
  name: string;
}

const ProfileSetup = () => {
  const [profile, setProfile] = useState<Profile>({
    gender: '',
    preference: '',
    photo: '/placeholder-avatar.png',
    summary: '',
    name: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      const userProfile = UserManager.getUserProfile(currentUser.id);
      if (userProfile) {
        setProfile({
          gender: userProfile.gender,
          preference: userProfile.preference,
          photo: userProfile.photo,
          summary: userProfile.summary,
          name: userProfile.name
        });
      } else {
        // Use user's name from account as default
        setProfile(prev => ({ ...prev, name: currentUser.name }));
        setIsEditing(true);
      }
    }
  }, []);

  const handleSave = () => {
    if (!profile.name || !profile.gender || !profile.preference) {
      alert('Please fill in all required fields');
      return;
    }
    
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      const userProfile = {
        userId: currentUser.id,
        gender: profile.gender,
        preference: profile.preference,
        photo: profile.photo,
        summary: profile.summary,
        name: profile.name
      };
      UserManager.saveUserProfile(currentUser.id, userProfile);
      setIsEditing(false);
      alert('Profile saved successfully!');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const placeholderImages = [
    '/placeholder-avatar.png',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
  ];

  if (!isEditing && profile.name) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <img
              src={profile.photo}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
            />
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-600 mt-2">{profile.gender}</p>
            <p className="text-gray-600">{profile.preference}</p>
          </div>
          
          {profile.summary && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">About Me</h3>
              <p className="text-gray-600">{profile.summary}</p>
            </div>
          )}
          
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary w-full"
          >
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {profile.name ? 'Edit Profile' : 'Create Your Profile'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'Man' | 'Woman' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select your gender</option>
              <option value="Man">Man</option>
              <option value="Woman">Woman</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Looking For *
            </label>
            <select
              value={profile.preference}
              onChange={(e) => setProfile({ ...profile, preference: e.target.value as 'Looking for a Man' | 'Looking for a Woman' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select your preference</option>
              <option value="Looking for a Man">Looking for a Man</option>
              <option value="Looking for a Woman">Looking for a Woman</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={profile.photo}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
              
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              
              <div className="flex space-x-2">
                <label
                  htmlFor="photo-upload"
                  className="btn-secondary cursor-pointer text-sm"
                >
                  Upload Photo
                </label>
              </div>
              
              <div className="text-sm text-gray-600">Or choose a placeholder:</div>
              <div className="flex space-x-2 flex-wrap">
                {placeholderImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setProfile({ ...profile, photo: img })}
                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300 hover:border-primary"
                  >
                    <img src={img} alt={`Placeholder ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Me
            </label>
            <textarea
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
              placeholder="Tell others about yourself..."
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {profile.summary.length}/200
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              Save Profile
            </button>
            {profile.name && (
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;