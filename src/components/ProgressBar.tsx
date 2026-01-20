import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
  height?: number;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  style,
  height = 4,
  animated = true,
}) => {
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressAnim.value = withSpring(progress, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      progressAnim.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <View style={[styles.container, { height }, style]}>
      <Animated.View style={[styles.progress, { height }, animatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});
