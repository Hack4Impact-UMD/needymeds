import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const resourcesIcon = require('../assets/Icon.png');
const cardIcon = require('../assets/confirmation_number.png');

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <Surface style={styles.bottomNav} elevation={0}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
        <View style={pathname.includes('search') ? styles.navActiveContainer : undefined}>
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color={pathname.includes('search') ? '#7C3AED' : '#6B7280'}
          />
        </View>
        <Text variant="labelMedium" style={styles.navLabel}>
          Search
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/DDC')}>
        <Image source={cardIcon} style={{ width: 26, height: 26 }} resizeMode="contain" />
        <Text variant="labelMedium" style={styles.navLabel}>
          My Cards
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Image source={resourcesIcon} style={{ width: 26, height: 26 }} resizeMode="contain" />
        <Text variant="labelMedium" style={styles.navLabel}>
          Resources
        </Text>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF5FF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    paddingVertical: 8,
  },
  navLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#625B71',
    fontWeight: '500',
  },
  navActiveContainer: {
    width: 60,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8DEF8',
  },
});

export default BottomNavBar;
