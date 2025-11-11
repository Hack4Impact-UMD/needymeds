// import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native'; // View, Image
import { Icon, Surface, Text } from 'react-native-paper';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { usePathname } from 'expo-router';

// const resourcesIcon = require('../assets/Icon.png');
// const cardIcon = require('../assets/confirmation_number.png');

const BottomNavBar = () => {
  // const pathname = usePathname();

  return (
    <Surface style={styles.bottomNav} elevation={0}>
      <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
        <Icon source="medication-outline" color="#004E60" size={30} />
        <Text variant="labelMedium" style={styles.navLabel}>
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Icon source="store-plus-outline" color="#004E60" size={30} />
        <Text variant="labelMedium" style={styles.navLabel}>
          Pharmacies
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Icon source="account" color="#004E60" size={30} />
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
    backgroundColor: '#EBEEF3',
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
