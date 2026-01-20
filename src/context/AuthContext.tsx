import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedProfileSetup: boolean;
  phoneNumber: string | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (method: 'phone' | 'email', credential: string, password?: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: () => void;
  completeProfileSetup: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  hasCompletedOnboarding: false,
  hasCompletedProfileSetup: false,
  phoneNumber: null,
  email: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const login = useCallback(async (method: 'phone' | 'email', credential: string, password?: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (method === 'phone') {
      setState(prev => ({
        ...prev,
        isLoading: false,
        phoneNumber: credential,
      }));
      return true; // Returns true to indicate OTP was "sent"
    }

    // Email login - mock validation
    if (method === 'email' && password && password.length >= 6) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        email: credential,
        hasCompletedOnboarding: true,
      }));
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock OTP - always succeeds with any 6 digit code
    if (otp.length === 6) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        hasCompletedOnboarding: true,
      }));
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (email.includes('@') && password.length >= 6) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
        email,
        hasCompletedOnboarding: true,
      }));
      return true;
    }

    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
    setState(initialState);
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  const completeProfileSetup = useCallback(() => {
    setState(prev => ({ ...prev, hasCompletedProfileSetup: true }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verifyOtp,
        signup,
        logout,
        completeOnboarding,
        completeProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
