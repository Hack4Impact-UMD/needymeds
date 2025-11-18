import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';

const medIcon = require('../assets/healing.svg');

type Props = {
  name: string;
  price: string;
  details: string; // for "2% / 1 tube" (change later to whatever its supposed to bee)
};

export default function PharmacyRow({ name, price, details }: Props) {
  return (
    <View>
      <Pressable style={styles.row}>
        <Image source={medIcon} style={styles.icon} resizeMode="contain" />

        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text variant="titleMedium" style={styles.name}>
              {name}
            </Text>
            <Text variant="titleMedium" style={styles.price}>
              {price}
            </Text>
          </View>

          <Text style={styles.details}>{details}</Text>
        </View>
      </Pressable>

      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    color: '#181C20',
    textTransform: 'none',
  },
  price: {
    color: '#181C20',
  },
  details: {
    marginTop: 2,
    color: '#5D6670',
    fontSize: 13,
  },
  divider: {
    marginTop: 0,
    height: 0,
    backgroundColor: 'transparent',
  },
});
