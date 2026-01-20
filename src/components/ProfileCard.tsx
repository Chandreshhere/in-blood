import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Profile } from '../types';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme';
import { InterestChip } from './InterestChip';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.58;

interface ProfileCardProps {
  profile: Profile;
  onPress?: () => void;
  showFullInfo?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onPress,
  showFullInfo = true,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const photoScale = useSharedValue(1);

  const handlePhotoTap = (side: 'left' | 'right') => {
    if (side === 'right' && currentPhotoIndex < profile.photos.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      photoScale.value = withSpring(0.98, { damping: 15 }, () => {
        photoScale.value = withSpring(1, { damping: 15 });
      });
      setCurrentPhotoIndex(prev => prev + 1);
    } else if (side === 'left' && currentPhotoIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      photoScale.value = withSpring(0.98, { damping: 15 }, () => {
        photoScale.value = withSpring(1, { damping: 15 });
      });
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={[styles.card, shadows.lg]}>
      {/* Main Image with animation */}
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Photo indicators - Modern pill style */}
      <View style={styles.photoIndicators}>
        {profile.photos.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.photoIndicator,
              index === currentPhotoIndex && styles.photoIndicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Tap zones for photo navigation */}
      <View style={styles.tapZones}>
        <Pressable
          style={styles.tapZone}
          onPress={() => handlePhotoTap('left')}
        />
        <Pressable
          style={styles.tapZone}
          onPress={() => handlePhotoTap('right')}
        />
      </View>

      {/* Modern gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
        locations={[0.3, 0.5, 0.75, 1]}
        style={styles.gradient}
      >
        <View style={styles.infoContainer}>
          {/* Top badges row */}
          <View style={styles.badges}>
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
            {profile.location.distance && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={12} color={colors.textSecondary} />
                <Text style={styles.distanceText}>
                  {profile.location.distance} km
                </Text>
              </View>
            )}
          </View>

          {/* Name and age with modern typography */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
            {profile.verified && (
              <View style={styles.onlineDot} />
            )}
          </View>

          {/* Location */}
          {profile.location.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={colors.primary} />
              <Text style={styles.locationText}>{profile.location.city}</Text>
            </View>
          )}

          {/* Bio with modern styling */}
          {showFullInfo && profile.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          )}

          {/* Interests with glassmorphism style */}
          {showFullInfo && profile.interests.length > 0 && (
            <View style={styles.interests}>
              {profile.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestPill}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
              {profile.interests.length > 3 && (
                <View style={styles.moreInterests}>
                  <Text style={styles.moreInterestsText}>+{profile.interests.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Match percentage badge - Modern design */}
      {profile.matchPercentage && (
        <View style={styles.matchPercentage}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.matchGradient}
          >
            <Text style={styles.matchPercentageText}>
              {profile.matchPercentage}%
            </Text>
            <Text style={styles.matchLabel}>Match</Text>
          </LinearGradient>
        </View>
      )}

      {/* Decorative corner accent */}
      <View style={styles.cornerAccent}>
        <LinearGradient
          colors={[colors.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cornerGradient}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xxl + 4,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.md + 4,
    left: spacing.md,
    right: spacing.md,
    gap: 6,
    zIndex: 10,
  },
  photoIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: borderRadius.full,
    maxWidth: 80,
  },
  photoIndicatorActive: {
    backgroundColor: colors.text,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '45%',
    flexDirection: 'row',
    zIndex: 5,
  },
  tapZone: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    justifyContent: 'flex-end',
  },
  infoContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  verifiedText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  distanceText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.xxxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  age: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.background,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  bio: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  interestPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  interestText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  moreInterests: {
    backgroundColor: 'rgba(229, 57, 53, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
  },
  moreInterestsText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  matchPercentage: {
    position: 'absolute',
    top: spacing.lg + 28,
    right: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  matchGradient: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    alignItems: 'center',
  },
  matchPercentageText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  matchLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    overflow: 'hidden',
  },
  cornerGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
    top: -100,
    left: -100,
    opacity: 0.15,
  },
});
