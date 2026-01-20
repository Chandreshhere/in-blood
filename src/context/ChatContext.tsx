import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Chat, Message } from '../types';
import { generateMockMessages, getRandomAutoReply } from '../data/mockMessages';

interface ChatContextType {
  chats: Map<string, Chat>;
  typingUsers: Set<string>;
  initializeChat: (matchId: string, userId: string, otherUserId: string) => void;
  sendMessage: (matchId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  getMessages: (matchId: string) => Message[];
  markAsRead: (matchId: string) => void;
  simulateTyping: (matchId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Map<string, Chat>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const initializeChat = useCallback((matchId: string, userId: string, otherUserId: string) => {
    if (chats.has(matchId)) return;

    const messages = generateMockMessages(matchId, userId, otherUserId, 5);
    setChats(prev => {
      const newChats = new Map(prev);
      newChats.set(matchId, { matchId, messages });
      return newChats;
    });
  }, [chats]);

  const sendMessage = useCallback((matchId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
      status: 'sending',
    };

    setChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(matchId);
      if (chat) {
        newChats.set(matchId, {
          ...chat,
          messages: [...chat.messages, newMessage],
        });
      } else {
        newChats.set(matchId, { matchId, messages: [newMessage] });
      }
      return newChats;
    });

    // Simulate message status updates
    setTimeout(() => {
      setChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(matchId);
        if (chat) {
          const updatedMessages = chat.messages.map(m =>
            m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
          );
          newChats.set(matchId, { ...chat, messages: updatedMessages });
        }
        return newChats;
      });
    }, 500);

    setTimeout(() => {
      setChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(matchId);
        if (chat) {
          const updatedMessages = chat.messages.map(m =>
            m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m
          );
          newChats.set(matchId, { ...chat, messages: updatedMessages });
        }
        return newChats;
      });
    }, 1000);

    // Simulate auto-reply
    simulateTyping(matchId);
    setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });

      const autoReply: Message = {
        id: `msg-${Date.now()}-reply`,
        senderId: 'other',
        text: getRandomAutoReply(),
        timestamp: new Date(),
        status: 'seen',
        type: 'text',
      };

      setChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(matchId);
        if (chat) {
          newChats.set(matchId, {
            ...chat,
            messages: [...chat.messages, autoReply],
          });
        }
        return newChats;
      });

      // Mark user's message as seen
      setChats(prev => {
        const newChats = new Map(prev);
        const chat = newChats.get(matchId);
        if (chat) {
          const updatedMessages = chat.messages.map(m =>
            m.id === newMessage.id ? { ...m, status: 'seen' as const } : m
          );
          newChats.set(matchId, { ...chat, messages: updatedMessages });
        }
        return newChats;
      });
    }, 2500);
  }, []);

  const simulateTyping = useCallback((matchId: string) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(matchId);
      return newSet;
    });
  }, []);

  const getMessages = useCallback((matchId: string): Message[] => {
    return chats.get(matchId)?.messages || [];
  }, [chats]);

  const markAsRead = useCallback((matchId: string) => {
    setChats(prev => {
      const newChats = new Map(prev);
      const chat = newChats.get(matchId);
      if (chat) {
        const updatedMessages = chat.messages.map(m => ({
          ...m,
          status: 'seen' as const,
        }));
        newChats.set(matchId, { ...chat, messages: updatedMessages });
      }
      return newChats;
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        typingUsers,
        initializeChat,
        sendMessage,
        getMessages,
        markAsRead,
        simulateTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
