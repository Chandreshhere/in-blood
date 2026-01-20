import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Profile, SwipeDirection } from '../types';
import { ProfileCard, CARD_WIDTH, CARD_HEIGHT } from './ProfileCard';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_UP_THRESHOLD = SCREEN_HEIGHT * 0.15;
const ROTATION_ANGLE = 15;

interface SwipeCardProps {
  profile: Profile;
  index: number;
  onSwipe: (direction: SwipeDirection) => void;
  onPress?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  index,
  onSwipe,
  onPress,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1 - index * 0.05);

  const triggerSwipe = useCallback((direction: SwipeDirection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwipe(direction);
  }, [onSwipe]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      // Swipe up for super like
      if (translateY.value < -SWIPE_UP_THRESHOLD && Math.abs(translateX.value) < SWIPE_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(triggerSwipe)('up');
        return;
      }

      // Swipe right for like
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        rotation.value = withTiming(ROTATION_ANGLE, { duration: 300 });
        runOnJS(triggerSwipe)('right');
        return;
      }

      // Swipe left for pass
      if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        rotation.value = withTiming(-ROTATION_ANGLE, { duration: 300 });
        runOnJS(triggerSwipe)('left');
        return;
      }

      // Return to center
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      rotation.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    zIndex: 100 - index,
  }));

  // Like overlay opacity
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  // Nope overlay opacity
  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  // Super like overlay opacity
  const superLikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_UP_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  if (index > 2) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardAnimatedStyle]}>
        <ProfileCard profile={profile} onPress={onPress} />

        {/* Like overlay */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <Ionicons name="heart" size={48} color={colors.primary} />
            <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
          </View>
        </Animated.View>

        {/* Nope overlay */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <Ionicons name="close" size={48} color={colors.textMuted} />
            <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
          </View>
        </Animated.View>

        {/* Super like overlay */}
        <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <Ionicons name="star" size={48} color={colors.superLike} />
            <Text style={[styles.overlayText, styles.superLikeText]}>SUPER LIKE</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.xxl,
  },
  overlayContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  likeOverlay: {
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  nopeOverlay: {
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
    borderWidth: 4,
    borderColor: colors.textMuted,
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 4,
    borderColor: colors.superLike,
  },
  overlayText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 2,
  },
  likeText: {
    color: colors.primary,
  },
  nopeText: {
    color: colors.textMuted,
  },
  superLikeText: {
    color: colors.superLike,
  },
});
