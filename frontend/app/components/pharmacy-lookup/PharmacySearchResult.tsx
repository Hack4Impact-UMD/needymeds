import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, IconButton } from 'react-native-paper';

type PharmacySearchResultProps = {
  name: string;
  address: string;
  distance: number;
  onPress: () => void;
};

const PharmacySearchResult = ({ name, address, distance, onPress }: PharmacySearchResultProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.resultTitle} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={2} ellipsizeMode="tail">
            {address}
          </Text>
        </View>

        {distance ? (
          <View style={styles.distanceContainer}>
            <Text style={styles.resultMiles}>{Number(distance).toFixed(1)}mi</Text>
            <IconButton icon="menu-right" iconColor="#41484D" size={24} onPress={onPress} />
          </View>
        ) : null}
      </View>
      <Divider style={styles.divider} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#181C20',
  },
  resultSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#41484D',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultMiles: {
    fontSize: 13,
    fontWeight: '500',
    color: '#41484D',
    fontFamily: 'Roboto',
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: '#C1C7CE',
  },
});

export default PharmacySearchResult;
