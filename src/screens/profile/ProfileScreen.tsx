import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useUser, useMatches } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = 140;

// Photo grid constants
const PHOTO_GRID_COLUMNS = 3;
const PHOTO_GAP = 4;
const PHOTO_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - PHOTO_GAP * (PHOTO_GRID_COLUMNS - 1)) / PHOTO_GRID_COLUMNS;

// Photo sheet constants
const COLLAPSED_HEIGHT = 55; // Small peek - handle + title visible at bottom
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.70; // 70% of screen when fully expanded

type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Subscription Plans Data
const SUBSCRIPTION_PLANS = {
  normal: {
    name: 'Basic',
    price: 0,
    period: 'Free',
    color: colors.textMuted,
    features: [
      { text: '10 likes per day', included: true },
      { text: 'See who liked you', included: false },
      { text: 'Unlimited rewinds', included: false },
      { text: 'Super Likes', included: false },
      { text: 'Boost profile', included: false },
      { text: 'Ad-free experience', included: false },
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    period: '/month',
    color: colors.primary,
    badge: 'POPULAR',
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'See who liked you', included: true },
      { text: '5 rewinds per day', included: true },
      { text: '3 Super Likes per day', included: true },
      { text: '1 Boost per month', included: true },
      { text: 'Ad-free experience', included: false },
    ],
  },
  premiumPlus: {
    name: 'Premium+',
    price: 199,
    period: '/month',
    color: '#FFD700',
    badge: 'BEST VALUE',
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'See who liked you', included: true },
      { text: 'Unlimited rewinds', included: true },
      { text: 'Unlimited Super Likes', included: true },
      { text: '5 Boosts per month', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Priority support', included: true },
      { text: 'Verified badge', included: true },
    ],
  },
};

