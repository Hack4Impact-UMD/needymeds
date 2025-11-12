import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Surface, Text } from "react-native-paper";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";

const BG = "#EEF2F6";
const ICON_ACTIVE_BG = "#D7F1FF";
const ICON = "#0F5561";
const LABEL = "#6B7280";
const LABEL_ACTIVE = "#111827";
const BORDER = "#E5E7EB";

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
        onPress={() => router.push("/(tabs)/search")}
      >
        <View style={isActive("/search") ? styles.iconPill : styles.iconWrap}>
          <MCI name="pill" size={22} color={ICON} />
        </View>
        <Text
          variant="labelMedium"
          style={[styles.navLabel, isActive("/search") && styles.navLabelActive]}
        >
          Drug Prices
        </Text>
      </TouchableOpacity>

      {/* Pharmacies */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.9}
        onPress={() => router.push("/(tabs)/welcome")}
      >
        <View style={isActive("/welcome") ? styles.iconPill : styles.iconWrap}>
          <MCI name="store-plus-outline" size={22} color={ICON} />
        </View>
        <Text
          variant="labelMedium"
          style={[styles.navLabel, isActive("/search") && styles.navLabelActive]}
        >
          Pharmacies
        </Text>
      </TouchableOpacity>

      {/* Resources */}
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.9}
        onPress={() => router.push("/(tabs)/education")}
      >
        <View style={isActive("/education") ? styles.iconPill : styles.iconWrap}>
          <Image source={require("../assets/resource.png")} style={{ width: 25, height: 25 }} />
        </View>
        <Text
          variant="labelMedium"
          style={[
            styles.navLabel,
            isActive("/education") && styles.navLabelActive,
          ]}
        >
          Resources
        </Text>
      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 12, // room above the device edge
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ICON_ACTIVE_BG, 
  },
  navLabel: {
    marginTop: 6,
    fontSize: 12,
    color: LABEL,
    fontWeight: "500",
  },
  navLabelActive: {
    color: LABEL_ACTIVE,
    fontWeight: "700",
  },
});
