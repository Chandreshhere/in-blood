import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withRepeat,
  interpolate,
  Extrapolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { AnimatedButton, AnimatedInput } from '../../components';
import { useAuth } from '../../context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Couple images for the background slideshow
const COUPLE_IMAGES = [
  'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=1200&fit=crop',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=1200&fit=crop',
];

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerification: { phoneNumber: string };
  ProfileSetup: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Animated Background Component
const AnimatedBackground: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1.1);
  const [showFirst, setShowFirst] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (showFirst) {
        opacity1.value = withTiming(0, { duration: 1000 });
        opacity2.value = withTiming(1, { duration: 1000 });
        scale1.value = withTiming(1.1, { duration: 5000 });
        scale2.value = 1;
        scale2.value = withTiming(1.1, { duration: 5000 });
      } else {
        opacity1.value = withTiming(1, { duration: 1000 });
        opacity2.value = withTiming(0, { duration: 1000 });
        scale2.value = withTiming(1.1, { duration: 5000 });
        scale1.value = 1;
        scale1.value = withTiming(1.1, { duration: 5000 });
      }

      setShowFirst(!showFirst);
      setCurrentIndex((prev) => (prev + 1) % COUPLE_IMAGES.length);
    }, 4000);

    // Start initial zoom
    scale1.value = withTiming(1.1, { duration: 5000 });

    return () => clearInterval(interval);
  }, [showFirst]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ scale: scale1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [{ scale: scale2.value }],
  }));

  const nextIndex = (currentIndex + 1) % COUPLE_IMAGES.length;

  return (
    <View style={styles.backgroundContainer}>
      <Animated.Image
        source={{ uri: COUPLE_IMAGES[currentIndex] }}
        style={[styles.backgroundImage, animatedStyle1]}
        resizeMode="cover"
        blurRadius={0}
      />
      <Animated.Image
        source={{ uri: COUPLE_IMAGES[nextIndex] }}
        style={[styles.backgroundImage, animatedStyle2]}
        resizeMode="cover"
        blurRadius={0}
      />

      {/* Black & White + Vignette overlay */}
      <View style={styles.grayscaleOverlay} />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.vignetteOverlay}
      />

      {/* Radial vignette effect */}
      <View style={styles.radialVignette} />
    </View>
  );
};

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; email?: string; password?: string }>({});

  const passwordRef = useRef<TextInput>(null);
  const logoScale = useSharedValue(1);
  const logoRotate = useSharedValue(0);

  useEffect(() => {
    // Subtle logo pulse animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const validatePhone = useCallback(() => {
    if (phoneNumber.length < 10) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: undefined }));
    return true;
  }, [phoneNumber]);

  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined, password: undefined }));
    return true;
  }, [email, password]);

  const handlePhoneLogin = useCallback(async () => {
    if (!validatePhone()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await login('phone', phoneNumber);
    if (success) {
      navigation.navigate('OtpVerification', { phoneNumber });
    }
  }, [phoneNumber, login, navigation, validatePhone]);

  const handleEmailLogin = useCallback(async () => {
    if (!validateEmail()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await login('email', email, password);
    if (success) {
      navigation.navigate('ProfileSetup');
    }
  }, [email, password, login, navigation, validateEmail]);

  const handleLogin = useCallback(() => {
    if (loginMethod === 'phone') {
      handlePhoneLogin();
    } else {
      handleEmailLogin();
    }
  }, [loginMethod, handlePhoneLogin, handleEmailLogin]);

  const handleSocialLogin = useCallback((provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      `${provider} Sign In`,
      `${provider} authentication will be available soon!`,
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo & Brand Section */}
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.header}>
              <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <LinearGradient
                  colors={['rgba(229, 57, 53, 0.3)', 'rgba(229, 57, 53, 0.1)']}
                  style={styles.logoGlow}
                >
                  <View style={styles.logoInner}>
                    <Image
                      source={require('../../assets/images/logo.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                </LinearGradient>
              </Animated.View>

              <Text style={styles.brandName}>InBlood</Text>
              <Text style={styles.tagline}>Where Hearts Connect</Text>
              <Text style={styles.subTagline}>Find love that runs deep</Text>
            </Animated.View>

            {/* Glass Card for Login Form */}
            <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.glassCard}>
              {/* Login Method Toggle */}
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[
                    styles.toggleButton,
                    loginMethod === 'phone' && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLoginMethod('phone');
                  }}
                >
                  <Ionicons
                    name="call"
                    size={18}
                    color={loginMethod === 'phone' ? colors.text : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      loginMethod === 'phone' && styles.toggleTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleButton,
                    loginMethod === 'email' && styles.toggleButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLoginMethod('email');
                  }}
                >
                  <Ionicons
                    name="mail"
                    size={18}
                    color={loginMethod === 'email' ? colors.text : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      loginMethod === 'email' && styles.toggleTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {loginMethod === 'phone' ? (
                  <AnimatedInput
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    error={errors.phone}
                    icon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />}
                  />
                ) : (
                  <>
                    <AnimatedInput
                      label="Email Address"
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      error={errors.email}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
                    />
                    <AnimatedInput
                      ref={passwordRef}
                      label="Password"
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      error={errors.password}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
                      rightIcon={
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.textMuted}
                          />
                        </Pressable>
                      }
                    />
                    <Pressable style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                  </>
                )}
              </View>

              {/* CTA Button */}
              <AnimatedButton
                title={loginMethod === 'phone' ? 'Continue' : 'Sign In'}
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="large"
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtons}>
                <Pressable
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Google')}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.socialButtonGradient}
                  >
                    <Ionicons name="logo-google" size={22} color={colors.text} />
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Apple')}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.socialButtonGradient}
                  >
                    <Ionicons name="logo-apple" size={24} color={colors.text} />
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin('Facebook')}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.socialButtonGradient}
                  >
                    <Ionicons name="logo-facebook" size={22} color={colors.text} />
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View entering={FadeIn.delay(700)} style={styles.signupContainer}>
              <Text style={styles.signupText}>New to InBlood? </Text>
              <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </Pressable>
            </Animated.View>

            {/* Terms */}
            <Animated.View entering={FadeIn.delay(800)} style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </ScrollView>
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
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  grayscaleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    // Note: True grayscale would need a custom filter, this is a dark overlay approximation
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  radialVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 100,
    borderColor: 'rgba(0,0,0,0.3)',
    borderRadius: SCREEN_WIDTH,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(229, 57, 53, 0.5)',
  },
  logo: {
    width: 70,
    height: 70,
  },
  brandName: {
    fontSize: 42,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -1,
    textShadowColor: 'rgba(229, 57, 53, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  subTagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  glassCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.text,
  },
  form: {
    marginBottom: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  socialButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  termsContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  termsText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