// Plan Details Modal
const PlanDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  selectedPlan: string | null;
  onSelectPlan: (plan: string) => void;
}> = ({ visible, onClose, selectedPlan, onSelectPlan }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <Animated.View entering={ZoomIn.springify()} style={modalStyles.container}>
          <LinearGradient colors={['#1a1a1a', '#0d0d0d']} style={modalStyles.gradient}>
            <Pressable style={modalStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>

            <Text style={modalStyles.title}>Choose Your Plan</Text>
            <Text style={modalStyles.subtitle}>Unlock the full InBlood experience</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={modalStyles.plansScroll}>
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <Pressable
                  key={key}
                  style={[
                    modalStyles.planCard,
                    selectedPlan === key && modalStyles.planCardSelected,
                    { borderColor: plan.color },
                  ]}
                  onPress={() => onSelectPlan(key)}
                >
                  {plan.badge && (
                    <View style={[modalStyles.planBadge, { backgroundColor: plan.color }]}>
                      <Text style={modalStyles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}

                  <View style={modalStyles.planHeader}>
                    <Text style={[modalStyles.planName, { color: plan.color }]}>{plan.name}</Text>
                    <View style={modalStyles.priceRow}>
                      {plan.price > 0 && <Text style={modalStyles.currency}>₹</Text>}
                      <Text style={modalStyles.planPrice}>
                        {plan.price === 0 ? 'Free' : plan.price}
                      </Text>
                      {plan.price > 0 && <Text style={modalStyles.planPeriod}>{plan.period}</Text>}
                    </View>
                  </View>

                  <View style={modalStyles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={modalStyles.featureItem}>
                        <Ionicons
                          name={feature.included ? 'checkmark-circle' : 'close-circle'}
                          size={18}
                          color={feature.included ? '#4CAF50' : colors.textMuted}
                        />
                        <Text
                          style={[
                            modalStyles.featureText,
                            !feature.included && modalStyles.featureTextDisabled,
                          ]}
                        >
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {selectedPlan === key && (
                    <View style={modalStyles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={plan.color} />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={modalStyles.subscribeButton}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Subscribe',
                  `You selected ${SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS]?.name}. Redirecting to payment...`,
                  [{ text: 'OK', onPress: onClose }]
                );
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={modalStyles.subscribeGradient}
              >
                <Text style={modalStyles.subscribeText}>Subscribe Now</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Draggable Photo Sheet Component
const PhotoSheet: React.FC<{
  photos: string[];
  onPhotoPress: (index: number) => void;
}> = ({ photos, onPhotoPress }) => {
  const translateY = useSharedValue(0);
  const contextY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const scrollOffset = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Wrapper functions for runOnJS
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resetScroll = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      // If expanded and scrolled down, don't allow dragging down until scroll reaches top
      if (isExpanded.value && scrollOffset.value > 0 && event.translationY > 0) {
        return;
      }

      const newY = contextY.value + event.translationY;
      // Clamp between collapsed and expanded
      translateY.value = Math.max(
        -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT),
        Math.min(0, newY)
      );
    })
    .onEnd((event) => {
      // If expanded and scrolled down, don't collapse
      if (isExpanded.value && scrollOffset.value > 5) {
        return;
      }

      const velocity = event.velocityY;
      const currentY = translateY.value;
      const midPoint = -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) / 2;

      // Determine snap position based on velocity and position
      if (velocity < -500) {
        // Fast swipe up - expand
        runOnJS(triggerHaptic)();
        isExpanded.value = true;
        translateY.value = withTiming(-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT), {
          duration: 300,
        });
      } else if (velocity > 500) {
        // Fast swipe down - collapse
        runOnJS(triggerHaptic)();
        isExpanded.value = false;
        translateY.value = withTiming(0, {
          duration: 300,
        });
        runOnJS(resetScroll)();
      } else {
        // Slow drag - snap to nearest
        if (currentY < midPoint) {
          isExpanded.value = true;
          translateY.value = withTiming(-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT), {
            duration: 300,
          });
        } else {
          isExpanded.value = false;
          translateY.value = withTiming(0, {
            duration: 300,
          });
          runOnJS(resetScroll)();
        }
      }
    });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.value = event.nativeEvent.contentOffset.y;
  };

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleIndicatorStyle = useAnimatedStyle(() => ({
    width: interpolate(
      translateY.value,
      [-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT), 0],
      [60, 40],
      Extrapolation.CLAMP
    ),
  }));

  const overlayOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT), 0],
      [0.5, 0],
      Extrapolation.CLAMP
    ),
    pointerEvents: translateY.value < -50 ? 'auto' as const : 'none' as const,
  }));

  // Fade out hint when expanding, fade in grid
  const hintOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * 0.2, 0],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const gridOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * 0.3, -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * 0.6],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      {/* Overlay when expanded */}
      <Animated.View style={[sheetStyles.overlay, overlayOpacity]} />

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[sheetStyles.container, sheetAnimatedStyle]}>
          {/* Handle */}
          <View style={sheetStyles.handleContainer}>
            <Animated.View style={[sheetStyles.handle, handleIndicatorStyle]} />
          </View>

          {/* Header */}
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.title}>My Photos</Text>
            <Text style={sheetStyles.photoCount}>{photos.length} photos</Text>
          </View>

          {/* Collapsed hint - swipe up indicator */}
          <Animated.View style={[sheetStyles.collapsedHint, hintOpacity]}>
            <Ionicons name="chevron-up" size={16} color={colors.textMuted} />
            <Text style={sheetStyles.collapsedHintText}>Swipe up to view</Text>
          </Animated.View>

          {/* Photo Grid - Expanded */}
          <Animated.View style={[sheetStyles.expandedContainer, gridOpacity]}>
            <ScrollView
              ref={scrollViewRef}
              style={sheetStyles.scrollView}
              contentContainerStyle={sheetStyles.gridContainer}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
            >
              <View style={sheetStyles.grid}>
                {photos.map((photo, index) => (
                  <Pressable
                    key={index}
                    style={sheetStyles.gridPhoto}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onPhotoPress(index);
                    }}
                  >
                    <Image source={{ uri: photo }} style={sheetStyles.gridImage} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

// Full Screen Photo Viewer
const PhotoViewer: React.FC<{
  visible: boolean;
  photos: string[];
  initialIndex: number;
  onClose: () => void;
}> = ({ visible, photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={viewerStyles.container}>
        <Pressable style={viewerStyles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>

        <Image
          source={{ uri: photos[currentIndex] }}
          style={viewerStyles.image}
          resizeMode="contain"
        />

        {/* Photo indicators */}
        <View style={viewerStyles.indicators}>
          {photos.map((_, index) => (
            <Pressable
              key={index}
              style={[
                viewerStyles.indicator,
                index === currentIndex && viewerStyles.indicatorActive,
              ]}
              onPress={() => setCurrentIndex(index)}
            />
          ))}
        </View>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <Pressable
            style={[viewerStyles.navButton, viewerStyles.navLeft]}
            onPress={() => setCurrentIndex(currentIndex - 1)}
          >
            <Ionicons name="chevron-back" size={32} color={colors.text} />
          </Pressable>
        )}
        {currentIndex < photos.length - 1 && (
          <Pressable
            style={[viewerStyles.navButton, viewerStyles.navRight]}
            onPress={() => setCurrentIndex(currentIndex + 1)}
          >
            <Ionicons name="chevron-forward" size={32} color={colors.text} />
          </Pressable>
        )}

        <Text style={viewerStyles.counter}>
          {currentIndex + 1} / {photos.length}
        </Text>
      </View>
    </Modal>
  );
};

