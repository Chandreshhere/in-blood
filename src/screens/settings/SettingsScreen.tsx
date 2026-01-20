import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useAuth, useUser } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

type RootStackParamList = {
  Settings: undefined;
  Onboarding: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  danger,
}) => (
  <Pressable style={styles.settingItem} onPress={onPress}>
    <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
      <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary} />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    )}
  </Pressable>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const { clearUser } = useUser();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showAge, setShowAge] = useState(true);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            clearUser();
            logout();
          },
        },
      ]
    );
  }, [logout, clearUser]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearUser();
            logout();
          },
        },
      ]
    );
  }, [logout, clearUser]);

  const handleToggle = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(prev => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.backButton} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Account Section */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="person-outline"
                title="Edit Profile"
                subtitle="Update your photos and info"
                onPress={() => navigation.goBack()}
              />
              <SettingItem
                icon="mail-outline"
                title="Email"
                subtitle="user@example.com"
                onPress={() => Alert.alert('Change Email', 'Email change feature coming soon!')}
              />
              <SettingItem
                icon="call-outline"
                title="Phone Number"
                subtitle="+91 98765 43210"
                onPress={() => Alert.alert('Change Phone', 'Phone number change feature coming soon!')}
              />
              <SettingItem
                icon="lock-closed-outline"
                title="Change Password"
                onPress={() => Alert.alert('Change Password', 'Password change feature coming soon!')}
              />
            </View>
          </Animated.View>

          {/* Notifications Section */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="notifications-outline"
                title="Push Notifications"
                subtitle="Get notified about new matches"
                rightElement={
                  <Switch
                    value={notifications}
                    onValueChange={() => handleToggle(setNotifications)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                }
              />
              <SettingItem
                icon="mail-outline"
                title="Email Notifications"
                subtitle="Receive updates via email"
                rightElement={
                  <Switch
                    value={emailNotifications}
                    onValueChange={() => handleToggle(setEmailNotifications)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                }
              />
            </View>
          </Animated.View>

          {/* Privacy Section */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="location-outline"
                title="Show Distance"
                subtitle="Let others see how far you are"
                rightElement={
                  <Switch
                    value={showDistance}
                    onValueChange={() => handleToggle(setShowDistance)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                }
              />
              <SettingItem
                icon="calendar-outline"
                title="Show Age"
                subtitle="Display your age on profile"
                rightElement={
                  <Switch
                    value={showAge}
                    onValueChange={() => handleToggle(setShowAge)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                }
              />
              <SettingItem
                icon="eye-off-outline"
                title="Incognito Mode"
                subtitle="Browse without being seen"
                onPress={() => Alert.alert('Incognito Mode', 'Go invisible and browse profiles without being seen. Premium feature coming soon!')}
              />
              <SettingItem
                icon="ban-outline"
                title="Blocked Users"
                subtitle="Manage blocked accounts"
                onPress={() => Alert.alert('Blocked Users', 'No blocked users yet.')}
              />
            </View>
          </Animated.View>

          {/* Help Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="help-circle-outline"
                title="Help Center"
                onPress={() => Alert.alert('Help Center', 'Need help? Contact us at support@inblood.com')}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                title="Safety Tips"
                onPress={() => Alert.alert('Safety Tips', '1. Never share personal info\n2. Meet in public places\n3. Tell a friend about your date\n4. Trust your instincts')}
              />
              <SettingItem
                icon="document-text-outline"
                title="Terms of Service"
                onPress={() => Alert.alert('Terms of Service', 'By using InBlood, you agree to our terms and conditions.')}
              />
              <SettingItem
                icon="shield-outline"
                title="Privacy Policy"
                onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us. We never share your data with third parties.')}
              />
            </View>
          </Animated.View>

          {/* App Info Section */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="information-circle-outline"
                title="App Version"
                subtitle="1.0.0"
              />
              <SettingItem
                icon="star-outline"
                title="Rate Us"
                subtitle="Love InBlood? Leave a review!"
                onPress={() => Alert.alert('Rate Us', 'Thank you for your support! Rating feature coming soon.')}
              />
              <SettingItem
                icon="share-social-outline"
                title="Share InBlood"
                subtitle="Invite friends to join"
                onPress={() => Alert.alert('Share InBlood', 'Share link: https://inblood.app/invite')}
              />
            </View>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeIn.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Account Actions</Text>
            <View style={styles.sectionContent}>
              <SettingItem
                icon="log-out-outline"
                title="Logout"
                onPress={handleLogout}
                danger
              />
              <SettingItem
                icon="trash-outline"
                title="Delete Account"
                subtitle="Permanently delete your account"
                onPress={handleDeleteAccount}
                danger
              />
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(700)} style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️ by InBlood Team</Text>
          </Animated.View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingIconDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  settingTitleDanger: {
    color: colors.error,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
