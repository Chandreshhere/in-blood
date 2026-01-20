import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton, InterestChip } from '../../components';
import { useMatches } from '../../context';
import { Profile, SwipeDirection } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.5;

type RootStackParamList = {
  ProfileDetail: { profile: Profile; isChat?: boolean };
  MatchScreen: { match: any };
};

type ProfileDetailRouteProp = RouteProp<RootStackParamList, 'ProfileDetail'>;

export const ProfileDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ProfileDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { swipeProfile } = useMatches();

  const { profile, isChat = false } = route.params;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(scrollY.value, [-100, 0], [1.3, 1], 'clamp'),
      },
    ],
  }));

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    const match = swipeProfile(profile.id, direction);
    navigation.goBack();

    if (match) {
      setTimeout(() => {
        navigation.navigate('MatchScreen', { match });
      }, 300);
    }
  }, [profile, swipeProfile, navigation]);

  const handlePhotoChange = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'next' && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  }, [currentPhotoIndex, profile.photos.length]);

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        {/* Photo indicators - on top of image (hide for chat profiles) */}
        {!isChat && profile.photos.length > 1 && (
          <View style={[styles.photoIndicatorsContainer, { top: insets.top + 8 }]}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === currentPhotoIndex && styles.photoIndicatorActive,
                ]}
              />
            ))}
          </View>
        )}
        <Image
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* Photo navigation zones */}
        <View style={styles.photoNavigation}>
          <Pressable
            style={styles.photoNavZone}
            onPress={() => handlePhotoChange('prev')}
          />
          <Pressable
            style={styles.photoNavZone}
            onPress={() => handlePhotoChange('next')}
          />
        </View>

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.headerGradient}
        />

        {/* Close button */}
        <Pressable
          style={[styles.closeButton, { top: insets.top + spacing.sm }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </Pressable>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.infoCard}>
          {/* Name and Age */}
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.age}>, {profile.age}</Text>
              {profile.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
              )}
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.location}>
                {profile.location.city}
                {profile.location.distance && ` • ${profile.location.distance} km away`}
              </Text>
            </View>

            {/* Match percentage */}
            {profile.matchPercentage && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{profile.matchPercentage}% Match</Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </Animated.View>
          )}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {profile.interests.map((interest, index) => (
                  <InterestChip key={index} label={interest} disabled />
                ))}
              </View>
            </Animated.View>
          )}

          {/* Photos Grid */}
          {profile.photos.length > 1 && (
            <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <View style={styles.photosGrid}>
                {profile.photos.map((photo, index) => (
                  <Pressable
                    key={index}
                    style={styles.photoThumb}
                    onPress={() => setCurrentPhotoIndex(index)}
                  >
                    <Image source={{ uri: photo }} style={styles.photoThumbImage} />
                    {index === currentPhotoIndex && (
                      <View style={styles.photoThumbActive} />
                    )}
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Spacer for action buttons */}
        {!isChat && <View style={{ height: 100 }} />}
      </Animated.ScrollView>

      {/* Action Buttons - hide for chat profiles */}
      {!isChat && (
        <Animated.View
          entering={FadeIn.delay(500)}
          style={[styles.actionsContainer, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <ActionButton
            type="pass"
            size="large"
            onPress={() => handleSwipe('left')}
          />
          <ActionButton
            type="superLike"
            size="medium"
            onPress={() => handleSwipe('up')}
          />
          <ActionButton
            type="like"
            size="large"
            onPress={() => handleSwipe('right')}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  photoIndicatorsContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
    zIndex: 10,
  },
  photoIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: colors.text,
  },
  photoNavigation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  photoNavZone: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    marginTop: -borderRadius.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  nameSection: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  age: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  location: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  matchText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoThumb: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photoThumbImage: {
    width: '100%',
    height: '100%',
  },
  photoThumbActive: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
});
