import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Profile, SwipeDirection } from '../types';
import { ProfileCard, CARD_WIDTH, CARD_HEIGHT } from './ProfileCard';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_UP_THRESHOLD = SCREEN_HEIGHT * 0.12;
const ROTATION_ANGLE = 12;
const SWIPE_VELOCITY_THRESHOLD = 500;

// Spring configs for different animations
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

const RETURN_SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};

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
  const cardScale = useSharedValue(1 - index * 0.04);
  const cardTranslateY = useSharedValue(index * 8);
  const overlayOpacity = useSharedValue(0);

  // Entrance animation for stacked cards
  useEffect(() => {
    if (index === 0) {
      cardScale.value = withSpring(1, SPRING_CONFIG);
      cardTranslateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      cardScale.value = withDelay(
        index * 50,
        withSpring(1 - index * 0.04, SPRING_CONFIG)
      );
      cardTranslateY.value = withDelay(
        index * 50,
        withSpring(index * 8, SPRING_CONFIG)
      );
    }
  }, [index]);

  const triggerSwipe = useCallback((direction: SwipeDirection) => {
    Haptics.impactAsync(
      direction === 'up'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onSwipe(direction);
  }, [onSwipe]);

  const triggerLightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Slight scale up when starting to drag
      cardScale.value = withSpring(1.02, { damping: 20, stiffness: 400 });
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // Reduced vertical movement

      // Smoother rotation with slight damping
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
        Extrapolation.CLAMP
      );

      // Trigger haptic when crossing threshold
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      if (absX > SWIPE_THRESHOLD * 0.8 || absY > SWIPE_UP_THRESHOLD * 0.8) {
        if (overlayOpacity.value < 0.5) {
          runOnJS(triggerLightHaptic)();
        }
        overlayOpacity.value = 1;
      } else {
        overlayOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      const velocityX = event.velocityX;
      const velocityY = event.velocityY;

      // Swipe up for super like (with velocity consideration)
      if (
        (translateY.value < -SWIPE_UP_THRESHOLD || velocityY < -SWIPE_VELOCITY_THRESHOLD) &&
        Math.abs(translateX.value) < SWIPE_THRESHOLD
      ) {
        translateY.value = withTiming(-SCREEN_HEIGHT, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        cardScale.value = withTiming(0.8, { duration: 400 });
        runOnJS(triggerSwipe)('up');
        return;
      }

      // Swipe right for like (with velocity consideration)
      if (translateX.value > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD) {
        const exitX = SCREEN_WIDTH * 1.5;
        const exitRotation = ROTATION_ANGLE + 10;

        translateX.value = withTiming(exitX, {
          duration: 350,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(translateY.value + 50, { duration: 350 });
        rotation.value = withTiming(exitRotation, { duration: 350 });
        cardScale.value = withTiming(0.9, { duration: 350 });
        runOnJS(triggerSwipe)('right');
        return;
      }

      // Swipe left for pass (with velocity consideration)
      if (translateX.value < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY_THRESHOLD) {
        const exitX = -SCREEN_WIDTH * 1.5;
        const exitRotation = -ROTATION_ANGLE - 10;

        translateX.value = withTiming(exitX, {
          duration: 350,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(translateY.value + 50, { duration: 350 });
        rotation.value = withTiming(exitRotation, { duration: 350 });
        cardScale.value = withTiming(0.9, { duration: 350 });
        runOnJS(triggerSwipe)('left');
        return;
      }

      // Return to center with bouncy spring animation
      translateX.value = withSpring(0, RETURN_SPRING_CONFIG);
      translateY.value = withSpring(0, RETURN_SPRING_CONFIG);
      rotation.value = withSpring(0, RETURN_SPRING_CONFIG);
      cardScale.value = withSpring(1, RETURN_SPRING_CONFIG);
      overlayOpacity.value = withTiming(0, { duration: 200 });
    });

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    // Add subtle shadow scaling based on position
    const shadowScale = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH / 2],
      [1, 1.2],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + cardTranslateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: cardScale.value },
      ],
      zIndex: 100 - index,
      shadowOpacity: 0.3 * shadowScale,
    };
  });

  // Like overlay opacity with smooth interpolation
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
      [0, 0.3, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Nope overlay opacity
  const nopeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
      [1, 0.3, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Super like overlay opacity
  const superLikeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_UP_THRESHOLD, -SWIPE_UP_THRESHOLD * 0.5, 0],
      [1, 0.3, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      translateY.value,
      [-SWIPE_UP_THRESHOLD, 0],
      [1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Background card animation (cards behind the top card)
  const backgroundCardStyle = useAnimatedStyle(() => {
    if (index === 0) return {};

    // When top card moves, bring next card forward
    const progress = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: cardTranslateY.value - progress * 8 },
        { scale: cardScale.value + progress * 0.04 },
      ],
    };
  });

  if (index > 2) return null;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container,
          cardAnimatedStyle,
          index > 0 && backgroundCardStyle,
        ]}
      >
        <ProfileCard profile={profile} onPress={onPress} />

        {/* Like overlay with gradient effect */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <View style={styles.overlayIconContainer}>
              <Ionicons name="heart" size={56} color="#fff" />
            </View>
            <Text style={[styles.overlayText, styles.likeText]}>LIKE</Text>
          </View>
        </Animated.View>

        {/* Nope overlay */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <View style={[styles.overlayIconContainer, styles.nopeIconContainer]}>
              <Ionicons name="close" size={56} color="#fff" />
            </View>
            <Text style={[styles.overlayText, styles.nopeText]}>NOPE</Text>
          </View>
        </Animated.View>

        {/* Super like overlay */}
        <Animated.View style={[styles.overlay, styles.superLikeOverlay, superLikeOverlayStyle]}>
          <View style={styles.overlayContent}>
            <View style={[styles.overlayIconContainer, styles.superLikeIconContainer]}>
              <Ionicons name="star" size={56} color="#fff" />
            </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
    gap: spacing.md,
  },
  overlayIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  nopeIconContainer: {
    backgroundColor: '#666',
    shadowColor: '#666',
  },
  superLikeIconContainer: {
    backgroundColor: colors.superLike,
    shadowColor: colors.superLike,
  },
  likeOverlay: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  nopeOverlay: {
    backgroundColor: 'rgba(100, 100, 100, 0.15)',
    borderWidth: 3,
    borderColor: '#666',
  },
  superLikeOverlay: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 3,
    borderColor: colors.superLike,
  },
  overlayText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  likeText: {
    color: colors.primary,
  },
  nopeText: {
    color: '#888',
  },
  superLikeText: {
    color: colors.superLike,
  },
});
