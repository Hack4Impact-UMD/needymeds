import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export type ErrorStateType = 'loading' | 'notFound' | 'noPharmacies' | 'generic';

interface ErrorStateProps {
  type: ErrorStateType;
  message?: string;
  showCallButton?: boolean;
  phoneNumber?: string;
  onCallPress?: () => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  message,
  showCallButton = true,
  phoneNumber = '8005036897',
  onCallPress,
  iconName = 'magnify',
  iconColor = '#41484D',
}) => {
  const { t } = useTranslation();

  const handleCallHelpline = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      const telUrl = `tel:${phoneNumber}`;
      Linking.openURL(telUrl);
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return t('LoadingMsg');
      case 'notFound':
        return t('NotFoundMsg');
      case 'noPharmacies':
        return t('EmptyMsg2');
      case 'generic':
      default:
        return t('LoadingMsg');
    }
  };

  const displayMessage = message || getDefaultMessage();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={iconName} size={48} color={iconColor} />
      <Text style={styles.messageText}>{displayMessage}</Text>

      {showCallButton && (
        <TouchableOpacity style={styles.callButton} onPress={handleCallHelpline}>
          <MaterialCommunityIcons name="phone" size={18} color="#236488" />
          <Text style={styles.callButtonText}>Call the helpline</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  messageText: {
    color: '#181C20',
    textAlign: 'center',
    fontFamily: 'Open Sans',
    lineHeight: 22,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 15,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#236488',
    marginTop: 10,
    gap: 8,
  },
  callButtonText: {
    color: '#236488',
    fontSize: 15,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
});

export default ErrorState;
