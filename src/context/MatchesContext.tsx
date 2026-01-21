import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Match, Profile, SwipeDirection } from '../types';
import { mockProfiles } from '../data/mockProfiles';

interface MatchesContextType {
  matches: Match[];
  profiles: Profile[];
  likedProfiles: string[];
  passedProfiles: string[];
  superLikedProfiles: string[];
  currentMatchNotification: Match | null;
  swipeProfile: (profileId: string, direction: SwipeDirection) => Match | null;
  dismissMatchNotification: () => void;
  getAvailableProfiles: () => Profile[];
  undoLastSwipe: () => void;
  createMatchForProfile: (profileData: Partial<Profile>) => Match;
  findMatchByName: (name: string) => Match | undefined;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const MatchesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profiles] = useState<Profile[]>(mockProfiles);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [superLikedProfiles, setSuperLikedProfiles] = useState<string[]>([]);
  const [currentMatchNotification, setCurrentMatchNotification] = useState<Match | null>(null);
  const [lastSwipe, setLastSwipe] = useState<{ profileId: string; direction: SwipeDirection } | null>(null);

  const swipeProfile = useCallback((profileId: string, direction: SwipeDirection): Match | null => {
    setLastSwipe({ profileId, direction });

    if (direction === 'left') {
      setPassedProfiles(prev => [...prev, profileId]);
      return null;
    }

    if (direction === 'right') {
      setLikedProfiles(prev => [...prev, profileId]);
    } else if (direction === 'up') {
      setSuperLikedProfiles(prev => [...prev, profileId]);
      setLikedProfiles(prev => [...prev, profileId]);
    }

    // Simulate match (40% chance for regular like, 70% for super like)
    const matchChance = direction === 'up' ? 0.7 : 0.4;
    const isMatch = Math.random() < matchChance;

    if (isMatch) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        const newMatch: Match = {
          id: `match-${Date.now()}`,
          matchedAt: new Date(),
          profile,
          unreadCount: 0,
        };
        setMatches(prev => [newMatch, ...prev]);
        setCurrentMatchNotification(newMatch);
        return newMatch;
      }
    }

    return null;
  }, [profiles]);

  const dismissMatchNotification = useCallback(() => {
    setCurrentMatchNotification(null);
  }, []);

  const getAvailableProfiles = useCallback((): Profile[] => {
    const swipedIds = new Set([...likedProfiles, ...passedProfiles]);
    return profiles.filter(p => !swipedIds.has(p.id));
  }, [profiles, likedProfiles, passedProfiles]);

  const undoLastSwipe = useCallback(() => {
    if (!lastSwipe) return;

    const { profileId, direction } = lastSwipe;

    if (direction === 'left') {
      setPassedProfiles(prev => prev.filter(id => id !== profileId));
    } else if (direction === 'right') {
      setLikedProfiles(prev => prev.filter(id => id !== profileId));
    } else if (direction === 'up') {
      setSuperLikedProfiles(prev => prev.filter(id => id !== profileId));
      setLikedProfiles(prev => prev.filter(id => id !== profileId));
    }

    // Remove from matches if it was a match
    setMatches(prev => prev.filter(m => m.profile.id !== profileId));
    setLastSwipe(null);
  }, [lastSwipe]);

  // Find a match by profile name
  const findMatchByName = useCallback((name: string): Match | undefined => {
    return matches.find(m => m.profile.name === name);
  }, [matches]);

  // Create a match for a profile (used when sending compliments from stories)
  const createMatchForProfile = useCallback((profileData: Partial<Profile>): Match => {
    // Check if match already exists
    const existingMatch = matches.find(m =>
      m.profile.name === profileData.name || m.profile.id === profileData.id
    );
    if (existingMatch) return existingMatch;

    // Create a full profile from partial data
    const fullProfile: Profile = {
      id: profileData.id || `profile-${Date.now()}`,
      name: profileData.name || 'Unknown',
      age: profileData.age || 25,
      gender: profileData.gender || 'female',
      interestedIn: profileData.interestedIn || ['male'],
      photos: profileData.photos || [],
      bio: profileData.bio || '',
      interests: profileData.interests || [],
      location: profileData.location || { city: 'Mumbai' },
      preferences: profileData.preferences || { ageRange: { min: 18, max: 40 }, maxDistance: 25 },
      verified: profileData.verified ?? true,
      ...profileData,
    };

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      matchedAt: new Date(),
      profile: fullProfile,
      unreadCount: 0,
    };

    setMatches(prev => [newMatch, ...prev]);
    return newMatch;
  }, [matches]);

  return (
    <MatchesContext.Provider
      value={{
        matches,
        profiles,
        likedProfiles,
        passedProfiles,
        superLikedProfiles,
        currentMatchNotification,
        swipeProfile,
        dismissMatchNotification,
        getAvailableProfiles,
        undoLastSwipe,
        createMatchForProfile,
        findMatchByName,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = (): MatchesContextType => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};
