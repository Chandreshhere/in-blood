import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import { AnimatedButton, AnimatedInput, InterestChip } from '../../components';
import { useUser } from '../../context';
import { allInterests } from '../../data/interests';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Profile prompts data
const PROFILE_PROMPTS = [
  { id: 'perfect_date', title: 'My perfect first date...', category: 'more_about_you' },
  { id: 'never_shut_up', title: "I'll never shut up about...", category: 'more_about_you' },
  { id: 'love_language', title: 'My love language is...', category: 'more_about_you' },
  { id: 'deal_breaker', title: 'My biggest deal breaker...', category: 'more_about_you' },
  { id: 'weekend_vibes', title: 'My weekend vibe is...', category: 'more_about_you' },
  { id: 'guilty_pleasure', title: 'My guilty pleasure is...', category: 'more_about_you' },
  { id: 'green_flag', title: 'A green flag I look for...', category: 'more_about_you' },
  { id: 'hottest_take', title: 'My hottest take...', category: 'more_about_you' },
  { id: 'young_mischievous', title: 'How young and mischievous are you?', category: 'more_about_you' },
  { id: 'secret_fantasy', title: 'My secret fantasy is...', category: 'more_about_you' },
  { id: 'turn_ons', title: 'What really turns me on...', category: 'more_about_you' },
  { id: 'wild_side', title: 'My wild side comes out when...', category: 'more_about_you' },
  { id: 'bedroom_vibe', title: 'In the bedroom, I am...', category: 'more_about_you' },
  { id: 'naughty_confession', title: 'A naughty confession...', category: 'more_about_you' },
  { id: 'seduction_style', title: 'My seduction style is...', category: 'more_about_you' },
  { id: 'kinkiest_thing', title: 'The kinkiest thing about me...', category: 'more_about_you' },
];

const OPENING_MOVES = [
  { id: 'open_1', title: "If we matched, I'd want to know...", category: 'opening_moves' },
  { id: 'open_2', title: 'Best way to start a convo with me...', category: 'opening_moves' },
  { id: 'open_3', title: "Let's debate: ...", category: 'opening_moves' },
  { id: 'open_4', title: 'Ask me about...', category: 'opening_moves' },
  { id: 'open_5', title: 'Two truths and a lie:', category: 'opening_moves' },
];

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese',
  'Korean', 'Portuguese', 'Italian', 'Arabic', 'Russian', 'Tamil', 'Telugu',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Kannada', 'Malayalam',
];

const SEXUAL_ORIENTATIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual',
  'Asexual', 'Demisexual', 'Queer', 'Questioning',
  'Omnisexual', 'Polysexual', 'Homoflexible', 'Heteroflexible',
  'Androsexual', 'Gynesexual', 'Skoliosexual', 'Sapiosexual',
  'Aromantic', 'Graysexual', 'Fluid',
];

const FETISH_TAGS = [
  { id: 'dom', label: 'Dom', category: 'power' },
  { id: 'sub', label: 'Sub', category: 'power' },
  { id: 'switch', label: 'Switch', category: 'power' },
  { id: 'bdsm', label: 'BDSM', category: 'kink' },
  { id: 'kinky', label: 'Kinky', category: 'kink' },
  { id: 'rope_play', label: 'Rope Play', category: 'kink' },
  { id: 'shibari', label: 'Shibari', category: 'kink' },
  { id: 'leather', label: 'Leather', category: 'kink' },
  { id: 'latex', label: 'Latex', category: 'kink' },
  { id: 'pup_play', label: 'Pup Play', category: 'roleplay' },
  { id: 'pet_play', label: 'Pet Play', category: 'roleplay' },
  { id: 'daddy', label: 'Daddy', category: 'roleplay' },
  { id: 'mommy', label: 'Mommy', category: 'roleplay' },
  { id: 'master', label: 'Master', category: 'power' },
  { id: 'slave', label: 'Slave', category: 'power' },
  { id: 'cuckold', label: 'Cuckold', category: 'group' },
  { id: 'hotwife', label: 'Hotwife', category: 'group' },
  { id: 'group_play', label: 'Group Play', category: 'group' },
  { id: 'threesome', label: 'Threesome', category: 'group' },
  { id: 'orgy', label: 'Orgy', category: 'group' },
  { id: 'swinger', label: 'Swinger', category: 'group' },
  { id: 'voyeur', label: 'Voyeur', category: 'exhibitionism' },
  { id: 'exhibitionist', label: 'Exhibitionist', category: 'exhibitionism' },
  { id: 'public_play', label: 'Public Play', category: 'exhibitionism' },
  { id: 'sadist', label: 'Sadist', category: 'intensity' },
  { id: 'masochist', label: 'Masochist', category: 'intensity' },
  { id: 'primal', label: 'Primal', category: 'intensity' },
  { id: 'degradation', label: 'Degradation', category: 'intensity' },
  { id: 'praise', label: 'Praise Kink', category: 'intensity' },
  { id: 'edging', label: 'Edging', category: 'sensual' },
  { id: 'tantric', label: 'Tantric', category: 'sensual' },
  { id: 'sensory', label: 'Sensory Play', category: 'sensual' },
  { id: 'wax_play', label: 'Wax Play', category: 'sensual' },
  { id: 'impact_play', label: 'Impact Play', category: 'intensity' },
  { id: 'spanking', label: 'Spanking', category: 'intensity' },
  { id: 'age_play', label: 'Age Play', category: 'roleplay' },
  { id: 'breeding', label: 'Breeding', category: 'kink' },
  { id: 'feet', label: 'Feet', category: 'kink' },
  { id: 'lingerie', label: 'Lingerie', category: 'aesthetic' },
  { id: 'crossdressing', label: 'Crossdressing', category: 'aesthetic' },
];

