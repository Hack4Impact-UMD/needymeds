import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface Medication {
  ndc: string;
}

const fallback_url = 'https://www.needymeds.org/search-programs';

const AdditionalResourcesButton = ({ ndc }: Medication) => {
  const [pressed, setPressed] = useState(false);
  // const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    // setLoading(true);
    try {
      const result = await fetch(`/api/urlapi/lookup?ndc=${encodeURIComponent(ndc)}`);
      const json = await result.json();
      const url = json?.data?.result ?? fallback_url;
      await Linking.openURL(url);
    } catch {
      await Linking.openURL(fallback_url);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, pressed && styles.buttonPressed]}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
    >
      <Text style={[styles.text, pressed && styles.textPressed]}>Additional Resources</Text>
      <MaterialIcons name="open-in-new" size={16} color={pressed ? '#004E60' : '#41484D'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#C1C7CE',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 24,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    backgroundColor: '#B6EBFF',
    borderColor: '#B6EBFF',
  },
  text: {
    color: '#41484D',
    fontSize: 15,
    fontFamily: 'Open Sans',
  },
  textPressed: {
    color: '#004E60',
  },
});

export default AdditionalResourcesButton;
