import React, { useState, useCallback, forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme';

interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const AnimatedInput = forwardRef<TextInput, AnimatedInputProps>(
  ({ label, error, containerStyle, icon, rightIcon, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useSharedValue(0);
    const shakeAnim = useSharedValue(0);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        [colors.border, colors.primary]
      ),
      transform: [
        {
          translateX: shakeAnim.value,
        },
      ],
    }));

    const labelAnimatedStyle = useAnimatedStyle(() => ({
      color: interpolateColor(
        focusAnim.value,
        [0, 1],
        [colors.textSecondary, colors.primary]
      ),
    }));

    const handleFocus = useCallback((e: any) => {
      setIsFocused(true);
      focusAnim.value = withSpring(1, { damping: 15 });
      props.onFocus?.(e);
    }, [props.onFocus]);

    const handleBlur = useCallback((e: any) => {
      setIsFocused(false);
      focusAnim.value = withSpring(0, { damping: 15 });
      props.onBlur?.(e);
    }, [props.onBlur]);

    // Shake animation for errors
    React.useEffect(() => {
      if (error) {
        shakeAnim.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }, [error]);

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <Animated.Text style={[styles.label, labelAnimatedStyle]}>
            {label}
          </Animated.Text>
        )}
        <AnimatedView style={[styles.container, containerAnimatedStyle, error && styles.errorContainer]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <TextInput
            ref={ref}
            style={[styles.input, icon ? styles.inputWithIcon : undefined, style]}
            placeholderTextColor={colors.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </AnimatedView>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  errorContainer: {
    borderColor: colors.error,
  },
  iconContainer: {
    paddingLeft: spacing.md,
  },
  rightIconContainer: {
    paddingRight: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
