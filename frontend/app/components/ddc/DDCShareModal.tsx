import { Adjudicator } from '@/api/types';
import { MaterialIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

interface DDCShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjudicator: Adjudicator;
}

const DDCShareModal = ({ isOpen, onClose, adjudicator }: DDCShareModalProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // small delay to allow modal animation to start
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!showContent) return null;

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
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Drug Discount Card',
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not share image.');
    }
  }

  async function handleDownloadDDCImage() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to save photos is required.');
        return;
      }

      const uri = await ensureAssetUri();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved to your photo library!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save image.');
    }
  }

  return (
    <Modal
      isVisible={isOpen}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      backdropColor="black"
      backdropOpacity={0.7}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      onBackdropPress={onClose}
      useNativeDriver={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
    >
      {/* Bottom popup container */}
      <View style={styles.bottomSheet}>
        <View style={styles.modalHandle} />

        <TouchableOpacity style={styles.closeIconContainer} onPress={onClose}>
          <MaterialIcons name="close" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.sheetTitle}>Share Drug Discount Card</Text>

        <Text style={styles.sheetSubTitle}>Send image to:</Text>

        <TouchableOpacity style={styles.sheetRow} onPress={handleShareDDCImage}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="sms" size={24} color="#fff" />
          </View>
          <Text style={styles.sheetText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.sheetRow} onPress={handleDownloadDDCImage}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="file-download" size={24} color="#fff" />
          </View>
          <Text style={styles.sheetText}>Download to device</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    backgroundColor: '#236488',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DDCShareModal;
