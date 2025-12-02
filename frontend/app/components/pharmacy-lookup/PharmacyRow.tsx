import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Divider, IconButton, Text } from 'react-native-paper';
const card = require('../../assets/confirmation_number.png');
const arrow = require('../../assets/arrow_right.png');

type Props = {
  name: string;
  price: string;
  distance: string;
  onPress?: () => void;
  onCouponPress?: () => void;
  onArrowPress?: () => void;
};

export default function PharmacyRow({
  name,
  price,
  distance,
  onPress,
  onCouponPress,
  onArrowPress,
}: Props) {
  return (
    <View>
      <View style={styles.row}>
        {/* icon button (coupon/ticket) */}
        <IconButton
          icon={() => (
            <Image source={card} style={{ width: 26, height: 26 }} resizeMode="contain" />
          )}
          onPress={onCouponPress}
          mode="contained"
          containerColor="transparent"
        />

        {/* Main text block */}
        <Pressable style={styles.middle} onPress={onPress}>
          <Text variant="titleMedium" style={styles.name}>
            {name}
          </Text>
          <Text variant="titleMedium" style={styles.price}>
            {price}
          </Text>
        </Pressable>

        {/* Distance */}
        <Text style={styles.distance}>{distance}</Text>

        {/* Right arrow button */}
        <IconButton
          icon={() => (
            <Image source={arrow} style={{ width: 25, height: 25 }} resizeMode="contain" />
          )}
          onPress={onArrowPress}
          mode="contained"
          containerColor="transparent"
        />
      </View>

      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FAFE',
    paddingHorizontal: 11,
    paddingVertical: 14,
    borderRadius: 8,
  },
  middle: {
    flex: 1,
    marginLeft: 3,
  },
  name: {
    color: '#181C20',
  },
  price: {
    marginTop: 2,
    color: '#41484D',
    fontSize: 14,
  },
  distance: {
    marginRight: 6,
    color: '#41484D',
  },
  divider: {
    marginTop: 8,
  },
});
