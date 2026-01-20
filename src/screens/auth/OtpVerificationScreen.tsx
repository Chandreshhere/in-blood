import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnimatedButton } from '../../components';
import { useAuth } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
  ProfileSetup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;
type OtpRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;

export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OtpRouteProp>();
  const { verifyOtp, isLoading } = useAuth();

  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const shakeAnim = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, []);

  const handleOtpChange = useCallback((value: string, index: number) => {
    setError('');
    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, OTP_LENGTH).split('');
      pastedCode.forEach((digit, i) => {
        if (i < OTP_LENGTH) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedCode.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleVerify = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter the complete verification code');
      triggerShake();
      return;
    }

    const success = await verifyOtp(otpString);
    if (success) {
      navigation.navigate('ProfileSetup');
    } else {
      setError('Invalid verification code. Please try again.');
      triggerShake();
    }
  }, [otp, verifyOtp, navigation, triggerShake]);

  const handleResend = useCallback(() => {
    if (resendTimer > 0) return;
    // Mock resend OTP
    setResendTimer(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }, [resendTimer]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Back Button */}
          <Animated.View entering={FadeIn} style={styles.backButton}>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-open" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{'\n'}
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </Text>
          </Animated.View>

          {/* OTP Inputs */}
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={[styles.otpContainer, shakeStyle]}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : undefined,
                  error ? styles.otpInputError : undefined,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          {error ? (
            <Animated.Text entering={FadeIn} style={styles.errorText}>
              {error}
            </Animated.Text>
          ) : null}

          {/* Resend */}
          <Animated.View entering={FadeIn.delay(300)} style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <Pressable onPress={handleResend} disabled={resendTimer > 0}>
              <Text
                style={[
                  styles.resendLink,
                  resendTimer > 0 && styles.resendLinkDisabled,
                ]}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.buttonContainer}>
            <AnimatedButton
              title="Verify"
              onPress={handleVerify}
              loading={isLoading}
              fullWidth
              size="large"
            />
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneNumber: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: colors.primary,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  resendLinkDisabled: {
    color: colors.textMuted,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
