import { Profile } from '../types';

const profilePhotos = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
];

const names = [
  'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia',
  'James', 'William', 'Oliver', 'Benjamin', 'Lucas',
  'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
  'Liam', 'Noah', 'Elijah', 'Mason', 'Logan',
];

const bios = [
  "Coffee enthusiast ☕️ | Dog lover 🐕 | Adventure seeker 🏔️",
  "Here for good vibes and great conversations. Let's grab a drink!",
  "Photographer by passion, developer by profession. Looking for my person.",
  "Just moved to the city. Show me around? 🌆",
  "Wine tasting > Netflix. Change my mind.",
  "If you can make me laugh, you've already won half my heart ❤️",
  "Foodie | Travel addict | Sunset chaser 🌅",
  "Looking for someone to share playlists and late night talks with 🎵",
  "Gym in the morning, tacos at night. Balance is key! 💪",
  "Let's skip the small talk and plan our first adventure together.",
];

const allInterests = [
  'Photography', 'Travel', 'Music', 'Fitness', 'Cooking',
  'Art', 'Reading', 'Hiking', 'Movies', 'Gaming',
  'Yoga', 'Coffee', 'Wine', 'Dancing', 'Tech',
  'Fashion', 'Food', 'Nature', 'Pets', 'Sports',
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateMockProfiles = (count: number = 20): Profile[] => {
  const profiles: Profile[] = [];

  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() > 0.5;
    const nameIndex = isFemale ? getRandomInt(0, 9) : getRandomInt(10, 19);
    const name = names[nameIndex % names.length];

    const numPhotos = getRandomInt(2, 5);
    const photoStartIndex = i % profilePhotos.length;
    const photos: string[] = [];
    for (let j = 0; j < numPhotos; j++) {
      photos.push(profilePhotos[(photoStartIndex + j) % profilePhotos.length]);
    }

    profiles.push({
      id: `profile-${i + 1}`,
      name,
      age: getRandomInt(22, 35),
      gender: isFemale ? 'female' : 'male',
      interestedIn: isFemale ? ['male'] : ['female'],
      photos,
      bio: bios[i % bios.length],
      interests: getRandomItems(allInterests, getRandomInt(3, 6)),
      location: {
        city: cities[i % cities.length],
        distance: getRandomInt(1, 25),
      },
      preferences: {
        ageRange: { min: 21, max: 40 },
        maxDistance: 50,
      },
      verified: Math.random() > 0.3,
      matchPercentage: getRandomInt(65, 98),
    });
  }

  return profiles;
};

export const mockProfiles = generateMockProfiles(20);
