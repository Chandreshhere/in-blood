import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  FadeIn,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnimatedButton, FloatingHearts } from '../../components';
import { useAuth } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: "It's easy to find a\nsoulmate nearby",
    description: 'Discover people around you and find meaningful connections based on your interests and preferences.',
    icon: 'location',
  },
  {
    id: '2',
    title: 'Chat with your match\n& set up dates',
    description: 'Once you match, start a conversation and plan your perfect first date together.',
    icon: 'chatbubbles',
  },
  {
    id: '3',
    title: "Don't wait anymore\nfind love now",
    description: 'Your perfect match is just a swipe away. Start your journey to find true love today.',
    icon: 'heart',
  },
];

type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OnboardingSlideItem: React.FC<{
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
}> = ({ item, index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.iconGradient}
        >
          <Ionicons name={item.icon} size={80} color={colors.text} />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textContainer, animatedStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const Pagination: React.FC<{
  scrollX: SharedValue<number>;
  data: OnboardingSlide[];
}> = ({ scrollX, data }) => {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        const dotStyle = useAnimatedStyle(() => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const width = interpolate(
            scrollX.value,
            inputRange,
            [8, 24, 8],
            Extrapolate.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolate.CLAMP
          );

          return {
            width,
            opacity,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, dotStyle]}
          />
        );
      })}
    </View>
  );
};

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { completeOnboarding } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
      navigation.navigate('Auth');
    }
  }, [currentIndex, navigation, completeOnboarding]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    navigation.navigate('Auth');
  }, [navigation, completeOnboarding]);

  return (
    <View style={styles.container}>
      <FloatingHearts count={12} />

      <SafeAreaView style={styles.safeArea}>
        {/* Skip button */}
        <Animated.View entering={FadeIn.delay(500)} style={styles.skipContainer}>
          <AnimatedButton
            title="Skip"
            variant="ghost"
            size="small"
            onPress={handleSkip}
          />
        </Animated.View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <OnboardingSlideItem item={item} index={index} scrollX={scrollX} />
          )}
        />

        {/* Pagination */}
        <Pagination scrollX={scrollX} data={slides} />

        {/* CTA Button */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.buttonContainer}>
          <AnimatedButton
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            fullWidth
            size="large"
          />
        </Animated.View>
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
  skipContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 44,
  },
  description: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
