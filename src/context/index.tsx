import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { MatchesProvider } from './MatchesContext';
import { ChatProvider } from './ChatContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <MatchesProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </MatchesProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export { useAuth } from './AuthContext';
export { useUser, type RelationshipTypeId } from './UserContext';
export { useMatches } from './MatchesContext';
export { useChat } from './ChatContext';
