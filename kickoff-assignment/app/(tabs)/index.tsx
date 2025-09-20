import { Text, ScrollView, StyleSheet } from "react-native";
import { Link, Stack } from "expo-router";

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen
        options={{ title: "Home" }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to the NeedyMeds team!</Text>

        <Link href="/NMEngineerDisplay" style={styles.link}>
          🏆 NeedyMeds Engineer Display 🏆
        </Link>
        <Link href="/angela" style={styles.link}>Angela's Page</Link>
        <Link href="/ayaan" style={styles.link}>Ayaan's Page</Link>
        <Link href="/bhavya" style={styles.link}>Bhavya's Page</Link>
        <Link href="/dhanya" style={styles.link}>Dhanya's Page</Link>
        <Link href="/eileen" style={styles.link}>Eileen's Page</Link>
        <Link href="/parsa" style={styles.link}>Parsa's Page</Link>
        <Link href="/samarth" style={styles.link}>Samarth's Page</Link>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  link: { fontSize: 18, marginBottom: 15, color: "#1E90FF" },
});
