export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: number;
}

export interface UserProfile {
  userId: string;
  gender: 'Man' | 'Woman' | '';
  preference: 'Looking for a Man' | 'Looking for a Woman' | '';
  photo: string;
  summary: string;
  name: string;
}

export class UserManager {
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('duetCurrentUser');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User) {
    localStorage.setItem('duetCurrentUser', JSON.stringify(user));
  }

  static logout() {
    localStorage.removeItem('duetCurrentUser');
    // Note: We keep profiles and other data for when user logs back in
  }

  static getUserProfile(userId: string): UserProfile | null {
    try {
      const profileData = localStorage.getItem(`duetProfile_${userId}`);
      return profileData ? JSON.parse(profileData) : null;
    } catch {
      return null;
    }
  }

  static saveUserProfile(userId: string, profile: UserProfile) {
    localStorage.setItem(`duetProfile_${userId}`, JSON.stringify(profile));
  }

  static getUserRatings(userId: string) {
    try {
      const ratingsData = localStorage.getItem(`duetRatings_${userId}`);
      return ratingsData ? JSON.parse(ratingsData) : [];
    } catch {
      return [];
    }
  }

  static saveUserRatings(userId: string, ratings: any[]) {
    localStorage.setItem(`duetRatings_${userId}`, JSON.stringify(ratings));
  }

  static getUserChats(userId: string, partnerId: string) {
    const chatKey = `chat-${[userId, partnerId].sort().join('-')}`;
    try {
      const chatData = localStorage.getItem(chatKey);
      return chatData ? JSON.parse(chatData) : [];
    } catch {
      return [];
    }
  }

  static saveUserChats(userId: string, partnerId: string, messages: any[]) {
    const chatKey = `chat-${[userId, partnerId].sort().join('-')}`;
    localStorage.setItem(chatKey, JSON.stringify(messages));
  }

  static migrateExistingData(userId: string) {
    // Migrate existing profile data to user-specific storage
    const existingProfile = localStorage.getItem('duetProfile');
    if (existingProfile) {
      localStorage.setItem(`duetProfile_${userId}`, existingProfile);
      localStorage.removeItem('duetProfile');
    }

    // Migrate existing ratings data
    const existingRatings = localStorage.getItem('duetRatings');
    if (existingRatings) {
      localStorage.setItem(`duetRatings_${userId}`, existingRatings);
      localStorage.removeItem('duetRatings');
    }
  }

  static createDemoUser(): User {
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@duet.com',
      password: 'demo123',
      name: 'Demo User',
      createdAt: Date.now()
    };

    // Save demo user to users list if not exists
    const users = JSON.parse(localStorage.getItem('duetUsers') || '[]');
    if (!users.find((u: User) => u.email === demoUser.email)) {
      users.push(demoUser);
      localStorage.setItem('duetUsers', JSON.stringify(users));
    }

    return demoUser;
  }
}