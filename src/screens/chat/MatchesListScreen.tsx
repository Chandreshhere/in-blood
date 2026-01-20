import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useMatches, useChat } from '../../context';
import { Match } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RootStackParamList = {
  MatchesList: undefined;
  ChatScreen: { matchId: string; profile: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pinned card component (first card with heart/likes)
const LikesCard: React.FC<{ likesCount: number; onPress: () => void }> = ({
  likesCount,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  }, []);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.pinnedCard, styles.likesCard, animatedStyle]}
    >
      <LinearGradient
        colors={['#FF6B6B', '#E53935']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.likesGradient}
      >
        <View style={styles.likesIconContainer}>
          <Ionicons name="heart" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.likesCount}>{likesCount}</Text>
        <Text style={styles.likesLabel}>Likes</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};

// Pinned profile card component
const PinnedProfileCard: React.FC<{
  match: Match;
  onPress: () => void;
  index: number;
}> = ({ match, onPress, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  }, []);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.pinnedCard, animatedStyle]}
    >
      <Image
        source={{ uri: match.profile.photos[0] }}
        style={styles.pinnedImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.pinnedGradient}
      >
        <Text style={styles.pinnedName} numberOfLines={1}>
          {match.profile.name}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
};

// Chat item component
const ChatItem: React.FC<{
  match: Match;
  onPress: () => void;
  index: number;
}> = ({ match, onPress, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Now';
  };

  const hasUnread = match.unreadCount > 0;

  return (
    <AnimatedPressable
      entering={FadeInRight.delay(index * 50).duration(300)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.chatItem, animatedStyle]}
    >
      <Image
        source={{ uri: match.profile.photos[0] }}
        style={styles.chatAvatar}
      />

      <View style={styles.chatContent}>
        <Text style={[styles.chatName, hasUnread && styles.chatNameUnread]} numberOfLines={1}>
          {match.profile.name}
        </Text>
        <Text style={[styles.chatMessage, hasUnread && styles.chatMessageUnread]} numberOfLines={1}>
          {match.lastMessage?.text || 'Say hello! 👋'}
        </Text>
      </View>

      <View style={styles.chatMeta}>
        {match.lastMessage && (
          <Text style={styles.chatTime}>
            {formatTime(match.lastMessage.timestamp)}
          </Text>
        )}
        {hasUnread && <View style={styles.unreadDot} />}
      </View>
    </AnimatedPressable>
  );
};

export const MatchesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { matches } = useMatches();
  const { chats } = useChat();

  // Separate new matches (no messages) from active chats
  const { newMatches, activeChats, likesCount } = useMemo(() => {
    const newM: Match[] = [];
    const active: Match[] = [];

    matches.forEach(match => {
      const chat = chats.get(match.id);
      if (chat && chat.messages.length > 0) {
        active.push({
          ...match,
          lastMessage: chat.messages[chat.messages.length - 1],
        });
      } else {
        newM.push(match);
      }
    });

    // Sort active chats by last message time
    active.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp?.getTime() || 0;
      const timeB = b.lastMessage?.timestamp?.getTime() || 0;
      return timeB - timeA;
    });

    return { newMatches: newM, activeChats: active, likesCount: 32 }; // Mock likes count
  }, [matches, chats]);

  const handleMatchPress = useCallback((match: Match) => {
    navigation.navigate('ChatScreen', {
      matchId: match.id,
      profile: match.profile,
    });
  }, [navigation]);

  const handleLikesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to likes screen or show premium modal
  }, []);

  const allChats = useMemo(() => {
    return [...newMatches, ...activeChats];
  }, [newMatches, activeChats]);

  return (
    <View style={styles.container}>
      {/* Red Header Section */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          {/* Header Title */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <Pressable style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.headerRight} />
          </Animated.View>

          {/* Pinned Messages Section */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.pinnedSection}>
            <Text style={styles.pinnedTitle}>Pinned Messages</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pinnedContainer}
            >
              {/* Likes Card */}
              <LikesCard likesCount={likesCount} onPress={handleLikesPress} />

              {/* Pinned Profile Cards */}
              {newMatches.slice(0, 5).map((match, index) => (
                <PinnedProfileCard
                  key={match.id}
                  match={match}
                  index={index}
                  onPress={() => handleMatchPress(match)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* Dark Chat List Section (Bottom Sheet Style) */}
      <View style={styles.chatListContainer}>
        {/* Handle Indicator */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {allChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View entering={FadeIn} style={styles.emptyContent}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubbles" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                When you match with someone,{'\n'}start a conversation here!
              </Text>
            </Animated.View>
          </View>
        ) : (
          <ScrollView
            style={styles.chatScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatScrollContent}
          >
            {allChats.map((match, index) => (
              <ChatItem
                key={match.id}
                match={match}
                index={index}
                onPress={() => handleMatchPress(match)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerGradient: {
    paddingBottom: spacing.lg,
  },
  headerSafeArea: {
    // flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  pinnedSection: {
    paddingTop: spacing.sm,
  },
  pinnedTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  pinnedContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  pinnedCard: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  likesCard: {
    backgroundColor: 'transparent',
  },
  likesGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  likesIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  likesCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  likesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pinnedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pinnedGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pinnedName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chatListContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: spacing.sm,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  chatScrollView: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  chatNameUnread: {
    fontWeight: '700',
  },
  chatMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  chatMessageUnread: {
    color: colors.text,
    fontWeight: '500',
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chatTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
