import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
  size: number;
  duration: number;
  opacity: number;
}

interface FloatingHeartsProps {
  count?: number;
  active?: boolean;
}

const Heart: React.FC<{ heart: FloatingHeart; active: boolean }> = ({ heart, active }) => {
  const translateY = useSharedValue(SCREEN_HEIGHT + 50);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Start animation
      translateY.value = withDelay(
        heart.delay,
        withRepeat(
          withTiming(-100, {
            duration: heart.duration,
            easing: Easing.linear,
          }),
          -1,
          false
        )
      );

      translateX.value = withDelay(
        heart.delay,
        withRepeat(
          withSequence(
            withTiming(20, { duration: heart.duration / 4 }),
            withTiming(-20, { duration: heart.duration / 2 }),
            withTiming(0, { duration: heart.duration / 4 })
          ),
          -1,
          true
        )
      );

      scale.value = withDelay(
        heart.delay,
        withTiming(1, { duration: 500 })
      );

      opacity.value = withDelay(
        heart.delay,
        withSequence(
          withTiming(heart.opacity, { duration: 500 }),
          withDelay(heart.duration - 1500, withTiming(0, { duration: 1000 }))
        )
      );

      rotation.value = withDelay(
        heart.delay,
        withRepeat(
          withSequence(
            withTiming(15, { duration: heart.duration / 4 }),
            withTiming(-15, { duration: heart.duration / 2 }),
            withTiming(0, { duration: heart.duration / 4 })
          ),
          -1,
          true
        )
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.heart,
        { left: heart.x },
        animatedStyle,
      ]}
    >
      <Ionicons
        name="heart"
        size={heart.size}
        color={colors.primary}
      />
    </Animated.View>
  );
};

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  count = 15,
  active = true,
}) => {
  const hearts: FloatingHeart[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 3000,
      size: 16 + Math.random() * 24,
      duration: 4000 + Math.random() * 4000,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <>
      {hearts.map(heart => (
        <Heart key={heart.id} heart={heart} active={active} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  heart: {
    position: 'absolute',
    bottom: 0,
  },
});
