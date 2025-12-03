import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface EligibilityModalProps {
  showEligibilityModal: boolean;
  setShowEligibilityModal: (b: boolean) => void;
}

const EligibilityModal = ({
  showEligibilityModal,
  setShowEligibilityModal,
}: EligibilityModalProps) => {
  const { t } = useTranslation();

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (showEligibilityModal) {
      // small delay to allow modal animation to start
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowContent(false);
    }
  }, [showEligibilityModal]);

  if (!showContent) return null;

  return (
    <Modal
      isVisible={showEligibilityModal}
      onSwipeComplete={() => setShowEligibilityModal(false)}
      swipeDirection={['down']}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      backdropColor="black"
      backdropOpacity={0.7}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      onBackdropPress={() => setShowEligibilityModal(false)}
      useNativeDriver={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowEligibilityModal(false)}
        />
        <View style={styles.modalMobileWrapper}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('Header')}</Text>
              <TouchableOpacity
                onPress={() => setShowEligibilityModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {[
                t('ListItem1'),
                t('ListItem2'),
                t('ListItem3'),
                t('ListItem4'),
                t('ListItem5'),
                t('ListItem6'),
              ].map((text, idx) => (
                <View key={idx} style={styles.modalItem}>
                  <MaterialCommunityIcons name="check" size={20} color="#111827" />
                  <Text style={styles.modalItemText}>{text}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalFooter}
              onPress={() => {
                setShowEligibilityModal(false);
                router.push('/prescription-savings-tips');
              }}
            >
              <Text style={styles.modalFooterText}>{t('FooterLink')}</Text>
              <MaterialCommunityIcons name="open-in-new" size={18} color="#181C20" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalMobileWrapper: {
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: Colors.default.neutrallt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 36,
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Open Sans',
    color: '#111827',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 7,
    paddingHorizontal: 24,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  modalFooterText: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    textDecorationLine: 'underline',
    fontFamily: 'Open Sans',
    color: '#181C20',
    fontWeight: '400',
  },
});

export default EligibilityModal;
