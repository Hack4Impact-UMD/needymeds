import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitSurvey } from '../../api/survey';
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
              <View style={styles.backButton}>
                <Ionicons
                  name="arrow-back"
                  size={25}
                  color={Colors.default.neutraldk}
                  onPress={handleBack}
                />
              </View>
            </View>

            <View style={styles.surveyContainer}>
              <Text style={styles.pageTitle}>{t('SurveyTitle')}</Text>

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
                  placeholder={t('EmailAddress')}
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
                  placeholder={t('Comments')}
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
                  style={
                    email.length > 0 && rating > 0 ? styles.doneButtonFilled : styles.doneButton
                  }
                  onPress={handleDone}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel={t('Done')}
                >
                  <Text
                    style={
                      email.length > 0 && rating > 0
                        ? styles.doneButtonFilledText
                        : styles.doneButtonText
                    }
                  >
                    {t('Done')}
                  </Text>
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
    padding: 20,
  },
  pageBody: {
    gap: 5,
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
    fontWeight: '400',
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
    marginTop: -10,
  },
  doneButton: {
    backgroundColor: Colors.default.neutrallt,
    borderColor: '#41484D',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  doneButtonFilled: {
    backgroundColor: Colors.default.brandBlue,
    borderColor: Colors.default.brandBlue,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 50,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#41484D',
  },
  doneButtonFilledText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#FFFFFF',
  },
});
