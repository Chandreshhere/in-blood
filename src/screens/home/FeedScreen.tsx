import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Profile } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { useChat } from '../../context/ChatContext';
import { useMatches } from '../../context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DATE_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2.3;

type MainTabsParamList = {
  Feed: undefined;
  Discover: undefined;
  Add: undefined;
  Matches: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  ProfileDetail: { profile: Profile };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList, 'Feed'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Distance Slider Component
const DistanceSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
}> = ({ value, onValueChange, minValue = 1, maxValue = 100 }) => {
  const sliderWidth = useRef(0);
  const sliderRef = useRef<View>(null);

  const calculateValue = (pageX: number) => {
    if (sliderWidth.current === 0) return value;
    sliderRef.current?.measure((x, y, width, height, pageXOffset) => {
      const touchX = pageX - pageXOffset;
      const percentage = Math.max(0, Math.min(1, touchX / width));
      const newValue = Math.round(minValue + percentage * (maxValue - minValue));
      onValueChange(newValue);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        calculateValue(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        calculateValue(evt.nativeEvent.pageX);
      },
    })
  ).current;

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <View
      ref={sliderRef}
      style={filterStyles.sliderContainer}
      onLayout={(e) => {
        sliderWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View style={filterStyles.sliderTrack}>
        <View style={[filterStyles.sliderFill, { width: `${percentage}%` }]} />
      </View>
      <View style={[filterStyles.sliderThumb, { left: `${percentage}%` }]} />
    </View>
  );
};

// Mock data for new chats/stories
const NEW_CHATS = [
  {
    id: 'my-story',
    name: 'My Story',
    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop',
    isMyStory: true,
    storyContent: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=800&fit=crop',
    age: 25,
    bio: 'Adventure seeker | Coffee lover',
    interests: ['Travel', 'Photography', 'Music'],
    prompt: { question: 'My perfect Sunday', answer: 'Brunch with friends and exploring new places' }
  },
  {
    id: '1',
    name: 'Ananya',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
    storyContent: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=800&fit=crop',
    age: 24,
    bio: 'Artist 🎨 | Dog mom 🐕',
    interests: ['Art', 'Yoga', 'Reading', 'Dogs'],
    prompt: { question: 'I geek out on', answer: 'Contemporary art and gallery hopping' }
  },
  {
    id: '2',
    name: 'Kavya',
    image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop',
    storyContent: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=800&fit=crop',
    age: 26,
    bio: 'Fitness enthusiast | Foodie',
    interests: ['Fitness', 'Cooking', 'Travel', 'Fashion'],
    prompt: { question: 'Best travel story', answer: 'Getting lost in Jaipur and finding the best dal baati' }
  },
  {
    id: '3',
    name: 'Ishita',
    image: 'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=200&h=200&fit=crop',
    storyContent: 'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400&h=800&fit=crop',
    age: 23,
    bio: 'Bookworm 📚 | Nature lover 🌿',
    interests: ['Books', 'Trekking', 'Coffee', 'Movies'],
    prompt: { question: 'My simple pleasures', answer: 'Morning chai with a good book' }
  },
  {
    id: '4',
    name: 'Arjun',
    image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200&h=200&fit=crop',
    storyContent: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=800&fit=crop',
    age: 27,
    bio: 'Tech geek | Music producer',
    interests: ['Technology', 'Music', 'Gaming', 'Cricket'],
    prompt: { question: 'I want someone who', answer: 'Can keep up with late night jam sessions' }
  },
  {
    id: '5',
    name: 'Priya',
    image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=200&h=200&fit=crop',
    storyContent: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=800&fit=crop',
    age: 25,
    bio: 'Dancer | Positive vibes only ✨',
    interests: ['Dance', 'Yoga', 'Photography', 'Food'],
    prompt: { question: "I'm looking for", answer: 'Someone who loves spontaneous adventures' }
  },
];

// Mock data for your dates (ages 18-99)
const YOUR_DATES = [
  { id: '1', name: 'Riya', age: 24, distance: '16 km away', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=600&fit=crop', orientation: 'QUEER', online: true },
  { id: '2', name: 'Shreya', age: 21, distance: '4.8 km away', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop', orientation: 'LESBIAN', online: false },
  { id: '3', name: 'Rohan', age: 26, distance: '2.2 km away', image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=600&fit=crop', orientation: 'GAY', online: true },
  { id: '4', name: 'Meera', age: 28, distance: '5.1 km away', image: 'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=400&h=600&fit=crop', orientation: 'BISEXUAL', online: false },
  { id: '5', name: 'Aditya', age: 32, distance: '3.5 km away', image: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=400&h=600&fit=crop', orientation: 'STRAIGHT', online: true },
];

// Mock nearby profiles for map
const NEARBY_PROFILES = [
  { id: '1', name: 'Tanvi', image: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=100&h=100&fit=crop', x: 0.35, y: 0.45 },
  { id: '2', name: 'Vikram', image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=100&h=100&fit=crop', x: 0.7, y: 0.65 },
];

// Story/Chat Item Component (without timer)
const StoryItem: React.FC<{
  item: typeof NEW_CHATS[0];
  index: number;
  onPress: () => void;
  onAddStory?: () => void;
}> = ({ item, index, onPress, onAddStory }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.isMyStory && onAddStory) {
      onAddStory();
    } else {
      onPress();
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.storyItem}
      >
        <View style={[styles.storyImageContainer, item.isMyStory && styles.myStoryContainer]}>
          {item.isMyStory ? (
            <LinearGradient
              colors={['#FFB6C1', '#FFC0CB']}
              style={styles.myStoryGradient}
            >
              <Image source={{ uri: item.image }} style={styles.storyImage} />
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.storyBorder}
            >
              <View style={styles.storyImageInner}>
                <Image source={{ uri: item.image }} style={styles.storyImage} />
              </View>
            </LinearGradient>
          )}
          {item.isMyStory && (
            <View style={styles.addStoryBadge}>
              <Ionicons name="add" size={14} color={colors.text} />
            </View>
          )}
        </View>
        <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
      </Pressable>
    </Animated.View>
  );
};

// Date Card Component
const DateCard: React.FC<{
  item: typeof YOUR_DATES[0];
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      style={[styles.dateCardWrapper, animatedStyle]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.dateCard}
      >
        <Image source={{ uri: item.image }} style={styles.dateCardImage} />

        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        {/* Bottom info */}
        <View style={styles.dateCardInfo}>
          <View style={styles.dateCardNameRow}>
            <Text style={styles.dateCardName}>{item.name}, {item.age}</Text>
            {item.online && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.dateCardOrientation}>{item.orientation}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { sendMessage, initializeChat } = useChat();
  const { createMatchForProfile, findMatchByName } = useMatches();
  const [selectedNearbyProfile, setSelectedNearbyProfile] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 35 });
  const [distance, setDistance] = useState(25);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStory, setSelectedStory] = useState<typeof NEW_CHATS[0] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);
  const [complimentText, setComplimentText] = useState('');

  // Filter chats and dates based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return NEW_CHATS;
    const query = searchQuery.toLowerCase();
    return NEW_CHATS.filter(chat => chat.name.toLowerCase().includes(query));
  }, [searchQuery]);

  const filteredDates = useMemo(() => {
    if (!searchQuery.trim()) return YOUR_DATES;
    const query = searchQuery.toLowerCase();
    return YOUR_DATES.filter(date =>
      date.name.toLowerCase().includes(query) ||
      date.orientation.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get stories list (excluding "My Story")
  const storiesList = useMemo(() => {
    return filteredChats.filter(chat => !chat.isMyStory);
  }, [filteredChats]);

  // Navigate to next story
  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < storiesList.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setSelectedStory(storiesList[nextIndex]);
      setStoryProgress(0);
    } else {
      // Close viewer when at the last story
      setShowStoryViewer(false);
    }
  }, [currentStoryIndex, storiesList]);

  // Navigate to previous story
  const handlePreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setSelectedStory(storiesList[prevIndex]);
      setStoryProgress(0);
    }
  }, [currentStoryIndex, storiesList]);

  // Open story at specific index
  const openStoryAtIndex = useCallback((story: typeof NEW_CHATS[0]) => {
    const index = storiesList.findIndex(s => s.id === story.id);
    if (index !== -1) {
      setCurrentStoryIndex(index);
      setSelectedStory(story);
      setShowStoryViewer(true);
      setStoryProgress(0);
    }
  }, [storiesList]);

  const handleSearchToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
    }
  }, [showSearch]);

  const handleProfilePress = useCallback((profile: any) => {
    const fullProfile: Profile = {
      id: profile.id,
      name: profile.name,
      age: profile.age || 25,
      photos: [profile.image],
      bio: 'Looking for meaningful connections and exploring new adventures',
      location: { city: 'Mumbai', distance: 5 },
      interests: ['Travel', 'Music', 'Food', 'Photography', 'Fitness'],
      verified: true,
      gender: 'female',
      interestedIn: ['male'],
      preferences: { ageRange: { min: 21, max: 35 }, maxDistance: 25 },
      pronouns: 'She/Her',
      stats: {
        rejections: 2400,
        likes: 33,
      },
      prompts: [
        {
          question: 'I geek out on',
          answer: 'Contemporary art and gallery hopping on weekends',
        },
        {
          question: 'My simple pleasures',
          answer: 'Morning coffee while watching the sunrise',
        },
      ],
    };
    navigation.navigate('ProfileDetail', { profile: fullProfile });
  }, [navigation]);


  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilterModal(true);
  }, []);

  const handleViewMapPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMapModal(true);
  }, []);


  const handleSendCompliment = useCallback(() => {
    if (!complimentText.trim() || !selectedStory) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Find existing match or create a new one for this story person
    let match = findMatchByName(selectedStory.name);

    if (!match) {
      // Create a new match for this profile from story data
      match = createMatchForProfile({
        id: `story-${selectedStory.id}`,
        name: selectedStory.name,
        age: selectedStory.age,
        photos: [selectedStory.image, selectedStory.storyContent].filter(Boolean) as string[],
        bio: selectedStory.bio || '',
        interests: selectedStory.interests || [],
        gender: 'female',
        interestedIn: ['male'],
        location: { city: 'Mumbai' },
        preferences: { ageRange: { min: 18, max: 40 }, maxDistance: 25 },
        verified: true,
      });
    }

    // Initialize chat if not already done
    initializeChat(match.id, 'current-user', match.profile.id);

    // Send the compliment message with a special format
    sendMessage(match.id, {
      senderId: 'current-user',
      text: `💝 Compliment: ${complimentText}`,
      type: 'text',
    });

    // Clear the input and show feedback
    setComplimentText('');

    // Close story viewer after sending compliment
    setShowStoryViewer(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [complimentText, selectedStory, findMatchByName, createMatchForProfile, initializeChat, sendMessage]);


  // Story timer effect
  useEffect(() => {
    if (!showStoryViewer || !selectedStory) return;

    const duration = 10000; // 10 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          // Auto-advance to next story
          if (currentStoryIndex < storiesList.length - 1) {
            const nextIndex = currentStoryIndex + 1;
            setCurrentStoryIndex(nextIndex);
            setSelectedStory(storiesList[nextIndex]);
            setStoryProgress(0);
          } else {
            setShowStoryViewer(false);
          }
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [showStoryViewer, selectedStory, currentStoryIndex, storiesList]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Pressable
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Home</Text>
          </View>

          <Pressable
            style={styles.searchButton}
            onPress={handleSearchToggle}
          >
            <Ionicons name={showSearch ? "close" : "search"} size={22} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Stories Section (without title) */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <FlatList
              horizontal
              data={filteredChats}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContainer}
              ListEmptyComponent={
                <Text style={styles.emptySearchText}>No chats found</Text>
              }
              renderItem={({ item, index }) => (
                <StoryItem
                  item={item}
                  index={index}
                  onPress={() => {
                    if (!item.isMyStory) {
                      openStoryAtIndex(item);
                    }
                  }}
                  onAddStory={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    console.log('Add story pressed');
                  }}
                />
              )}
            />
          </Animated.View>

          {/* Your Dates Section */}
          <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Dates</Text>
              <Pressable onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Discover');
              }}>
                <Text style={styles.viewMoreText}>Explore More</Text>
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={filteredDates}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesContainer}
              ListEmptyComponent={
                <Text style={styles.emptySearchText}>No dates found</Text>
              }
              renderItem={({ item, index }) => (
                <DateCard
                  item={item}
                  index={index}
                  onPress={() => handleProfilePress(item)}
                />
              )}
            />
          </Animated.View>

          {/* Near You Section */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <Pressable onPress={handleViewMapPress}>
                <Text style={styles.viewMoreText}>View Map</Text>
              </Pressable>
            </View>

            <View style={styles.mapContainer}>
              {/* Map background */}
              <Image
                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/72.8777,19.0760,13,0/400x300@2x?access_token=pk.placeholder' }}
                style={styles.mapImage}
                resizeMode="cover"
              />

              {/* Map overlay with grid pattern */}
              <View style={styles.mapOverlay}>
                {/* Grid lines */}
                <View style={styles.mapGrid}>
                  {[...Array(6)].map((_, i) => (
                    <View key={`h-${i}`} style={[styles.gridLineH, { top: `${i * 20}%` }]} />
                  ))}
                  {[...Array(6)].map((_, i) => (
                    <View key={`v-${i}`} style={[styles.gridLineV, { left: `${i * 20}%` }]} />
                  ))}
                </View>

                {/* Nearby profiles on map */}
                {NEARBY_PROFILES.map((profile) => (
                  <Pressable
                    key={profile.id}
                    style={[
                      styles.mapProfile,
                      { left: `${profile.x * 100}%`, top: `${profile.y * 100}%` },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSelectedNearbyProfile(profile.id);
                    }}
                  >
                    {selectedNearbyProfile === profile.id && (
                      <Animated.View entering={FadeIn} style={styles.connectBubble}>
                        <Ionicons name="wifi" size={14} color={colors.text} />
                        <Text style={styles.connectText}>Connect with {profile.name} 👋</Text>
                      </Animated.View>
                    )}
                    <View style={[
                      styles.mapProfileImage,
                      selectedNearbyProfile === profile.id && styles.mapProfileImageActive,
                    ]}>
                      <Image source={{ uri: profile.image }} style={styles.mapProfileImg} />
                    </View>
                    {selectedNearbyProfile === profile.id && (
                      <View style={styles.mapProfileDot} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Story Viewer Modal */}
      <Modal
        visible={showStoryViewer}
        animationType="fade"
        onRequestClose={() => setShowStoryViewer(false)}
      >
        <View style={storyStyles.container}>
          {selectedStory && (
            <>
              {/* Full Screen Story Image */}
              <Image
                source={{ uri: selectedStory.storyContent || selectedStory.image }}
                style={storyStyles.storyImage}
                resizeMode="cover"
              />

              {/* Tap zones for navigation */}
              <View style={storyStyles.tapZonesContainer}>
                <Pressable
                  style={storyStyles.tapZoneLeft}
                  onPress={handlePreviousStory}
                />
                <Pressable
                  style={storyStyles.tapZoneRight}
                  onPress={handleNextStory}
                />
              </View>

              {/* Top gradient overlay with timer and header */}
              <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent']}
                style={storyStyles.topGradient}
              >
                <SafeAreaView edges={['top']} style={storyStyles.topOverlay}>
                  {/* Single progress bar */}
                  <View style={storyStyles.timerBar}>
                    <View style={[storyStyles.timerFill, { width: `${storyProgress}%` }]} />
                  </View>

                  {/* Story header */}
                  <View style={storyStyles.header}>
                    <View style={storyStyles.userInfo}>
                      <Image
                        source={{ uri: selectedStory.image }}
                        style={storyStyles.avatar}
                      />
                      <View>
                        <Text style={storyStyles.username}>{selectedStory.name}</Text>
                        {selectedStory.age && (
                          <Text style={storyStyles.age}>{selectedStory.age}</Text>
                        )}
                      </View>
                    </View>
                    <Pressable
                      style={storyStyles.closeButton}
                      onPress={() => setShowStoryViewer(false)}
                    >
                      <Ionicons name="close" size={28} color={colors.text} />
                    </Pressable>
                  </View>
                </SafeAreaView>
              </LinearGradient>

              {/* Bottom compliment input */}
              <SafeAreaView edges={['bottom']} style={storyStyles.bottomContainer}>
                <View style={storyStyles.complimentInputContainer}>
                  <TextInput
                    style={storyStyles.complimentInput}
                    placeholder="Add compliment..."
                    placeholderTextColor={colors.textMuted}
                    value={complimentText}
                    onChangeText={setComplimentText}
                    maxLength={200}
                  />
                  <Pressable
                    style={[
                      storyStyles.sendButton,
                      !complimentText.trim() && storyStyles.sendButtonDisabled
                    ]}
                    onPress={handleSendCompliment}
                    disabled={!complimentText.trim()}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={complimentText.trim() ? colors.primary : colors.textMuted}
                    />
                  </Pressable>
                </View>
              </SafeAreaView>
            </>
          )}
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={filterStyles.modalOverlay}>
          <Pressable
            style={filterStyles.modalBackdrop}
            onPress={() => setShowFilterModal(false)}
          />
          <View style={filterStyles.modalContainer}>
            <LinearGradient
              colors={['#1a1a1a', '#0d0d0d']}
              style={filterStyles.modalGradient}
            >
              {/* Handle */}
              <View style={filterStyles.modalHandle} />

              {/* Header */}
              <View style={filterStyles.modalHeader}>
                <Text style={filterStyles.modalTitle}>Filters</Text>
                <Pressable
                  onPress={() => setShowFilterModal(false)}
                  style={filterStyles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Age Preference */}
                <View style={filterStyles.filterSection}>
                  <Text style={filterStyles.filterLabel}>Age Preference</Text>
                  <Text style={filterStyles.filterValue}>{ageRange.min} - {ageRange.max} years</Text>

                  <View style={filterStyles.ageContainer}>
                    <View style={filterStyles.ageInput}>
                      <Text style={filterStyles.ageLabel}>Min</Text>
                      <View style={filterStyles.ageControls}>
                        <Pressable
                          style={filterStyles.ageButton}
                          onPress={() => setAgeRange(prev => ({ ...prev, min: Math.max(18, prev.min - 1) }))}
                        >
                          <Ionicons name="remove" size={20} color={colors.text} />
                        </Pressable>
                        <Text style={filterStyles.ageValue}>{ageRange.min}</Text>
                        <Pressable
                          style={filterStyles.ageButton}
                          onPress={() => setAgeRange(prev => ({ ...prev, min: Math.min(prev.max - 1, prev.min + 1) }))}
                        >
                          <Ionicons name="add" size={20} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>

                    <View style={filterStyles.ageSeparator}>
                      <Text style={filterStyles.ageSeparatorText}>to</Text>
                    </View>

                    <View style={filterStyles.ageInput}>
                      <Text style={filterStyles.ageLabel}>Max</Text>
                      <View style={filterStyles.ageControls}>
                        <Pressable
                          style={filterStyles.ageButton}
                          onPress={() => setAgeRange(prev => ({ ...prev, max: Math.max(prev.min + 1, prev.max - 1) }))}
                        >
                          <Ionicons name="remove" size={20} color={colors.text} />
                        </Pressable>
                        <Text style={filterStyles.ageValue}>{ageRange.max}</Text>
                        <Pressable
                          style={filterStyles.ageButton}
                          onPress={() => setAgeRange(prev => ({ ...prev, max: Math.min(99, prev.max + 1) }))}
                        >
                          <Ionicons name="add" size={20} color={colors.text} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Maximum Distance */}
                <View style={filterStyles.filterSection}>
                  <Text style={filterStyles.filterLabel}>Maximum Distance</Text>
                  <Text style={filterStyles.filterValue}>{distance} km</Text>
                  <DistanceSlider
                    value={distance}
                    onValueChange={setDistance}
                    minValue={1}
                    maxValue={100}
                  />
                </View>

                {/* Apply Button */}
                <Pressable
                  style={filterStyles.applyButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowFilterModal(false);
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={filterStyles.applyButtonGradient}
                  >
                    <Text style={filterStyles.applyButtonText}>Apply Filters</Text>
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Full Screen Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView edges={['top']} style={mapStyles.container}>
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a']}
            style={mapStyles.gradient}
          >
            {/* Header */}
            <View style={mapStyles.header}>
              <View style={mapStyles.headerLeft}>
                <Ionicons name="location" size={24} color={colors.primary} />
                <Text style={mapStyles.headerTitle}>Nearby</Text>
              </View>
              <Pressable
                style={mapStyles.closeButton}
                onPress={() => setShowMapModal(false)}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            </View>

            {/* Map Content */}
            <View style={mapStyles.mapContainer}>
              {/* Map placeholder image */}
              <Image
                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/72.8777,19.0760,12,0/600x800@2x?access_token=pk.placeholder' }}
                style={mapStyles.mapImage}
                resizeMode="cover"
              />

              {/* Map overlay with profiles */}
              <View style={mapStyles.mapOverlay}>
                {NEARBY_PROFILES.map((profile) => (
                  <Pressable
                    key={profile.id}
                    style={[
                      mapStyles.mapProfilePin,
                      { left: `${profile.x * 100}%`, top: `${profile.y * 100}%` },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <View style={mapStyles.profilePinImage}>
                      <Image source={{ uri: profile.image }} style={mapStyles.profilePinImg} />
                    </View>
                    <View style={mapStyles.profilePinDot} />
                  </Pressable>
                ))}
              </View>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    height: '100%',
  },
  emptySearchText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  viewMoreText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Stories styles
  storiesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 75,
  },
  storyImageContainer: {
    width: 72,
    height: 72,
    marginBottom: spacing.xs,
  },
  myStoryContainer: {
    position: 'relative',
  },
  myStoryGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  storyBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  storyImageInner: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: colors.background,
    padding: 2,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  addStoryBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  storyName: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  // Dual section row
  dualSectionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  halfSection: {
    flex: 1,
  },
  sectionHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleSmall: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  viewMoreTextSmall: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  datesContainerCompact: {
    gap: spacing.sm,
  },
  // Date cards styles
  datesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  dateCardWrapper: {
    width: DATE_CARD_WIDTH,
  },
  dateCard: {
    width: '100%',
    height: DATE_CARD_WIDTH * 1.4,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  dateCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 60,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  distanceText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  dateCardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dateCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateCardName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  dateCardOrientation: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    marginTop: 2,
  },
  // Map styles
  mapContainer: {
    marginHorizontal: spacing.lg,
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  mapContainerCompact: {
    height: DATE_CARD_WIDTH * 1.2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: fontWeight.medium,
  },
  mapProfile: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapProfileSmall: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  mapProfileImageSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  mapProfileImageActive: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  mapProfileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  mapProfileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: -4,
  },
  connectBubble: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    minWidth: 180,
  },
  connectText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
});

// Filter modal styles
const filterStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  filterValue: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageInput: {
    flex: 1,
    alignItems: 'center',
  },
  ageLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  ageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  ageSeparator: {
    paddingHorizontal: spacing.md,
  },
  ageSeparatorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginLeft: -12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  applyButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});

// Story viewer styles
const storyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  tapZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapZoneLeft: {
    flex: 1,
    height: '100%',
  },
  tapZoneRight: {
    flex: 1,
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 10,
  },
  topOverlay: {
    paddingTop: spacing.xl,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  progressBarsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: 4,
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.text,
    borderRadius: 1.5,
  },
  timerBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: colors.text,
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.text,
  },
  username: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  age: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bioCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 105, 180, 0.3)',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  bioTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  bioText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  interestsCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestTag: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  interestText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  promptQuestion: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptAnswer: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 24,
    fontWeight: fontWeight.medium,
  },
  complimentSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  complimentTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  complimentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  complimentInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryActionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapProfilePin: {
    position: 'absolute',
    alignItems: 'center',
  },
  profilePinImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  profilePinImg: {
    width: '100%',
    height: '100%',
  },
  profilePinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: -6,
    borderWidth: 2,
    borderColor: colors.background,
  },
});

export default FeedScreen;