const CONNECTED_APPS = [
  { id: 'spotify', name: 'Spotify', icon: 'musical-notes', color: '#1DB954', connected: false },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E4405F', connected: false },
];

interface PromptAnswer {
  promptId: string;
  promptTitle: string;
  answer: string;
}

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useUser();

  // Form state initialized with user data
  const [photos, setPhotos] = useState<string[]>(
    user?.photos || ['https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=600&fit=crop']
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [ageRange, setAgeRange] = useState(user?.preferences?.ageRange || { min: 21, max: 35 });
  const [maxDistance, setMaxDistance] = useState(user?.preferences?.maxDistance || 25);
  const [showInterests, setShowInterests] = useState(false);
  const [saving, setSaving] = useState(false);

  // New states for prompts and connected accounts
  const [promptAnswers, setPromptAnswers] = useState<PromptAnswer[]>([]);
  const [openingMoves, setOpeningMoves] = useState<PromptAnswer[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [connectedApps, setConnectedApps] = useState(CONNECTED_APPS);

  // Modal states
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showOpeningMoveModal, setShowOpeningMoveModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<typeof PROFILE_PROMPTS[0] | null>(null);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>(user?.orientation || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Calculate profile strength
  const profileStrength = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    // Photos (max 30 points - 5 per photo)
    score += Math.min(photos.length * 5, 30);

    // Bio (max 15 points)
    if (bio.length > 0) score += 5;
    if (bio.length > 50) score += 5;
    if (bio.length > 100) score += 5;

    // Interests (max 15 points - 1.5 per interest)
    score += Math.min(interests.length * 1.5, 15);

    // Profile prompts (max 15 points - 5 per prompt)
    score += Math.min(promptAnswers.length * 5, 15);

    // Opening moves (max 10 points - 5 per move)
    score += Math.min(openingMoves.length * 5, 10);

    // Languages (max 5 points)
    if (selectedLanguages.length > 0) score += 2.5;
    if (selectedLanguages.length > 1) score += 2.5;

    // Connected accounts (max 10 points - 5 per account)
    score += connectedApps.filter(app => app.connected).length * 5;

    return Math.min(Math.round(score), maxScore);
  }, [photos, bio, interests, promptAnswers, openingMoves, selectedLanguages, connectedApps]);

  const getStrengthColor = (score: number) => {
    if (score < 30) return '#E53935';
    if (score < 60) return '#FFB300';
    if (score < 80) return '#43A047';
    return '#1E88E5';
  };

  const getStrengthLabel = (score: number) => {
    if (score < 30) return 'Needs Work';
    if (score < 60) return 'Getting There';
    if (score < 80) return 'Looking Good';
    return 'All Star';
  };

  const handlePickImage = useCallback(async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      allowsMultipleSelection: false,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newPhotos = [...photos];
      if (index < newPhotos.length) {
        newPhotos[index] = result.assets[0].uri;
      } else {
        newPhotos.push(result.assets[0].uri);
      }
      setPhotos(newPhotos);
    }
  }, [photos]);

  const handleRemovePhoto = useCallback((index: number) => {
    if (photos.length > 1) {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      Alert.alert('Error', 'You must have at least one photo');
    }
  }, [photos.length]);

  const toggleInterest = useCallback((interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 10
        ? [...prev, interest]
        : prev
    );
  }, []);

  const handleAddPrompt = (prompt: typeof PROFILE_PROMPTS[0], isOpeningMove: boolean = false) => {
    setSelectedPrompt(prompt);
    setPromptAnswer('');
    if (isOpeningMove) {
      setShowOpeningMoveModal(true);
    } else {
      setShowPromptModal(true);
    }
  };

  const handleSavePrompt = (isOpeningMove: boolean = false) => {
    if (!selectedPrompt || !promptAnswer.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswer: PromptAnswer = {
      promptId: selectedPrompt.id,
      promptTitle: selectedPrompt.title,
      answer: promptAnswer.trim(),
    };

    if (isOpeningMove) {
      setOpeningMoves(prev => [...prev.filter(p => p.promptId !== selectedPrompt.id), newAnswer]);
      setShowOpeningMoveModal(false);
    } else {
      setPromptAnswers(prev => [...prev.filter(p => p.promptId !== selectedPrompt.id), newAnswer]);
      setShowPromptModal(false);
    }

    setSelectedPrompt(null);
    setPromptAnswer('');
  };

  const handleRemovePrompt = (promptId: string, isOpeningMove: boolean = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isOpeningMove) {
      setOpeningMoves(prev => prev.filter(p => p.promptId !== promptId));
    } else {
      setPromptAnswers(prev => prev.filter(p => p.promptId !== promptId));
    }
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const toggleTag = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleConnectApp = (appId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnectedApps(prev =>
      prev.map(app =>
        app.id === appId ? { ...app, connected: !app.connected } : app
      )
    );
  };

  const handleSave = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUser({
      photos,
      bio,
      interests,
      orientation: selectedOrientation,
      tags: selectedTags,
      preferences: { ageRange, maxDistance },
    });

    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  }, [photos, bio, interests, ageRange, maxDistance, selectedOrientation, selectedTags, updateUser, navigation]);

  const renderPromptModal = (isOpeningMove: boolean = false) => (
    <Modal
      visible={isOpeningMove ? showOpeningMoveModal : showPromptModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => isOpeningMove ? setShowOpeningMoveModal(false) : setShowPromptModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => isOpeningMove ? setShowOpeningMoveModal(false) : setShowPromptModal(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.modalTitle}>
            {selectedPrompt ? 'Answer Prompt' : isOpeningMove ? 'Opening Moves' : 'Choose a Prompt'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {selectedPrompt ? (
          <View style={styles.promptAnswerContainer}>
            <Text style={styles.promptQuestion}>{selectedPrompt.title}</Text>
            <TextInput
              style={styles.promptInput}
              placeholder="Your answer..."
              placeholderTextColor={colors.textMuted}
              value={promptAnswer}
              onChangeText={setPromptAnswer}
              multiline
              maxLength={300}
              autoFocus
            />
            <Text style={styles.promptCharCount}>{promptAnswer.length}/300</Text>
            <AnimatedButton
              title="Save Answer"
              onPress={() => handleSavePrompt(isOpeningMove)}
              fullWidth
              disabled={!promptAnswer.trim()}
            />
          </View>
        ) : (
          <ScrollView style={styles.promptListContainer}>
            {(isOpeningMove ? OPENING_MOVES : PROFILE_PROMPTS).map(prompt => {
              const existingAnswer = (isOpeningMove ? openingMoves : promptAnswers).find(
                p => p.promptId === prompt.id
              );
              return (
                <Pressable
                  key={prompt.id}
                  style={[styles.promptOption, existingAnswer && styles.promptOptionAnswered]}
                  onPress={() => handleAddPrompt(prompt, isOpeningMove)}
                >
                  <Text style={styles.promptOptionText}>{prompt.title}</Text>
                  {existingAnswer ? (
                    <View style={styles.promptAnsweredBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </View>
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setShowLanguageModal(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Languages I Speak</Text>
          <Pressable onPress={() => setShowLanguageModal(false)}>
            <Text style={styles.doneButton}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.languageListContainer}>
          {LANGUAGES.map(language => (
            <Pressable
              key={language}
              style={[
                styles.languageOption,
                selectedLanguages.includes(language) && styles.languageOptionSelected,
              ]}
              onPress={() => toggleLanguage(language)}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguages.includes(language) && styles.languageOptionTextSelected,
                ]}
              >
                {language}
              </Text>
              {selectedLanguages.includes(language) && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderOrientationModal = () => (
    <Modal
      visible={showOrientationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrientationModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setShowOrientationModal(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Sexual Orientation</Text>
          <Pressable onPress={() => setShowOrientationModal(false)}>
            <Text style={styles.doneButton}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.orientationListContainer}>
          {SEXUAL_ORIENTATIONS.map(orientation => (
            <Pressable
              key={orientation}
              style={[
                styles.orientationOption,
                selectedOrientation === orientation && styles.orientationOptionSelected,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedOrientation(orientation);
              }}
            >
              <View style={styles.orientationOptionContent}>
                <View style={[
                  styles.orientationIconBg,
                  selectedOrientation === orientation && styles.orientationIconBgSelected,
                ]}>
                  <Ionicons
                    name="heart"
                    size={18}
                    color={selectedOrientation === orientation ? '#fff' : '#FF9800'}
                  />
                </View>
                <Text
                  style={[
                    styles.orientationOptionText,
                    selectedOrientation === orientation && styles.orientationOptionTextSelected,
                  ]}
                >
                  {orientation}
                </Text>
              </View>
              {selectedOrientation === orientation && (
                <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderTagsModal = () => {
    const groupedTags = FETISH_TAGS.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, typeof FETISH_TAGS>);

    const categoryLabels: Record<string, string> = {
      power: 'Power Dynamics',
      kink: 'Kink & BDSM',
      roleplay: 'Role Play',
      group: 'Group Activities',
      exhibitionism: 'Exhibitionism',
      intensity: 'Intensity',
      sensual: 'Sensual',
      aesthetic: 'Aesthetic',
    };

    return (
      <Modal
        visible={showTagsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTagsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowTagsModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Select Your Tags</Text>
            <Pressable onPress={() => setShowTagsModal(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.tagsListContainer}>
            {Object.entries(groupedTags).map(([category, tags]) => (
              <View key={category} style={styles.tagsCategoryContainer}>
                <Text style={styles.tagsCategoryTitle}>{categoryLabels[category] || category}</Text>
                <View style={styles.tagsChipsContainer}>
                  {tags.map(tag => (
                    <Pressable
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        selectedTags.includes(tag.id) && styles.tagChipSelected,
                      ]}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          selectedTags.includes(tag.id) && styles.tagChipTextSelected,
                        ]}
                      >
                        {tag.label}
                      </Text>
                      {selectedTags.includes(tag.id) && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backButton} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Strength Section */}
          <Animated.View entering={FadeInUp.delay(50)} style={styles.strengthSection}>
            <View style={styles.strengthHeader}>
              <Text style={styles.strengthTitle}>Profile Strength</Text>
              <View style={styles.strengthBadge}>
                <Text style={[styles.strengthLabel, { color: getStrengthColor(profileStrength) }]}>
                  {getStrengthLabel(profileStrength)}
                </Text>
              </View>
            </View>

            <View style={styles.strengthBarContainer}>
              <View style={styles.strengthBarBackground}>
                <Animated.View
                  style={[
                    styles.strengthBarFill,
                    {
                      width: `${profileStrength}%`,
                      backgroundColor: getStrengthColor(profileStrength),
                    },
                  ]}
                />
              </View>
              <Text style={styles.strengthPercent}>{profileStrength}%</Text>
            </View>

            <View style={styles.strengthTips}>
              {photos.length < 6 && (
                <View style={styles.tipItem}>
                  <Ionicons name="camera-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.tipText}>Add more photos (+5% each)</Text>
                </View>
              )}
              {promptAnswers.length < 3 && (
                <View style={styles.tipItem}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.tipText}>Answer profile prompts (+5% each)</Text>
                </View>
              )}
              {connectedApps.filter(a => a.connected).length < 2 && (
                <View style={styles.tipItem}>
                  <Ionicons name="link-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.tipText}>Connect accounts (+5% each)</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Photos Section */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>Add up to 6 photos</Text>

            <View style={styles.photosGrid}>
              {[...Array(6)].map((_, index) => (
                <Pressable
                  key={index}
                  style={[styles.photoSlot, index === 0 && styles.photoSlotMain]}
                  onPress={() => {
                    if (photos[index]) {
                      Alert.alert(
                        'Photo Options',
                        'What would you like to do?',
                        [
                          { text: 'Replace', onPress: () => handlePickImage(index) },
                          { text: 'Remove', style: 'destructive', onPress: () => handleRemovePhoto(index) },
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    } else if (index <= photos.length) {
                      handlePickImage(index);
                    }
                  }}
                >
                  {photos[index] ? (
                    <>
                      <Image source={{ uri: photos[index] }} style={styles.photoImage} />
                      <View style={styles.photoEditBadge}>
                        <Ionicons name="pencil" size={14} color={colors.text} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons
                        name={index <= photos.length ? 'add' : 'lock-closed'}
                        size={24}
                        color={index <= photos.length ? colors.primary : colors.textMuted}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Bio Section */}
          <Animated.View entering={FadeInUp.delay(150)} style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <AnimatedInput
              placeholder="Write something about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />
            <Text style={styles.charCount}>{bio.length}/500 characters</Text>
          </Animated.View>

          {/* Sexual Orientation Section */}
          <Animated.View entering={FadeInUp.delay(175)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sexual Orientation</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedOrientation || 'Not selected'}
                </Text>
              </View>
              <Pressable
                style={styles.expandButton}
                onPress={() => setShowOrientationModal(true)}
              >
                <Text style={styles.expandButtonText}>
                  {selectedOrientation ? 'Change' : 'Select'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            </View>

            {selectedOrientation ? (
              <View style={styles.orientationChipContainer}>
                <View style={styles.selectedOrientationChip}>
                  <Ionicons name="heart" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.selectedOrientationText}>{selectedOrientation}</Text>
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.emptyOrientationCard}
                onPress={() => setShowOrientationModal(true)}
              >
                <Ionicons name="heart-circle-outline" size={32} color="#FF9800" />
                <Text style={styles.emptyOrientationText}>Select your sexual orientation</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* More About You - Prompts Section */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>More About You</Text>
                <Text style={styles.sectionSubtitle}>
                  Answer prompts to show your personality
                </Text>
              </View>
              <Pressable
                style={styles.addButton}
                onPress={() => {
                  setSelectedPrompt(null);
                  setShowPromptModal(true);
                }}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </Pressable>
            </View>

            {promptAnswers.length > 0 ? (
              <View style={styles.promptsContainer}>
                {promptAnswers.map((answer) => (
                  <View key={answer.promptId} style={styles.promptCard}>
                    <Text style={styles.promptCardTitle}>{answer.promptTitle}</Text>
                    <Text style={styles.promptCardAnswer}>{answer.answer}</Text>
                    <Pressable
                      style={styles.promptRemoveButton}
                      onPress={() => handleRemovePrompt(answer.promptId)}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Pressable
                style={styles.emptyPromptCard}
                onPress={() => {
                  setSelectedPrompt(null);
                  setShowPromptModal(true);
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyPromptText}>Add a prompt to show your personality</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Opening Moves Section */}
          <Animated.View entering={FadeInUp.delay(250)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Opening Moves</Text>
                <Text style={styles.sectionSubtitle}>
                  Help matches start conversations
                </Text>
              </View>
              <Pressable
                style={styles.addButton}
                onPress={() => {
                  setSelectedPrompt(null);
                  setShowOpeningMoveModal(true);
                }}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </Pressable>
            </View>

            {openingMoves.length > 0 ? (
              <View style={styles.promptsContainer}>
                {openingMoves.map((move) => (
                  <View key={move.promptId} style={[styles.promptCard, styles.openingMoveCard]}>
                    <View style={styles.openingMoveIcon}>
                      <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.openingMoveContent}>
                      <Text style={styles.promptCardTitle}>{move.promptTitle}</Text>
                      <Text style={styles.promptCardAnswer}>{move.answer}</Text>
                    </View>
                    <Pressable
                      style={styles.promptRemoveButton}
                      onPress={() => handleRemovePrompt(move.promptId, true)}
                    >
                      <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Pressable
                style={styles.emptyPromptCard}
                onPress={() => {
                  setSelectedPrompt(null);
                  setShowOpeningMoveModal(true);
                }}
              >
                <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyPromptText}>Add an opening move to spark conversations</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Languages Section */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Languages I Speak</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
              <Pressable
                style={styles.expandButton}
                onPress={() => setShowLanguageModal(true)}
              >
                <Text style={styles.expandButtonText}>Edit</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.languageChipsContainer}>
              {selectedLanguages.map(language => (
                <View key={language} style={styles.languageChip}>
                  <Text style={styles.languageChipText}>{language}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Tags Section */}
          <Animated.View entering={FadeInUp.delay(325)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Your Tags</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedTags.length > 0 ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected` : 'Select tags that describe you'}
                </Text>
              </View>
              <Pressable
                style={styles.expandButton}
                onPress={() => setShowTagsModal(true)}
              >
                <Text style={styles.expandButtonText}>
                  {selectedTags.length > 0 ? 'Edit' : 'Add'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            </View>

            {selectedTags.length > 0 ? (
              <View style={styles.tagsChipsContainer}>
                {selectedTags.map(tagId => {
                  const tag = FETISH_TAGS.find(t => t.id === tagId);
                  return tag ? (
                    <View key={tagId} style={styles.selectedTagChip}>
                      <Text style={styles.selectedTagText}>{tag.label}</Text>
                    </View>
                  ) : null;
                })}
              </View>
            ) : (
              <Pressable
                style={styles.emptyTagsCard}
                onPress={() => setShowTagsModal(true)}
              >
                <Ionicons name="pricetags-outline" size={32} color={colors.primary} />
                <Text style={styles.emptyTagsText}>Add tags to express yourself</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Interests Section */}
          <Animated.View entering={FadeInUp.delay(350)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Interests</Text>
                <Text style={styles.sectionSubtitle}>
                  {interests.length}/10 selected
                </Text>
              </View>
              <Pressable
                style={styles.expandButton}
                onPress={() => setShowInterests(!showInterests)}
              >
                <Text style={styles.expandButtonText}>
                  {showInterests ? 'Show Less' : 'Edit'}
                </Text>
                <Ionicons
                  name={showInterests ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            {showInterests ? (
              <View style={styles.interestsContainer}>
                {allInterests.map(interest => (
                  <InterestChip
                    key={interest}
                    label={interest}
                    selected={interests.includes(interest)}
                    onPress={() => toggleInterest(interest)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.interestsContainer}>
                {interests.map(interest => (
                  <InterestChip key={interest} label={interest} disabled />
                ))}
              </View>
            )}
          </Animated.View>

          {/* Connect Accounts Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Connect Accounts</Text>
            <Text style={styles.sectionSubtitle}>
              Show your personality through your favorite apps
            </Text>

            <View style={styles.connectedAppsContainer}>
              {connectedApps.map(app => (
                <Pressable
                  key={app.id}
                  style={[
                    styles.connectedAppCard,
                    app.connected && styles.connectedAppCardActive,
                  ]}
                  onPress={() => handleConnectApp(app.id)}
                >
                  <View style={[styles.connectedAppIcon, { backgroundColor: app.color + '20' }]}>
                    <Ionicons name={app.icon as any} size={28} color={app.color} />
                  </View>
                  <View style={styles.connectedAppInfo}>
                    <Text style={styles.connectedAppName}>{app.name}</Text>
                    <Text style={styles.connectedAppStatus}>
                      {app.connected ? 'Connected' : 'Tap to connect'}
                    </Text>
                  </View>
                  {app.connected ? (
                    <View style={styles.connectedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    </View>
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                  )}
                </Pressable>
              ))}
            </View>

            {connectedApps.some(app => app.connected && app.id === 'spotify') && (
              <View style={styles.spotifyPreview}>
                <View style={styles.spotifyHeader}>
                  <Ionicons name="musical-notes" size={20} color="#1DB954" />
                  <Text style={styles.spotifyTitle}>My Top Artists</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['Arijit Singh', 'Ed Sheeran', 'Taylor Swift', 'The Weeknd'].map((artist, i) => (
                    <View key={i} style={styles.spotifyArtist}>
                      <View style={styles.spotifyArtistImage}>
                        <Ionicons name="person" size={24} color={colors.textMuted} />
                      </View>
                      <Text style={styles.spotifyArtistName}>{artist}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View entering={FadeInUp.delay(450)} style={styles.section}>
            <Text style={styles.sectionTitle}>Match Preferences</Text>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceHeader}>
                <Text style={styles.preferenceLabel}>Age Range</Text>
                <Text style={styles.preferenceValue}>
                  {ageRange.min} - {ageRange.max}
                </Text>
              </View>
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{ageRange.min}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={18}
                  maximumValue={99}
                  step={1}
                  value={ageRange.max}
                  onValueChange={(value) => setAgeRange(prev => ({ ...prev, max: Math.round(value) }))}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
                <Text style={styles.sliderLabel}>{ageRange.max}</Text>
              </View>
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceHeader}>
                <Text style={styles.preferenceLabel}>Maximum Distance</Text>
                <Text style={styles.preferenceValue}>{maxDistance} km</Text>
              </View>
              <Slider
                style={styles.distanceSlider}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={maxDistance}
                onValueChange={(value) => setMaxDistance(Math.round(value))}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeIn.delay(500)} style={styles.saveButtonContainer}>
            <AnimatedButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="large"
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      {renderPromptModal(false)}
      {renderPromptModal(true)}
      {renderLanguageModal()}
      {renderOrientationModal()}
      {renderTagsModal()}
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
  // Profile Strength Styles
  strengthSection: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  strengthTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  strengthBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  strengthLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  strengthBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthPercent: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    width: 40,
    textAlign: 'right',
  },
  strengthTips: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  // Section Styles
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Photos Styles
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoSlot: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 2) / 3,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  photoSlotMain: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
  },
  // Bio Styles
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  // Prompts Styles
  promptsContainer: {
    gap: spacing.md,
  },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
  },
  promptCardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  promptCardAnswer: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  promptRemoveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  emptyPromptCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyPromptText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  // Opening Moves Styles
  openingMoveCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingRight: spacing.xl + spacing.md,
  },
  openingMoveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openingMoveContent: {
    flex: 1,
  },
  // Languages Styles
  languageChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  languageChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  // Interests Styles
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expandButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Connected Accounts Styles
  connectedAppsContainer: {
    gap: spacing.md,
  },
  connectedAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  connectedAppCardActive: {
    borderWidth: 2,
    borderColor: colors.success + '40',
    backgroundColor: colors.success + '08',
  },
  connectedAppIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedAppInfo: {
    flex: 1,
  },
  connectedAppName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  connectedAppStatus: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  connectedBadge: {
    marginLeft: 'auto',
  },
  // Spotify Preview
  spotifyPreview: {
    marginTop: spacing.lg,
    backgroundColor: '#1DB954' + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  spotifyTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: '#1DB954',
  },
  spotifyArtist: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  spotifyArtistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  spotifyArtistName: {
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: 'center',
    width: 70,
  },
  // Preferences Styles
  preferenceItem: {
    marginBottom: spacing.xl,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  preferenceLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  preferenceValue: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  distanceSlider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    width: 30,
    textAlign: 'center',
  },
  saveButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  doneButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  promptListContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  promptOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  promptOptionAnswered: {
    borderWidth: 2,
    borderColor: colors.success + '40',
  },
  promptOptionText: {
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  promptAnsweredBadge: {
    marginLeft: 'auto',
  },
  promptAnswerContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  promptQuestion: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  promptInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  promptCharCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: spacing.xl,
  },
  // Language Modal Styles
  languageListContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  languageOptionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  languageOptionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  languageOptionTextSelected: {
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  // Orientation Styles
  orientationChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedOrientationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    borderColor: '#FF9800',
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  selectedOrientationText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },
  emptyOrientationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    borderStyle: 'dashed',
  },
  emptyOrientationText: {
    fontSize: fontSize.md,
    color: '#FF9800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  orientationListContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  orientationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  orientationOptionSelected: {
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
  },
  orientationOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orientationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orientationIconBgSelected: {
    backgroundColor: '#FF9800',
  },
  orientationOptionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  orientationOptionTextSelected: {
    fontWeight: fontWeight.semibold,
    color: '#FF9800',
  },
  // Tags Styles
  tagsListContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  tagsCategoryContainer: {
    marginBottom: spacing.xl,
  },
  tagsCategoryTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  tagChipTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  selectedTagChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedTagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  emptyTagsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
  },
  emptyTagsText: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
