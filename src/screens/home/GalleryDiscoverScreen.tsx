import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Profile } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { useUser } from '../../context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Grid configuration
const NUM_COLUMNS = 3;
const NUM_ROWS = 5;
const CARD_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Cell dimensions (card + gap)
const CELL_WIDTH = CARD_WIDTH + CARD_GAP;
const CELL_HEIGHT = CARD_HEIGHT + CARD_GAP;

// Total grid cycle dimensions
const GRID_CYCLE_WIDTH = CELL_WIDTH * NUM_COLUMNS;
const GRID_CYCLE_HEIGHT = CELL_HEIGHT * NUM_ROWS;

// Mock profiles - more variety
const MOCK_PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop',
];

const NAMES = [
  'Priya', 'Rahul', 'Ananya', 'Vikram', 'Ishita', 'Arjun', 'Kavya', 'Aditya',
  'Shreya', 'Rohan', 'Neha', 'Karan', 'Pooja', 'Varun', 'Riya', 'Siddharth',
  'Divya', 'Nikhil', 'Tanya', 'Amit', 'Meera', 'Raj', 'Nisha', 'Dev',
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Hyderabad'];

type RootStackParamList = {
  GalleryDiscover: undefined;
  ProfileDetail: { profile: Profile };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface GalleryProfile {
  id: string;
  name: string;
  age: number;
  image: string;
  city: string;
  verified: boolean;
  online: boolean;
}

// Generate profile for grid position with proper wrapping
const getProfileForPosition = (col: number, row: number): GalleryProfile => {
  // Use positive modulo for wrapping
  const wrappedCol = ((col % NUM_COLUMNS) + NUM_COLUMNS) % NUM_COLUMNS;
  const wrappedRow = ((row % NUM_ROWS) + NUM_ROWS) % NUM_ROWS;
  const index = wrappedRow * NUM_COLUMNS + wrappedCol;

  return {
    id: `profile-${wrappedCol}-${wrappedRow}`,
    name: NAMES[index % NAMES.length],
    age: 18 + (index * 3 % 30),
    image: MOCK_PROFILE_IMAGES[index % MOCK_PROFILE_IMAGES.length],
    city: CITIES[index % CITIES.length],
    verified: index % 3 === 0,
    online: index % 2 === 0,
  };
};

// Relationship type options with unique colors
export const RELATIONSHIP_TYPES = [
  { id: 'long-term', label: 'Long-term', icon: 'heart', color: '#E53935' },
  { id: 'casual', label: 'Casual', icon: 'cafe', color: '#8E24AA' },
  { id: 'friendship', label: 'Friendship', icon: 'happy', color: '#43A047' },
  { id: 'marriage', label: 'Marriage', icon: 'diamond', color: '#FB8C00' },
  { id: 'open', label: 'Open to All', icon: 'sparkles', color: '#00ACC1' },
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number]['id'] | null;

// Helper to get color for a relationship type
export const getRelationshipColor = (typeId: RelationshipType): string => {
  if (!typeId) return '#FFFFFF'; // default white when no filter
  const type = RELATIONSHIP_TYPES.find(t => t.id === typeId);
  return type?.color || '#FFFFFF';
};

// Filter Modal Component - Simple "Looking For" filter only
const FilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectedType: RelationshipType;
  onSelectType: (type: RelationshipType) => void;
}> = ({ visible, onClose, selectedType, onSelectType }) => {
  const [tempType, setTempType] = useState<RelationshipType>(selectedType);

  useEffect(() => {
    setTempType(selectedType);
  }, [selectedType, visible]);

  const selectType = (type: typeof RELATIONSHIP_TYPES[number]['id']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempType(tempType === type ? null : type);
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectType(tempType);
    onClose();
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempType(null);
  };

  const getTypeColor = (typeId: string) => {
    const type = RELATIONSHIP_TYPES.find(t => t.id === typeId);
    return type?.color || colors.primary;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={filterStyles.overlay}>
        <View style={filterStyles.container}>
          <LinearGradient colors={['#1a1a1a', '#0d0d0d']} style={filterStyles.gradient}>
            <View style={filterStyles.header}>
              <Text style={filterStyles.title}>Looking For</Text>
              <Pressable style={filterStyles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={filterStyles.subtitle}>What type of relationship are you looking for?</Text>

            <View style={filterStyles.typesGrid}>
              {RELATIONSHIP_TYPES.map((type) => {
                const isSelected = tempType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    style={[
                      filterStyles.typeChip,
                      isSelected && { backgroundColor: type.color, borderColor: type.color },
                    ]}
                    onPress={() => selectType(type.id)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={isSelected ? colors.text : type.color}
                    />
                    <Text
                      style={[
                        filterStyles.typeChipText,
                        { color: isSelected ? colors.text : type.color },
                      ]}
                      numberOfLines={1}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tempType && (
              <Pressable style={filterStyles.clearButton} onPress={handleClearAll}>
                <Text style={filterStyles.clearButtonText}>Clear Filter</Text>
              </Pressable>
            )}

            <Pressable style={filterStyles.applyButton} onPress={handleApply}>
              <LinearGradient
                colors={tempType ? [getTypeColor(tempType), getTypeColor(tempType)] : [colors.primary, colors.primaryDark]}
                style={filterStyles.applyGradient}
              >
                <Text style={filterStyles.applyText}>
                  Apply Filter
                </Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

// Preload all images on mount
const preloadImages = () => {
  MOCK_PROFILE_IMAGES.forEach(uri => {
    Image.prefetch(uri);
  });
};

// Profile Card Component - simple rectangular design
const ProfileCard: React.FC<{
  profile: GalleryProfile;
  onPress: () => void;
  borderColor: string;
}> = React.memo(({ profile, onPress, borderColor }) => {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.card,
        { borderWidth: 2, borderColor },
      ]}
    >
      <Image
        source={{ uri: profile.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <Text style={styles.cardName} numberOfLines={1}>{profile.name}</Text>
        <Text style={styles.cardAge}>{profile.age}</Text>
      </LinearGradient>
      {profile.online && <View style={styles.onlineIndicator} />}
      {profile.verified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#1DA1F2" />
        </View>
      )}
    </Pressable>
  );
}, (prevProps, nextProps) =>
  prevProps.profile.id === nextProps.profile.id &&
  prevProps.borderColor === nextProps.borderColor
);

// Helper function for proper modulo that handles negatives
const mod = (n: number, m: number): number => {
  'worklet';
  return ((n % m) + m) % m;
};

// Infinite 360 Grid Component - renders a tiled grid that wraps seamlessly
const InfiniteGrid: React.FC<{
  onProfilePress: (profile: GalleryProfile) => void;
  filterColor: string;
}> = ({ onProfilePress, filterColor }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  // Pre-generate all profile data for the base grid
  const baseProfiles = useMemo(() => {
    const profiles: GalleryProfile[][] = [];
    for (let row = 0; row < NUM_ROWS; row++) {
      profiles[row] = [];
      for (let col = 0; col < NUM_COLUMNS; col++) {
        profiles[row][col] = getProfileForPosition(col, row);
      }
    }
    return profiles;
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      contextX.value = translateX.value;
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = contextX.value + event.translationX;
      translateY.value = contextY.value + event.translationY;
    })
    .onEnd((event) => {
      translateX.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.997,
      });

      translateY.value = withDecay({
        velocity: event.velocityY,
        deceleration: 0.997,
      });
    });

  // Animated style for the entire grid container
  const animatedGridStyle = useAnimatedStyle(() => {
    // Keep translation within one cycle to prevent huge numbers
    const normX = mod(translateX.value, GRID_CYCLE_WIDTH);
    const normY = mod(translateY.value, GRID_CYCLE_HEIGHT);

    return {
      transform: [
        { translateX: normX - GRID_CYCLE_WIDTH },
        { translateY: normY - GRID_CYCLE_HEIGHT },
      ],
    };
  });

  // Render 3x3 grid tiles to ensure seamless wrapping in all directions
  const renderTiles = () => {
    const tiles: React.ReactElement[] = [];

    for (let tileRow = 0; tileRow < 3; tileRow++) {
      for (let tileCol = 0; tileCol < 3; tileCol++) {
        const tileOffsetX = tileCol * GRID_CYCLE_WIDTH;
        const tileOffsetY = tileRow * GRID_CYCLE_HEIGHT;

        // Render cards within this tile
        for (let row = 0; row < NUM_ROWS; row++) {
          for (let col = 0; col < NUM_COLUMNS; col++) {
            const profile = baseProfiles[row][col];
            const x = tileOffsetX + col * CELL_WIDTH;
            const y = tileOffsetY + row * CELL_HEIGHT;

            tiles.push(
              <View
                key={`${tileCol}-${tileRow}-${col}-${row}`}
                style={[
                  styles.cardWrapper,
                  {
                    left: x,
                    top: y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                  },
                ]}
              >
                <ProfileCard
                  profile={profile}
                  onPress={() => onProfilePress(profile)}
                  borderColor={filterColor}
                />
              </View>
            );
          }
        }
      }
    }

    return tiles;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.gridContainer, animatedGridStyle]}>
        {renderTiles()}
      </Animated.View>
    </GestureDetector>
  );
};

export const GalleryDiscoverScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedRelationshipType, setSelectedRelationshipType } = useUser();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Preload images on mount
  useEffect(() => {
    preloadImages();
  }, []);

  const handleProfilePress = useCallback((profile: GalleryProfile) => {
    const fullProfile: Profile = {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      photos: [profile.image],
      bio: 'Looking for meaningful connections',
      location: { city: profile.city, distance: Math.floor(Math.random() * 10) + 1 },
      interests: ['Travel', 'Music', 'Food'],
      verified: profile.verified,
      gender: 'female',
      interestedIn: ['male'],
      preferences: { ageRange: { min: 21, max: 35 }, maxDistance: 25 },
    };
    navigation.navigate('ProfileDetail', { profile: fullProfile });
  }, [navigation]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFilters(true);
            }}
          >
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Explore</Text>
          </View>

          <Pressable
            style={styles.searchButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSearch(!showSearch);
            }}
          >
            <Ionicons name="search" size={22} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View entering={FadeIn} style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, city..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* Quick Filters */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.quickFiltersContainer}>
          {['All', 'Online', 'Verified', 'New', 'Nearby'].map((filter) => (
            <Pressable
              key={filter}
              style={[styles.quickFilterChip, activeFilter === filter && styles.quickFilterChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(filter);
              }}
            >
              <Text style={[styles.quickFilterText, activeFilter === filter && styles.quickFilterTextActive]}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </SafeAreaView>

      {/* Infinite 360 Grid */}
      <View style={styles.gridWrapper}>
        <InfiniteGrid
          onProfilePress={handleProfilePress}
          filterColor={getRelationshipColor(selectedRelationshipType)}
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedType={selectedRelationshipType}
        onSelectType={setSelectedRelationshipType}
      />
    </GestureHandlerRootView>
  );
};

const filterStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  genderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
  },
  rainbowButton: {
    width: '100%',
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  genderButtonTextActive: {
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  typesGrid: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
  },
  typeChipTextActive: {
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  scrollContent: {
    maxHeight: 400,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  rangeInputWrapper: {
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rangeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rangeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  rangeSeparator: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  distanceValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  distanceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distanceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distanceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interestChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  interestChipTextActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  clearButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  clearButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  applyButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  applyGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  applyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    zIndex: 10,
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
  title: {
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  quickFilterChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.full,
  },
  quickFilterChipActive: {
    backgroundColor: colors.primary,
  },
  quickFilterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  quickFilterTextActive: {
    color: colors.text,
  },
  gridWrapper: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  gridContainer: {
    position: 'absolute',
    width: GRID_CYCLE_WIDTH * 3,
    height: GRID_CYCLE_HEIGHT * 3,
  },
  cardWrapper: {
    position: 'absolute',
  },
  card: {
    flex: 1,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.sm,
    paddingTop: spacing.xl,
  },
  cardName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  cardAge: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
});

export default GalleryDiscoverScreen;
