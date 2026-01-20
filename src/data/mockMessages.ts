import { Message } from '../types';

const messageTemplates = [
  "Hey! How's it going?",
  "I noticed you like {interest}. Me too!",
  "Your photos are amazing! Where was that taken?",
  "What's your favorite spot in the city?",
  "Hi there! I love your bio 😊",
  "That's awesome! Tell me more about it.",
  "Haha, that's hilarious! 😂",
  "I've been meaning to try that. Any recommendations?",
  "Thanks! You have a great taste in music btw",
  "Would love to grab coffee sometime!",
  "No way! I was just there last month!",
  "That's such a cool hobby. How did you get into it?",
  "I'm free this weekend if you want to meet up",
  "You seem really interesting. Let's chat more!",
  "Sorry for the late reply, busy day at work 😅",
];

const autoReplies = [
  "That sounds amazing! I'd love to hear more",
  "Haha yes! Exactly what I was thinking 😄",
  "You're so sweet, thank you!",
  "That's interesting! What else do you enjoy?",
  "I'd love that! When works for you?",
  "Tell me more about yourself!",
  "Great minds think alike 😉",
  "Oh nice! That's one of my favorites too",
];

export const generateMockMessages = (
  matchId: string,
  userId: string,
  otherUserId: string,
  count: number = 5
): Message[] => {
  const messages: Message[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const isFromUser = i % 2 === 0;
    const timestamp = new Date(now.getTime() - (count - i) * 1000 * 60 * 30); // 30 min intervals

    messages.push({
      id: `msg-${matchId}-${i}`,
      senderId: isFromUser ? userId : otherUserId,
      text: messageTemplates[i % messageTemplates.length],
      timestamp,
      status: 'seen',
      type: 'text',
    });
  }

  return messages;
};

export const getRandomAutoReply = (): string => {
  return autoReplies[Math.floor(Math.random() * autoReplies.length)];
};

export { autoReplies };
