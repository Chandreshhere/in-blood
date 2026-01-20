import React, { useState, useCallback, useMemo } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useMatches } from '../../context';
import { Profile } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DATE_CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2.3;

type RootStackParamList = {
  Feed: undefined;
  ProfileDetail: { profile: Profile };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for new chats/stories
const NEW_CHATS = [
  { id: 'my-story', name: 'My Story', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', isMyStory: true },
  { id: '1', name: 'Anita', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { id: '2', name: 'Vinita', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
  { id: '3', name: 'Sunita', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop' },
  { id: '4', name: 'Bablu', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: '5', name: 'Priya', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
];

// Mock data for your dates (ages 18-99)
const YOUR_DATES = [
  { id: '1', name: 'Bablu', age: 24, distance: '16 km away', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop', orientation: 'QUEER', online: true },
  { id: '2', name: 'Golu', age: 21, distance: '4.8 km away', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop', orientation: 'LESBIAN', online: false },
  { id: '3', name: 'Rohit', age: 26, distance: '2.2 km away', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop', orientation: 'GAY', online: true },
  { id: '4', name: 'Meera', age: 28, distance: '5.1 km away', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop', orientation: 'BISEXUAL', online: false },
  { id: '5', name: 'Arjun', age: 32, distance: '3.5 km away', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop', orientation: 'STRAIGHT', online: true },
];

// Mock nearby profiles for map
const NEARBY_PROFILES = [
  { id: '1', name: 'Anita', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', x: 0.35, y: 0.45 },
  { id: '2', name: 'Rahul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', x: 0.7, y: 0.65 },
];

// Story/Chat Item Component
const StoryItem: React.FC<{
  item: typeof NEW_CHATS[0];
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
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

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).springify()}
      style={animatedStyle}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
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
              colors={[colors.primary, '#FF6B6B']}
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
  const { getAvailableProfiles } = useMatches();
  const [selectedNearbyProfile, setSelectedNearbyProfile] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearchToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
    }
  }, [showSearch]);

  const handleProfilePress = useCallback((profile: any, isChat: boolean = false) => {
    const fullProfile: Profile = {
      id: profile.id,
      name: profile.name,
      age: profile.age || 25,
      photos: [profile.image],
      bio: 'Looking for meaningful connections',
      location: { city: 'Mumbai', distance: 5 },
      interests: ['Travel', 'Music', 'Food'],
      verified: true,
      gender: 'female',
      interestedIn: ['male'],
      preferences: { ageRange: { min: 21, max: 35 }, maxDistance: 25 },
    };
    navigation.navigate('ProfileDetail', { profile: fullProfile, isChat });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="options-outline" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Home</Text>

          <Pressable
            style={[styles.headerButton, showSearch && styles.headerButtonActive]}
            onPress={handleSearchToggle}
          >
            <Ionicons name={showSearch ? "close" : "search-outline"} size={24} color={colors.text} />
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
          {/* New Chats Section */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Chats</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={styles.viewMoreText}>View More</Text>
              </Pressable>
            </View>

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
                      handleProfilePress(item, true);
                    }
                  }}
                />
              )}
            />
          </Animated.View>

          {/* Your Dates Section */}
          <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Dates</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Text style={styles.viewMoreText}>View All</Text>
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
                  onPress={() => handleProfilePress(item, false)}
                />
              )}
            />
          </Animated.View>

          {/* Near You Section */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
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

export default FeedScreen;
