import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';

// Relationship type for filter selection
export type RelationshipTypeId = 'long-term' | 'casual' | 'friendship' | 'marriage' | 'open' | null;

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
  selectedRelationshipType: RelationshipTypeId;
  setSelectedRelationshipType: (type: RelationshipTypeId) => void;
}

const defaultUser: User = {
  id: 'current-user',
  name: '',
  age: 25,
  gender: 'male',
  interestedIn: ['female'],
  photos: [],
  bio: '',
  interests: [],
  location: {
    city: 'New York',
    distance: 0,
  },
  preferences: {
    ageRange: { min: 21, max: 35 },
    maxDistance: 25,
  },
  verified: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipTypeId>(null);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUserState(prev => {
      if (!prev) return { ...defaultUser, ...updates };
      return { ...prev, ...updates };
    });
  }, []);

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser);
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        updateUser,
        setUser,
        clearUser,
        selectedRelationshipType,
        setSelectedRelationshipType,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { defaultUser };
