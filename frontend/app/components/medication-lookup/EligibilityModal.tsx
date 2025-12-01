import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface EligibilityModalProps {
  showEligibilityModal: boolean;
  setShowEligibilityModal: (b: boolean) => void;
}

const EligibilityModal = ({
  showEligibilityModal,
  setShowEligibilityModal,
}: EligibilityModalProps) => {
  return (
    <Modal
      visible={showEligibilityModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEligibilityModal(false)}
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
              <Text style={styles.modalTitle}>Save on</Text>
              <TouchableOpacity
                onPress={() => setShowEligibilityModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {[
                'Prescription drugs.',
                'Over-the-counter medicines if written on a prescription blank.',
                'Medical supplies if written on a prescription blank.',
                'Medical equipment (canes, crutches, splints, incontinence supplies, etc).',
                'Diabetic supplies (glucose meters, test strips, lancets, diabetic shoes).',
                'Pet prescription medicines.',
              ].map((text, idx) => (
                <View key={idx} style={styles.modalItem}>
                  <MaterialCommunityIcons name="check" size={20} color="#111827" />
                  <Text style={styles.modalItemText}>{text}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalFooter}>
              <Text style={styles.modalFooterText}>Learn more</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
