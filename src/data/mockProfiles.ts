import { Profile } from '../types';

// Indian female photos
const femalePhotos = [
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop', // Professional woman
  'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1618151313441-bc79b11e5090?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=600&fit=crop', // Indian woman
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop', // Woman portrait
];

// Indian male photos
const malePhotos = [
  'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=600&fit=crop', // Indian man
  'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=600&fit=crop', // Indian man
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=600&fit=crop', // Indian man
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop', // Man portrait
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', // Man portrait
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop', // Man portrait
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop', // Man portrait
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop', // Professional man
];

// Indian female names
const femaleNames = [
  'Priya', 'Ananya', 'Ishita', 'Kavya', 'Riya',
  'Aisha', 'Nisha', 'Shreya', 'Tanvi', 'Meera',
  'Aditi', 'Pooja', 'Neha', 'Diya', 'Sakshi',
  'Kritika', 'Simran', 'Aarohi', 'Kiara', 'Avni',
];

// Indian male names
const maleNames = [
  'Arjun', 'Rohan', 'Aditya', 'Vikram', 'Rahul',
  'Karan', 'Aryan', 'Siddharth', 'Veer', 'Kabir',
  'Arnav', 'Ishaan', 'Dev', 'Vivaan', 'Reyansh',
  'Aarav', 'Dhruv', 'Krishna', 'Shaurya', 'Yash',
];

const bios = [
  "Chai lover ☕️ | Dog parent 🐕 | Mountains over beaches 🏔️",
  "Here for meaningful conversations and genuine connections. Let's meet over coffee!",
  "Software engineer by day, musician by night. Looking for my duet partner 🎸",
  "Just moved to the city for work. Would love to explore the food scene together! 🍕",
  "Books > Netflix. Recommend me your favorite read! 📚",
  "If you can make me laugh, you've already won my heart ❤️",
  "Foodie | Travel enthusiast | Sunset chaser 🌅",
  "Looking for someone to share Spotify playlists and late night chai with 🎵",
  "Morning yoga, evening walks. Simple pleasures make life beautiful 🧘",
  "Let's skip the small talk and plan our first trek together 🥾",
  "Film buff | Photography enthusiast | Coffee connoisseur ☕",
  "Startup life has me busy but never too busy for the right person 💫",
  "Home chef experimenting with fusion cuisine. Be my taste tester? 👨‍🍳",
  "Weekend warrior - always up for an adventure or a cozy movie marathon 🎬",
  "IIM grad who still can't decide between butter chicken and paneer tikka 😄",
];

const allInterests = [
  'Photography', 'Travel', 'Bollywood', 'Fitness', 'Cooking',
  'Art', 'Reading', 'Trekking', 'Movies', 'Cricket',
  'Yoga', 'Coffee', 'Music', 'Dancing', 'Tech',
  'Fashion', 'Street Food', 'Nature', 'Pets', 'Football',
  'Meditation', 'Poetry', 'Stand-up Comedy', 'Startups', 'Gaming',
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Goa', 'Kochi', 'Indore', 'Surat',
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
  const usedFemaleNames = new Set<string>();
  const usedMaleNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isFemale = i % 2 === 0; // Alternate between female and male

    // Get unique name
    let name: string;
    if (isFemale) {
      const availableNames = femaleNames.filter(n => !usedFemaleNames.has(n));
      name = availableNames.length > 0
        ? availableNames[getRandomInt(0, availableNames.length - 1)]
        : femaleNames[i % femaleNames.length];
      usedFemaleNames.add(name);
    } else {
      const availableNames = maleNames.filter(n => !usedMaleNames.has(n));
      name = availableNames.length > 0
        ? availableNames[getRandomInt(0, availableNames.length - 1)]
        : maleNames[i % maleNames.length];
      usedMaleNames.add(name);
    }

    // Get appropriate photos based on gender
    const photoPool = isFemale ? femalePhotos : malePhotos;
    const numPhotos = getRandomInt(2, 4);
    const photoStartIndex = Math.floor(i / 2) % photoPool.length;
    const photos: string[] = [];
    for (let j = 0; j < numPhotos; j++) {
      photos.push(photoPool[(photoStartIndex + j) % photoPool.length]);
    }

    profiles.push({
      id: `profile-${i + 1}`,
      name,
      age: getRandomInt(22, 32),
      gender: isFemale ? 'female' : 'male',
      interestedIn: isFemale ? ['male'] : ['female'],
      photos,
      bio: bios[i % bios.length],
      interests: getRandomItems(allInterests, getRandomInt(4, 6)),
      location: {
        city: cities[i % cities.length],
        distance: getRandomInt(1, 20),
      },
      preferences: {
        ageRange: { min: 21, max: 35 },
        maxDistance: 50,
      },
      verified: Math.random() > 0.3,
      matchPercentage: getRandomInt(72, 98),
    });
  }

  return profiles;
};

export const mockProfiles = generateMockProfiles(20);
