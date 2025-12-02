import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { DrugSearchResult } from '../../../api/types';

type DDCMedInfoRowProps = {
  result: DrugSearchResult;
  quantity: string;
  form: string;
};

export default function DDCMedInfoRow({ result, quantity, form }: DDCMedInfoRowProps) {
  return (
    <View>
      <Pressable style={styles.row}>
        <MaterialIcons name="healing" size={24} color="#41484D" />

        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <Text variant="titleMedium" style={styles.name}>
              {result.labelName}
            </Text>
            <Text variant="titleMedium" style={styles.price}>
              {`$${result.price}`}
            </Text>
          </View>
          <View style={styles.subRow}>
            <Text variant="titleMedium" style={styles.subLabel}>
              {quantity} {form}
            </Text>
          </View>
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
    paddingTop: 8,
    paddingHorizontal: 4,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 10,
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subRow: {
    paddingTop: 5,
  },
  subLabel: {
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
  name: {
    fontSize: 16,
    maxWidth: '70%',
    color: '#181C20',
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
  price: {
    color: '#181C20',
    fontWeight: '400',
    fontFamily: 'Open Sans',
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
