import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { submitSurvey } from '../../api/survey';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Survey = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');

  const handleBack = () => {
    router.push({
      pathname: '/DDC',
      params: { ...params },
    });
  };

  const validateEmail = (text: string) => {
    return EMAIL_REGEX.test(text);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    if (rating === 0) {
      Alert.alert(t('SurveyRatingRequired'), '');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert(t('SurveyEmailRequired'), '');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert(t('SurveyEmailError'), '');
      return;
    }

    setSubmitting(true);
    try {
      await submitSurvey({
        rating,
        email: trimmedEmail,
        comments: comments.trim() || undefined,
        drugName: params.drugName ? String(params.drugName) : undefined,
      });
      handleBack();
    } catch {
      Alert.alert('Submission failed', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingPress = (star: number) => {
    setRating(star);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const StarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => handleRatingPress(star)}
            accessibilityRole="button"
            accessibilityLabel={`${star} stars`}
            style={({ pressed }) => [styles.starPressable, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? Colors.default.brandBlue : Colors.default.primary}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
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
          <DefaultHeader />
          <View style={styles.pageBody}>
            <View style={styles.pageHeader}>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={t('arrow_backIcon')}
              >
                <Ionicons name="arrow-back" size={25} color={Colors.default.neutraldk} />
              </Pressable>
            </View>

            <View style={styles.surveyContainer}>
              <Text style={styles.pageTitle}>Survey</Text>

              <View style={styles.inputSection}>
                <Text style={styles.label}>
                  {t('SurveyHeader')} <Text style={styles.requiredStar}>*</Text>
                </Text>
                <StarRating />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>
                  {t('SurveyEmailLabel')} <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('SurveyEmailPlaceholder')}
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.label}>{t('SurveyCommentsLabel')}</Text>
                <TextInput
                  style={[styles.textInput, styles.commentsInput]}
                  placeholder={t('SurveyCommentsPlaceholder')}
                  placeholderTextColor="#6B7280"
                  value={comments}
                  onChangeText={setComments}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.doneButtonContainer}>
                <Pressable
                  style={({ pressed }) => [styles.doneButton, { opacity: pressed || submitting ? 0.8 : 1 }]}
                  onPress={handleDone}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel={t('SurveyDoneBtn')}
                >
                  <Text style={styles.doneButtonText}>{t('SurveyDoneBtn')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default Survey;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  pageBody: {
    padding: 20,
    gap: 15,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  surveyContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '400',
    color: Colors.default.neutraldk,
    marginBottom: 50,
    fontFamily: 'Nunito Sans',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 25,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.default.neutraldk,
    marginBottom: 12,
    fontFamily: 'Open Sans',
    textAlign: 'center',
  },
  requiredStar: {
    color: '#FF0000',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
  },
  starPressable: {
    padding: 2,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 14,
    fontSize: 16,
    color: '#41484D',
    fontFamily: 'Open Sans',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  commentsInput: {
    height: 150,
  },
  doneButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  doneButton: {
    backgroundColor: Colors.default.brandBlue,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Open Sans',
  },
});