// Section Card Component
const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  delay?: number;
}> = ({ title, children, onEdit, delay = 0 }) => (
  <Animated.View entering={FadeInUp.delay(delay)} style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onEdit && (
        <Pressable onPress={onEdit} style={styles.editSectionButton}>
          <Ionicons name="pencil" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
    {children}
  </Animated.View>
);

// Prompt Card Component
const PromptCard: React.FC<{
  prompt: string;
  answer: string;
}> = ({ prompt, answer }) => (
  <View style={styles.promptCard}>
    <Text style={styles.promptQuestion}>{prompt}</Text>
    <Text style={styles.promptAnswer}>{answer}</Text>
  </View>
);

// Menu Item Component
const MenuItem: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconBgColor?: string;
  iconColor?: string;
}> = ({ icon, title, subtitle, onPress, iconBgColor = 'rgba(255,255,255,0.1)', iconColor = colors.text }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconBg, { backgroundColor: iconBgColor }]}>
      <Ionicons name={icon as any} size={22} color={iconColor} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
  </Pressable>
);

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUser();
  const { matches } = useMatches();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const handleEditProfile = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settings');
  }, [navigation]);

  const handlePhotoPress = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoViewer(true);
  }, []);

  // Default user data if user is not set
  const displayUser = user || {
    name: 'Rohan',
    age: 23,
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop',
    ],
    bio: 'Coffee enthusiast | Adventure seeker | Dog lover\n\nLooking for someone to explore new cafes and travel the world with. Let\'s create memories together!',
    interests: ['Travel', 'Photography', 'Music', 'Fitness', 'Coffee', 'Movies', 'Art', 'Food'],
    location: { city: 'Indore' },
    verified: true,
    pronouns: 'He/Him',
    orientation: 'Gay',
  };

  // Stats data
  const stats = {
    seductions: '2.4k',
    likes: matches.length || 33,
  };

  // Mock prompts data
  const prompts = [
    { prompt: 'A life goal of mine', answer: 'To visit every continent and capture moments through my lens' },
    { prompt: 'I\'m looking for', answer: 'Someone who laughs at my terrible jokes and enjoys spontaneous adventures' },
    { prompt: 'My simple pleasures', answer: 'Morning coffee, sunset walks, and deep conversations' },
  ];

  // Mock opening move
  const openingMove = 'Hey! I noticed you love travel too. What\'s the most unexpected place you\'ve ever visited?';

  // Languages
  const languages = ['Hindi', 'English', 'Marathi'];

  // Connected accounts
  const connectedAccounts = [
    { name: 'Spotify', connected: true, icon: 'musical-notes' },
    { name: 'Instagram', connected: false, icon: 'logo-instagram' },
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: COLLAPSED_HEIGHT + 120 }]}
          bounces={true}
        >
          {/* Header with Edit Button */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.headerLeft} />
            <Pressable style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil-outline" size={22} color={colors.primary} />
            </Pressable>
          </Animated.View>

          {/* Profile Section with Stats */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.profileSection}>
            {/* Left Stats */}
            <View style={styles.statContainer}>
              <Text style={styles.statValue}>{stats.seductions}</Text>
              <Text style={styles.statLabel}>SEDUCTIONS</Text>
            </View>

            {/* Center Profile Image */}
            <View style={styles.profileImageContainer}>
              {/* Gradient border wrapper - always red */}
              <LinearGradient
                colors={['#FF6B6B', '#E53935', '#C62828']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.profileImageInner}>
                  <Image
                    source={{ uri: displayUser.photos[0] }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
              </LinearGradient>
              {/* Verification Badge */}
              {displayUser.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={28} color="#1DA1F2" />
                </View>
              )}
            </View>

            {/* Right Stats */}
            <View style={styles.statContainer}>
              <Text style={styles.statValue}>{stats.likes}</Text>
              <Text style={styles.statLabel}>LIKES</Text>
            </View>
          </Animated.View>

          {/* Name and Basic Info */}
          <Animated.View entering={FadeInUp.delay(250)} style={styles.nameContainer}>
            <Text style={styles.userName}>{displayUser.name}, {displayUser.age}</Text>
            <Text style={styles.userLocation}>{displayUser.location.city}</Text>
          </Animated.View>

          {/* Verification Status */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.verificationCard}>
            <View style={styles.verificationContent}>
              <View style={[styles.verificationIcon, displayUser.verified ? styles.verifiedIcon : styles.unverifiedIcon]}>
                <Ionicons
                  name={displayUser.verified ? "shield-checkmark" : "shield-outline"}
                  size={24}
                  color={displayUser.verified ? "#4CAF50" : colors.textMuted}
                />
              </View>
              <View style={styles.verificationTextContainer}>
                <Text style={styles.verificationTitle}>
                  {displayUser.verified ? 'Verified Profile' : 'Not Verified'}
                </Text>
                <Text style={styles.verificationSubtitle}>
                  {displayUser.verified ? 'Your identity has been confirmed' : 'Verify to get more matches'}
                </Text>
              </View>
            </View>
            {!displayUser.verified && (
              <Pressable style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify Now</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* About Me / Bio */}
          <SectionCard title="About Me" onEdit={handleEditProfile} delay={350}>
            <Text style={styles.bioText}>{displayUser.bio}</Text>
          </SectionCard>

          {/* Pronouns */}
          <SectionCard title="Pronouns" onEdit={handleEditProfile} delay={400}>
            <View style={styles.pronounsContainer}>
              <View style={styles.pronounTag}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
                <Text style={styles.pronounText}>{displayUser.pronouns || 'Not specified'}</Text>
              </View>
            </View>
          </SectionCard>

          {/* Interests */}
          <SectionCard title="Interests" onEdit={handleEditProfile} delay={450}>
            <View style={styles.interestsContainer}>
              {displayUser.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* Prompts */}
          <SectionCard title="My Prompts" onEdit={handleEditProfile} delay={500}>
            {prompts.map((prompt, index) => (
              <PromptCard key={index} prompt={prompt.prompt} answer={prompt.answer} />
            ))}
          </SectionCard>

          {/* Opening Moves */}
          <SectionCard title="Opening Move" onEdit={handleEditProfile} delay={550}>
            <View style={styles.openingMoveCard}>
              <Ionicons name="flash" size={20} color="#FFD700" style={styles.openingMoveIcon} />
              <Text style={styles.openingMoveText}>{openingMove}</Text>
            </View>
          </SectionCard>

          {/* Languages */}
          <SectionCard title="Languages I Know" onEdit={handleEditProfile} delay={600}>
            <View style={styles.languagesContainer}>
              {languages.map((language, index) => (
                <View key={index} style={styles.languageTag}>
                  <Ionicons name="globe-outline" size={14} color={colors.primary} />
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* Connected Accounts */}
          <SectionCard title="Connected Accounts" onEdit={handleEditProfile} delay={650}>
            {connectedAccounts.map((account, index) => (
              <View key={index} style={styles.connectedAccountRow}>
                <View style={styles.connectedAccountLeft}>
                  <View style={[styles.accountIconBg, account.connected && styles.accountIconBgActive]}>
                    <Ionicons name={account.icon as any} size={20} color={account.connected ? colors.text : colors.textMuted} />
                  </View>
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <Pressable style={[styles.connectionButton, account.connected && styles.connectionButtonActive]}>
                  <Text style={[styles.connectionButtonText, account.connected && styles.connectionButtonTextActive]}>
                    {account.connected ? 'Connected' : 'Connect'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </SectionCard>

          {/* Premium Banner */}
          <Animated.View entering={FadeInUp.delay(700)} style={styles.premiumBannerContainer}>
            <Pressable
              style={styles.premiumBanner}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPlanModal(true);
              }}
            >
              <LinearGradient
                colors={['rgba(229, 57, 53, 0.2)', 'rgba(229, 57, 53, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumIconBg}>
                  <Ionicons name="diamond" size={20} color={colors.primary} />
                </View>
                <View style={styles.premiumTextContent}>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumSubtitle}>See who likes you & more</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* More Options */}
          <Animated.View entering={FadeInUp.delay(750)} style={styles.moreSection}>
            <Text style={styles.moreSectionTitle}>More</Text>

            <MenuItem
              icon="gift-outline"
              title="Invite Friends"
              subtitle="Get free premium days"
              iconBgColor="rgba(76, 175, 80, 0.15)"
              iconColor="#4CAF50"
              onPress={() => Alert.alert('Invite Friends', 'Share your referral link!')}
            />

            <MenuItem
              icon="shield-checkmark-outline"
              title="Safety Center"
              subtitle="Tips for safe dating"
              iconBgColor="rgba(255, 152, 0, 0.15)"
              iconColor="#FF9800"
              onPress={() => Alert.alert('Safety Tips', 'Always meet in public places.')}
            />

            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help from our team"
              iconBgColor="rgba(33, 150, 243, 0.15)"
              iconColor="#2196F3"
              onPress={() => Alert.alert('Help', 'Contact support@inblood.com')}
            />

            <MenuItem
              icon="settings-outline"
              title="Settings"
              subtitle="Account & preferences"
              iconBgColor="rgba(255,255,255,0.1)"
              iconColor={colors.text}
              onPress={handleSettings}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
            <Text style={styles.footerText}>InBlood v1.0.0</Text>
            <Text style={styles.footerSubtext}>Made with love in India</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Full Screen Photo Viewer */}
      <PhotoViewer
        visible={showPhotoViewer}
        photos={displayUser.photos}
        initialIndex={selectedPhotoIndex}
        onClose={() => setShowPhotoViewer(false)}
      />

      {/* Plan Details Modal */}
      <PlanDetailsModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
      />

      {/* Draggable Photo Sheet */}
      <PhotoSheet
        photos={displayUser.photos}
        onPhotoPress={handlePhotoPress}
      />
    </GestureHandlerRootView>
  );
};

const viewerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  indicators: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    backgroundColor: colors.text,
    width: 24,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLeft: {
    left: 16,
  },
  navRight: {
    right: 16,
  },
  counter: {
    position: 'absolute',
    bottom: 60,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

// Tab bar offset - position sheet just above tab bar (tab bar height 70 + bottom margin 24)
const TAB_BAR_OFFSET = 94;

const sheetStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  container: {
    position: 'absolute',
    bottom: TAB_BAR_OFFSET - EXPANDED_HEIGHT + COLLAPSED_HEIGHT,
    left: 0,
    right: 0,
    height: EXPANDED_HEIGHT,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  photoCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  collapsedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.md,
    paddingBottom: spacing.xs,
  },
  collapsedHintText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  expandedContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PHOTO_GAP,
  },
  gridPhoto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  plansScroll: {
    maxHeight: 400,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  planBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.background,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  currency: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  planPeriod: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  featureTextDisabled: {
    color: colors.textMuted,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  subscribeButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  subscribeText: {
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
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    width: 44,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
  },
  // Profile Section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  statContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    position: 'relative',
  },
  profileImageWrapper: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  gradientBorder: {
    width: PROFILE_IMAGE_SIZE + 6,
    height: PROFILE_IMAGE_SIZE + 6,
    borderRadius: (PROFILE_IMAGE_SIZE + 6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInner: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 2,
  },
  // Name Container
  nameContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  userLocation: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Verification Card
  verificationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  unverifiedIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  verificationTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  verificationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  verificationSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  verifyButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  // Section Card
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  editSectionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bio
  bioText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Pronouns
  pronounsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pronounTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  pronounText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Interests
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestTag: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  interestText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Prompts
  promptCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  promptQuestion: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  promptAnswer: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  // Opening Move
  openingMoveCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  openingMoveIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  openingMoveText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  // Languages
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  languageText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  // Connected Accounts
  connectedAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  connectedAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountIconBgActive: {
    backgroundColor: colors.primary,
  },
  accountName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  connectionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  connectionButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  connectionButtonText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  connectionButtonTextActive: {
    color: '#4CAF50',
  },
  // Premium Banner
  premiumBannerContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  premiumBanner: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
  },
  premiumIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTextContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  premiumTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  premiumSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // More Section
  moreSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  moreSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  footerSubtext: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
