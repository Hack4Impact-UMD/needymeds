import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { apiGet } from '@/api/http';

interface Props {
  ndc?: string;
  loaded: boolean;
}

const default_url = 'https://www.needymeds.org/search-programs?initialSearchTab=drugs';

const AdditionalResourcesButton = ({ ndc, loaded }: Props) => {
  const [pressed, setPressed] = useState(false);

  const handlePress = async () => {
    // open coupon url if there's no med ndc provided
    if (!ndc) {
      await Linking.openURL(default_url);
      return;
    }

    console.log('NDC passed:', ndc, 'length:', ndc.length);

    try {
      /*
      const result = await fetch(`/api/urlapi/lookup?ndc=${encodeURIComponent(ndc)}`);
      const json = await result.json();
      const url = json?.data?.result ?? default_url;
      */

      const result = await apiGet<{ result: string }>('/api/urlapi/lookup', { ndc });
      await Linking.openURL(result.result ?? default_url);
    } catch (err) {
      console.error('FETCH ERROR:', err);
      await Linking.openURL(default_url);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.buttonBase,
          loaded ? styles.buttonLoaded : styles.buttonNotLoaded,
          pressed && styles.buttonPressed,
        ]}
        onPress={handlePress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1}
      >
        <Text style={[styles.text, pressed && styles.textPressed]}>Additional Resources </Text>
        <MaterialIcons
          name="open-in-new"
          size={16}
          color={pressed ? '#004E60' : '#41484D'}
          style={{ marginRight: 6 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F6FAFE',
    borderColor: '#71787E;',
    borderRadius: 26,
    borderWidth: 1,
    elevation: 3,
  },
  buttonLoaded: {
    position: 'absolute',
    bottom: 100,
    right: 16,
  },
  buttonNotLoaded: {
    position: 'relative',
    alignSelf: 'center',
  },
  buttonPressed: {
    backgroundColor: '#B6EBFF',
    borderColor: '#B6EBFF',
  },
  text: {
    color: '#41484D',
    fontSize: 15,
    fontFamily: 'Open Sans',
    fontWeight: '500',
  },
  textPressed: {
    color: '#004E60',
  },
});

export default AdditionalResourcesButton;
