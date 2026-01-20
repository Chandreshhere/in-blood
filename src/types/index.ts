export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: ('male' | 'female' | 'non-binary' | 'everyone')[];
  photos: string[];
  bio: string;
  interests: string[];
  location: {
    city: string;
    distance?: number;
  };
  preferences: {
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
  verified: boolean;
  lastActive?: Date;
}

export interface Profile extends User {
  matchPercentage?: number;
}

export interface Match {
  id: string;
  matchedAt: Date;
  profile: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  type: 'text' | 'image' | 'gif';
  imageUrl?: string;
}

export interface Chat {
  matchId: string;
  messages: Message[];
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type SwipeDirection = 'left' | 'right' | 'up';

export interface SwipeAction {
  direction: SwipeDirection;
  profile: Profile;
}
