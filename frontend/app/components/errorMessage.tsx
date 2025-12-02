import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

type ErrorStateType = 'loading' | 'notFound' | 'generic';

interface ErrorStateProps {
  type: ErrorStateType;
  query?: string;
  message?: string;
  showCallButton?: boolean;
  phoneNumber?: string;
  onCallPress?: () => void;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  query,
  message,
  showCallButton = true,
  phoneNumber = '(800) 503-6897',
  onCallPress,
  iconName = 'magnify',
  iconColor = '#41484D',
}) => {
  const handleCallHelpline = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      const telUrl = `tel:${phoneNumber}`;
      Linking.openURL(telUrl).catch((err) => console.error('Error opening phone dialer:', err));
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'loading':
        return 'We could not load results right now. This happens when the connection is slow or the system is busy.';
      case 'notFound':
        return `We could not find that drug. You might find it at a pharmacy even if it is not on our discount list.\nMake sure it is spelled correctly.`;
      case 'generic':
      default:
        return 'Something went wrong. Please try again later.';
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
    fontFamily: 'Nunito Sans',
    lineHeight: 22,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
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
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    gap: 8,
  },
  callButtonText: {
    color: '#236488',
    fontSize: 15,
    fontFamily: 'Nunito Sans',
    fontWeight: '600',
  },
});

export default ErrorState;
