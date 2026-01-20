import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChatBubble, TypingIndicator } from '../../components';
import { useChat, useUser } from '../../context';
import { Message, Profile } from '../../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

type RootStackParamList = {
  ChatScreen: { matchId: string; profile: Profile };
  ProfileDetail: { profile: Profile };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ChatScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { initializeChat, sendMessage, getMessages, typingUsers } = useChat();
  const { user } = useUser();

  const { matchId, profile } = route.params;
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const messages = getMessages(matchId);
  const isTyping = typingUsers.has(matchId);

  useEffect(() => {
    // Initialize chat with mock messages if it doesn't exist
    initializeChat(matchId, user?.id || 'current-user', profile.id);
  }, [matchId, user?.id, profile.id, initializeChat]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!messageText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(matchId, {
      senderId: user?.id || 'current-user',
      text: messageText.trim(),
      type: 'text',
    });
    setMessageText('');
  }, [messageText, matchId, sendMessage, user?.id]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('ProfileDetail', { profile });
  }, [navigation, profile]);

  const handleVideoCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Video Call',
      `Start a video call with ${profile.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Alert.alert('Calling...', `Connecting video call with ${profile.name}...`)
        },
      ]
    );
  }, [profile.name]);

  const handleVoiceCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Voice Call',
      `Start a voice call with ${profile.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Alert.alert('Calling...', `Connecting voice call with ${profile.name}...`)
        },
      ]
    );
  }, [profile.name]);

  const handleAttachment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Add Attachment',
      'Choose what to send',
      [
        { text: 'Photo', onPress: () => Alert.alert('Photo', 'Opening camera roll...') },
        { text: 'GIF', onPress: () => Alert.alert('GIF', 'Opening GIF picker...') },
        { text: 'Location', onPress: () => Alert.alert('Location', 'Sharing location...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  const handleEmoji = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Add a random emoji to the message
    const emojis = ['😊', '❤️', '😂', '🥰', '😍', '🔥', '✨', '💕', '😘', '🙈'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessageText(prev => prev + randomEmoji);
  }, []);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === (user?.id || 'current-user');
    const showTimestamp = index === 0 ||
      messages[index - 1]?.senderId !== item.senderId ||
      (item.timestamp.getTime() - messages[index - 1]?.timestamp.getTime()) > 300000; // 5 minutes

    return (
      <ChatBubble
        message={item}
        isOwn={isOwn}
        showTimestamp={showTimestamp}
      />
    );
  }, [user?.id, messages]);

  const renderListFooter = useCallback(() => {
    if (!isTyping) return null;
    return <TypingIndicator name={profile.name} />;
  }, [isTyping, profile.name]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>

        <Pressable style={styles.profileInfo} onPress={handleProfilePress}>
          <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileStatus}>Online</Text>
          </View>
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleVideoCall}>
            <Ionicons name="videocam" size={24} color={colors.text} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={handleVoiceCall}>
            <Ionicons name="call" size={22} color={colors.text} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={
            <Animated.View entering={FadeIn} style={styles.emptyChat}>
              <View style={styles.emptyChatBubble}>
                <Ionicons name="chatbubbles" size={40} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyChatText}>
                Say hello to {profile.name}!{'\n'}
                Start a conversation and get to know each other.
              </Text>
            </Animated.View>
          }
        />

        {/* Input */}
        <Animated.View
          entering={SlideInUp.delay(300)}
          style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}
        >
          <Pressable style={styles.attachButton} onPress={handleAttachment}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </Pressable>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <Pressable style={styles.emojiButton} onPress={handleEmoji}>
              <Ionicons name="happy-outline" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.sendButton,
              messageText.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={messageText.trim() ? colors.text : colors.textMuted}
            />
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.sm,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  profileStatus: {
    fontSize: fontSize.sm,
    color: colors.success,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyChatBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyChatText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  emojiButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
