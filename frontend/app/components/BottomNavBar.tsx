import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, Surface, Text } from 'react-native-paper';
import { usePathname, useRouter } from 'expo-router';

const BG = '#EBEEF3';
const ICON_ACTIVE_BG = '#B6EBFF';
const ICON = '#004E60';
const LABEL = '#41484D';
const LABEL_ACTIVE = '#181C20';
const BORDER = '#EBEEF3';

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (seg: string) => pathname?.includes(seg);

  return (
    <Surface style={styles.bottomNav} elevation={0}>
      {/* Drug Prices */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/search')}
      >
        <View style={isActive('/search') ? styles.iconPill : styles.iconWrap}>
          <Icon source="medication-outline" color={ICON} size={30} />
        </View>
        <Text
          variant="labelMedium"
          style={[styles.navLabel, isActive('/search') && styles.navLabelActive]}
        >
          Drug Prices
        </Text>
      </TouchableOpacity>

      {/* Pharmacies */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/paramstyping')}
      >
        <View style={isActive('/paramstyping') ? styles.iconPill : styles.iconWrap}>
          <Icon source="store-plus-outline" color={ICON} size={30} />
        </View>
        <Text
          variant="labelMedium"
          style={[styles.navLabel, isActive('/paramstyping') && styles.navLabelActive]}
        >
          Pharmacies
        </Text>
      </TouchableOpacity>

      {/* Resources */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.9}
        onPress={() => router.push('/(tabs)/education')}
      >
        <View style={isActive('/education') ? styles.iconPill : styles.iconWrap}>
          <Icon source="library" color={ICON} size={30} />
        </View>
        <Text
          variant="labelMedium"
          style={[styles.navLabel, isActive('/education') && styles.navLabelActive]}
        >
          Resources
        </Text>
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 12, // room above the device edge
    borderTopWidth: 4,
    borderTopColor: BORDER,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 64,
    height: 32,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ICON_ACTIVE_BG,
  },
  navLabel: {
    marginTop: 6,
    fontSize: 12,
    color: LABEL,
    fontWeight: '500',
  },
  navLabelActive: {
    color: LABEL_ACTIVE,
    fontWeight: '700',
  },
});
