import { Adjudicator, DrugSearchResult } from '@/api/types';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '../BottomSheetModal';

interface DDCShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjudicator: Adjudicator;
  result: DrugSearchResult;
}

const DDCShareModal = ({ isOpen, onClose, adjudicator, result }: DDCShareModalProps) => {
  const { t } = useTranslation();

  async function ensureAssetUri(): Promise<string> {
    const ddcImage =
      adjudicator === 'DSNT'
        ? require('../../assets/DST_DDCDetailsFront.png')
        : require('../../assets/ScriptSave_DDCDetailsFront.png');

    const asset = Asset.fromModule(ddcImage);
    await asset.downloadAsync();
    return asset.localUri || asset.uri;
  }

  async function handleShareDDCImage() {
    try {
      const uri = await ensureAssetUri();

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(t('SharingNotAvailable'), t('SharingNotAvailableAlert1'));
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: t('DDCShare'),
      });
    } catch (error) {
      Alert.alert(t('Error'), t('ErrorAlert1'));
    }
  }

  async function handleDownloadDDCImage() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('PermissionRequired'), t('PermissionRequiredAlert1'));
        return;
      }

      const uri = await ensureAssetUri();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('Success'), t('SuccessAlert1'));
    } catch (error) {
      Alert.alert(t('Error'), t('ErrorAlert2'));
    }
  }

  return (
    <BottomSheetModal visible={isOpen} onClose={onClose} animationDuration={300}>
      <View style={styles.bottomSheet}>
        <View style={styles.modalHandle} />

        <TouchableOpacity style={styles.closeIconContainer} onPress={onClose}>
          <MaterialIcons name="close" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.sheetTitle}>{t('DDCShare')}</Text>

        <Text style={styles.sheetSubTitle}>{t('DDCSend')}</Text>

        <TouchableOpacity style={styles.sheetRow} onPress={handleShareDDCImage}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="sms" size={24} color="#fff" />
          </View>
          <Text style={styles.sheetText}>{t('Share')}</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.sheetRow} onPress={handleDownloadDDCImage}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="file-download" size={24} color="#fff" />
          </View>
          <Text style={styles.sheetText}>{t('DDCDownload')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    width: '100%',
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    // iOS-style drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,

    // Android elevation
    elevation: 10,
  },
  modalHandle: {
    width: 36,
    height: 2,
    backgroundColor: '#71787E',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 30,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Nunito Sans',
    textAlign: 'center',
  },
  sheetSubTitle: {
    width: '100%',
    fontSize: 18,
    fontFamily: 'Nunito Sans',
    paddingVertical: 8,
    textAlign: 'center',
  },
  sheetText: {
    width: '100%',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 14,
    fontFamily: 'Nunito Sans',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  sheetRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.default.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DDCShareModal;
