import React, { useEffect, useCallback } from 'react';
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
  FadeInDown,
  FadeInUp,
  ZoomIn,
  ZoomInEasyDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { AnimatedButton, FloatingHearts } from '../../components';
import { Match } from '../../types';
import { useMatches, useUser } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  MatchScreen: { match: Match };
  ChatScreen: { matchId: string; profile: any };
  Discover: undefined;
};

type MatchScreenRouteProp = RouteProp<RootStackParamList, 'MatchScreen'>;

export const MatchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<MatchScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { dismissMatchNotification } = useMatches();
  const { user } = useUser();

  const { match } = route.params;

  // Animation values
  const heartScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const photoScale1 = useSharedValue(0);
  const photoScale2 = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Sequence animations
    heartScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    photoScale1.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
    photoScale2.value = withDelay(800, withSpring(1, { damping: 12, stiffness: 100 }));

    // Pulsing glow effect
    glowOpacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const photo1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale1.value }],
  }));

  const photo2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: photoScale2.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleSayHello = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dismissMatchNotification();
    navigation.replace('ChatScreen', {
      matchId: match.id,
      profile: match.profile,
    });
  }, [navigation, match, dismissMatchNotification]);

  const handleKeepSwiping = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismissMatchNotification();
    navigation.goBack();
  }, [navigation, dismissMatchNotification]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[colors.primaryDark, colors.background, colors.background]}
        style={styles.gradient}
      />

      {/* Floating Hearts */}
      <FloatingHearts count={20} />

      {/* Glow Effect */}
      <Animated.View style={[styles.glow, glowAnimatedStyle]} />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={handleKeepSwiping}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>

        {/* Match Animation */}
        <View style={styles.matchContainer}>
          {/* Photos with Heart */}
          <View style={styles.photosContainer}>
            <Animated.View style={[styles.photoWrapper, styles.photoLeft, photo1AnimatedStyle]}>
              <Image
                source={{ uri: user?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }}
                style={styles.photo}
              />
            </Animated.View>

            <Animated.View style={[styles.heartWrapper, heartAnimatedStyle]}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.heartGradient}
              >
                <Ionicons name="heart" size={32} color={colors.text} />
              </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.photoWrapper, styles.photoRight, photo2AnimatedStyle]}>
              <Image
                source={{ uri: match.profile.photos[0] }}
                style={styles.photo}
              />
            </Animated.View>
          </View>

          {/* Match Text */}
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {match.profile.name} liked each other
            </Text>

            {/* Match percentage */}
            {match.profile.matchPercentage && (
              <View style={styles.matchPercentContainer}>
                <Text style={styles.matchPercent}>{match.profile.matchPercentage}%</Text>
                <Text style={styles.matchPercentLabel}>Compatibility</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Buttons */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(500)}
          style={[styles.buttonsContainer, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <AnimatedButton
            title="Say Hello"
            onPress={handleSayHello}
            fullWidth
            size="large"
            icon={<Ionicons name="chatbubble" size={20} color={colors.text} />}
          />
          <AnimatedButton
            title="Keep Swiping"
            variant="secondary"
            onPress={handleKeepSwiping}
            fullWidth
            size="large"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glow: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  matchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  photoWrapper: {
    ...shadows.lg,
  },
  photoLeft: {
    transform: [{ rotate: '-10deg' }],
    zIndex: 1,
  },
  photoRight: {
    transform: [{ rotate: '10deg' }],
    zIndex: 1,
  },
  photo: {
    width: 140,
    height: 180,
    borderRadius: borderRadius.xl,
    borderWidth: 4,
    borderColor: colors.card,
  },
  heartWrapper: {
    position: 'absolute',
    zIndex: 2,
    ...shadows.glow,
  },
  heartGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.text,
  },
  textContainer: {
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 42,
    fontWeight: fontWeight.extrabold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  matchSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  matchPercentContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  matchPercent: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  matchPercentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});
